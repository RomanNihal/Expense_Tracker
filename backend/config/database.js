const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

// Vercel Postgres sets POSTGRES_URL; Railway sets DATABASE_URL
const dbUrl = process.env.POSTGRES_URL_NON_POOLING
  || process.env.POSTGRES_URL
  || process.env.DATABASE_URL;

if (dbUrl) {
  // Production: PostgreSQL
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    },
    logging: false,
    pool: { max: 1, min: 0, idle: 10000 } // keep connections low for serverless
  });
} else {
  // Local development: SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
  });
}

module.exports = sequelize;
