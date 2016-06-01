'use strict';

//require
var Ajv = require('ajv');
var ajv = Ajv({
  verbose: true,
  allErrors: true
    //v5: true  //enable v5 proposal of JSON-schema standard
}); // options can be passed, e.g. {allErrors: true}

//build schema
const objectid = {
  type: 'string',
  maxLength: 24,
  minLength: 24
};
const user = {
  type: 'object',
  properties: {
    id: {
      type: 'string'
    },
    email: {
      type: 'string',
      format: 'email'
    },
    name: {
      type: 'string'
    },
    nickname: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    company: {
      type: 'string'
    },
    location: {
      type: 'string'
    },
    provider: {
      type: 'string'
    }
  },
  required: ['id', 'email', 'name', 'url', 'provider']
};
const authentification = {
  type: 'object',
  properties: {
    timestamp: {
      type: 'string'
    },
    token: {
      type: 'string'
    },
    expires_in: {
      type: 'number'
    },
    scopes: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  required: ['timestamp', 'token', 'expires_in']
}
const application = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    authentification: authentification
  },
  required: ['name', 'authentification']
};
const consumer = {
  type: 'object',
  properties: {
    _id: objectid,
    identities: {
      type: 'object',
      properties: {
        github: user,
        google: user,
        facebook: user
      }
    },
    applications: {
      type: 'array',
      items: application
    }
  },
  required: ['_id', 'identities']
};

//export
module.exports = ajv.compile(user);
