/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
  handlers = require('./controllers/handler');

module.exports = function(server) {
  server.route({
    method: 'GET',
    path: '/handle_github_callback',
    handler: function(req, res) {
      console.log('query', req.query);
      console.log('auth', req.auth);
      console.log('headers', req.headers);
      console.log('payload', req.payload);
      res(JSON.stringify(req.query, null, 2));
    }
  });
};
