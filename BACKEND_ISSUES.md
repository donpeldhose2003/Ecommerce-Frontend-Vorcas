# Backend Issues & Frontend Fixes

## Issue: Registration Returns 400 Status Code

### Problem
The backend is returning HTTP 400 (Bad Request) for successful registrations, but still creating the user and returning the user data.

### Current Behavior
```
POST /auth/register
Response Status: 400 (Error)
Response Body: { _id: "...", firstName: "John", email: "john@gmail.com", ... }
```

### Why This Is Wrong
- HTTP 400 = "Bad Request" - indicates the request was malformed
- Successful registration should return:
  - **201 Created** (Recommended for resource creation)
  - **200 OK** (Acceptable alternative)

### Frontend Fix Applied
The frontend now accepts registrations with:
- Status 200, 201 as success ✅
- Status 400 IF user data is returned in response ✅
- Extracts role from response (handles both `role` and `ROLE_USER` format)

### Backend Fix Required
Update your backend to return the correct status code:

```java
// BEFORE (Wrong)
@PostMapping("/register")
public ResponseEntity<?> registerUser(...) {
    // ... registration logic ...
    return ResponseEntity.status(400).body(user); // ❌ Wrong status
}

// AFTER (Correct)
@PostMapping("/register")
public ResponseEntity<?> registerUser(...) {
    // ... registration logic ...
    return ResponseEntity.status(201).body(user); // ✅ Correct status
    // Or
    return ResponseEntity.ok(user); // ✅ Also correct
}
```

### Role Handling
The backend returns role as `ROLE_USER` (Java convention), but the frontend converts it to lowercase `user` for consistency:
- Backend returns: `"role": "ROLE_USER"`
- Frontend stores: `"role": "user"` or `"role": "admin"`

This is handled in the registration component:
```javascript
role: data?.role ? data.role.replace('ROLE_', '').toLowerCase() : 'customer'
```

### Additional Notes
1. **For Admin Role**: Backend should return `ROLE_ADMIN` which becomes `admin`
2. **For Customer Role**: Backend should return `ROLE_USER` which becomes `user` or `customer`
3. **HTTP Status Codes**:
   - 201 Created: Best for resource creation
   - 200 OK: Acceptable for successful requests
   - 400 Bad Request: Should NOT be used for successful operations

---

## Related Files
- `src/customer/components/registration/register.jsx` - Updated registration handling
- `src/customer/components/registration/login.jsx` - Login should also handle roles properly
