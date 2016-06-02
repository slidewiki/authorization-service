'use strict';

const mongodb = require('mongodb'),
  dbHelper = require('./helper');

const EXPIRE_TIME = 7200,
  STD_COLLECTION = 'consumer';

module.exports = {
  getUserId: (user, authorizationQuery, provider) => {
    return SearchUser(user, provider)
      .then((doc) => {
        if (doc === null) {
          return AddUser(user, authorizationQuery, provider)
            .then((newId) => {
              if (newId === null) {
                return;
              }
              return newId;
            });
        } else { //TODO update social provider data
          return doc._id;
        }
      });
  },

  //testing
  testing_SearchUser: SearchUser,
  testing_AddUser: AddUser,
  testing_createConsumerInstance: createConsumerInstance,
  testing_UpdateUser: UpdateUser
};

function SearchUser(user, provider) {
  return dbHelper.connectToDatabase()
    .then((dbconn) => dbconn.collection(STD_COLLECTION))
    .then((collection) => {
      let query = {};
      query['identities.' + provider + '.user.id'] = user.id;
      return collection.findOne(query);
    });
}

function AddUser(user, authorizationQuery, provider) {
  return dbHelper.connectToDatabase()
    .then((dbconn) => dbconn.collection(STD_COLLECTION))
    .then((collection) => {
      const newConsumer = createConsumerInstance(user, authorizationQuery, provider);
      return collection.insertOne(newConsumer)
        .then((result) => {
          return (result.insertedCount === 1) ? result.insertedId : null;
        });
    });
}

function UpdateUser(user, authorization, provider) {

}

function createConsumerInstance(user, authorizationQuery, provider) {
  let consumer = {
    identities: {},
    applications: [{
      name: 'standard',
      authentification: {
        timestamp: (new Date()).toString(),
        token: authorizationQuery.access_token,
        expires_in: EXPIRE_TIME,
        scopes: ['all']
      }
    }]
  };
  consumer.identities[provider] = {
    user: user,
    oauth: parseOAuthResponse(authorizationQuery)
  };

  return consumer;
}

function parseOAuthResponse(authorizationQuery) {
  let oauth = {
    token: authorizationQuery.access_token
  };
  if (authorizationQuery['raw[expires_in]'] !== undefined) {
    oauth.expires_in = authorizationQuery['raw[expires_in]'];
  }
  if (authorizationQuery['raw[scope]'] !== undefined) {
    oauth.scope = authorizationQuery['raw[scope]'];
  }
  return oauth;
}
