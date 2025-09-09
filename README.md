# Full-Stack Movie & TV Show Tracker

This is a production-ready, full-stack web application designed to allow users to manage a curated list of their favorite movies and TV shows.  
The application is built with a modern tech stack and follows industry best practices for scalability, security, and maintainability.

### 🔗 Important Links

- **Frontend**: [https://try-cine-track.vercel.app/](https://try-cine-track.vercel.app/)
- **Backend API**: [https://movie-backend-lus8.onrender.com/](https://movie-backend-lus8.onrender.com/)
- **GitHub Repository**: [https://github.com/avanishshaw/movie-tracker-app](https://github.com/avanishshaw/movie-tracker-app)
- **API Documentation**: [Add your Swagger docs URL here]

### 🎬 Demo Credentials

- **Admin Account**:
  - Email: `admin@example.com`
  - Password: `password123`
- **Test User Account**:
  - Email: `user@example.com`
  - Password: `password123`

---

## ✨ Features

### Core Functionality
- **Full CRUD Operations**: Authenticated users can create, read, update, and delete their own media entries, while admins have full control over all entries.
- **Admin Approval Workflow**: New entries submitted by regular users are held in a `pending` state and are only publicly visible after an administrator approves them.
- **Dynamic Data Table**: Media entries are displayed in a responsive table with infinite scroll for a smooth user experience.
- **Role-Based Permissions**: Users can only edit or delete entries they have created, while admins have full control over all entries.

### Advanced Features
- **Secure JWT Authentication**: Complete user registration and login system using JSON Web Tokens, with sessions persisted in local storage.
- **Role-Based Access Control**: Differentiates between `admin` (full access) and `user` roles to manage permissions.
- **Advanced Filtering & Search**: The dashboard includes controls to filter entries by type, industry, and search by keywords.
- **Shareable Filter Links**: The application state for filters is persisted in the URL, allowing users to share links to specific views.
- **API Documentation**: A live, interactive Swagger/OpenAPI documentation is served directly from the backend.
- **Containerized Environment**: The entire application stack (frontend, backend, database) can be launched with a single Docker Compose command.
- **CI/CD Pipeline**: A GitHub Actions workflow is set up to automatically run tests on every pull request, ensuring code quality.

---

## 🛠 Tech Stack

| Area            | Technology |
|-----------------|------------|
| **Frontend**    | React.js (Vite), Tailwind CSS, Zustand, TanStack Query, TanStack Table, React Router |
| **Backend**     | Node.js, Express.js |
| **Database**    | MongoDB with Mongoose |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Validation**  | Zod (Client-side & Server-side) |
| **DevOps**      | Docker, Docker Compose, GitHub Actions |
| **Testing**     | Jest, Supertest (Backend), React Testing Library (Frontend) |

---

# 🚀 Getting Started

## Prerequisites
- **Node.js** (v18 or later)
- **npm** or **yarn**
- **Docker & Docker Compose** (for containerized setup)
- **A free MongoDB Atlas account** (or a local MongoDB instance)

***

## ⚡ Setup Instructions

### 1. Local Environment Setup

### Backend

1. **Navigate to the backend directory**
    ```
    cd backend
    ```

2. **Install dependencies**
    ```
    npm install
    ```

3. **Create the environment file**
    ```
    cp .env.example .env
    ```
    Now, open the newly created `.env` file and add your credentials for `MONGO_URI`, `JWT_SECRET`, and the default admin credentials for the seeder.

4. **Start the backend server**
    ```
    npm start
    ```

    The backend will be running on:  
    👉 http://localhost:5001

### Frontend

1. **Navigate to the frontend directory**
    ```
    cd frontend
    ```

2. **Install dependencies**
    ```
    npm install
    ```

3. **Create the environment file**  
    Create a new `.env` file in the `/frontend` directory and add the following:
    ```
    VITE_API_BASE_URL=http://localhost:5001
    ```

4. **Start the frontend development server**
    ```
    npm run dev
    ```

    The frontend will be running on:  
    👉 http://localhost:5173

### Docker Environment Setup

1. **Clone the repository**
    ```
    git clone https://github.com/avanishshaw/movie-tracker-app
    cd movie-tracker-app
    ```

2. **Ensure you have a `.env` file**  
   Make sure there is a `.env` file in the `backend` directory with your `JWT_SECRET` defined.

3. **Build and run all services**
    ```
    docker-compose up --build
    ```

    This command will build Docker images for the frontend and backend, and start all three services for you.
    
    - Frontend → http://localhost
    - Backend API → http://localhost:5001

## 📦 Database Schema and Seeding

The application uses Mongoose for schema management. Schema definitions can be found in `backend/src/models/`.

To populate the database with a default admin user and sample data, run the seeder script.

> ⚠️ Note: This will wipe all existing data.

Run this command from the `/backend` directory:
```
npm run seed
```

## 📑 API Documentation

The backend includes interactive API documentation served by Swagger UI. Once the backend server is running, access it at:  
👉 http://localhost:5001/api-docs


Continuous Integration (CI)
A GitHub Actions workflow is configured at .github/workflows/ci.yml. This workflow automatically runs the backend test suite on every push and pull request to the main branch to ensure code integrity.
