```markdown
# Replit Project (push to GitHub)

This repo was created from a Replit workspace.

How to push locally (example commands shown below):

1. Make sure secrets are not committed. Use Replit Secrets for environment values.
2. Ensure `.gitignore` exists (ignore node_modules, .env, etc).
3. Create a GitHub repository (web UI or gh CLI).
4. Push from Replit shell:

   ```
   git init
   git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
   git add .
   git commit -m "Initial commit from Replit"
   git branch -M main
   git push -u origin main
   ```

If node_modules or secrets were accidentally committed, untrack them and commit the fix:

```
git rm -r --cached node_modules
git rm --cached config.js
git commit -m "Remove node_modules and secrets from repo"
git push
```

Replace `YOUR_USER` and `YOUR_REPO` with your repo details.
```