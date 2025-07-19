const express = require('express');
const builder = require('xmlbuilder');
const products = require('./data');
const path = require('path');
const analytics = require('./analytics');
const campaigns = require('./campaigns');
const fs = require('fs');
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
  addView(productId, source);
  res.json({ message: `View track from ${source} for ${productId}` });
})

app.get('/analytics', (req, res) => {
  res.json({ message: 'Analytics data retrieved successfully', analytics });
})

app.post('/app/campaigns/', (req, res) => {
  const newCampaign = JSON.parse(fs.readFileSync('campaigns.json', 'utf8'));
  const {link, google, instagram, tiktok, cost} = req.body
  const campaign = {
    productId : link.split('/').pop().split('?')[0],
    source : google ? 'google' : instagram ? 'instagram' : tiktok ? 'tiktok' : null,
    cost,
    followers: Math.floor((Math.random() * 9 * Math.ceil(cost)) + Math.ceil(cost)),

  }
  newCampaign.push(campaign);
  fs.writeFileSync('campaigns.json', JSON.stringify(newCampaign, null, 2));
  res.json({ message: 'Campaign added successfully' });
})

app.get('/app/campaigns', (req, res) => {
  const data = fs.readFileSync('campaigns.json', 'utf8');
  const campaigns = JSON.parse(data);
  res.json({ message: 'Campaigns retrieved successfully', campaigns });
})

app.get('/app/campaigns/analytics', (req, res) => {
  const data = fs.readFileSync('campaigns.json', 'utf8');
  const campaigns = JSON.parse(data);
  const result = campaigns.map(campaign => {
    return {
      message: `Campaign with productId ${campaign.productId} has ${campaign.followers} followers and roas is ${(campaign.followers / campaign.cost).toFixed(2)} and cpl is ${((campaign.cost / campaign.followers) * 100).toFixed(2)}%`,
    }
  });
  res.json({ message: 'Campaigns retrieved successfully', result });
})

app.listen(3000, () => { 
  console.log('Google Shopping Feed is available at http://localhost:3000/google-feed.xml');
})