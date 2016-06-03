/*
Handler between called routes and controllers.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
  co = require('../common'),
  socialProvider = require('./social_provider'),
  usermanagement = require('../database/usermanagement');

module.exports = {
  //using OAuth token
  continueWithToken: function (req, res, provider) {
    return socialProvider.getUserCredentials(req.query.access_token, provider)
      .then((user) => {
        return usermanagement.getUserId(user, req.query, provider)
          .then((id) => {
            if (id === undefined || id === null)
              throw Error('unable to get mongodb id with user');

            //testing
            return usermanagement.testing_SearchUser(user, provider)
              .then((dbuser) => {
                res(JSON.stringify({
                  old_user: user,
                  db_user: dbuser
                }));
              });
          });
      })
      .catch((error) => {
        req.log('error', error);
        res(boom.badImplementation());
      });
  }
};
