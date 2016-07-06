/*
Controller which configures a Kong instance.
It has functions to create a costumer and a application and also to retrieve a access token for the API.
*/

'use strict';

const request = require('request');

const KONG_ADMIN = 'http://localhost:8001/',
  KONG_OAUTH2 = 'https://oauth2test.localhost/oauth2/token';

module.exports = {
  //returns {"created_at":,"id":""}
  createConsumer: (consumerId) => {
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_ADMIN + 'consumers/',
        method: 'PUT',
        json: true,
        body: {
          custom_id: consumerId
        }
      };

      function callback(error, response, body) {
        //console.log('Kong: createConsumer got: ', error, response.statusCode, body);

        if (!error && (response.statusCode === 201 || response.statusCode === 200)) {
          let consumer = body;
          resolve(consumer);
        } else {
          reject(error);
        }
      }

      //console.log('Kong: createConsumer: ', options);

      request(options, callback);
    });
    return promise;
  },
  //returns {id:, created_at: , custom_id: }
  getConsumerByMongoDBId: (consumerId) => {
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_ADMIN + 'consumers/',
        method: 'GET',
        json: true,
        body: {
          custom_id: consumerId
        }
      };

      function callback(error, response, body) {
        //console.log('we have send: ', options);
        //console.log('we got: ', error, response.statusCode, body);

        if (!error && (response.statusCode === 201 || response.statusCode === 200)) {
          const consumers = body.data;

          //it could happen that there are different consumers with the same costum_id - get the newest one
          const consumer = consumers.reduce(
            (prev, curr) => {
              if (prev === null)
                return curr;

              if (prev.created_at < curr.created_at)
                return curr;

              return prev;
            }, null
          );

          resolve(consumer);
        } else {
          reject(error);
        }
      }

      request(options, callback);
    });
    return promise;
  },
  //returns {"consumer_id":"","client_id":"", id:"","created_at":,"redirect_uri":"","name":"","client_secret":""}
  createApplication: (consumerKongId, applicationName, redirectURI) => {
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_ADMIN + 'consumers/' + consumerKongId + '/oauth2',
        method: 'POST',
        json: true,
        body: {
          name: applicationName,
          redirect_uri: redirectURI
        }
      };

      function callback(error, response, body) {
        if (!error && response.statusCode === 201) {
          let application = body;
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
  //returns {{"consumer_id":"","client_id":"","id":"","created_at":,"name":"standard","redirect_uri":"","client_secret":""}
  getStandardApplicationOfConsumer: (consumerKongId) => {
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_ADMIN + 'consumers/' + consumerKongId + '/oauth2',
        method: 'GET',
        json: true
      };

      function callback(error, response, body) {
        //console.log('we have send: ', options);
        //console.log('we got: ', error, response.statusCode, body);

        if (response.statusCode === 404 && body.message === 'Not found') {
          resolve (null);
          return;
        }

        if (!error && (response.statusCode === 201 || response.statusCode === 200)) {
          const applications = body;

          if (applications.total < 1) {
            resolve(null);
            return;
          }

          const application = applications.data.find((app) => {
            if (app.name = 'standard')
              return true;
            return false;
          });

          resolve(application);
        } else {
          reject(error);
        }
      }

      request(options, callback);
    });
    return promise;
  },
  //returns {{"consumer_id":"","client_id":"","id":"","created_at":,"name":"standard","redirect_uri":"","client_secret":""}
  getStandardApplicationByMongoDBId: (consumerId) => {
    return module.exports.getConsumerByMongoDBId(consumerId)
      .then((consumer) => {
        if (consumer === null)
          return null;

        return module.exports.getStandardApplicationOfConsumer(consumer.id);
      });
  },
  //returns {"token_type":"bearer","access_token":"","expires_in":}
  getAccessToken: (clientId, clientSecret, scope) => {
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_OAUTH2,
        method: 'POST',
        body: 'grant_type=client_credentials&client_id=' + clientId + '&client_secret=' + clientSecret + (scope ? '&scope=' + scope : ''),
        agentOptions: {
          rejectUnauthorized: false //Kong has an own certificate
        }
      };

      function callback(error, response, body) {
        console.log('Kong: getAccessToken: ', options);
        console.log('Kong: getAccessToken: got ', error, response.statusCode, body);

        if (!error && response.statusCode === 200) {
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
        json: true,
        body: {
          name: hostname,
          request_host: requestHost,
          upstream_url: upstreamURL
        }
      };

      function callback(error, response, body) {
        //console.log('Kong: addUpstreamHost: ', options);
        //console.log('Kong: addUpstreamHost: got ', error, response.statusCode, body);

        if (!error && response.statusCode === 201) {
          let api = body;
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
        //console.log('Kong: deleteUpstreamHost: ', options);
        //console.log('Kong: deleteUpstreamHost: got ', error, response.statusCode, body);

        if (!error && response.statusCode === 204) {
          resolve(response);
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
      "enable_implicit_grant": true,
      "hide_credentials": false,
      "provision_key": "",
      "accept_http_if_already_terminated": false,
      "enable_authorization_code": true,
      "enable_client_credentials": true,
      "enable_password_grant": false
    }
  }
  */
  initializePluginOAuth2: (hostname, scopes) => { //hostname could also be the kong id
    let promise = new Promise((resolve, reject) => {
      const options = {
        url: KONG_ADMIN + 'apis/' + hostname + '/plugins',
        method: 'POST',
        json: true,
        body: {
          name: 'oauth2',
          'config.scopes': scopes,
          'config.enable_client_credentials': true
        }
      };

      function callback(error, response, body) {
        if (!error && response.statusCode === 201) {
          let plugin = body;
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
        json: true,
        body: {
          name: 'acl',
          'config.whitelist': whitelist,
          'config.blacklist': blacklist
        }
      };

      function callback(error, response, body) {
        if (!error && response.statusCode === 201) {
          let plugin = body;
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
