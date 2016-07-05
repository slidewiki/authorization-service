'use strict';

const mongodb = require('mongodb'),
  dbHelper = require('./helper');

const STD_COLLECTION = 'consumer';

module.exports = {
  getConsumerId: (user, authorizationQuery, provider) => {
    //console.log('getConsumerId: we got:', user, authorizationQuery, provider);
    return module.exports.getConsumer(user, authorizationQuery, provider).then((consumer) => {
      if (consumer !== null) {
        return consumer._id.toString();
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

  ReplaceConsumer: ReplaceConsumer,

  //testing
  testing_SearchConsumerByProvider: SearchConsumerByProvider,
  testing_AddConsumer: AddConsumer,
  testing_createConsumerInstance: createConsumerInstance,
  testing_ReplaceConsumer: ReplaceConsumer
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
        _id: mongodb.ObjectID.createFromHexString(id)
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

function ReplaceConsumer(consumer) {
  return dbHelper.connectToDatabase()
    .then((dbconn) => dbconn.collection(STD_COLLECTION))
    .then((collection) => {
      const _id = mongodb.ObjectID.createFromHexString(consumer._id);
      consumer._id = _id;
      return collection.replaceOne({_id: _id}, consumer)
        .then((result) => {
          if (result.modifiedCount === 1) {
            return _id.toString();
          }

          return null;
        });
    });
}

function createConsumerInstance(user, authorizationQuery, provider) {
  let consumer = {
    identities: {},
    applications: [{
      name: 'standard',
      authentification: null,
      kong: null
    }]
    //,userid: ''
  };
  consumer.identities[provider] = {
    user: user, //TODO: enrich location/language attribute
    oauth: parseOAuthResponse(authorizationQuery)
  };

  return consumer;
}

function parseOAuthResponse(authorizationQuery) {
  let oauth = {
    token: authorizationQuery.access_token,
    expires_in: 0
  };
  if (authorizationQuery['raw[expires_in]'] !== undefined) {
    oauth.expires_in = authorizationQuery['raw[expires_in]'];
  }
  if (authorizationQuery['raw[scope]'] !== undefined) {
    oauth.scope = authorizationQuery['raw[scope]'];
  }
  return oauth;
}
