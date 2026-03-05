const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const env = dotenv.config({ path: envFile });
dotenvExpand.expand(env);

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: process.env.DB_DIALECT || 'mysql',
  },

  production: {
    use_env_variable: 'DATABASE_URL',
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    dialect: 'mysql',
  }
};

//sửa sau