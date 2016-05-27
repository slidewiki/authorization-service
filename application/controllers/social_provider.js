'use strict';

const request = require('request'),
  Purest = require('purest');

module.exports = {
  //functions which using OAuth2 token to get user information
  //try a generic one
  getUserCredentials: function(token, provider) {
    console.log('Lets do API access with our token', token, provider);

    let myPromise = new Promise(function(resolve, reject) {
      let providerInstance = new Purest({
        provider: provider
      });

      switch (provider) {
        case 'google':
          providerInstance.get('https://www.googleapis.com/userinfo/v2/me', {
            auth: {
              bearer: token
            },
            headers: {
              'User-Agent': 'SlideWiki'
            }
          }, function(err, res, body) {
            if (err) {
              console.log(err);
              reject(err);
            }
            console.log(body);

            let user = {};

            user = getUserFromGoogleResponse(body);

            resolve(user);
          });
          break;
        default:
          providerInstance.query()
            .select('user')
            .auth(token)
            .headers({
              'User-Agent': 'SlideWiki'
            })
            .request((err, res, body) => {
              if (err) {
                console.log(err);
                reject(err);
              }
              console.log(body);

              let user = {};

              switch (provider) {
                case 'github':
                  user = getUserFromGithubResponse(body);
                  break;
              }

              resolve(user);
            });
          break;
      }
    });

    return myPromise;
  }
};

function getUserFromGithubResponse(body) {
  return {
    nickname: body.login,
    id: body.id,
    url: body.html_url,
    name: body.name,
    company: body.company,
    location: body.location
  };
}

function getUserFromGoogleResponse(body) {
  let user = {
    name: body.name,
    location: body.locale,
    url: body.link,
    id: body.id,
    email: body.email,

  };
  try {
    user.nickname = body.email.substring(0, body.email.indexOf('@'));
  } catch (e) {}

  return user;
}
