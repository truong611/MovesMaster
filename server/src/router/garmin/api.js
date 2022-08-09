const logging = require("../../middleware/autologging");
const db = require("../../data/knex-db");
const request = require("request");
const GARMIN_ACTIVITIES_DETAIL = process.env.GARMIN_ACTIVITIES_DETAIL;
const commonSystem = require("../../common/commonSystem");
// var cryptoJS = require("crypto-js");

module.exports = function (app) {
    app.post('/testApi', (req, res) => {
        console.log('API OK')
        res.status(200).send('API OK');
    });
};
