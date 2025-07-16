const express = require('express');
const builder = require('xmlbuilder');
const products = require('./data');

const app = express();

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
    item.ele("g:price", {}, product.price);
    item.ele("g:brand", {}, product.brand);
    item.ele("g:condition", {}, "new");
    item.ele("g:product_type", {}, "Apparel & Accessories > Clothing > Shoes");
  })

  const xmlString = rss.end({ pretty: true });
  res.header('Content-Type', 'application/rss+xml');
  res.send(xmlString);
})

app.listen(3000, () => { 
  console.log('Google Shopping Feed is available at http://localhost:3000/google-feed.xml');
})