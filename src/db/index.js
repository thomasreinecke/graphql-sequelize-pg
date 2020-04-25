
import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';

const db = {};
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// define the sequilize ORM instance and connect it to the db
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
console.log(`🚀 sequilize ORM connected to ${process.env.DB_DIALECT} @ ${process.env.DB_HOST}:${process.env.DB_PORT}`);

// loading all sequilize models from the 'models' folder
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

// /**
//  * createCurrency - creates a currency record
//  * 
//  * creates a currency by the given <CurrencyInput> fields
//  * 
//  * @param  {JSON} input JSON structure holding the fields for the to-be created record 
//  * @return {JSON}       CurrencyOutput object containing the actual results (data), the result count and error
//  */
// db.createCurrency = async (input) => {
//     // handle create request for the new record and immediately return the result
//     return db.currency.create(input)
//         .then(res => constructResponse([res]))
//         .catch(err => constructResponse([], err))
// }

// /**
//  * updateCurrency - updates an existing currency record
//  * 
//  * tries to find a currency record given by <CurrencyRecordInput> and returns the updated record after
//  * it has successfully been updated
//  * 
//  * @param  {JSON} query JSON structure holding the query to identify the record that should be updated 
//  * @param  {JSON} input JSON structure holding the fields for the to-be updated record 
//  * @return {JSON}       CurrencyyOutput object containing the actual results (data), the result count and error
//  */
// db.updateCurrency = async (updateRequest) => {
//     let q = { where: updateRequest.query }
//     return db.currency.findAll(q)
//         .then(records => {
//             if(records.length === 0) return constructResponse([], NO_RECORDS_FOUND) 
//             if(records.length !== 1) return constructResponse([], UNIQUE_RECORD_REQUIRED)
//             else return records[0].update(updateRequest.input)
//                 .then(res => constructResponse([res]))
//                 .catch(err => constructResponse([], err))
//         })
//         .catch(err => constructResponse([], err))
// }

// db.deleteCurrency = async (deleteRequest) => {
//     let q = { where: deleteRequest.query }
//     return db.currency.findAll(q)
//         .then(records => {
//             if(records.length === 0) return constructResponse([], NO_RECORDS_FOUND) 
//             if(records.length !== 1) return constructResponse([], UNIQUE_RECORD_REQUIRED)
//             else return records[0].destroy()
//                 .then(res => constructResponse([res]))
//                 .catch(err => constructResponse([], err))
//         })
//         .catch(err => constructResponse([], err))
// }

// /**
//  * createCountry - creates a country record
//  * 
//  * creates a country by the given <CountryInput> fields, including a <CurrencyRecordInput> record to
//  * identify the currency record that is to be referenced in the new country. After successful creation
//  * it queries for the full (and child-attached) record through <getCountry> and returns it.
//  * 
//  * @param  {JSON} input JSON structure holding the fields for the to-be created record 
//  * @return {JSON}       CountryOutput object containing the actual results (data), the result count and error
//  * 
//  * @throws MDSError.NO_CURRENCY_AVAILABLE if no <CurrencyRecordInput> was provided
//  */
// db.createCountry = async (input) => {
//     if (!input.currency) throw new MDSError(MDSError.NO_CURRENCY_AVAILABLE);
    
//     // extra handling of child object <currency>, the <CurrencyRecordInput> has to be provided,
//     // we'll have to find the currency record and attach the <currencyId> into the <input>
//     await db.getCurrency(input.currency).then(res => {
//         if(res.data.length !== 1) throw new MDSError(MDSError.SPECIFIC_CURRENCY_REQUIRED); 
//         input.currencyId = res.data[0].id;
//     })

//     // handle create of a new record
//     return db.country.create(input)
//         .then(res => {
//             // find and return the updated record
//             return db.getCountry({id: res.id});
//         })
//         .catch(err => constructResponse([], err))
// }

// /**
//  * updateCountry - updates an existing country record
//  * 
//  * tries to find a country record given by <CountryRecordInput> & also supports updating the reference
//  * to the child <currency> relationship. After successful update it queries for the full (and child-attached) 
//  * record through <getCountry> and returns it.
//  * 
//  * @param  {JSON} query JSON structure holding the query to identify the record that should be updated 
//  * @param  {JSON} input JSON structure holding the fields for the to-be updated record 
//  * @return {JSON}       CountryOutput object containing the actual results (data), the result count and error
//  */
// db.updateCountry = async (query, input) => {

//     // extra handling of child object <currency>, if a <CurrencyRecordInput> is provided,
//     // we'll have to find the currency record and attach the <currencyId> into the <input>
//     if (input.currency) {
//         await db.getCurrency(input.currency).then(res => {
//             if(res.data.length !== 1) throw new MDSError(MDSError.SPECIFIC_CURRENCY_REQUIRED); 
//             input.currencyId = res.data[0].id;
//         })
//     }

//     // find the record to be updated
//     let q = { where: query }
//     return db.country.findAll(q)
//         .then(records => {
//             // update the record
//             return records[0].update(input).then(noop => {
//                 // find and return the updated record
//                 return db.getCountry(query);
//             })
//         })
//         .catch(err => constructResponse([], err))
// }

// /**
//  * createExchange - creates an exchange record
//  * 
//  * creates an exchange by the given <ExchangeInput> fields, including a <CountryRecordInput> record to
//  * identify the country record that is to be referenced in the new exchange. After successful creation
//  * it queries for the full (and child-attached) record through <getExchange> and returns it.
//  * 
//  * @param  {JSON} input JSON structure holding the fields for the to-be created record 
//  * @return {JSON}       ExchangeyOutput object containing the actual results (data), the result count and error
//  * 
//  * @throws MDSError.NO_COUNTRY_AVAILABLE if no <CountryRecordInput> was provided
//  */
// db.createExchange = async (input) => {
//     if (!input.country) throw new MDSError(MDSError.NO_COUNTRY_AVAILABLE);
    
//     // extra handling of child object <country>, a <CountryRecordInput> has to be provided,
//     // we'll have to find the country record and attach the <countryId> into the <input>
//     await db.getCountry(input.country).then(res => {
//         if(res.data.length !== 1) throw new MDSError(MDSError.SPECIFIC_COUNTRY_REQUIRED); 
//         input.countryId = res.data[0].id;
//     })

//     // handle create of a new record
//     return db.exchange.create(input)
//         .then(res => {
//             // find and return the updated record
//             return db.getExchange({id: res.id});
//         })
//         .catch(err => constructResponse([], err))
// }

// /**
//  * updateExchange - updates an existing exchange record
//  * 
//  * tries to find a exchange record given by <ExchangeRecordInput> & also supports updating the reference
//  * to the child <country> relationship. After successful update it queries for the full (and child-attached) 
//  * record through <getExchange> and returns it.
//  * 
//  * @param  {JSON} query JSON structure holding the query to identify the record that should be updated 
//  * @param  {JSON} input JSON structure holding the fields for the to-be updated record 
//  * @return {JSON}       ExchangeOutput object containing the actual results (data), the result count and error
//  */
// db.updateExchange = async (query, input) => {

//     // extra handling of child object <country>, if a <CountryRecordInput> is provided,
//     // we'll have to find the country record and attach the <countryId> into the <input>
//     if (input.country) {
//         await db.getCountry(input.country).then(res => {
//             if(res.data.length !== 1) throw new MDSError(MDSError.SPECIFIC_COUNTRY_REQUIRED); 
//             input.countryId = res.data[0].id;
//         })
//     }

//     // find the record to be updated
//     let q = { where: query }
//     return db.exchange.findAll(q)
//         .then(records => {
//             // update the record
//             return records[0].update(input).then(noop => {
//                 // find and return the updated record
//                 return db.getExchange(query);
//             })
//         })
//         .catch(err => constructResponse([], err))
// }


// /**
//  * createGicsclass - creates a gicsclass record
//  * 
//  * creates a gicsclass by the given <GicsclassInput> fields
//  * 
//  * @param  {JSON} input JSON structure holding the fields for the to-be created record 
//  * @return {JSON}       GicsclassOutput object containing the actual results (data), the result count and error
//  */
// db.createGicsclass = async (input) => {
//     // handle create request for the new record and immediately return the result
//     return db.gicsclass.create(input)
//         .then(res => constructResponse([res]))
//         .catch(err => constructResponse([], err))
// }

// /**
//  * updateGicsclass - updates an existing gicsclass record
//  * 
//  * tries to find a gicsclass record given by <GicsclassRecordInput> and returns the updated record after
//  * it has successfully been updated
//  * 
//  * @param  {JSON} query JSON structure holding the query to identify the record that should be updated 
//  * @param  {JSON} input JSON structure holding the fields for the to-be updated record 
//  * @return {JSON}       GicsclassyOutput object containing the actual results (data), the result count and error
//  */
// db.updateGicsclass = async (query, input) => {
//     let q = { where: query }
//     return db.gicsclass.findAll(q)
//         .then(records => {
//             return records[0].update(input)
//                 .then(res => constructResponse([res]))
//                 .catch(err => constructResponse([], err))
//         })
//         .catch(err => constructResponse([], err))
// }


// /**
//  * createMarketindex - creates a marketindex record
//  * 
//  * creates a marketindex by the given <MarketindexInput> fields
//  * 
//  * @param  {JSON} input JSON structure holding the fields for the to-be created record 
//  * @return {JSON}       MarketindexOutput object containing the actual results (data), the result count and error
//  */
// db.createMarketindex = async (input) => {
//     // handle create request for the new record and immediately return the result
//     return db.marketindex.create(input)
//         .then(res => constructResponse([res]))
//         .catch(err => constructResponse([], err))
// }

// /**
//  * updateMarketindex - updates an existing marketindex record
//  * 
//  * tries to find a marketindex record given by <MarketindexRecordInput> and returns the updated record after
//  * it has successfully been updated
//  * 
//  * @param  {JSON} query JSON structure holding the query to identify the record that should be updated 
//  * @param  {JSON} input JSON structure holding the fields for the to-be updated record 
//  * @return {JSON}       MarketindexyOutput object containing the actual results (data), the result count and error
//  */
// db.updateMarketindex = async (query, input) => {
//     let q = { where: query }
//     return db.marketindex.findAll(q)
//         .then(records => {
//             return records[0].update(input)
//                 .then(res => constructResponse([res]))
//                 .catch(err => constructResponse([], err))
//         })
//         .catch(err => constructResponse([], err))
// }

// /**
//  * createCompany - creates a company record
//  * 
//  * creates a company by the given <CompanyInput> fields, including a <CurrencyRecordInput> record to
//  * identify the currency record that is to be referenced in the new company. After successful creation
//  * it queries for the full (and child-attached) record through <getCompany> and returns it.
//  * 
//  * @param  {JSON} input JSON structure holding the fields for the to-be created record 
//  * @return {JSON}       CompanyOutput object containing the actual results (data), the result count and error
//  * 
//  * @throws MDSError.NO_CURRENCY_AVAILABLE if no <CurrencyRecordInput> was provided
//  */
// db.createCompany = async (input) => {
//     if (!input.country) throw new MDSError(MDSError.NO_COUNTRY_AVAILABLE);
//     if (!input.gicsclass) throw new MDSError(MDSError.NO_GICSCLASS_AVAILABLE);
    
//     // extra handling of child object <country>, the <CountryRecordInput> has to be provided,
//     // we'll have to find the country record and attach the <countryId> into the <input>
//     await db.getCountry(input.country).then(res => {
//         if(res.data.length !== 1) throw new MDSError(MDSError.SPECIFIC_COUNTRY_REQUIRED); 
//         input.countryId = res.data[0].id;
//     })
//     // extra handling of child object <gicsclass>, the <GicsclassRecordInput> has to be provided,
//     // we'll have to find the gicsclass record and attach the <gicsclassId> into the <input>
//     await db.getGicsclass(input.gicsclass).then(res => {
//         if(res.data.length !== 1) throw new MDSError(MDSError.SPECIFIC_GICSCLASS_REQUIRED); 
//         input.gicsclassId = res.data[0].id;
//     })

//     // handle create of a new record
//     return db.company.create(input)
//         .then(res => {
//             // find and return the updated record
//             return db.getCompany({id: res.id});
//         })
//         .catch(err => constructResponse([], err))
// }

// /**
//  * updateCompany - updates an existing company record
//  * 
//  * tries to find a company record given by <CompanyRecordInput> & also supports updating the reference
//  * to the child <currency> relationship. After successful update it queries for the full (and child-attached) 
//  * record through <getCompany> and returns it.
//  * 
//  * @param  {JSON} query JSON structure holding the query to identify the record that should be updated 
//  * @param  {JSON} input JSON structure holding the fields for the to-be updated record 
//  * @return {JSON}       CompanyOutput object containing the actual results (data), the result count and error
//  */
// db.updateCompany = async (query, input) => {

//     console.log("INPUT: ", JSON.stringify(input))
//     // extra handling of child object <country>, if a <CountryRecordInput> is provided,
//     // we'll have to find the country record and attach the <countryId> into the <input>
//     if (input.country) {
//         await db.getCountry(input.country).then(res => {
//             if(res.data.length !== 1) throw new MDSError(MDSError.SPECIFIC_COUNTRY_REQUIRED); 
//             input.countryId = res.data[0].id;
//         })
//     }    
//     // extra handling of child object <country>, if a <CountryRecordInput> is provided,
//     // we'll have to find the country record and attach the <countryId> into the <input>
//     if (input.gicsclass) {
//         await db.getGicsclass(input.gicsclass).then(res => {
//             if(res.data.length !== 1) throw new MDSError(MDSError.SPECIFIC_GICSCLASS_REQUIRED);
//             input.gicsclassId = res.data[0].id;
//         })
//     }

//     // find the record to be updated
//     let q = { where: query }
//     console.log("QUERY: ", q)
//     return db.company.findAll(q)
//         .then(records => {
//             // update the record
//             return records[0].update(input).then(noop => {
//                 // find and return the updated record
//                 return db.getCompany(query);
//             })
//         })
//         .catch(err => constructResponse([], err))
// }

export default db;