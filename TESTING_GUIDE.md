# Authentication System - Quick Testing Guide

## Getting Started

### Dev Server Status
- ✅ Running at `http://localhost:3000`
- ✅ Database configured and seeded
- ✅ All endpoints ready

---

## Test Accounts

Use these credentials to test different roles:

```
┌─────────────────────────┬──────────────────┬────────────────────────┐
│ Email                   │ Password         │ Role                   │
├─────────────────────────┼──────────────────┼────────────────────────┤
│ admin@laspa.gov.ng      │ Admin@123456     │ ADMIN                  │
│ officer@laspa.gov.ng    │ Officer@123456   │ ENFORCEMENT_OFFICER    │
│ analyst@laspa.gov.ng    │ Analyst@123456   │ ANALYST                │
│ viewer@laspa.gov.ng     │ Viewer@123456    │ VIEWER                 │
└─────────────────────────┴──────────────────┴────────────────────────┘
```

---

## Test Scenarios

### 1. Login Test (Basic)
**Test**: Login with valid admin credentials
1. Navigate to `http://localhost:3000/login`
2. Enter email: `admin@laspa.gov.ng`
3. Enter password: `Admin@123456`
4. Click "Sign In"
5. **Expected**: Redirected to home page, user info visible in sidebar

### 2. Login with Remember Me
**Test**: Verify Remember Me functionality
1. Go to login page
2. Enter valid credentials
3. Check "Remember me"
4. Click "Sign In"
5. Wait for redirect
6. Close browser completely
7. Reopen and navigate to `http://localhost:3000`
8. **Expected**: Still logged in (session extended to 30 days)

### 3. Invalid Password
**Test**: Test security with incorrect password
1. Go to login page
2. Enter email: `admin@laspa.gov.ng`
3. Enter incorrect password
4. Click "Sign In"
5. **Expected**: Error message "Invalid email or password."

### 4. Rate Limiting
**Test**: Test login rate limiting (5 attempts per 15 minutes)
1. Go to login page
2. Attempt login with wrong password 5 times rapidly
3. On 6th attempt
4. **Expected**: Error message about rate limiting

### 5. Signup Test
**Test**: Create a new user account
1. Navigate to `http://localhost:3000/signup`
2. Enter:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `testuser@laspa.gov.ng`
   - Password: `TestPass@123456`
   - Confirm: `TestPass@123456`
3. **Expected**: 
   - Password requirements show as met
   - Success message
   - Redirect to login page

### 6. Password Reset Flow
**Test**: Reset password via email link
1. Go to `http://localhost:3000/forgot-password`
2. Enter email: `admin@laspa.gov.ng`
3. Click "Send Reset Link"
4. **Expected**: Message about reset link being sent
5. **Note**: In development, check server logs for reset token

### 7. Role-Based Access - Admin
**Test**: Admin can access user management
1. Login as admin
2. Go to `http://localhost:3000/settings/users`
3. **Expected**: User management page loads with user list

### 8. Role-Based Access - Viewer
**Test**: Viewer cannot access user management
1. Logout (if logged in)
2. Login as viewer: `viewer@laspa.gov.ng` / `Viewer@123456`
3. Try to navigate to `http://localhost:3000/settings/users`
4. **Expected**: Redirected to home page (access denied)

### 9. Role-Based Access - Officer
**Test**: Officer can access enforcement routes
1. Logout
2. Login as officer: `officer@laspa.gov.ng` / `Officer@123456`
3. Navigate to `http://localhost:3000/enforcement`
4. **Expected**: Enforcement page loads

### 10. Logout Test
**Test**: Logout clears session
1. Login with any account
2. Click logout button in sidebar
3. Attempt to go back to dashboard
4. **Expected**: Redirected to login page

### 11. Inactivity Timeout
**Test**: Auto-logout after 30 minutes inactivity
1. Login with any account
2. Do not interact with page for 30+ minutes
3. Try to interact with page
4. **Expected**: Automatically logged out and redirected to login

### 12. User Management - Create User (Admin Only)
**Test**: Admin can create new users
1. Login as admin
2. Go to `http://localhost:3000/settings/users`
3. Click "Add User"
4. Fill in form:
   - First Name: `New`
   - Last Name: `User`
   - Email: `newuser@laspa.gov.ng`
   - Password: `NewPass@123456`
   - Role: `ANALYST`
5. Click "Create User"
6. **Expected**: User added to list

### 13. User Management - Deactivate User (Admin Only)
**Test**: Admin can deactivate users
1. Login as admin
2. Go to user management
3. Click toggle button next to a user
4. **Expected**: User status changes from Active to Inactive

### 14. User Management - Delete User (Admin Only)
**Test**: Admin can delete users
1. Login as admin
2. Go to user management
3. Click delete (trash) icon
4. Confirm deletion
5. **Expected**: User removed from list

---

## Sidebar Features

### Logged-In User Display
- ✅ User initials in avatar
- ✅ Full name display
- ✅ User role display
- ✅ Logout button

### Navigation Changes
- ✅ Route visibility based on role
- ✅ Protected routes redirect when unauthorized

---

## Security Tests

### 1. Cookie Security
**Test**: Verify httpOnly cookies
1. Login with valid credentials
2. Open Developer Tools (F12)
3. Go to Application > Cookies
4. **Expected**: `accessToken` and `refreshToken` cookies visible
5. **Check**: Cookies have `HttpOnly` flag set (cannot access from JS)

### 2. Password Validation
**Test**: Password must meet requirements
1. Go to signup page
2. Try password without uppercase
3. **Expected**: "Uppercase letter" requirement shows red
4. Try password with all requirements
5. **Expected**: All requirements show green, button enabled

### 3. CORS & CSRF Protection
**Test**: Cross-origin requests blocked
1. Open browser console
2. Try to make request to API from different domain
3. **Expected**: CORS/CSRF protection prevents it

---

## Performance Checks

### 1. Page Load Times
- Login page: < 2 seconds
- Signup page: < 2 seconds
- User management: < 3 seconds

### 2. API Response Times
- Login endpoint: < 500ms
- User list fetch: < 500ms
- User creation: < 1000ms

### 3. Database Queries
- All indexes created
- N+1 query prevention
- Connection pooling active

---

## Error Scenarios

### 1. Network Error During Login
**Test**: Handle network failures gracefully
1. While logging in, lose network connection
2. **Expected**: Error message displayed

### 2. Database Connection Error
**Test**: Handle database unavailability
1. Stop database connection
2. Try to login
3. **Expected**: User-friendly error message

### 3. Invalid Token
**Test**: Expired tokens handled correctly
1. Login and get token
2. Manually clear cookies
3. Refresh page
4. **Expected**: Redirect to login

### 4. Malformed URL Tokens
**Test**: Invalid password reset tokens
1. Navigate to `/reset-password/invalid-token`
2. **Expected**: "Invalid or expired reset link" message

---

## Browser Compatibility

Test on these browsers:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## Mobile Responsiveness

Test on these viewports:
- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

### Mobile Login Test
1. Open login page on mobile device
2. Verify form is readable
3. Test input fields
4. Test button responsiveness
5. **Expected**: All elements visible and usable

---

## Accessibility Tests

### 1. Keyboard Navigation
- Tab through form fields
- Space/Enter to submit
- Arrow keys in dropdowns

### 2. Screen Reader
- Form labels associated with inputs
- Error messages announced
- Focus indicators visible

### 3. Color Contrast
- Text contrast ratio > 4.5:1
- Dark navy (#0F1419) on light backgrounds
- Blue accent (#4A9EFF) readable

---

## Data Validation Tests

### 1. Email Validation
- Invalid formats rejected
- Duplicates not allowed
- Case-insensitive matching

### 2. Password Validation
- Length requirement enforced
- Character requirements checked
- Confirmation match verified

### 3. Name Validation
- First/last name required
- Trimmed of whitespace
- Special characters allowed

---

## Session Management Tests

### 1. Multiple Tabs
**Test**: Session consistency across tabs
1. Login in Tab A
2. Open new tab and visit app
3. **Expected**: Logged in state synchronized

### 2. Concurrent Requests
**Test**: Handle multiple simultaneous requests
1. Login and make multiple API calls
2. **Expected**: All requests succeed with consistent state

### 3. Token Refresh
**Test**: Automatic token refresh
1. Monitor network in DevTools
2. After 15 minutes, make request
3. **Expected**: Access token automatically refreshed

---

## Quick Test Checklist

```
Login & Authentication
  ☐ Login with valid credentials works
  ☐ Login with invalid password fails
  ☐ Remember Me extends session to 30 days
  ☐ Rate limiting blocks after 5 attempts
  ☐ Logout clears session
  ☐ 30-minute inactivity timeout works

User Registration
  ☐ Signup form validates passwords
  ☐ Password requirements display correctly
  ☐ Confirmation password matching works
  ☐ Email uniqueness enforced
  ☐ New users created as VIEWER role

Password Reset
  ☐ Forgot password page sends reset link
  ☐ Reset token validates
  ☐ Password updated successfully
  ☐ Old password doesn't work after reset
  ☐ Reset token expires after 1 hour

Role-Based Access
  ☐ Admin can access settings/users
  ☐ Officer can access enforcement routes
  ☐ Analyst can access reports/revenue
  ☐ Viewer restricted to read-only
  ☐ Unauthorized redirects work

User Management (Admin)
  ☐ Can view all users
  ☐ Can create new users
  ☐ Can assign roles
  ☐ Can deactivate users
  ☐ Can delete users

Sidebar Features
  ☐ User info displays correctly
  ☐ User initials shown in avatar
  ☐ Role displayed
  ☐ Logout button works
  ☐ Responsive on mobile

Security
  ☐ Passwords hashed in database
  ☐ Tokens stored in httpOnly cookies
  ☐ CORS headers configured
  ☐ Rate limiting functional
  ☐ Session tokens expire correctly

Database
  ☐ Auth tables created
  ☐ Users table synced
  ☐ Test data seeded
  ☐ Migrations applied
  ☐ Prisma client generated
```

---

## Troubleshooting Guide

### "Login Failed" Error
- ✅ Check database is running
- ✅ Verify DATABASE_URL in .env.local
- ✅ Check user exists in database
- ✅ Verify password is correct

### "Rate Limit Exceeded"
- ✅ Wait 15 minutes for reset
- ✅ Use different email address
- ✅ Check server logs for details

### "Token Expired"
- ✅ Login again to get new token
- ✅ Clear cookies and refresh
- ✅ Check system time is correct

### "Page Not Found" After Login
- ✅ Check user role has access
- ✅ Verify middleware.ts configured
- ✅ Check route protection logic

### "Database Connection Error"
- ✅ Ensure PostgreSQL running on port 5433
- ✅ Verify DATABASE_URL is correct
- ✅ Check database exists and is accessible
- ✅ Run: `npx prisma db push`

### "Module Not Found" Errors
- ✅ Install dependencies: `npm install`
- ✅ Generate Prisma client: `npx prisma generate`
- ✅ Clear .next folder: `rm -rf .next`
- ✅ Restart dev server: `npm run dev`

---

## Performance Metrics

### Target Metrics
- Login time: < 500ms
- Page load: < 2 seconds
- API response: < 500ms
- Database query: < 100ms

### Monitoring
- Check Network tab in DevTools
- Monitor server logs
- Check database query performance
- Monitor memory usage

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Fix any identified issues
3. ✅ Configure production environment
4. ✅ Set up monitoring/logging
5. ✅ Configure email service for password reset
6. ✅ Deploy to staging
7. ✅ Load testing
8. ✅ Security audit
9. ✅ Deploy to production

---

**Last Updated**: February 7, 2025
**Test Duration**: 60-90 minutes
**Pass Criteria**: All 14+ scenarios pass successfully
