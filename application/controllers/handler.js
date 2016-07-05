/*
Handler between called routes and controllers.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
  socialProvider = require('./social_provider'),
  usermanagement = require('../database/usermanagement'),
  kongService = require('./kong');

const TIME_BUFFER_EXPIRATION = 5 * 60;

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
              const now = (new Date()).getTime();
              let outdatedDate = new Date(standardApplication[0].authentification.timestamp);
              outdatedDate = new Date(outdatedDate.getTime() + (1000 * standardApplication[0].authentification.expires_in));

              if (now.getTime() + TIME_BUFFER_EXPIRATION < outdatedDate.getTime()) {
                //Token is valid and could be used
                let result = standardApplication[0].authentification;
                result.userid = consumer.user_id; //MongoDB ID
                return res(result);
              } else {
                //get a new access token
                const kong = standardApplication[0].kong;
                //prepare scope
                let scopes = standardApplication[0].authentification.scopes.reduce((prev, curr) => {
                  if (prev === '')
                    return curr;

                  return prev + ' ' + curr;
                }, '');
                return kongService.getAccessToken(kong.client_id, kong.client_secret, scopes)
                  .then((auth) => { //we get {"token_type":"bearer","access_token":"","expires_in":}
                    //update consumer
                    consumer.applications.pop(standardApplication[0]);

                    standardApplication[0].authentification.token = auth.access_token;
                    standardApplication[0].authentification.timestamp = new Date();
                    standardApplication[0].authentification.expires_in = auth.expires_in;

                    consumer.applications.push(standardApplication[0]);

                    return usermanagement.ReplaceConsumer(consumer)
                      .then((_id) => {
                        if (_id === null) {
                          throw Error('database error: replacing document not possible - ' + consumer._id);
                        }

                        let result = standardApplication[0].authentification;
                        result.userid = standardApplication[0].kong.consumer_id;
                        return res(result);
                      });
                  });
              }
            } //end first path

            //second Path: consumer not in the database; have to be created as well as consumer and application in Kong; user have to be created with user service

          });
      })
      .catch((error) => {
        req.log('error', error);
        res(boom.badImplementation());
      });
  }
};
