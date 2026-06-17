import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './Config/Mongodb.js';
import authRouter from './Routes/authRotes.js';
import userRouter from './Routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

// Allowed origins
const allowedOrigins = ['http://localhost:5173'];

// CORS middleware with origin check
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.send("API WORKING");
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    app.listen(port, () => {
      console.log(`Server started on PORT: ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
