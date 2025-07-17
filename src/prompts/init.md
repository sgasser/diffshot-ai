# Initialize DiffShot

Initialize DiffShot for this project:

## Screenshot Tool
Screenshot capture tool path: {{captureScriptPath}}

## Tasks

1. Analyze if this is a web application. If not, exit with error.

2. Start dev server, create directories:
   - Run dev server: DEV_COMMAND </dev/null >/dev/null 2>&1 & disown
   - Extract the dev server URL
   - Create: mkdir -p .diffshot/screenshots

3. Check if authentication exists:
   - Search for auth routes, login components, auth middleware
   - If auth detected, identify these routes:
     * Unauthenticated route (homepage, landing)
     * Login route (sign in page)
     * Authenticated route (dashboard, main app)
   - Document in DIFFSHOT.md that authentication is required

4. Take initial screenshot:
   - Use the screenshot tool: node {{captureScriptPath}} [dev server URL] .diffshot/screenshots/init.png

5. Create DIFFSHOT.md at {{configPath}}:

   ## Development Server
   **URL:** [dev server URL]
   **Command:** [start command]
   
   ## Authentication
   [Only if auth detected]
   **Required:** Yes
   **Type:** [form-based/OAuth/API key/SSO]
   **Provider:** [WorkOS/Auth0/Okta/etc if OAuth]
   **Routes:**
   - Unauthenticated: [homepage route]
   - Login: [login route]
   - Authenticated: [dashboard route]
   **Setup:** Run `diffshot-ai setup-auth` to configure authentication
   
   ## Screenshot Settings
   ### Viewports
   - Mobile: 375×812
   - Tablet: 768×1024  
   - Desktop: 1440×900
   
   ### Themes
   - Light (default)
   - Dark [if supported]
   
   ## Initial Screenshot
   ![Application](.diffshot/screenshots/init.png)
   
   ## Markdown Output Format
   ### [Feature Name]
   **Description:** [What changed]
   **Screenshots:** [Embed images using ![alt text](path) syntax]

6. Stop dev server before finishing.