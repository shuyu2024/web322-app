/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Shuyu Deng
Student ID: 117587238
Date: September 26
Vercel Web App URL: https://helloworld-iota-eight.vercel.app/
GitHub Repository URL: https://github.com/shuyu2024/helloworld.git

********************************************************************************/ 
const express = require('express');
const path = require('path');
const storeService = require('./store-service'); 
const app = express();
const PORT = process.env.PORT || 8080;

// static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/items', (req, res) => {
  storeService.getAllItems()
      .then(items => res.json(items))
      .catch(err => res.status(500).send(err.message)); // send an error message
});

app.get('/categories', (req, res) => {
  storeService.getCategories()
      .then(categories => res.json(categories))
      .catch(err => res.status(500).send(err.message));
});

//404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});
// Start the server

storeService.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize data:", err);
});
