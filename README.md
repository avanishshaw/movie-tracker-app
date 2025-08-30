# Movie Tracker API (Backend)

This is the backend for the Movie Tracker application, a full-stack web app that allows users to manage a list of their favorite movies and TV shows. It features a secure RESTful API with user authentication, role-based access control, and an admin approval system for new entries.

## Features

-   **Authentication**: Secure user registration and login using JSON Web Tokens (JWT).
-   **Role-Based Access Control**: `admin` and `user` roles to manage permissions.
-   **CRUD Operations**: Full Create, Read, Update, and Delete functionality for media entries.
-   **Admin Approval Workflow**: User-submitted entries are held in a 'pending' state until an admin approves or rejects them.
-   **Soft Deletes**: Entries are marked as deleted but not permanently removed from the database.
-   **Validation**: Secure request validation using Zod.
-   **API Documentation**: Interactive API documentation powered by Swagger/OpenAPI.

## Tech Stack

-   **Framework**: Node.js with Express.js
-   **Database**: MongoDB with Mongoose
-   **Authentication**: JSON Web Tokens (JWT)
-   **Validation**: Zod
-   **API Documentation**: Swagger/OpenAPI
-   **Containerization**: Docker

## API Documentation

Interactive API documentation is available through Swagger UI. Once the server is running, you can access it at:

[cite_start][**http://localhost:5001/api-docs**](http://localhost:5001/api-docs) [cite: 7]

## [cite_start]Database Schema [cite: 4]

The application uses two main collections: `users` and `mediaEntries`.

### User Schema

| Field      | Type     | Constraints                | Description                      |
| :--------- | :------- | :------------------------- | :------------------------------- |
| `_id`      | ObjectId | Primary Key                | Unique identifier for the user.  |
| `name`     | String   | Required                   | User's full name.                |
| `email`    | String   | Required, Unique           | User's email address.            |
| `password` | String   | Required                   | Hashed user password.            |
| `role`     | String   | Enum: `['user', 'admin']`  | User's role, defaults to `user`. |
| `createdAt`| Date     | -                          | Timestamp of creation.           |
| `updatedAt`| Date     | -                          | Timestamp of last update.        |

### MediaEntry Schema

| Field      | Type     | Constraints               | Description                             |
| :--------- | :------- | :------------------------ | :-------------------------------------- |
| `_id`      | ObjectId | Primary Key               | Unique identifier for the media entry.  |
| `title`    | String   | Required                  | Title of the movie or TV show.          |
| `type`     | String   | Enum: `['Movie', 'TV Show']` | Type of media.                        |
| `director` | String   | Required                  | Director's name.                        |
| `budget`   | Number   | Required                  | Production budget.                      |
| `location` | String   | Required                  | Filming location.                       |
| `duration` | String   | Required                  | Runtime or season count.                |
| `releaseYear` | Number | Required                  | The year of release.                    |
| `status`   | String   | Enum: `['pending', 'approved', 'rejected']` | Approval status, defaults to `pending`. |
| `createdBy`| ObjectId | Ref: 'User'               | The user who created the entry.         |
| `isDeleted`| Boolean  | -                         | Flag for soft deletes, defaults to `false`. |
| `deletedAt`| Date     | -                         | Timestamp of soft delete.               |
| `createdAt`| Date     | -                         | Timestamp of creation.                  |
| `updatedAt`| Date     | -                         | Timestamp of last update.               |

## [cite_start]Local Setup Instructions [cite: 3]

1.  **Clone the repository:**
    ```sh
    git clone <your-repo-url>
    cd <your-repo-name>/backend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory by copying the example file:
    ```sh
    cp .env.example .env
    ```
    Now, open the `.env` file and fill in the required values for `MONGO_URI` and `JWT_SECRET`.

4.  **Start the server:**
    ```sh
    npm start
    ```
    The server will be running on `http://localhost:5001`.

## [cite_start]Docker Setup [cite: 3]

1.  Ensure you have Docker installed and running.
2.  Navigate to the `backend` directory.
3.  Build the Docker image:
    ```sh
    docker build -t movie-tracker-api .
    ```
4.  Run the Docker container:
    ```sh
    docker run -p 5001:5001 -d --env-file .env movie-tracker-api
    ```
    The container will be running in detached mode, and the API will be accessible at `http://localhost:5001`.

## [cite_start]Testing Instructions [cite: 8]

To run the automated tests, use the following command:
```sh
npm test
```

## [cite_start]Demo Credentials [cite: 9]

Once the application is running, you can register two different users to test the role-based features:
-   **User Role**: Register a new user through the `POST /api/v1/auth/register` endpoint. This user will have the default `user` role.
-   **Admin Role**: To create an admin, register a user and then manually change their `role` field in the MongoDB database from `'user'` to `'admin'`.

## API Usage & Testing Examples (Postman)

Here are Postman examples demonstrating the core authentication flow.

### 1. User Registration

A new user is created by sending a `POST` request to the `/auth/register` endpoint.

![Successful User Registration](img/img-1.png)

### 2. User Login

A registered user can log in via the `POST /auth/login` endpoint to receive a JWT access token.

![Successful User Login](img/img-2.png)

### 3. Accessing Protected Routes (Failure)

Attempting to access a protected route like `GET /users/me` without providing a valid Bearer Token results in a `401 Unauthorized` error, as expected.

![Protected Route Failure](img/img-3.png)

### 4. Accessing Protected Routes (Success)

Providing the JWT as a Bearer Token in the Authorization header grants access to protected routes.

![Protected Route Success](img/img-4.png)