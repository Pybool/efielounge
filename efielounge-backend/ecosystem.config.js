const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

module.exports = {
  apps: [
    {
      name: "crygoca",
      script: "./dist/index.js",
      env_production: {
        NODE_ENV: "prod",
        ...process.env
      }
    }
  ]
};
// pm2 start ecosystem.config.js --env prod