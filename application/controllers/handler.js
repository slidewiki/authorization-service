/*
Handler between called routes and controllers.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
  socialProvider = require('./social_provider'),
  usermanagement = require('../database/usermanagement'),
  kongService = require('./kong'),
  request = require('request');

const TIME_BUFFER_EXPIRATION = 5 * 60,
  URL_USERSERVICE = 'http://userservice.manfredfris.ch/',
  URL_APPLICATION_REDIRECT = 'http://platform.manfredfris.ch';

module.exports = {
  //using OAuth token
  /*What should it do:
      Get user information from social provider because we have now a token to do that
      Get or create consumer (consumer in terms of a container of: the Kong consumer and the minimal user representation)
      Now different paths:
        a) consumer was already there with a Kong configuration - just get the saved token or if the token is invalid get a new one
        b) consumer not in the database; have to be created as well as consumer and application in Kong; user have to be created with user service
  */
  continueWithToken: function (req, res, provider) {
    return socialProvider.getUserCredentials(req.query.access_token, provider)
      .then((user) => {
        return usermanagement.getConsumer(user, req.query, provider)
          .then((consumer) => {
            //simple checks

            if (consumer === undefined || consumer === null)
              throw Error('unable to get mongodb data');

            if (consumer.applications === undefined || consumer.applications === undefined || consumer.applications.length < 1) {
              throw Error('data error: no applications in consumer');
            }

            let standardApplication = consumer.applications.find((app) => {
              if (app.name === 'standard')
                return true;

              return false;
            });

            if (standardApplication[0] === null) {
              throw Error('data error: no standard application in consumer');
            }

            //first Path: consumer was already there with a Kong configuration - just get the saved token or if the token is invalid get a new one
            if (standardApplication[0].kong !== null && standardApplication[0].authentification !== null) {
              return firstPath(consumer, standardApplication[0], res);
            } //end first path

            //second Path: consumer not in the database; have to be created as well as consumer and application in Kong; user have to be created with user service
            return secondPath(consumer, provider, res);
            //end second path
          });
      })
      .catch((error) => {
        req.log('error', error);
        res(boom.badImplementation());
      });
  },

  //testing
  testing_CreateUser: CreateUser,
  testing_GetAccessTokenAndSaveConsumer: GetAccessTokenAndSaveConsumer,
  testing_firstPath: firstPath,
  testing_secondPath: secondPath
};

function CreateUser(user) {
  let promise = new Promise((resolve, reject) => {
    const options = {
      url: URL_USERSERVICE + 'create',
      method: 'POST',
      json: true,
      body: {
        email: user.email,
        username: user.nickname,
        language: user.location
      }
    };

    function callback(error, response, body) {
      //console.log('got', error, response.statusCode, body);
      if (!error && (response.statusCode === 201 || response.statusCode === 200)) {
        let result = body.new_id;
        resolve(result);
      } else {
        reject(error);
      }
    }

    //console.log('do request', options);

    request(options, callback);
  });
  return promise;
}

function GetAccessTokenAndSaveConsumer(consumer, temporaryApplication, scopes, res) {
  return kongService.getAccessToken(temporaryApplication.kong.client_id, temporaryApplication.kong.client_secret, scopes)
    .then((auth) => { //we get {"token_type":"bearer","access_token":"","expires_in":}
      console.log('Got auth');

      //update consumer
      temporaryApplication.authentification.token = auth.access_token;
      temporaryApplication.authentification.timestamp = new Date();
      temporaryApplication.authentification.expires_in = auth.expires_in;
      temporaryApplication.authentification.redirect_URI = URL_APPLICATION_REDIRECT;

      consumer.applications.push(temporaryApplication);

      console.log('Got access token: ', auth);

      return usermanagement.ReplaceConsumer(consumer)
        .then((_id) => {
          if (_id === null) {
            console.log('Error', 'We got null from ReplaceConsumer');
            throw Error('database error: replacing document is not possible - ' + consumer._id);
          }

          let result = temporaryApplication.authentification;
          result.userid = consumer.user_id;
          return res(result);
        });
    });
}

//consumer was already there with a Kong configuration - just get the saved token or if the token is invalid get a new one
function firstPath(consumer, standardApplication, res) {
  const now = (new Date()).getTime();
  let outdatedDate = new Date(standardApplication.authentification.timestamp);
  outdatedDate = new Date(outdatedDate.getTime() + (1000 * standardApplication.authentification.expires_in));

  if ((now + TIME_BUFFER_EXPIRATION) < outdatedDate.getTime()) {
    console.log('Token is valid and could be used: ', standardApplication.authentification);
    let result = standardApplication.authentification;
    result.userid = consumer.user_id; //MongoDB ID
    return res(result);
  } else {
    console.log('get a new access token');
    //prepare scope
    let scopes = standardApplication.authentification.scopes.reduce((prev, curr) => {
      if (prev === '')
        return curr;

      return prev + ' ' + curr;
    }, '');
    consumer.applications.pop(standardApplication);
    return GetAccessTokenAndSaveConsumer(consumer, standardApplication, scopes, res);
  }
}

//consumer not in the database; have to be created as well as consumer and application in Kong; user have to be created with user service
function secondPath(consumer, provider, res) {
  return CreateUser(consumer.identities[provider].user)
    .then((new_Id) => {
      console.log('got the userid ', new_Id);

      if (new_Id.length !== 24) {
        throw Error('service error: user service does not create a new user - ' + new_Id);
      }

      consumer.user_id = new_Id;

      //create Kong consumer
      return kongService.createConsumer(new_Id)
        .then((kong_consumer) => {
          console.log('created Kong consumer: ', kong_consumer);

          //create Kong application
          return kongService.createApplication(kong_consumer.id, 'standard', URL_APPLICATION_REDIRECT)
            .then((kong_application) => {
              console.log('created Kong application: ', kong_application);

              let c_application = consumer.applications[0];
              consumer.applications.pop(c_application);
              c_application.kong = kong_application;
              c_application.authentification = {};

              //get token and save consumer
              return GetAccessTokenAndSaveConsumer(consumer, c_application, null, res); //TODO: use correct scopes
            });
        });
    });
}
