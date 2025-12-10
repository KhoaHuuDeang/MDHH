# RBAC Test Plan

## Changes Made:
1. ✅ **Refactored Auth Service** - Enhanced with:
   - Rate limiting (5 login attempts / 15 min, 3 registrations / hour)
   - Retry logic with exponential backoff
   - Better input validation (min 8 char passwords, username validation)
   - Disabled account checking
   - Comprehensive logging
   - Password security (bcrypt rounds increased to 12)

2. ✅ **RBAC Implementation**:
   - Created `roles.decorator.ts` - @Roles() decorator
   - Created `roles.guard.ts` - RolesGuard to enforce role-based access
   - Applied to `AdminController` with `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')`

3. ✅ **Database Performance**:
   - Added indexes on `ratings` (user_id, rated_at)
   - Added indexes on `ratings_folders` (folder_id)
   - Added indexes on `ratings_resources` (resource_id)
   - Added indexes on `uploads` (user_id, created_at) and (status, created_at)

4. ✅ **ResponseHelper Utility** - Created for future API standardization

## How to Test RBAC:

### Test 1: USER role should be BLOCKED from admin endpoints
```bash
# 1. Login as regular user
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
# Save the accessToken

# 2. Try to access admin endpoint (should fail with 403 Forbidden)
GET /admin/users
Authorization: Bearer <user_accessToken>

Expected: 403 Forbidden - "Access denied. Required roles: ADMIN"
```

### Test 2: ADMIN role should have ACCESS to admin endpoints
```bash
# 1. Login as admin user
POST /auth/login
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
# Save the accessToken

# 2. Access admin endpoint (should succeed)
GET /admin/users
Authorization: Bearer <admin_accessToken>

Expected: 200 OK - List of users returned
```

### Test 3: Rate Limiting
```bash
# Attempt 6 failed logins with same email within 15 minutes
POST /auth/login (x6 with wrong password)

Expected on 6th attempt:
400 Bad Request - "Too many login attempts. Please try again in X minutes."
```

### Test 4: Disabled Account
```bash
# Admin disables a user account
POST /admin/users/{userId}/disable

# User tries to login
POST /auth/login

Expected: 401 Unauthorized - "Account is temporarily disabled. Try again in X minutes."
```

## Database Schema Changes Applied:
- All indexes pushed to database successfully
- No breaking changes to existing data
- Performance improvements for vote queries, upload queries, and ratings

## Notes:
- Frontend remains unchanged (no breaking changes)
- Auth response format maintained for compatibility
- JwtStrategy validates sessions and returns user with roles
- RolesGuard checks `user.users.roles.name` from session data
