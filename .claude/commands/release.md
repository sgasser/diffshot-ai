# Release DiffShot

Create a new release for DiffShot with version: $ARGUMENTS

Steps:
1. Run all quality checks: `npm run build && npm run typecheck && npm run lint && npm test`
2. If any checks fail, fix the issues and show what was fixed
3. Update version in package.json
4. Commit all changes with conventional commit message
5. Push to main branch
6. Create and push git tag
7. Create GitHub release with gh CLI, including changelog
8. Monitor that GitHub Actions publish workflow succeeds

If no version is provided as $ARGUMENTS, determine the appropriate version based on the changes.