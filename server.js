/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
*  of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Shuyu Deng  Student ID: 117587238 Date: October 26
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
    cloud_name: 'dennu0db6',
    api_key: '365358677663971',
    api_secret: 'Nds-UYxcBKZq8CXPJxH_ycXTSWY',
    secure: true
});

// Configure multer
const upload = multer(); // no { storage: storage } since we are not using disk storage

// Serve static files
app.use(express.static('public'));

// Main routes
app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// New route to get a single item by ID
app.get('/item/:id', (req, res) => {
    storeService.getItemById(req.params.id)
        .then(item => res.json(item))
        .catch(err => res.status(404).send(err.message)); // 404 if item not found
  });

app.get('/items', (req, res) => {
    const queryCategory = req.query.category;
    if (queryCategory){
        return storeService.getItemsByCategory(queryCategory)
           .then(items => res.json(items))
           .catch(err => res.status(500).send(err.message));
    }

    const queryMinDate = req.query.minDate;
    if (queryMinDate) {
        return storeService.getItemsByMinDate(queryMinDate)
           .then(items => res.json(items))
           .catch(err => res.status(500).send(err.message));
    }

    return storeService.getAllItems()
        .then(item => res.json(item))
        .catch(err => res.status(500).send(err.message));
});

app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
});

app.post('/items/add', upload.single('featureImage'), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }
     
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;
    
        // Process the req.body and add it as a new Item before redirecting to /items
        storeService.addItem(req.body);
        res.redirect('/items');
    } 
    
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
