// const Pool = require('pg');
const Sequelize = require('sequelize');
// const sequelize = new Sequelize('gpt', 'postgres', 'sumit@4307', {
//     host: 'localhost',
//     dialect: 'postgres',
// });
module.exports = function (sequelize) {
    let dbs = sequelize.define('dbs', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        prompt: {
            type: Sequelize.STRING
        },
        response: {
            type: Sequelize.STRING(2000)
        }
    });

    return dbs;
};