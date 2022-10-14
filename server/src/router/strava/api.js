const logging = require('../../middleware/autologging');
const db = require('../../data/knex-db');
const request = require('request');
const STRAVA_ACTIVITIES_DETAIL = process.env.STRAVA_ACTIVITIES_DETAIL;
const commonSystem = require('../../common/commonSystem');

function doRequest(url, access_token) {
  let option = {
    url: url,
    headers: {
      'authorization': `Bearer ${access_token}`,
    }
  };
  return new Promise(function (resolve, reject) {
    request(option, function (error, res, body) {
      if (res.statusCode == 200)
        resolve({
          statusCode: res.statusCode,
          body: body
        });
      else
        resolve({
          statusCode: res.statusCode,
          body: body
        });
    });
  });
}

module.exports = function (app) {
  // Creates the endpoint for our webhook
  app.post('/webhook', async (req, res) => {
    let Fitness_App_Usage_ID = req?.body?.owner_id;
    let object_id = req?.body?.object_id?.toString();
    let aspect_type = req?.body?.aspect_type;

    if (Fitness_App_Usage_ID && object_id) {
      let fitness_app_infor = await db.table('Fitness_App_Usage')
        .where('Fitness_App_Usage_ID', Fitness_App_Usage_ID.toString())
        .first();
      let Access_Token = fitness_app_infor?.Fitness_App_Usage_Access_Token;
      let result = await doRequest(STRAVA_ACTIVITIES_DETAIL + object_id, Access_Token);

      if (result.statusCode == 200) {
        let _result = JSON.parse(result.body);

        let end_date_local_time = _result.moving_time * 1000;

        let end_date_local = new Date(new Date(_result.start_date).getTime() + end_date_local_time);

        let listType = await db.table('Activity_Type');
        let type = listType.find(x => x.Strava_Activity_Type_Name.toLocaleLowerCase().trim().includes(_result.type.toLocaleLowerCase().trim()));

        if (aspect_type == 'create') {
          //Nếu khoảng thời gian qua hơn 1 ngày
          if (commonSystem.formatDate(end_date_local) != commonSystem.formatDate(new Date(_result.start_date))) {
            let listRangeDate = commonSystem.getListRangeDate(new Date(_result.start_date), end_date_local);

            for (let i = 0; i < listRangeDate.length; i++) {
              let item = listRangeDate[i];
              await db.table('Fitness_App_Activities')
                .insert({
                  Fitness_App_Distance: _result.distance,
                  Fitness_App_Moving_Time: Math.ceil(_result.moving_time / 60),
                  Fitness_App_Type: _result.type,
                  User_ID: fitness_app_infor.User_ID,
                  Fitness_App_Activities_Usage_ID: Fitness_App_Usage_ID,
                  Fitness_App_Activities_Object_ID: object_id,
                  Fitness_App_Activities_Apply_Moves: false,
                  Fitness_App_Activities_Start_Date: item[0],
                  Fitness_App_Activities_Start_Date_Local: item[0],
                  Fitness_App_Activities_End_Date_Local: item[1],
                  Activity_Type_ID: type?.Activity_Type_ID
                });
            }
          }
          else {
            await db.table('Fitness_App_Activities')
              .insert({
                Fitness_App_Distance: _result.distance,
                Fitness_App_Moving_Time: Math.ceil(_result.moving_time / 60),
                Fitness_App_Type: _result.type,
                User_ID: fitness_app_infor.User_ID,
                Fitness_App_Activities_Usage_ID: Fitness_App_Usage_ID,
                Fitness_App_Activities_Object_ID: object_id,
                Fitness_App_Activities_Apply_Moves: false,
                Fitness_App_Activities_Start_Date: _result.start_date ? new Date(_result.start_date) : null,
                Fitness_App_Activities_Start_Date_Local: _result.start_date ? new Date(_result.start_date) : null,
                Fitness_App_Activities_End_Date_Local: end_date_local,
                Activity_Type_ID: type?.Activity_Type_ID
              });
          }
        }
        else if (aspect_type == 'update') {
          await db.table('Fitness_App_Activities')
            .where('Fitness_App_Activities_Object_ID', object_id)
            .andWhere('Fitness_App_Activities_Apply_Moves', false)
            .update({
              Fitness_App_Type: _result.type,
              Activity_Type_ID: type?.Activity_Type_ID
            });
        }
        else if (aspect_type == 'delete') {
          await db.table('Fitness_App_Activities')
            .where('Fitness_App_Activities_Object_ID', object_id)
            .andWhere('Fitness_App_Activities_Apply_Moves', false)
            .delete();
        }
      }
      else {
        console.log(result);
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  });

  // Adds support for GET requests to our webhook
  app.get('/webhook', (req, res) => {
    // Your verify token. Should be a random string.
    const VERIFY_TOKEN = "STRAVA";
    // Parses the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
      // Verifies that the mode and token sent are valid
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        logging(null, challenge);
        res.json({ "hub.challenge": challenge });
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  });
}