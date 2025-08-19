# API Documentation

This document describes the REST API endpoints available in the File Explorer backend.

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently, the API does not require authentication. This may change in future versions.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

## Endpoints

### Folders

#### Get All Folders
```
GET /folders
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Documents",
      "parentId": null,
      "path": "/Documents",
      "createdAt": "2024-01-15T10:00:00Z",
      "modifiedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Get Folder by ID
```
GET /folders/:id
```

**Parameters:**
- `id` (string): Folder ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Documents",
    "parentId": null,
    "path": "/Documents",
    "createdAt": "2024-01-15T10:00:00Z",
    "modifiedAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Get Folder Contents
```
GET /folders/:id/contents
```

**Parameters:**
- `id` (string): Folder ID

**Response:**
```json
{
  "success": true,
  "data": {
    "folders": [
      {
        "id": "2",
        "name": "Subfolder",
        "parentId": "1",
        "path": "/Documents/Subfolder",
        "createdAt": "2024-01-15T10:30:00Z",
        "modifiedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "files": [
      {
        "id": "1",
        "name": "document.pdf",
        "folderId": "1",
        "path": "/Documents/document.pdf",
        "size": 1024576,
        "extension": "pdf",
        "mimeType": "application/pdf",
        "createdAt": "2024-01-15T11:00:00Z",
        "modifiedAt": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

#### Create Folder
```
POST /folders
```

**Request Body:**
```json
{
  "name": "New Folder",
  "parentId": "1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "3",
    "name": "New Folder",
    "parentId": "1",
    "path": "/Documents/New Folder",
    "createdAt": "2024-01-15T12:00:00Z",
    "modifiedAt": "2024-01-15T12:00:00Z"
  }
}
```

#### Update Folder
```
PUT /folders/:id
```

**Parameters:**
- `id` (string): Folder ID

**Request Body:**
```json
{
  "name": "Renamed Folder"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "3",
    "name": "Renamed Folder",
    "parentId": "1",
    "path": "/Documents/Renamed Folder",
    "createdAt": "2024-01-15T12:00:00Z",
    "modifiedAt": "2024-01-15T12:30:00Z"
  }
}
```

#### Delete Folder
```
DELETE /folders/:id
```

**Parameters:**
- `id` (string): Folder ID

**Response:**
```json
{
  "success": true,
  "message": "Folder deleted successfully"
}
```

### Files

#### Get All Files
```
GET /files
```

**Query Parameters:**
- `folderId` (string, optional): Filter files by folder ID
- `limit` (number, optional): Limit number of results (default: 100)
- `offset` (number, optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "document.pdf",
      "folderId": "1",
      "path": "/Documents/document.pdf",
      "size": 1024576,
      "extension": "pdf",
      "mimeType": "application/pdf",
      "createdAt": "2024-01-15T11:00:00Z",
      "modifiedAt": "2024-01-15T11:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 100,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Get File by ID
```
GET /files/:id
```

**Parameters:**
- `id` (string): File ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "document.pdf",
    "folderId": "1",
    "path": "/Documents/document.pdf",
    "size": 1024576,
    "extension": "pdf",
    "mimeType": "application/pdf",
    "createdAt": "2024-01-15T11:00:00Z",
    "modifiedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### Create File
```
POST /files
```

**Request Body:**
```json
{
  "name": "new-file.txt",
  "folderId": "1",
  "size": 1024,
  "extension": "txt",
  "mimeType": "text/plain"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "2",
    "name": "new-file.txt",
    "folderId": "1",
    "path": "/Documents/new-file.txt",
    "size": 1024,
    "extension": "txt",
    "mimeType": "text/plain",
    "createdAt": "2024-01-15T13:00:00Z",
    "modifiedAt": "2024-01-15T13:00:00Z"
  }
}
```

#### Update File
```
PUT /files/:id
```

**Parameters:**
- `id` (string): File ID

**Request Body:**
```json
{
  "name": "renamed-file.txt"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "2",
    "name": "renamed-file.txt",
    "folderId": "1",
    "path": "/Documents/renamed-file.txt",
    "size": 1024,
    "extension": "txt",
    "mimeType": "text/plain",
    "createdAt": "2024-01-15T13:00:00Z",
    "modifiedAt": "2024-01-15T13:30:00Z"
  }
}
```

#### Delete File
```
DELETE /files/:id
```

**Parameters:**
- `id` (string): File ID

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Search

#### Basic Search
```
GET /search?q=searchTerm
```

**Query Parameters:**
- `q` (string): Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "folders": [
      {
        "id": "1",
        "name": "Documents",
        "parentId": null,
        "path": "/Documents",
        "createdAt": "2024-01-15T10:00:00Z",
        "modifiedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "files": [
      {
        "id": "1",
        "name": "document.pdf",
        "folderId": "1",
        "path": "/Documents/document.pdf",
        "size": 1024576,
        "extension": "pdf",
        "mimeType": "application/pdf",
        "createdAt": "2024-01-15T11:00:00Z",
        "modifiedAt": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

#### Advanced Search
```
POST /search/advanced
```

**Request Body:**
```json
{
  "name": "document",
  "type": "file",
  "extension": "pdf",
  "minSize": 1024,
  "maxSize": 10485760,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "folders": [],
    "files": [
      {
        "id": "1",
        "name": "document.pdf",
        "folderId": "1",
        "path": "/Documents/document.pdf",
        "size": 1024576,
        "extension": "pdf",
        "mimeType": "application/pdf",
        "createdAt": "2024-01-15T11:00:00Z",
        "modifiedAt": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

#### Search by Type
```
GET /search/type/:type
```

**Parameters:**
- `type` (string): Either "folder" or "file"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Documents",
      "parentId": null,
      "path": "/Documents",
      "createdAt": "2024-01-15T10:00:00Z",
      "modifiedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `DATABASE_ERROR` | 500 | Database operation failed |

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Rate Limit**: 1000 requests per hour per IP
- **Headers**: Rate limit information is included in response headers
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time (Unix timestamp)

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for the following origins:
- `http://localhost:5173` (Frontend development server)
- `http://localhost:3000` (Production frontend)

## Request/Response Examples

### Creating a Folder with Error Handling

**Request:**
```bash
curl -X POST http://localhost:3001/api/folders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "parentId": "invalid-id"
  }'
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "name": "Name is required",
      "parentId": "Invalid parent folder ID"
    }
  }
}
```

### Successful File Upload

**Request:**
```bash
curl -X POST http://localhost:3001/api/files \
  -H "Content-Type: application/json" \
  -d '{
    "name": "report.pdf",
    "folderId": "1",
    "size": 2048576,
    "extension": "pdf",
    "mimeType": "application/pdf"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "3",
    "name": "report.pdf",
    "folderId": "1",
    "path": "/Documents/report.pdf",
    "size": 2048576,
    "extension": "pdf",
    "mimeType": "application/pdf",
    "createdAt": "2024-01-15T14:00:00Z",
    "modifiedAt": "2024-01-15T14:00:00Z"
  },
  "message": "File created successfully"
}
```

## SDK Usage Examples

### JavaScript/TypeScript
```typescript
// Using fetch
const response = await fetch('http://localhost:3001/api/folders/1', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
if (result.success) {
  console.log('Folder:', result.data);
} else {
  console.error('Error:', result.error);
}

// Using axios
import axios from 'axios';

try {
  const response = await axios.get('http://localhost:3001/api/folders/1');
  console.log('Folder:', response.data.data);
} catch (error) {
  console.error('Error:', error.response.data.error);
}
```

### Python
```python
import requests

# Get folder
response = requests.get('http://localhost:3001/api/folders/1')
if response.status_code == 200:
    data = response.json()
    if data['success']:
        print('Folder:', data['data'])
    else:
        print('Error:', data['error'])

# Create folder
payload = {
    'name': 'New Folder',
    'parentId': '1'
}
response = requests.post('http://localhost:3001/api/folders', json=payload)
data = response.json()
```

## Versioning

The API follows semantic versioning. The current version is `v1`. Future versions will be available at:
- `http://localhost:3001/api/v2/...`

## Changelog

### v1.0.0 (Current)
- Initial API release
- Folder and file management
- Search functionality
- SOLID principles implementation
