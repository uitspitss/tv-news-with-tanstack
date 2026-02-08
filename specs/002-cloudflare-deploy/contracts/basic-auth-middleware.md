# Contract: Basic Authentication Middleware

**Feature**: 002-cloudflare-deploy
**Type**: Server Middleware
**Date**: 2026-02-08

## Overview

TanStack Start環境でのBasic認証ミドルウェア。HTTPリクエストごとに`Authorization`ヘッダーを検証し、有効な認証情報がない場合は401レスポンスを返す。

## Middleware Signature

```typescript
import { createMiddleware } from '@tanstack/react-start'

export const basicAuthMiddleware = createMiddleware()
  .server(async ({ next, context, request }) => {
    // Authentication logic
    // Returns: Response | ReturnType<typeof next>
  })
```

## Input

### Request Headers

**Authorization Header**:
```
Authorization: Basic <base64-encoded-credentials>
```

**Example**:
```
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

**Decoded**:
```
admin:password
```

### Environment Variables (from context)

```typescript
interface Env {
  BASIC_AUTH_USER: string      // Expected username
  BASIC_AUTH_PASSWORD: string  // Expected password
}
```

**Access**:
```typescript
const env = context.cloudflare.env as Env
const validUser = env.BASIC_AUTH_USER
const validPass = env.BASIC_AUTH_PASSWORD
```

## Output

### Success Case

**Condition**: Valid credentials provided

**Action**: Call `next()` to proceed to next middleware/handler

**Return**:
```typescript
return next()
```

### Failure Cases

#### Case 1: No Authorization Header

**Condition**: `Authorization` header missing

**Response**:
```typescript
new Response('Unauthorized', {
  status: 401,
  headers: {
    'WWW-Authenticate': 'Basic realm="Secure Area"',
  },
})
```

**HTTP Response**:
```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="Secure Area"

Unauthorized
```

**Browser Behavior**: Shows Basic Auth dialog

---

#### Case 2: Invalid Header Format

**Condition**: Header doesn't start with `Basic `

**Response**:
```typescript
new Response('Unauthorized', {
  status: 401,
  headers: {
    'WWW-Authenticate': 'Basic realm="Secure Area"',
  },
})
```

---

#### Case 3: Malformed Credentials

**Condition**: Base64 decode fails or missing colon

**Response**:
```typescript
new Response('Invalid credentials', {
  status: 401,
})
```

---

#### Case 4: Incorrect Credentials

**Condition**: Username or password doesn't match

**Response**:
```typescript
new Response('Unauthorized', {
  status: 401,
  headers: {
    'WWW-Authenticate': 'Basic realm="Secure Area"',
  },
})
```

## Processing Flow

```
1. Extract Authorization header from request
   ↓
2. Check if header exists and starts with "Basic "
   ↓ No → Return 401 with WWW-Authenticate
   ↓ Yes
3. Extract base64-encoded credentials
   ↓
4. Decode base64 to "user:pass" string
   ↓
5. Parse into { user, pass } object
   ↓ Invalid format → Return 401
   ↓ Valid
6. Fetch expected credentials from Env
   ↓
7. Timing-safe comparison
   ↓
8. Match? → next() | No match → 401
```

## Security Requirements

### 1. Timing-Safe Comparison

**Purpose**: Prevent timing attacks

**Implementation**:
```typescript
function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const aBuffer = encoder.encode(a)
  const bBuffer = encoder.encode(b)

  return crypto.subtle.timingSafeEqual(aBuffer, bBuffer)
}
```

**Usage**:
```typescript
const userMatch = timingSafeEqual(credentials.user, validUser)
const passMatch = timingSafeEqual(credentials.pass, validPass)

if (!userMatch || !passMatch) {
  // Return 401
}
```

**Why**: String comparison `===` can leak timing information. Use constant-time comparison for security-sensitive operations.

---

### 2. HTTPS Only

**Requirement**: Basic Auth must only be used over HTTPS

**Enforcement**: Cloudflare Workers default to HTTPS. No HTTP endpoints exposed.

**Rationale**: Base64 is not encryption. Credentials are easily decoded if intercepted.

---

### 3. Secret Management

**Requirement**: Never hardcode credentials

**Correct**:
```typescript
const validUser = env.BASIC_AUTH_USER  // From Cloudflare secret
```

**Incorrect**:
```typescript
const validUser = "admin"  // ❌ Never hardcode
```

---

## Examples

### Example 1: Successful Authentication

**Request**:
```http
GET / HTTP/1.1
Host: tv-news.example.com
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

**Environment**:
```
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=password
```

**Flow**:
```
1. Extract "Basic YWRtaW46cGFzc3dvcmQ="
2. Decode to "admin:password"
3. Parse to { user: "admin", pass: "password" }
4. Compare with env credentials
5. Match → next()
6. Return page content
```

**Response**:
```http
HTTP/1.1 200 OK
Content-Type: text/html

<html>...</html>
```

---

### Example 2: First Access (No Credentials)

**Request**:
```http
GET / HTTP/1.1
Host: tv-news.example.com
```

**Flow**:
```
1. Authorization header missing
2. Return 401 with WWW-Authenticate
```

**Response**:
```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="Secure Area"

Unauthorized
```

**Browser Behavior**:
```
[Browser shows login dialog]
┌────────────────────────────────────┐
│ Authentication Required            │
├────────────────────────────────────┤
│ The site says: "Secure Area"       │
│                                    │
│ User name: [_________________]     │
│ Password:  [_________________]     │
│                                    │
│        [Cancel]  [Log In]          │
└────────────────────────────────────┘
```

---

### Example 3: Invalid Credentials

**Request**:
```http
GET / HTTP/1.1
Host: tv-news.example.com
Authorization: Basic d3JvbmdfY3JlZHM=
```

**Decoded**: `wrong:creds`

**Flow**:
```
1. Extract and decode credentials
2. Compare with env credentials
3. No match → Return 401
```

**Response**:
```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="Secure Area"

Unauthorized
```

**Browser Behavior**: Shows login dialog again (credentials rejected)

---

## Integration Points

### Route-Level Protection

**Apply to specific route**:
```typescript
// routes/_protected.tsx
export const Route = createFileRoute('/_protected')({
  server: {
    middleware: [basicAuthMiddleware],
  },
})
```

**Result**: All child routes under `/_protected/` require authentication

---

### Global Protection

**Apply to all routes**:
```typescript
// router.tsx
export function getRouter() {
  const router = createRouter({
    routeTree,
    server: {
      middleware: [basicAuthMiddleware],
    },
  })
  return router
}
```

**Result**: Entire application requires authentication

---

### Selective Protection

**Protect specific server functions**:
```typescript
// routes/api/protected-data.ts
export const getProtectedData = createServerFn({ method: 'GET' })
  .middleware([basicAuthMiddleware])
  .handler(async () => {
    return { data: 'sensitive information' }
  })
```

---

## Error Handling

### Middleware Errors

**Scenario**: Environment variables missing

**Detection**:
```typescript
const validUser = env.BASIC_AUTH_USER || 'admin'  // Fallback
const validPass = env.BASIC_AUTH_PASSWORD || 'password'  // Fallback
```

**Better Approach**:
```typescript
if (!env.BASIC_AUTH_USER || !env.BASIC_AUTH_PASSWORD) {
  console.error('Basic Auth credentials not configured')
  return new Response('Server misconfiguration', {
    status: 500,
  })
}
```

---

### Parsing Errors

**Scenario**: Malformed base64 or missing colon

**Detection**:
```typescript
try {
  const credentials = atob(base64Credentials)
  const [user, pass] = credentials.split(':')

  if (!user || !pass) {
    throw new Error('Invalid format')
  }
} catch (error) {
  return new Response('Invalid credentials', {
    status: 401,
  })
}
```

---

## Testing Scenarios

### Test Case 1: No Authorization Header

**Request**:
```typescript
const request = new Request('https://example.com/')
// No Authorization header
```

**Expected**:
```typescript
expect(response.status).toBe(401)
expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="Secure Area"')
```

---

### Test Case 2: Valid Credentials

**Request**:
```typescript
const request = new Request('https://example.com/', {
  headers: {
    'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ=', // admin:password
  },
})
```

**Environment**:
```typescript
const env = {
  BASIC_AUTH_USER: 'admin',
  BASIC_AUTH_PASSWORD: 'password',
}
```

**Expected**:
```typescript
expect(response.status).toBe(200)  // Or next middleware's response
```

---

### Test Case 3: Invalid Credentials

**Request**:
```typescript
const request = new Request('https://example.com/', {
  headers: {
    'Authorization': 'Basic d3JvbmdfY3JlZHM=', // wrong:creds
  },
})
```

**Expected**:
```typescript
expect(response.status).toBe(401)
```

---

### Test Case 4: Malformed Header

**Request**:
```typescript
const request = new Request('https://example.com/', {
  headers: {
    'Authorization': 'Bearer token123',  // Not Basic
  },
})
```

**Expected**:
```typescript
expect(response.status).toBe(401)
```

---

## Performance Considerations

### Constant-Time Operations

**Requirement**: Authentication check must be constant time

**Implementation**:
- Use `crypto.subtle.timingSafeEqual()` for comparison
- Avoid early returns based on username vs password

**Bad Practice**:
```typescript
if (credentials.user !== validUser) {
  return error  // ❌ Leaks timing info
}
if (credentials.pass !== validPass) {
  return error  // ❌ Leaks timing info
}
```

**Good Practice**:
```typescript
const userMatch = timingSafeEqual(credentials.user, validUser)
const passMatch = timingSafeEqual(credentials.pass, validPass)

if (!userMatch || !passMatch) {
  return error  // ✅ Constant time
}
```

---

### Minimal Overhead

**Requirement**: Middleware should add < 1ms overhead

**Optimization**:
- Avoid unnecessary string operations
- Cache environment variables if possible
- Minimize allocations

---

## Future Enhancements

### Rate Limiting

**Purpose**: Prevent brute force attacks

**Implementation**:
```typescript
// Track failed attempts per IP
const attempts = await getFailedAttempts(clientIP)
if (attempts > 10) {
  return new Response('Too many attempts', { status: 429 })
}
```

---

### Session Support

**Purpose**: Avoid repeated authentication

**Implementation**:
```typescript
// Check session cookie before Basic Auth
const sessionId = request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1]
if (sessionId && await validateSession(sessionId)) {
  return next()
}
// Fall back to Basic Auth
```

---

### Audit Logging

**Purpose**: Track authentication events

**Implementation**:
```typescript
await logAuthEvent({
  timestamp: new Date(),
  ip: request.headers.get('CF-Connecting-IP'),
  success: authenticated,
  user: credentials?.user,
})
```

---

**Note**: このコントラクトはCloudflare Workers環境とTanStack Startミドルウェアシステムに特化しています。
