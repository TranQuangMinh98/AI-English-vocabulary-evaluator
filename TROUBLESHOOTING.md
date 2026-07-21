# Troubleshooting Guide

## Issue: "Failed to fetch" error in browser

### Problem
When you submit text for evaluation, you see an error message: "Failed to fetch" or "We couldn't evaluate your text right now."

### Root Cause
This was caused by Claude API returning JSON wrapped in markdown code blocks (```json ... ```), which couldn't be parsed directly.

### Solution ✅ FIXED
**Status:** This issue has been resolved in commit `ba247bd`.

The backend now automatically strips markdown code blocks from the API response before parsing JSON.

### Verification
Run these tests to verify everything works:

```bash
# Test 1: Run backend tests
cd server
npm test
# Should show: 5/5 tests passing

# Test 2: Test Claude API directly
cd server
node test-claude-api.js
# Should show: ✅ JSON parsed successfully!

# Test 3: Test full API endpoint
# Terminal 1:
cd server
npm start

# Terminal 2:
cd ..
node test-api.js
# Should show: ✅ Evaluation successful!
```

---

## Other Common Issues

### Server won't start

**Symptoms:**
```
Error: listen EADDRINUSE :::3001
```

**Solution:**
Port 3001 is already in use. Kill the existing process:

```bash
# Windows
taskkill //F //IM node.exe

# Then restart
cd server
npm start
```

**Or** change the port in `server/.env`:
```
PORT=3002
```

---

### Frontend can't connect to backend

**Symptoms:**
- Browser console shows: `Failed to fetch`
- Network tab shows: `ERR_CONNECTION_REFUSED`

**Solution:**

1. **Check server is running:**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok"}
   ```

2. **Check CORS is enabled:**
   - Already enabled by default in `server/index.js`
   - Verify line: `app.use(cors());`

3. **Check API URL in frontend:**
   - Default is `http://localhost:3001`
   - Create `client/.env` to override:
     ```
     VITE_API_URL=http://localhost:3001
     ```

---

### API returns 400 error

**Symptoms:**
Backend returns: `Text must be at least 100 words`

**Solution:**
Ensure your text has between 100-1000 words. The word counter in the UI shows real-time count.

---

### API returns 500 error

**Symptoms:**
Backend logs show: `Evaluation error: ...`

**Possible Causes:**

1. **Invalid API credentials:**
   Check `server/.env`:
   ```bash
   ANTHROPIC_API_KEY=your_key_here
   ANTHROPIC_BASE_URL=your_endpoint_here
   ```

2. **Network issue:**
   - Check internet connection
   - Verify custom endpoint is accessible

3. **API quota exceeded:**
   - Check your API usage limits
   - Wait and try again later

**Debug:**
```bash
cd server
node test-claude-api.js
# Shows detailed error messages
```

---

### Frontend build fails

**Symptoms:**
```
error during build: [postcss] tailwindcss...
```

**Solution:**
Ensure you have the correct Tailwind packages:

```bash
cd client
npm install -D @tailwindcss/postcss autoprefixer
```

Verify `postcss.config.js` contains:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

---

### Tests fail

**Symptoms:**
```
Test Suites: 1 failed
```

**Solution:**

1. **Clean install:**
   ```bash
   cd server
   rm -rf node_modules package-lock.json
   npm install
   npm test
   ```

2. **Check Node version:**
   ```bash
   node --version
   # Should be v18 or higher
   ```

---

## Still Having Issues?

### Enable Debug Mode

**Backend:**
Add to `server/.env`:
```
DEBUG=true
```

**Frontend:**
Open browser DevTools (F12):
- Console tab: Shows JavaScript errors
- Network tab: Shows API requests/responses

### Check Logs

**Server logs:**
```bash
cd server
npm start
# Watch console output
```

**Browser logs:**
- Open DevTools (F12)
- Look for errors in Console tab
- Check Network tab for failed requests

### Test Each Component

1. **Test backend independently:**
   ```bash
   cd server
   node test-claude-api.js
   ```

2. **Test API endpoint:**
   ```bash
   # Server running in another terminal
   node test-api.js
   ```

3. **Test frontend independently:**
   ```bash
   cd client
   npm run dev
   # Try with backend stopped - should show connection error
   ```

---

## Getting Help

If you're still stuck:

1. Check the logs for specific error messages
2. Verify all prerequisites are installed (Node.js v18+)
3. Ensure `.env` files are properly configured
4. Try the test scripts to isolate the issue

**Remember:** The most common issue was the JSON parsing problem, which is now fixed. If you're experiencing "Failed to fetch", make sure you have the latest code with the fix.
