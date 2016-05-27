'use strict';

//This is our webserver framework (instead of express)
const hapi = require('hapi'),
  co = require('./common');
const yar = require('yar');

const Grant = require('grant-hapi');
const grant = new Grant();

//Initiate the webserver with standard or given port
const server = new hapi.Server();

let port =  (!co.isEmpty(process.env.APPLICATION_PORT)) ? process.env.APPLICATION_PORT : 3000;
server.connection({
  port: port
});
let host = 'slidewikiauth.spdns.eu'; //(!co.isEmpty(process.env.VIRTUAL_HOST)) ? process.env.VIRTUAL_HOST : server.info.host;

//Export the webserver to be able to use server.log()
module.exports = server;

let plugins = [
  {
    register: require('good'),  //Plugin for sweet server console output
    options: {
      ops: {
        interval: 1000
      },
      reporters: {
        console: [{
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{
            log: '*',
            response: '*',
            request: '*'
          }]
        }, {
          module: 'good-console'
        }, 'stdout']
      }
    }
  },
  {
    register: yar,  //For cookie handling - most OAuth2 providers doing a handshake with a unified cookie value to verify the requests
    options: {
      cookieOptions: {
        password: '12345678901113151234567890111315',
        isSecure: false
      }
    }
  },
  // mount grant
  {
    register: grant,
    options: require('./config.json')
  }
];

//Register plugins and start webserver
server.register(plugins, (err) => {
  if (err) {
    console.error(err);
    global.process.exit();
  } else {
    server.start(() => {
      server.log('info', 'Server started at ' + server.info.uri);
      //Register routes
      require('./routes.js')(server);
    });
  }
});
