/*
Controller which configures a Kong instance.
It has functions to create a costumer and a application and also to retrieve a access token for the API.
*/

'use strict';

const co = require('../common'),
  request = require('request');

const KONG_ADMIN = 'http://localhost:8001/',
  KONG_OAUTH2 = 'http://testservice.localhost/oauth2/token';

module.exports = {
  //returns {"created_at":,"id":""}
  createConsumer: (consumerId) => {
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_ADMIN + 'consumers/',
        method: 'PUT',
        body: {
          custom_id: consumerId
        }
      };

      function callback(error, response, body) {
        if (!error && (response.statusCode === 201 || response.statusCode === 200)) {
          let consumer = JSON.parse(body);
          resolve(consumer);
        }
        else {
          reject(error);
        }
      }

      request(options, callback);
    });
    return promise;
  },
  //returns {"consumer_id":"","client_id":"","created_at":,"redirect_uri":"","name":"","client_secret":""}
  createApplication: (consumerKongId, applicationName, redirectURI) => {
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_ADMIN + 'consumers/' + consumerKongId + '/oauth2',
        method: 'POST',
        body: {
          name: applicationName,
          redirect_uri: redirectURI
        }
      };

      function callback(error, response, body) {
        if (!error && response.statusCode === 201) {
          let application = JSON.parse(body);
          if (consumerKongId !== application.consumer_id)
            reject('created Application for wrong consumer');
          resolve(application);
        }
        else {
          reject(error);
        }
      }

      request(options, callback);
    });
    return promise;
  },
  //returns {"token_type":"bearer","access_token":"","expires_in":}
  getAccessToken: (clientId, clientSecret, scope) => {
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_OAUTH2 + '?grant_type=client_credentials&client_id=' + clientId + '&client_secret=' + clientSecret + '&scope=' + scope,
        method: 'GET'
      };

      function callback(error, response, body) {
        if (!error && response.statusCode === 201) {
          let authorization = JSON.parse(body);
          resolve(authorization);
        }
        else {
          reject(error);
        }
      }

      request(options, callback);
    });
    return promise;
  },

  //functions which are for a general configuration of Kongs API

};
