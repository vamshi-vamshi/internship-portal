# API Documentation — Internship Portal

Base URL: `http://localhost:8080/api`

All protected endpoints require the header:
```
Authorization: Bearer <jwt_token>
```

---

## Auth

### POST /auth/register
Register a new user.

**Request Body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }
```
**Response 200:**
```json
{ "token": "eyJ...", "email": "john@example.com", "name": "John Doe", "role": "USER" }
```

---

### POST /auth/login
**Request Body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```
**Response 200:**
```json
{ "token": "eyJ...", "email": "john@example.com", "name": "John Doe", "role": "USER" }
```
**Error 401:** Invalid credentials.

---

## Internships (Public)

### GET /internships
List all internships with optional filters and pagination.

**Query Params:**
| Param | Type | Description |
|---|---|---|
| page | int | Page number (default: 0) |
| size | int | Items per page (default: 9) |
| skills | string | Comma-separated skills to filter by |
| location | string | Location substring match |
| maxExperience | int | Maximum experience required |

**Response 200:**
```json
{
  "content": [ { "id": 1, "title": "...", "company": "...", "skills": "React,JS", ... } ],
  "currentPage": 0,
  "totalPages": 3,
  "totalElements": 25
}
```

---

### GET /internships/{id}
Get a single internship by ID.

**Response 200:**
```json
{
  "id": 1, "title": "Frontend Intern", "company": "TechCorp",
  "description": "...", "location": "Bangalore", "skills": "React,JS",
  "minExperience": 0, "stipend": 18000, "companyApplicationLink": "https://...",
  "createdAt": "2024-01-15T10:30:00"
}
```
**Error 404:** Internship not found.

---

## Recommendations (Authenticated)

### GET /recommendations
Get personalized internship recommendations.

**Query Params:**
| Param | Type | Description |
|---|---|---|
| skills | string | Your skills (comma-separated) |
| preferredLocation | string | Your preferred location |
| experienceYears | int | Your years of experience |
| page | int | Page number |
| size | int | Items per page |

**Response 200:** Same structure as GET /internships

---

## Admin (ADMIN role only)

### POST /admin/internships
Create a new internship.

**Request Body:**
```json
{
  "title": "Backend Intern",
  "company": "Acme Corp",
  "description": "...",
  "location": "Remote",
  "skills": "Java,Spring Boot,MySQL",
  "minExperience": 0,
  "stipend": 20000,
  "companyApplicationLink": "https://acme.com/apply"
}
```
**Response 201:** Created internship object.

---

### PUT /admin/internships/{id}
Update an existing internship. Same body as POST.

**Response 200:** Updated internship object.
**Error 404:** Not found.

---

### DELETE /admin/internships/{id}
Delete an internship.

**Response 200:** `{ "message": "Internship deleted successfully" }`
**Error 404:** Not found.

---

## Error Format
All errors return:
```json
{ "message": "Error description here" }
```
Or for validation errors:
```json
{ "field": "error message", "field2": "error message" }
```

## HTTP Status Codes
| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized / bad credentials |
| 403 | Forbidden (insufficient role) |
| 404 | Not found |
| 500 | Server error |
