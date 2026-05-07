const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config');
const passport = require('./config/passport.config');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const videoRoutes = require('./routes/video.routes');
const streamRoutes = require('./routes/stream.routes');
const adminRoutes = require('./routes/admin.routes');
const streamKeyRoutes = require('./routes/streamkey.routes');
const notificationRoutes = require('./routes/notifications.routes');
const platformAuthRoutes = require('./routes/platformAuth.routes');
const liveStatsRoutes = require('./routes/livestats.routes');
const errorMiddleware = require('./middleware/error.middleware');

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/streamkeys', streamKeyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth/platform', platformAuthRoutes);
app.use('/api/livestats', liveStatsRoutes);

app.use(errorMiddleware);

module.exports = app;