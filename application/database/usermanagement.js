'use strict';

const mongodb = require('mongodb'),
  dbHelper = require('./helper');

const EXPIRE_TIME = 7200,
  STD_COLLECTION = 'consumer';

module.exports = {
  getConsumerId: (user, authorizationQuery, provider) => {
    //console.log('getConsumerId: we got:', user, authorizationQuery, provider);
    return module.exports.getConsumer(user, authorizationQuery, provider).then((consumer) => {
      if (consumer !== null) {
        return consumer._id;
      }
      return null;
    });
  },

  getConsumer: (user, authorizationQuery, provider) => {
    //console.log('getConsumer: we got:', user, authorizationQuery, provider);
    return SearchConsumerByProvider(user, provider)
      .then((doc) => {
        if (doc === null) {
          return AddConsumer(user, authorizationQuery, provider)
            .then((newConsumer) => {
              return newConsumer;
            });
        } else { //TODO update social provider data
          return doc;
        }
      });
  },

  //testing
  testing_SearchConsumerByProvider: SearchConsumerByProvider,
  testing_AddConsumer: AddConsumer,
  testing_createConsumerInstance: createConsumerInstance,
  testing_UpdateConsumer: UpdateConsumer
};

function SearchConsumerByProvider(user, provider) {
  return dbHelper.connectToDatabase()
    .then((dbconn) => dbconn.collection(STD_COLLECTION))
    .then((collection) => {
      let query = {};
      query['identities.' + provider + '.user.id'] = user.id;
      return collection.findOne(query);
    });
}

function SearchConsumerByMongoDBId(id) {
  return dbHelper.connectToDatabase()
    .then((dbconn) => dbconn.collection(STD_COLLECTION))
    .then((collection) => {
      let query = {
        _id: id
      };
      return collection.findOne(query);
    });
}

function AddConsumer(user, authorizationQuery, provider) {
  return dbHelper.connectToDatabase()
    .then((dbconn) => dbconn.collection(STD_COLLECTION))
    .then((collection) => {
      const newConsumer = createConsumerInstance(user, authorizationQuery, provider);
      //console.log('Add new consumer: ', newConsumer);
      return collection.insertOne(newConsumer)
        .then((result) => {
          if (result.insertedCount === 1) {
            newConsumer._id = result.insertedId;
            return newConsumer;
          }

          return null;
        });
    });
}

function UpdateConsumer(user, authorization, provider) {

}

function createConsumerInstance(user, authorizationQuery, provider) {
  let consumer = {
    identities: {},
    applications: [{
      name: 'standard',
      authentification: {},
      kong: {}
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
