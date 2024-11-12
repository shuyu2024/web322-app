/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
*  of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Shuyu Deng  Student ID: 117587238 Date: November 12
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

// Configure EJS as the view engine
app.set('view engine', 'ejs');

// Main routes
// app.get('/', (req, res) => {
//   res.redirect('/about');
// });

// Main routes Redirect to /shop
app.get('/', (req, res) => {
    res.redirect('/shop');
});

// update routes to render using new ejs
app.get('/about', (req, res) => {
    res.render('about', { layout: 'partials/main' });
});


// New route to get a single item by ID
app.get('/item/:id', (req, res) => {
    storeService.getItemById(req.params.id)
        .then(item => res.json(item))
        .catch(err => res.status(404).send(err.message)); // 404 if item not found
  });

  //Update /items route
  app.get('/items', (req, res) => {
    const queryCategory = req.query.category;
    if (queryCategory) {
        return storeService.getItemsByCategory(queryCategory)
           .then(items => res.render('items', { items }))
           .catch(err => res.render('items', { message: "no results" }));
    }

    const queryMinDate = req.query.minDate;
    if (queryMinDate) {
        return storeService.getItemsByMinDate(queryMinDate)
           .then(items => res.render('items', { items }))
           .catch(err => res.render('items', { message: "no results" }));
    }

    return storeService.getAllItems()
        .then(items => res.render('items', { items }))
        .catch(err => res.render('items', { message: "no results" }));
});

app.get('/items/add', (req, res) => {
    res.render('addItem', { layout: 'partials/main' });
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
// app.get('/categories', (req, res) => {
//     storeService.getCategories()
//         .then(categories => res.json(categories))
//         .catch(err => res.status(500).send(err.message));
// });

//Update the /categories Route
app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(categories => {
            console.log(categories); // Log to check the data structure
            res.render('categories', { categories });
        })
        .catch(err => res.render('categories', { message: "no results" }));
});

// Add Middleware for Active Route Tracking
app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

//Register Helper
const helpers = require('./helpers');
app.locals.helpers = helpers;


app.get('/shop', (req, res) => {
    let viewData = {};
    storeService.getPublishedItems()
        .then(items => {
            viewData.items = items;

            if (req.query.category) {
                return storeService.getPublishedItemsByCategory(req.query.category);
            } else {
                return storeService.getPublishedItems();
            }
        })
        .then(itemsByCategory => {
            viewData.item = itemsByCategory.length > 0 ? itemsByCategory[0] : null;
            viewData.message = itemsByCategory.length > 0 ? null : "No items found";
            return storeService.getCategories();
        })
        .then(categories => {
            viewData.categories = categories;
            res.render('shop', {
                data: viewData,
                viewingCategory: req.query.category || ''
            });
        })
        .catch(err => {
            viewData.message = "No items found";
            res.render('shop', {
                data: viewData,
                viewingCategory: req.query.category || ''
            });
        });
});


//Import strip-js
const stripJs = require('strip-js');


// Import DOMPurify and JSDOM:
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

// Set up DOMPurify with JSDOM
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

//Create a New Route for /shop/:id
app.get('/shop/:id', (req, res) => {
    let viewData = {};

    storeService.getItemById(req.params.id)
        .then(item => {
            viewData.item = item;
            return storeService.getPublishedItems();
        })
        .then(items => {
            viewData.items = items;

            if (req.query.category) {
                return storeService.getPublishedItemsByCategory(req.query.category);
            } else {
                return storeService.getPublishedItems();
            }
        })
        .then(itemsByCategory => {
            viewData.itemsByCategory = itemsByCategory;
            return storeService.getCategories();
        })
        .then(categories => {
            viewData.categories = categories;
            res.render('shop', {
                data: viewData,
                viewingCategory: req.query.category || ''
            });
        })
        .catch(err => {
            viewData.message = "Item not found";
            res.render('shop', {
                data: viewData,
                viewingCategory: req.query.category || ''
            });
        });
});

// Handle 404 after all other routes
// app.use((req, res) => {
//     res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
// });
app.use((req, res) => {
    res.status(404).render('404', { layout: 'partials/main' });
});

// Initialize and start server
storeService.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Failed to initialize data:", err);
});