# Screenshot Generation Prompt

Generate screenshots based on code changes.

## Configuration
{{diffShotConfig}}

## Changed Files
{{changedFiles}}

## Screenshot Tool
Screenshot capture tool path: {{captureScriptPath}}

## Tasks

1. Read DIFFSHOT.md settings
   - Note authentication details, viewport sizes, themes, languages, and server configuration
   - Pay special attention to the "Markdown Output Format" section if present
   - This defines how to structure your final summary and name screenshots
2. Analyze changed files to understand their impact on the UI
   - Examine the actual changes using git diff
   - Understand what changed and why it matters
   - Identify where in the UI those changes would be visible
   - Check if language files (/lang/, /locales/, i18n) are in changed files
3. Discover routes where the changed components are used
   - Find which pages display the changed components
   - List the specific routes you will screenshot
4. Handle authentication if needed
   - Check DIFFSHOT.md for Authentication section
   - If Auth Script is specified:
     * Run the auth script as documented in DIFFSHOT.md
     * Use the saved auth state for all screenshots
5. Create a todo list of planned screenshots
   - Plan screenshots that will actually show the changes
   - Think about what state the UI needs to be in to see the change
   - Less is more: avoid redundant screenshots
   - If language files changed AND Languages section exists in DIFFSHOT.md: plan screenshots for each language
6. Start dev server (if not already running per DIFFSHOT.md)
   - Run dev server in background: DEV_COMMAND </dev/null >/dev/null 2>&1 & disown
   - Wait a moment for server to start
7. Take screenshots of affected pages using the capture-screenshot.js tool at the path provided above:
   
   Save all screenshots to the target project's .diffshot/screenshots/ directory
   Example: {{workDir}}/.diffshot/screenshots/filename.png
   
   The tool supports these options:
   - --route <path>: Route to append to base URL
   - --selector <selector>: CSS selector to scroll to before screenshot (will scroll element into view)
   - --click <selector>: Click an element before screenshot
   - --viewport <width>: Viewport width (use sizes from DIFFSHOT.md)
   - --viewport-height <height>: Viewport height (use if specified in DIFFSHOT.md)
   - --wait <ms>: Wait time after navigation
   - --auth-cookie <cookie>: Authentication cookie (check DIFFSHOT.md)
   - --auth-state <path>: Path to auth state JSON file (check DIFFSHOT.md)
   - --dark-mode: Enable dark mode (sets prefers-color-scheme: dark)
   
   The tool captures only the viewport (what users see without scrolling).
   Use ONLY the viewport sizes specified in DIFFSHOT.md.
   
   Capture screenshots for each viewport, theme, and language specified in DIFFSHOT.md.
   Use --dark-mode flag for dark theme screenshots.
   
   Multi-language workflow (when language files are in changed files):
   1. Check if Languages section exists in DIFFSHOT.md
   2. Use languages and switching method from DIFFSHOT.md
   3. For each language specified in DIFFSHOT.md:
      - Switch languages as instructed in DIFFSHOT.md
      - Take screenshots for all viewports and themes from DIFFSHOT.md
      - Use language suffix in filenames
   
   Smart screenshot approach:
   - Every screenshot should show the actual change
   - If the change isn't immediately visible:
     * Use --click to open menus, dropdowns, accordions
     * Use --selector to scroll to specific sections
     * Combine options as needed for complex interactions
   - Prefer using the built-in tool options over creating custom scripts
   - Quality over quantity: one good screenshot is better than many that don't show the change
   
   Parallel execution for speed:
   - You can run multiple screenshot commands in parallel using shell background jobs
   - Use shell background jobs or xargs for parallel execution
   - Limit to 3-4 parallel processes to avoid overwhelming the system
   
8. Clean up any temporary files
   - Remove any custom scripts created during the process
   - Keep only the final screenshots and auth.json
9. Stop dev server (if we started it)
10. Final step: Output markdown summary
   After all screenshots are complete, output a markdown summary as your last message.
   Follow the "Markdown Output Format" section from DIFFSHOT.md exactly.

The screenshot tool will automatically handle scrolling to elements when using --selector.