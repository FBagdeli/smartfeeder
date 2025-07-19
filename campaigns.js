const fs = require('fs');
const campaigns = JSON.parse(fs.readFileSync('campaigns.json', 'utf8'));

module.exports = campaigns;