/*
Handler between called routes and controllers.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
  socialProvider = require('./social_provider'),
  usermanagement = require('../database/usermanagement'),
  kong = require('./kong');

module.exports = {
  //using OAuth token
  continueWithToken: function (req, res, provider) {
    return socialProvider.getUserCredentials(req.query.access_token, provider)
      .then((user) => {
        return usermanagement.getConsumer(user, req.query, provider)
          .then((consumer) => {
            if (consumer === undefined || consumer === null)
              throw Error('unable to get mongodb id with user');

            if (consumer.applications === undefined || consumer.applications === undefined || consumer.applications.length < 1) {
              throw Error('data error');
            }

            let standardApplication = consumer.applications.find((app) => {
              if (app.name === 'standard')
                return true;

              return false;
            });

            
          });
      })
      .catch((error) => {
        req.log('error', error);
        res(boom.badImplementation());
      });
  }
};
