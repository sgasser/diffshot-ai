#!/usr/bin/env node

/**
 * Enhanced screenshot capture script using Playwright
 * 
 * Usage: node capture-screenshot.js <base-url> <output-file> [options]
 * 
 * Options:
 *   --route <path>           Route path to append to base URL (e.g., /about, /contact)
 *   --selector <selector>    CSS selector to scroll to before screenshot
 *   --viewport <width>       Viewport width (default: 1440)
 *   --viewport-height <height> Viewport height (optional, defaults based on width)
 *   --wait <ms>              Wait time after navigation (default: 2000)
 *   --auth-cookie <cookie>   Authentication cookie string
 *   --auth-state <path>      Path to auth state JSON file (recommended for OAuth/SSO)
 *   --dark-mode              Enable dark mode (sets prefers-color-scheme: dark)
 *   --click <selector>       Click an element before taking screenshot (e.g., to open menus)
 */

import { chromium } from 'playwright';
import fs from 'fs';

function parseArgs(args) {
  const options = {
    url: args[0],
    outputFile: args[1],
    route: '',
    selector: null,
    viewportWidth: 1440,
    viewportHeight: null,
    waitTime: 2000,
    authCookie: null,
    authState: null,
    darkMode: false,
    clickSelector: null
  };

  for (let i = 2; i < args.length; i++) {
    switch (args[i]) {
      case '--route':
        options.route = args[++i] || '';
        break;
      case '--selector':
        options.selector = args[++i];
        break;
      case '--viewport':
        options.viewportWidth = parseInt(args[++i]) || 1440;
        break;
      case '--viewport-height':
        options.viewportHeight = parseInt(args[++i]) || null;
        break;
      case '--wait':
        options.waitTime = parseInt(args[++i]) || 2000;
        break;
      case '--auth-cookie':
        options.authCookie = args[++i];
        break;
      case '--auth-state':
        options.authState = args[++i];
        break;
      case '--dark-mode':
        options.darkMode = true;
        break;
      case '--click':
        options.clickSelector = args[++i];
        break;
    }
  }

  return options;
}

async function captureScreenshot() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node capture-screenshot.js <base-url> <output-file> [options]');
    console.error('Options:');
    console.error('  --route <path>           Route path to append to base URL');
    console.error('  --selector <selector>    CSS selector to scroll to before screenshot');
    console.error('  --viewport <width>       Viewport width (default: 1440)');
    console.error('  --viewport-height <height> Viewport height (optional, defaults based on width)');
    console.error('  --wait <ms>              Wait time after navigation (default: 2000)');
    console.error('  --auth-cookie <cookie>   Authentication cookie string');
    console.error('  --auth-state <path>      Path to auth state JSON file');
    console.error('  --dark-mode              Enable dark mode (sets prefers-color-scheme: dark)');
    console.error('  --click <selector>       Click an element before taking screenshot');
    process.exit(1);
  }

  const options = parseArgs(args);
  const fullUrl = options.url + options.route;
  
  console.log(`Capturing screenshot of: ${fullUrl}`);
  if (options.selector) {
    console.log(`Will scroll to selector: ${options.selector}`);
  }
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Use provided height or set default based on width
    let viewportHeight = options.viewportHeight;
    if (!viewportHeight) {
      // Default heights based on common device sizes
      if (options.viewportWidth <= 375) {
        viewportHeight = 812; // mobile (iPhone X/11/12)
      } else if (options.viewportWidth <= 768) {
        viewportHeight = 1024; // tablet (iPad)
      } else if (options.viewportWidth <= 1024) {
        viewportHeight = 768; // small laptop
      } else {
        viewportHeight = 900; // desktop
      }
    }
    
    // Load auth state if provided
    let contextOptions = {
      viewport: { width: options.viewportWidth, height: viewportHeight },
      deviceScaleFactor: 2, // Retina quality
      colorScheme: options.darkMode ? 'dark' : 'light'
    };
    
    if (options.authState && fs.existsSync(options.authState)) {
      contextOptions.storageState = options.authState;
      console.log(`Using auth state from: ${options.authState}`);
    }
    
    const context = await browser.newContext(contextOptions);
    
    // Add authentication cookie if provided
    if (options.authCookie) {
      const [name, value] = options.authCookie.split('=');
      await context.addCookies([{
        name,
        value,
        domain: new URL(options.url).hostname,
        path: '/'
      }]);
    }
    
    const page = await context.newPage();
    
    // Navigate to URL
    await page.goto(fullUrl, { waitUntil: 'networkidle' });
    
    // Wait for specified time
    await page.waitForTimeout(options.waitTime);
    
    // Click element if specified
    if (options.clickSelector) {
      try {
        await page.waitForSelector(options.clickSelector, { timeout: 5000 });
        await page.click(options.clickSelector);
        console.log(`Clicked: ${options.clickSelector}`);
        // Wait a bit for any animations/transitions
        await page.waitForTimeout(500);
      } catch (error) {
        console.warn(`Warning: Could not click selector "${options.clickSelector}". Continuing anyway.`);
      }
    }
    
    // Scroll to selector if specified
    if (options.selector) {
      try {
        // Wait for selector to be visible
        await page.waitForSelector(options.selector, { timeout: 5000 });
        
        // Scroll to element
        await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, options.selector);
        
        // Wait a bit for scroll animation
        await page.waitForTimeout(1000);
        
        console.log(`Scrolled to: ${options.selector}`);
      } catch (error) {
        console.warn(`Warning: Could not find selector "${options.selector}". Taking screenshot anyway.`);
      }
    }
    
    // Take screenshot (viewport only)
    const screenshotOptions = {
      path: options.outputFile,
      fullPage: false
    };
    
    // If selector is specified, optionally capture just the element
    if (options.selector && false) { // Disabled element-only capture for now
      try {
        const element = await page.$(options.selector);
        if (element) {
          await element.screenshot(screenshotOptions);
          console.log(`Screenshot of element saved to: ${options.outputFile}`);
        } else {
          await page.screenshot(screenshotOptions);
          console.log(`Element not found, full viewport saved to: ${options.outputFile}`);
        }
      } catch (error) {
        await page.screenshot(screenshotOptions);
        console.log(`Error capturing element, full viewport saved to: ${options.outputFile}`);
      }
    } else {
      await page.screenshot(screenshotOptions);
      console.log(`Screenshot saved to: ${options.outputFile}`);
    }
    
  } catch (error) {
    console.error('Error capturing screenshot:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureScreenshot();