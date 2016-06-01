'use strict';

const mongodb = require('mongodb');

module.exports = {
  getUserId: (user, authorization, provider) => {
    let promise = new Promise(function (resolve, reject) {
      let dbUser = SearchUser(user, authorization, provider);

      if (dbUser === null) {
        dbUser = AddUser(user, authorization, provider);
        if (dbUser === null)
          reject('Error adding user to the database');
      } else
        UpdateUser(user, authorization, provider);

      resolve(dbUser);
    });

    return promise;
  }
};

function SearchUser(user, authorization, provider) {

}

function AddUser(user, authorization, provider) {

}

function UpdateUser(user, authorization, provider) {

}
