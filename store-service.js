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

// New function to add an item
const addItem = (itemData) => {
  return new Promise((resolve, reject) => {
    // Set default for published status
    itemData.published = itemData.published ? true : false;
    // Assign an ID to the new item
    itemData.id = items.length + 1;
    // Push the new item onto the items array
    items.push(itemData);
    // Persist changes by writing back to the items.json file
    fs.writeFile(itemsFilePath, JSON.stringify(items, null, 2), err => {
      if (err) {
        reject("Unable to save new item");
      } else {
        resolve(itemData); // Resolve with the new item details
      }
    });
  });
};
const getItemsByCategory = (category) => {
  return new Promise((resolve, reject) => {
      const filteredItems = items.filter(item => item.category === parseInt(category));
      if (filteredItems.length > 0) resolve(filteredItems);
      else reject("No items found for category: " + category);
  });
};

// Get items by minimum date
const getItemsByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
      const filteredItems = items.filter(item => new Date(item.saleDate) >= new Date(minDateStr));
      if (filteredItems.length > 0) resolve(filteredItems);
      else reject("No items found with min date: " + minDateStr);
  });
};

// Get item by ID
const getItemById = (id) => {
  return new Promise((resolve, reject) => {
      const item = items.find(item => item.id === parseInt(id));
      if (item) resolve(item);
      else reject("Item not found with ID: " + id);
  });
};

module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
  addItem,
  getItemsByCategory,
  getItemsByMinDate,
  getItemById
};
