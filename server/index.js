const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tripRoutes = require('./routes/trips');
const groupRoutes = require('./routes/groups');
const budgetRoutes = require('./routes/budget');
const placesRoutes = require('./routes/places');

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tripplanner', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/places', placesRoutes);

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join trip room for real-time collaboration
  socket.on('join-trip', (tripId) => {
    socket.join(tripId);
    console.log(`User ${socket.id} joined trip ${tripId}`);
  });

  // Handle group chat messages
  socket.on('send-message', (data) => {
    socket.to(data.tripId).emit('new-message', data);
  });

  // Handle itinerary updates
  socket.on('update-itinerary', (data) => {
    socket.to(data.tripId).emit('itinerary-updated', data);
  });

  // Handle budget updates
  socket.on('update-budget', (data) => {
    socket.to(data.tripId).emit('budget-updated', data);
  });

  // Handle voting
  socket.on('cast-vote', (data) => {
    socket.to(data.tripId).emit('vote-cast', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
