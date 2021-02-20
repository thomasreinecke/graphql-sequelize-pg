
import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';

const db = {};
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// define the sequelize ORM instance and connect it to the db
const sequelize = new Sequelize(
    process.env.DB_DATABASE, 
    process.env.DB_USERNAME, 
    process.env.DB_PASSWORD, 
    {
        db: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        schema: process.env.DB_SCHEMA
    });
console.log(`🚀 sequelize ORM connected to ${process.env.DB_DIALECT} @ ${process.env.DB_HOST}:${process.env.DB_PORT}`);

// loading all sequelize models from the 'models' folder
fs.readdirSync(path.join(__dirname, './models'))
    .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
    .forEach(file => {
        const model = sequelize.import(path.join(__dirname, './models', file));
        db[model.name] = model;
    });

// define the relationships between the entities
db.user.belongsTo(db.org);
db.user.belongsToMany(db.role, { through: 'userrole' });
db.role.belongsToMany(db.user, { through: 'userrole' });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

/**
 * constructResponse - constructs the API response payload 
 * 
 * containing the actual data, a count of records the data contains and an error object
 * 
 * @param {INT} count 
 * @param {ARRAY} data 
 * @param {JSON} error 
 */
let constructResponse = function (data, error) {
    return {
        count: data ? data.length : 0,
        data: data,
        error: error ? (error.name ? error.name : error) : null
    }
}

/**
 * getUser - queries for currencies based on a given query
 * 
 * @param  {JSON} query JSON structure holding the query arguments
 * @return {JSON}       output object containing the actual results (data), the result count and error
 */
db.getUser = async (request) => {
    console.log("getUser called")
    let q = { 
        where: request.query, 
        include: [
            { 
                model: db.org 
            },
            {
                model: db.role,
            }
        ]
    }; 
    return db.user.findAll(q)
        .then(res => constructResponse(res))
}

/**
 * getOrg - queries for countries based on a given query
 * 
 * @param  {JSON} query JSON structure holding the query arguments
 * @return {JSON}       output object containing the actual results (data), the result count and error
 */
db.getOrg = async (request) => {
    console.log("getOrg called")
    let q = { where: request.query }; 
    return db.org.findAll(q)
        .then(res => constructResponse(res))
}

/**
 * getRole - queries for countries based on a given query
 * 
 * @param  {JSON} query JSON structure holding the query arguments
 * @return {JSON}       output object containing the actual results (data), the result count and error
 */
db.getRole = async (request) => {
    let q = { where: request.query }; 
    return db.role.findAll(q)
        .then(res => constructResponse(res))
}

/**
 * getUserRole - queries for userroles based on a given query
 * 
 * @param  {JSON} query JSON structure holding the query arguments
 * @return {JSON}       output object containing the actual results (data), the result count and error
 */
db.getUserRole = async (request) => {
    let q = { where: request.query }; 
    return db.userrole.findAll(q)
        .then(res => constructResponse(res))
}

export default db;