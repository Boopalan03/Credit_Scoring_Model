# Credit Scoring Model Backend API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication (`/auth`)

### 1. Register
- **URL**: `/auth/register`
- **Method**: `POST`
- **Description**: Register a new user.
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user" // optional, defaults to 'user'
  }
  ```
- **Response**: `201 Created` with user details and JWT token.

### 2. Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Description**: Authenticate user and get token.
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK` with user details and JWT token.

### 3. Logout
- **URL**: `/auth/logout`
- **Method**: `POST`
- **Description**: Logout user (client should discard token).
- **Response**: `200 OK`

---

## Credit Applications (`/applications`)

### 1. Submit Application
- **URL**: `/applications/submit`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Description**: Submit a loan application. The backend runs the ML model and saves the prediction.
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "income": 50000,
    "loan_amount": 10000,
    "loan_intent": "EDUCATION",
    "loan_grade": "A",
    "loan_int_rate": 10.5,
    "percent_income": 0.2,
    "cb_person_default_on_file": "N",
    "cb_person_cred_hist_length": 5
  }
  ```
- **Response**: `201 Created` with application and prediction details.

### 2. Get My Applications
- **URL**: `/applications/my-applications`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Get all applications submitted by the logged-in user.
- **Response**: `200 OK` with list of applications.

### 3. Get Application Status
- **URL**: `/applications/:id`
- **Method**: `GET`
- **Auth Required**: Yes (Must be the creator or admin)
- **Description**: Get details of a specific application.
- **Response**: `200 OK`

---

## Admin (`/admin`)

### 1. Get All Applications
- **URL**: `/admin/applications`
- **Method**: `GET`
- **Auth Required**: Yes (Admin only)
- **Description**: Get all credit applications.
- **Response**: `200 OK` with list of applications.

### 2. Update Application Status
- **URL**: `/admin/applications/:id/status`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin only)
- **Description**: Approve or reject an application.
- **Body**:
  ```json
  {
    "status": "Approved" // 'Approved', 'Rejected', or 'Pending'
  }
  ```
- **Response**: `200 OK` with updated application.

### 3. Get Dashboard Stats
- **URL**: `/admin/dashboard-stats`
- **Method**: `GET`
- **Auth Required**: Yes (Admin only)
- **Description**: Get aggregated stats for the admin dashboard.
- **Response**: `200 OK` with analytics.
