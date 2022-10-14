require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const jwt = require('jsonwebtoken');
const compression = require('compression');
const {
  GraphQLUpload,
  graphqlUploadExpress, // A Koa implementation is also exported.
} = require('graphql-upload');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const cors = require('cors');
const http = require('http');
const https = require('https');
const { execute, subscribe } = require('graphql');
const bodyParser = require('body-parser');
const path = require('path');
const pg = require('pg');
const task = require('./cron-job/updateStatus');
const fs = require(`fs`);
const { 
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled
} = require('apollo-server-core');

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => {
  return parseFloat(value);
});

// Environment
var PORT = process.env.PORT;
var HOSTNAME = process.env.HOSTNAME;
var JWTSECRET = process.env.JWTSECRET;
var STATIC_FOLDER = process.env.STATIC_FOLDER;
var PORT_HTTP = process.env.PORT_HTTP;
var HTTP_URL = process.env.HTTP_URL;
var PROJECT_MODE = process.env.PROJECT_MODE;

// Load schema and resolvers
const typeDefs = require('./graphql/types/index');
const resolvers = require('./graphql/resolves/index');

const tradeTokenForUser = async authorization => {
  const token = authorization ? authorization.slice(7, authorization.length) : '';
  // @ts-ignore
  const verificationResponse = jwt.verify(token, JWTSECRET);
  if (!verificationResponse) {
    return false
  }
  return verificationResponse
};

//https setting
const options = {
  key: fs.readFileSync(path.join(__dirname, 'settingHttps/privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'settingHttps/tringhiatech.pem'))
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

(async () => {
  const app = express();
  const httpServer = http.createServer(app);
  const httpsServer = https.createServer(options, app);

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      let authToken = null;
      let currentUser = null;

      try {
        authToken = req.headers['authorization'];
        if (authToken) {
          currentUser = await tradeTokenForUser(authToken);
        }
      } catch (e) {
        console.warn(`Unable to authenticate using auth token: ${e}`);
      }
      return {
        currentUser
      };
    },
    plugins: [
      // ApolloServerPluginLandingPageGraphQLPlayground(),
      // ApolloServerPluginLandingPageDisabled(),
    ],
    introspection: PROJECT_MODE !== 'Production'
  });

  await server.start();

  // @ts-ignore
  app.use(cors('*')); // allows request from webapp

  app.use(graphqlUploadExpress());

  app.use(compression());

  app.use(bodyParser.json({ limit: '50mb' }));

  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.use('/' + STATIC_FOLDER, express.static(path.join(__dirname, 'upload'), {
    index: false,
    maxAge: '7d'
  }));

  task.start();

  //router
  require('./router/strava/api')(app);
  require('./router/map-my-ride/api')(app);
  require('./router/garmin/api')(app);
  

  // Mount Apollo middleware here.
  server.applyMiddleware({ app });

  SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpsServer, path: server.graphqlPath }
  );

  httpServer.listen({ port: PORT_HTTP, hostname: HTTP_URL }, () => {
    console.log(
      `Query endpoint ready at ${HTTP_URL}:${PORT_HTTP}${server.graphqlPath}`
    );
  })

  httpsServer.listen({ port: PORT, hostname: HOSTNAME }, () => {
    console.log(
      `Query endpoint ready at ${HOSTNAME}:${PORT}${server.graphqlPath}`
    );
    console.log(
      `Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
    );
  });
})();
