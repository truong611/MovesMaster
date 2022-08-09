// export const API_URL = 'http://127.0.0.1:4000/graphql'; // local
// export const API_URL = 'http://10.0.2.2:4000/graphql'; // local
export const API_URL = 'http://103.138.113.52:4192/graphql'; // test

export const WEB_URL = 'http://103.138.113.52:4194';

// STRAVA
const STRAVA_clientId = '87981';
const STRAVA_clientSecret = '3fee171f7fcc38b8a206380810c5f23962000a2e';
const STRAVA_redirectUri = 'movesapp://movesapp.com/strava/code';
const STRAVA_scopes = ['read', 'read_all', 'profile:read_all', 'activity:read', 'activity:read_all'];
export const STRAVA_oauthAuthorize = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_clientId}&response_type=code&redirect_uri=${STRAVA_redirectUri}&approval_prompt=force&scope=${STRAVA_scopes.join()}`;
export const STRAVA_oauthToken = `https://www.strava.com/api/v3/oauth/token?grant_type=authorization_code&client_id=${STRAVA_clientId}&client_secret=${STRAVA_clientSecret}&redirect_uri=https://developers.strava.com/oauth2-redirect/&scope=${STRAVA_scopes.join()}&code=`;

// GARMIN
export const GARMIN_Consumer_Key = '48073071-550d-419d-b25e-f1194258dff0'
export const GARMIN_Consumer_Secret ='3lMhrLQqztsOWaXlZnrXN5tjie6geLKsp58'
const GARMIN_callback = 'movesapp://movesapp.com/garmin/code'
export const GARMIN_request_token = 'https://connectapi.garmin.com/oauth-service/oauth/request_token'
export const GARMIN_oauthConfirm = `https://connect.garmin.com/oauthConfirm?oauth_callback=${GARMIN_callback}&action=step3&oauth_token=`
export const GARMIN_accsess_token = 'https://connectapi.garmin.com/oauth-service/oauth/access_token'
export const GARMIN_activities = 'https://apis.garmin.com/wellness-api/rest/activities?'