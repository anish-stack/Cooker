const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const Port = process.env.PORT || 5000;
const ConnectDB = require('./database/db');

const cors = require('cors');
const UserRoutes = require('./routes/userroutes');
const Paymentrouter = require('./routes/paymentRoutes');
const cookiesParser = require('cookie-parser');
// Import helmet for security headers

ConnectDB();

// Middlewareapp.use(helmet()); // Use helmet for security headers
app.use(cors({

  credentials: true
}));
app.use(cookiesParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', UserRoutes);
app.use('/api/v2', Paymentrouter);

// Default route
app.use('/', (req, res) => {
  res.send(`<h2>Welcome to the API</h2>`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(Port, () => {
  console.log(`Server is running on ${Port}`);
});
