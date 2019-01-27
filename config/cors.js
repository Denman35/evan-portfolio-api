const whitelist = [];

if (process.env.NODE_ENV === 'development') {
  whitelist.push('http://localhost:3000');
  whitelist.push('http://localhost:8080');
}

module.exports = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}