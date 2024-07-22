const dotenv = require('dotenv');
dotenv.config({ path: '.env.prod' });

module.exports = {
  apps: [
    {
      name: "efielounge",
      script: "./dist/server.js",
      env_production: {
        NODE_ENV: "prod",
        ...process.env
      }
    }
  ]
};
// pm2 start ecosystem.config.js --env prod