const fs = require('fs');
const path = require('path');

// Read collaborators file
const collaboratorsFile = path.join(__dirname, '../collaborators/collaborators.json');

// Read and process collaborators
const data = JSON.parse(fs.readFileSync(collaboratorsFile));
const collaborators = data.collaborators
  .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

// Update website data
const websiteData = {
  collaborators,
  lastUpdated: new Date().toISOString()
};

// Write to website data file
fs.writeFileSync(
  path.join(__dirname, '../website-data.json'),
  JSON.stringify(websiteData, null, 2)
);