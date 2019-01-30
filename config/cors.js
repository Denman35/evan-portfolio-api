const whitelist = [];

if (process.env.NODE_ENV === 'development') {
  whitelist.push('http://localhost:3000');
  whitelist.push('http://localhost:3001');
  whitelist.push('http://localhost:8080');
} else if (process.env.NODE_ENV === 'production') {
  whitelist.push('https://evanlissoos.com');
  whitelist.push('https://www.evanlissoos.com');
}

module.exports = {
  origin: (origin, callback) => {
    console.log(origin);
    if (origin === undefined) {
      // Same origin seems to be undefined
      callback(null, true);
    } else if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}