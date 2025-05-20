const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Read all collaborator files
const collaboratorsDir = path.join(__dirname, '../collaborators');
const logosDir = path.join(__dirname, '../collaborators/logos');

// Ensure directories exist
if (!fs.existsSync(collaboratorsDir)) fs.mkdirSync(collaboratorsDir, { recursive: true });
if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

// Process collaborators
const collaborators = fs.readdirSync(collaboratorsDir)
  .filter(file => file.endsWith('.json') && file !== '_template.json')
  .map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(collaboratorsDir, file)));
    
    // Get logo filename from URL
    const logoUrl = data.logo.url;
    const logoExt = logoUrl.split('.').pop();
    const logoFilename = `${path.basename(file, '.json')}.${logoExt}`;
    
    // Validate logo
    const logoPath = path.join(logosDir, logoFilename);
    if (fs.existsSync(logoPath)) {
      const image = sharp(logoPath);
      image.metadata().then(metadata => {
        if (metadata.width > 200 || metadata.height > 200) {
          image
            .resize(200, 200, { fit: 'inside' })
            .toFile(logoPath + '.resized')
            .then(() => {
              fs.renameSync(logoPath + '.resized', logoPath);
            });
        }
      });
    }
    
    return {
      ...data,
      logo: {
        file: `/collaborators/logos/${logoFilename}`,
        url: logoUrl
      }
    };
  })
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