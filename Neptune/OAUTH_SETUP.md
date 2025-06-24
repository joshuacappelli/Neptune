# GitHub OAuth Setup

To use GitHub OAuth in your Neptune application, follow these steps:

## 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the following details:
   - **Application name**: Neptune
   - **Homepage URL**: `http://localhost:1420` (for development)
   - **Authorization callback URL**: Add these URLs (one per line):
     ```
     http://localhost:8000/callback
     http://localhost:8001/callback
     http://localhost:8002/callback
     ```
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

## 2. Environment Configuration

Create a `.env` file in your project root with the following variables:

```env
VITE_GH_CLIENT_ID=your_github_client_id_here
VITE_GH_SECRET=your_github_client_secret_here
```

## 3. Important: Callback URL Configuration

**CRITICAL**: Make sure your GitHub OAuth app has the exact callback URLs listed above. The OAuth flow will fail if the redirect URI doesn't match exactly.

To update existing OAuth app:
1. Go to your OAuth app settings
2. In "Authorization callback URL" field, add all three URLs:
   - `http://localhost:8000/callback`
   - `http://localhost:8001/callback`
   - `http://localhost:8002/callback`
3. Click "Update application"

## 4. Security Notes

- Never commit your `.env` file to version control
- The `VITE_GH_SECRET` is only used server-side in the Rust backend
- The OAuth flow uses a local server to capture the callback, which is secure for desktop applications

## 5. Testing

1. Start your Tauri application: `npm run tauri dev`
2. Navigate to the login page
3. Click "Continue with GitHub"
4. Complete the OAuth flow
5. You should be redirected back to your application

## Troubleshooting

### "The redirect_uri is not associated with this application" Error

This error means the callback URL in your GitHub OAuth app doesn't match the one being used. To fix:

1. **Check your OAuth app settings**: Make sure you have all three callback URLs listed
2. **Verify the URLs are exact**: No extra spaces, correct protocol (http), correct ports
3. **Wait for changes to propagate**: GitHub may take a few minutes to update settings

### Other Common Issues

- Make sure your callback URLs match exactly (including protocol and port)
- Check that your GitHub OAuth app is properly configured
- Verify that the environment variables are loaded correctly
- Check the browser console and Tauri logs for any errors 