// src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import mediaRoutes from './routes/media.routes.js';
import adminRoutes from './routes/admin.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

dotenv.config();

const app = express();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware and DB Connection
// connectDB();
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('API is running...'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

// Only start the server if this file is run directly (not imported)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the app for testing
export default app;