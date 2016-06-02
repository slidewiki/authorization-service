'use strict';

const mongodb = require('mongodb'),
  dbHelper = require('./helper');

const EXPIRE_TIME = 7200,
  STD_COLLECTION = 'consumer';

module.exports = {
  getUserId: (user, authorization, provider) => {
    return SearchUser(user, authorization, provider)
      .then((doc) => {
        if (doc === null) {
          return AddUser(user, authorization, provider)
            .then((newId) => {
              if (newId === null) {
                return;
              }
              return newId;
            });
        } else {
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

function SearchUser(user, authorization, provider) {
  return dbHelper.connectToDatabase()
    .then((dbconn) => dbconn.collection(STD_COLLECTION))
      .then((collection) => {
        let query = {};
        query['identities.' + provider + '.id'] = user.id;
        return collection.findOne(query);
      })
    ;
}

function AddUser(user, authorization, provider) {
  return dbHelper.connectToDatabase()
    .then((dbconn) => dbconn.collection(STD_COLLECTION))
      .then((collection) => {
        const newConsumer = createConsumerInstance(user, authorization, provider);
        return collection.insertOne(newConsumer)
          .then((result) => {
            return (result.insertedCount === 1) ? result.insertedId : null;
          });
      });
}

function UpdateUser(user, authorization, provider) {

}

function createConsumerInstance(user, authorization, provider) {
  let consumer = {
    identities: {},
    applications: [{
      name: 'standard',
      authentification: {
        timestamp: (new Date()).toString(),
        token: authorization,
        expires_in: EXPIRE_TIME,
        scopes: ['all']
      }
    }]
  };
  consumer.identities[provider] = user;

  return consumer;
}
