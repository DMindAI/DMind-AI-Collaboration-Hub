const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Read collaborators file
const collaboratorsFile = path.join(__dirname, '../collaborators/collaborators.json');
const logosDir = path.join(__dirname, '../collaborators/logos');

// Ensure directories exist
if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

// Read and process collaborators
const data = JSON.parse(fs.readFileSync(collaboratorsFile));
const collaborators = data.collaborators.map(collaborator => {
  // Get logo filename from URL
  const logoUrl = collaborator.logo.url;
  const logoExt = logoUrl.split('.').pop();
  const logoFilename = `${collaborator.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${logoExt}`;
  
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
    ...collaborator,
    logo: {
      file: `/collaborators/logos/${logoFilename}`,
      url: logoUrl
    }
  };
}).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

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