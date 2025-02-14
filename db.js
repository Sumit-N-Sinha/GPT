const Pool = require('pg');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('gpt', 'postgres', 'sumit@4307', {
    host: 'localhost',
    dialect: 'postgres',
});
const db = sequelize.define('db', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    }
});

module.exports =  { db };