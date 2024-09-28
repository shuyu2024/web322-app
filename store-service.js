const fs = require('fs');
const path = require('path');

//Define paths to the data files
const dataPath = path.join(__dirname, 'data');
const itemsFilePath = path.join(dataPath, 'items.json');
const categoriesFilePath = path.join(dataPath, 'categories.json');

// Arrays to holding the data from the files
let items = [];
let categories = [];

const initialize = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(itemsFilePath, 'utf8', (err, data) => {
      if (err) return reject("Unable to read items file");
      items = JSON.parse(data);
      fs.readFile(categoriesFilePath, 'utf8', (err, data) => {
        if (err) return reject("Unable to read categories file");
        categories = JSON.parse(data);
        resolve();
      });
    });
  });
};

const getAllItems = () => {
  return new Promise((resolve, reject) => {
    if (items.length === 0) reject("No items found");
    else resolve(items);
  });
};

const getPublishedItems = () => {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published);
    if (publishedItems.length === 0) return reject("No published items found");
    resolve(publishedItems);
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) return reject("No categories found");
    resolve(categories);
  });
};

//storeService.initialize().then(() => {
//  app.listen(process.env.PORT || 8080, () => {
//    console.log(`Server listening on port ${process.env.PORT || 8080}`);
//  });
//}).catch(err => {
//  console.error("Failed to initialize data:", err);
//});

module.exports = { initialize, getAllItems, getPublishedItems, getCategories };
