const logging = require('../../middleware/autologging');
const db = require('../../data/knex-db');
const request = require('request');
// const GARMIN_Consumer_Key = process.env.GARMIN_Consumer_Key
const commonSystem = require('../../common/commonSystem');
// const CryptoJS = require("crypto-js");

// function doRequest(url, oauth_token, oauth_token_secret) {
//     let EndTime = Math.floor(new Date().getTime() / 1000)
//     let StartTime = EndTime - 86400;
//     let oauth_timestamp = Math.floor(new Date().getTime() / 1000)
//     let oauth_nonce = 3153996031
//     let key = Buffer.from(GARMIN_Consumer_Secret + '&' + oauth_token_secret).toString();
//     let Signature_Base_String = `GET&https%3A%2F%2Fapis.garmin.com%2Fwellness-api%2Frest%2Factivities&oauth_consumer_key%3D${GARMIN_Consumer_Key}%26oauth_nonce%3D${oauth_nonce}%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D${oauth_timestamp}%26oauth_token%3D${oauth_token}%26oauth_version%3D1.0%26uploadEndTimeInSeconds%3D${EndTime}%26uploadStartTimeInSeconds%3D${StartTime}`
    
//     const hash = CryptoJS.HmacSHA1(Signature_Base_String, key)
//     let base64encoded = CryptoJS.enc.Base64.stringify(hash)
//     const uriEncodedHash = encodeURIComponent(base64encoded);
    
//     let options = {
//         method: 'GET',
//         url: url + "uploadStartTimeInSeconds=" + StartTime + "&uploadEndTimeInSeconds=" + EndTime,
//         headers: {
//             "Authorization": `OAuth oauth_nonce=${oauth_nonce}, oauth_signature=${uriEncodedHash}, oauth_token=${oauth_token}, oauth_consumer_key=${GARMIN_Consumer_Key}, oauth_timestamp=${oauth_timestamp}, oauth_signature_method="HMAC-SHA1", oauth_version="1.0"`
//         }
//     };

//     return new Promise(function (resolve, reject) {
//         request(options, function (error, res, body) {
//            if(error) resolve(error)
//            resolve(body)
//         });
//   });
// }

module.exports = function (app) {
  // Creates the endpoint for our webhook
  app.post('/garmin/ping', async (req, res) => {
    console.log(req.body);

    res.status(200).send('OK');
  });

  // Adds support for GET requests to our webhook
  // app.get('/webhook-garmin', (req, res) => {
  //   console.log(req);
  // });
}