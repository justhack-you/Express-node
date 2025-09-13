require('./config/env_config')
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const route = require('./config/routes');
const logger = require('./utilities/logger');
const initilizaSocket = require('./utilities/socket');
const http = require('http');
global.logger = logger;

const app = express();
const server = http.createServer(app);
initilizaSocket(server); // Initialize Socket.io with the HTTP server

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['token']
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/', route);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully')
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }).catch(err => console.error('MongoDB connection error:', err));

module.exports = app;



// const rateLimit = require('express-rate-limit');
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//     message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// Test endpoint to verify server is running
// app.get('/health', (req, res) => {
//     res.json({
//         status: 'OK',
//         timestamp: new Date().toISOString(),
//         socketConnections: io.engine.clientsCount
//     });
// });

// Error handling middleware (fix the middleware signature)
// app.use((err, req, res, next) => {
//     logger.error('Unhandled error:', err);
//     res.status(500).json({ message: 'Internal Server Error' });
// });