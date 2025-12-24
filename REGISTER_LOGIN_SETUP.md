# Registration & Login Troubleshooting Guide

## ✅ Prerequisites

### 1. Backend Server Running
- URL: `http://localhost:8080`
- Must have `/auth/register` and `/auth/login` endpoints
- Check if running with: `curl http://localhost:8080/auth/register -X POST`

### 2. Frontend Server Running
- URL: `http://localhost:3000`
- Command: `npm start` from `ecommerce` folder

## 🔧 How the Proxy Works

```
Frontend (localhost:3000)
    ↓
setupProxy.js middleware
    ↓
Request rewritten: /api/* → http://localhost:8080/*
    ↓
Backend (localhost:8080)
    ↓
Response sent back to Frontend
```

### API Endpoints Used:
- Frontend requests: `/api/auth/register` and `/api/auth/login`
- Proxy rewrites to: `http://localhost:8080/auth/register` and `http://localhost:8080/auth/login`

## 🐛 Debugging Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Try to register
4. Look for console logs showing:
   - Request URL being sent
   - Response status
   - Any error messages

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to register
4. Look for the request to `/api/auth/register`
5. Check:
   - Request Headers (should have `Content-Type: application/json`)
   - Response Headers
   - Response Body
   - Status Code

### Step 3: Test Backend Directly
Run this in PowerShell:
```powershell
$body = @{
    firstName="John"
    lastName="Doe"
    email="test@example.com"
    phone="+15551234567"
    password="TestPass123"
    streetAddress="123 Main St"
    city="New York"
    state="NY"
    zip="10001"
    country="USA"
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:8080/auth/register' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $body `
    -UseBasicParsing
```

## ❌ Common Errors & Solutions

### "Could not reach the server" / "Failed to fetch"
**Cause**: Backend not running or not accessible

**Solution**:
1. Make sure backend server is running on `http://localhost:8080`
2. Test directly: `http://localhost:8080/auth/register` in browser or curl
3. Check firewall isn't blocking port 8080
4. Verify backend process is still alive

### "503 Service Unavailable"
**Cause**: Backend server crashed or stopped

**Solution**:
1. Check backend logs
2. Restart backend server
3. Verify backend dependencies are installed

### "401 Unauthorized" (for login)
**Cause**: Invalid credentials

**Solution**:
1. Double-check email and password
2. Make sure user exists from registration

### Empty Response / "Unexpected end of JSON input"
**Cause**: Backend returned 200 but empty body

**Solution**:
1. Current code handles this - should show "User registered successfully"
2. If still failing, backend needs to return JSON response

## 🚀 Full Process

### Registration Flow:
1. User fills form
2. Clicks "Create Account"
3. Frontend validates form (client-side)
4. Sends POST to `/api/auth/register` with user data
5. setupProxy.js intercepts and forwards to `http://localhost:8080/auth/register`
6. Backend processes registration
7. Backend returns response (200 with message or error status with message)
8. Frontend receives response
9. If successful, stores user info and redirects to login
10. If error, shows error message

### Login Flow:
1. User enters email & password
2. Clicks "Sign In"
3. Frontend validates form
4. Sends POST to `/api/auth/login` with credentials
5. setupProxy.js intercepts and forwards to `http://localhost:8080/auth/login`
6. Backend processes login
7. Backend returns response with token (if successful)
8. Frontend receives response
9. If successful, stores token and redirects to home
10. If error, shows error message

## 📝 Files Involved

- **Frontend Proxy**: `src/setupProxy.js`
- **API Config**: `src/utils/api.js`
- **Register Component**: `src/customer/components/registration/register.jsx`
- **Login Component**: `src/customer/components/registration/login.jsx`
- **Routes**: `src/App.js`

## 🔗 Important Notes

- The proxy only works in development mode (npm start)
- Once you build for production, you'll need actual CORS configuration on backend OR separate deployment strategy
- For production, consider configuring CORS on backend instead of using proxy
