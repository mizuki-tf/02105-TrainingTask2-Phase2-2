'use strict';
const Sequelize = require('sequelize');
const Post = require('./post');
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/secret_board',
  {
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
const BadReport = sequelize.define('BadReport', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  postId: {
    type: Sequelize.INTEGER
  },
  reportedBy: {
    type: Sequelize.STRING
  }
}, {
    freezeTableName: true,
    timestamps: true
  });

BadReport.belongsTo(Post, {foreignKey: 'postId'});

BadReport.sync();

module.exports = BadReport;