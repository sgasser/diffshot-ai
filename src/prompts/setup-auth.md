# Set Up Authentication

Set up authentication for this DiffShot project:

## Current Configuration
{{config}}

## Screenshot Tool
Screenshot capture tool path: {{captureScriptPath}}

## Provided Credentials
{{credentials}}

## Tasks

1. Parse the provided credentials:
   - Extract credential components from the natural language input
   - Create .diffshot/auth/credentials.env with appropriate environment variables

2. Analyze the authentication system from DIFFSHOT.md

3. Create auth directory: mkdir -p .diffshot/auth

4. Generate authentication script:
   - Create .diffshot/auth/login.js that authenticates and saves auth state
   - Make it load credentials from credentials.env
   - Save auth state to .diffshot/auth.json in Playwright's format:
     { "cookies": [...], "origins": [...] }
   - The script should authenticate and then save the browser context state

5. Start dev server (if not already running):
   - Run dev server in background: DEV_COMMAND </dev/null >/dev/null 2>&1 & disown
   - Wait a moment for server to start

6. Test authentication:
   - Run the auth script: node .diffshot/auth/login.js
   - Verify that .diffshot/auth.json was created successfully

7. Capture authenticated screenshot:
   - Take screenshot using the screenshot tool:
     node {{captureScriptPath}} [dev server URL] .diffshot/screenshots/init-auth.png --auth-state .diffshot/auth.json
   - Verify screenshot shows authenticated content, not homepage or login page

8. Update DIFFSHOT.md:
   - Replace the "Setup: Run diffshot-ai setup-auth" line with auth script details
   - Add the auth screenshot reference
   - Do NOT include actual credential values in DIFFSHOT.md for security

9. Stop dev server (if we started it)

10. Provide summary of what was done and next steps