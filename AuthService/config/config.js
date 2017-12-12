const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'authservice'
    },
    port: process.env.PORT || 3001,
    security : {
      userTokenLife : 1800,
      serviceTokenLife : 100
    },
    db: 'mongodb://localhost/authservice-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'authservice'
    },
    port: process.env.PORT || 3001,
    db: 'mongodb://localhost/authservice-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'authservice'
    },
    port: process.env.PORT || 3001,
    db: 'mongodb://localhost/authservice-production'
  }
};

module.exports = config[env];
