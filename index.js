const express = require('express');
const builder = require('xmlbuilder');
const products = require('./data');
const path = require('path');
const analytics = require('./analytics');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/google-feed.xml', (req, res) => {
  const rss = builder.create('rss', {encoding: 'UTF-8'});
  rss.att('version', '2.0');
  rss.att('xmlns:g', 'http://base.google.com/ns/1.0');

  const channel = rss.ele('channel');
  channel.ele("title", {}, "My Product Feed");
  channel.ele("link", {}, "https://www.example.com");
  channel.ele("description", {}, "This is a sample product feed for Google Shopping");

  products.forEach(product => {
    const item = channel.ele("item");
    item.ele("g:id", {}, product.id);
    item.ele("g:title", {}, product.title);
    item.ele("g:description", {}, product.description);
    item.ele("g:link", {}, product.link);
    item.ele("g:image_link", {}, product.image_link);
    item.ele("g:availability", {}, product.availability);
    item.ele("g:price", {}, `${product.price} ${product.currency}`); 
    item.ele("g:brand", {}, product.brand);
    item.ele("g:condition", {}, "new");
    item.ele("g:product_type", {}, "Apparel & Accessories > Clothing > Shoes");
  })

  const xmlString = rss.end({ pretty: true });
  res.header('Content-Type', 'application/rss+xml');
  res.send(xmlString);
})  

app.post('/app/products', (req, res) => {
  const { title, description, price, image_link, brand, availability, currency, link } = req.body;
  
  products.push({ id: `p${(products.length + 1).toString().padStart(3, '0')}`, title, description, price, image_link, brand, availability, currency, link });
  res.json({ message: 'Product added successfully' });
})

function addView(productId, source) {
  if(!analytics[productId]) {
    analytics[productId] = {}
  }
  if(!analytics[productId][source]) {
    analytics[productId][source] = 0;
  }
  analytics[productId][source]++;
}

app.post('/track-view/:productId/:source', (req, res) => {
 
  const { productId, source } = req.params;
  console.log('track-view1111', productId, source);
  addView(productId, source);
  res.json({ message: `View track from ${source} for ${productId}` });
})

app.get('/analytics', (req, res) => {
  res.json({ message: 'Analytics data retrieved successfully', analytics });
})

app.listen(3000, () => { 
  console.log('Google Shopping Feed is available at http://localhost:3000/google-feed.xml');
})