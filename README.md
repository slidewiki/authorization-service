# authorization-service #
[![Build Status](https://travis-ci.org/slidewiki/authorization-service.svg?branch=master)](https://travis-ci.org/slidewiki/authorization-service)
[![License](https://img.shields.io/badge/License-MPL%202.0-green.svg)](https://github.com/slidewiki/microservice-template/blob/master/LICENSE)
[![Language](https://img.shields.io/badge/Language-Javascript%20ECMA2015-lightgrey.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Framework](https://img.shields.io/badge/Framework-NodeJS%206.1.0-blue.svg)](https://nodejs.org/)
[![Webserver](https://img.shields.io/badge/Webserver-Hapi%2013.4.0-blue.svg)](http://hapijs.com/)

This service will provide different endpoints.
One endpoint is for finalizing a social login in terms of using the authorization code to get the tokens.
Finalizing means also to store the social tokens in a mongodb in order to do user management at authorization level.
This includes also creating a consumer and application in Kong.
The other endpoints are for managing the user logins.

Here an overview where this service will be used:
![OAuth2 workflow while using a browser](/ressources/images/OAuth_Browser.png)

API:

connect

&nbsp;&nbsp;&nbsp;        GET /github

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;            OAuth2 with Github

&nbsp;&nbsp;&nbsp;        GET /google

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;            OAuth2 with Google

user

&nbsp;&nbsp;&nbsp;        PUT /getToken

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;            Get access token for user

You want to **checkout this cool service**? Simply start the service and head over to: [http://localhost:3000/documentation](http://localhost:3000/documentation). We're using  [swagger](https://www.npmjs.com/package/hapi-swagger) to have this super cool API discovery/documentation tool.

### Install NodeJS ###
---
Please visit the wiki at [**Install NodeJS**](https://github.com/slidewiki/microservice-template/wiki/Install-NodeJS).

### Use Docker to run/test your application ###
---
You can use [Docker](https://www.docker.com/) to build, test and run your application locally. Simply edit the Dockerfile and run:

```
docker build -t MY_IMAGE_TAG ./
docker run -it --rm -p 8880:3000 MY_IMAGE_TAG
```

Alternatively you can use [docker-compose](https://docs.docker.com/compose/) to run your application in conjunction with a (local) mongodb instance. Simply execute:

```
docker-compose up -d
```
