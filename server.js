/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
*  of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Shuyu Deng  Student ID: 117587238 Date: October 13
*
*  Vercel Web App URL: https://helloworld-iota-eight.vercel.app/
*  GitHub Repository URL: https://github.com/shuyu2024/helloworld.git
*
********************************************************************************/
const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const app = express();
const PORT = process.env.PORT || 8080;
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure cloudinary
cloudinary.config({
    cloud_name: 'YOUR_CLOUD_NAME',
    api_key: 'YOUR_API_KEY',
    api_secret: 'YOUR_API_SECRET',
    secure: true
});

// Configure multer
const upload = multer({
    storage: multer.memoryStorage()
});

// Serve static files
app.use(express.static('public'));

// Main routes
app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
});

app.post('/items/add', upload.single('featureImage'), (req, res) => {
    // Image upload logic here...
});

// Category and item listing routes
app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(500).send(err.message));
});

// Handle 404 after all other routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Initialize and start server
storeService.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Failed to initialize data:", err);
});


// New route to get a single item by ID
app.get('/item/:id', (req, res) => {
  storeService.getItemById(req.params.id)
      .then(item => res.json(item))
      .catch(err => res.status(404).send(err.message)); // 404 if item not found
});