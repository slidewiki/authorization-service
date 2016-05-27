/*
Routes getting the access tokens.
*/
'use strict';

const Joi = require('joi'),
  handlers = require('./controllers/handler');

module.exports = function(server) {
  server.route({
    method: 'GET',
    path: '/handle_github_callback',
    handler: function(req, res) {
      //Continue with the token
      //Remark: third parameter have to be the name of the provider as listet for purest
      handlers.continueWithToken(req, res, 'github');
    }
  });

  server.route({
    method: 'GET',
    path: '/handle_google_callback',
    handler: function(req, res) {
      handlers.continueWithToken(req, res, 'google');
    }
  });
};
