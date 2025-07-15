# BitChat Demo Site

## Setup Instructions

1. Clone the repository
2. Create your GitHub token:
   - Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Give it a name (e.g., "BitChat Demo")
   - Select only these permissions:
     - `public_repo` (to read public repository data)
     - `read:user` (to read user profile data)
   - Click "Generate token"
   - **Copy your token immediately** - you won't be able to see it again!

3. Configure the token:
   - Copy `assets/js/config.template.js` to `assets/js/config.js`
   - Replace `YOUR_GITHUB_TOKEN_HERE` with your actual GitHub token

```javascript
// assets/js/config.js
const config = {
    github: {
        token: 'your-actual-token-here'
    }
};

export default config;
```

4. Add config.js to .gitignore
   - This prevents your token from being committed to the repository
   - The file is already in .gitignore, but double-check it's there

## Security Notes

- Never commit your GitHub token to the repository
- Never share your token with anyone
- If you accidentally expose your token, go to GitHub and revoke it immediately
- Use environment variables in production environments
