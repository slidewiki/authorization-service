/*
Controller which configures a Kong instance.
It has functions to create a costumer and a application and also to retrieve a access token for the API.
*/

'use strict';

const request = require('request');

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
        } else {
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
        } else {
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
        } else {
          reject(error);
        }
      }

      request(options, callback);
    });
    return promise;
  },

  //functions which are for a general configuration of Kongs API

  //returns {"upstream_url":"","created_at":,"id":"","name":"","preserve_host":false,"strip_request_path":false,"request_host":""}
  addUpstreamHost: (hostname, requestHost, upstreamURL) => {
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_ADMIN + 'apis/',
        method: 'POST',
        body: {
          name: hostname,
          request_host: requestHost,
          upstream_url: upstreamURL
        }
      };

      function callback(error, response, body) {
        if (!error && response.statusCode === 201) {
          let api = JSON.parse(body);
          if (api.name !== hostname)
            reject('created Application for wrong consumer');
          resolve(api);
        } else {
          reject(error);
        }
      }

      request(options, callback);
    });
    return promise;
  },

  //returns nothing
  deleteUpstreamHost: (hostId) => {
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_ADMIN + 'apis/' + hostId,
        method: 'DELETE'
      };

      function callback(error, response, body) {
        if (!error && response.statusCode === 204) {
          resolve(api);
        } else {
          reject(error);
        }
      }

      request(options, callback);
    });
    return promise;
  },

  /*returns
  {
    "api_id": "",
    "id": "",
    "created_at": ,
    "enabled": true,
    "name": "",
    "config": {
      "mandatory_scope": false,
      "token_expiration": 7200,
      "enable_implicit_grant": false,
      "hide_credentials": false,
      "provision_key": "",
      "accept_http_if_already_terminated": false,
      "enable_authorization_code": true,
      "enable_client_credentials": true,
      "enable_password_grant": false
    }
  }
  */
  initializePluginOAuth2: (hostname, scopes) => {
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_ADMIN + 'apis/' + hostname + '/plugins',
        method: 'POST',
        body: {
          name: 'oauth2',
          'config.scopes': scopes,
          'config.enable_client_credentials': true
        }
      };

      function callback(error, response, body) {
        if (!error && response.statusCode === 201) {
          let plugin = JSON.parse(body);
          if (!plugin.enabled)
            reject('Failed creating plugin');
          resolve(plugin);
        } else {
          reject(error);
        }
      }

      request(options, callback);
    });
    return promise;
  },

  /* returns
  {
    "id": ,
    "api_id": "",
    "consumer_id": "",
    "name": "",
    "config": {

    },
    "enabled": true,
    "created_at":
  }
  */
  initializePluginACL: (hostname, whitelist, blacklist) => {
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_ADMIN + 'apis/' + hostname + '/plugins',
        method: 'POST',
        body: {
          name: 'acl',
          'config.whitelist': whitelist,
          'config.blacklist': blacklist
        }
      };

      function callback(error, response, body) {
        if (!error && response.statusCode === 201) {
          let plugin = JSON.parse(body);
          if (!plugin.enabled)
            reject('Failed creating plugin');
          resolve(plugin);
        } else {
          reject(error);
        }
      }

      request(options, callback);
    });
    return promise;
  }
};
