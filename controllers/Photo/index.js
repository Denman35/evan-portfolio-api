const sharp = require('sharp');

const resizePhoto = (buffer, width) => {
  return sharp(buffer)
    .resize({ width })
    .toBuffer({ resolveWithObject: true })
}

const getPhotoMetdata = (buffer) => {
  return sharp(buffer).metadata();
}

module.exports = {
  resizePhoto,
  getPhotoMetdata,
};
