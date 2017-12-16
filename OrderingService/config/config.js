var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');
    env = process.env.NODE_ENV || 'development';

const tokenLife = 300;

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'orderingservice',
      tokenLife: tokenLife 
    },
    port: process.env.PORT || 3002,
    db: 'mongodb://localhost/orderingservice-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'orderingservice',
      tokenLife : tokenLife
    },
    port: process.env.PORT || 3002,
    db: 'mongodb://localhost/orderingservice-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'orderingservice',
      tokenLife : tokenLife
    },
    port: process.env.PORT || 3002,
    db: 'mongodb://localhost/orderingservice-production'
  }
};

module.exports = config[env];