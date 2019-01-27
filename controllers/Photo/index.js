const sharp = require('sharp');

const resizePhoto = (buffer, width) => {
  return sharp(buffer)
    .resize({ width })
    .toBuffer()
}

const getPhotoWidth = (buffer) => {
  return sharp(buffer)
    .metadata()
    .then(metadata => Promise.resolve(metadata.width));
}

module.exports = {
  resizePhoto,
  getPhotoWidth,
};
