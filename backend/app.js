const express = require('express')
const app = express()
const path = require('path');
const mongoose = require('mongoose')
require('dotenv').config()
const userRoutes = require('./controllers/users')
const cors = require('cors');
const { requestLogger, unknownEndpoint } = require('./middleware/middleware')


app.use(cors());
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));
app.use(express.json())



const mongoUrl = process.env.MONGO_URL

mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('Error connecting to MongoDB:', error.message))

app.use(requestLogger)

app.use('/api/users', userRoutes)

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


app.use(unknownEndpoint)
module.exports = app