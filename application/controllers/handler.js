/*
Handler between called routes and controllers.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
  co = require('../common'),
  socialProvider = require('./social_provider');

module.exports = {
  //using OAuth token
  continueWithToken: function(req, res, provider) {
    socialProvider.getUserCredentials(req.query.access_token, provider)
      .then((user) => {
        //TODO
        res(JSON.stringify(user));
      })
      .catch((error) => {
        req.log('error', error);
        res(boom.badImplementation());
      });
  }
};
