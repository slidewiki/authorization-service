/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
  handlers = require('./controllers/handler');

module.exports = function(server) {
  //Create new slide (by payload) and return it (...). Validate payload
  server.route({
    method: 'POST',
    path: '/sociallogin',
    handler: handlers.sociallogin,
    config: {
      validate: {
        payload: Joi.object().keys({
          code: Joi.string(),
          redirect_uri: Joi.string(),
          provider: Joi.number()
        }).requiredKeys('code', 'redirect_uri', 'provider'),
      },
      tags: ['api'],
      description: 'get tokens from social login'
    }
  });
};
