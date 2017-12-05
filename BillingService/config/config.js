const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'billingservice'
    },
    port: process.env.PORT || 3003,
    db: 'mongodb://localhost/billingservice-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'billingservice'
    },
    port: process.env.PORT || 3003,
    db: 'mongodb://localhost/billingservice-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'billingservice'
    },
    port: process.env.PORT || 3003,
    db: 'mongodb://localhost/billingservice-production'
  }
};

module.exports = config[env];
