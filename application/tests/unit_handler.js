// example unit tests
'use strict';

//Mocking is missing completely TODO add mocked objects

describe('handler.js', () => {

  let controller, expect, usermanagement, kong;

  const hostname = 'unit_oauth2_test',
    requestHost = 'oauth2test.localhost',
    upstreamURL = 'http://localhost:9897';

  let hostId = '';

  before(() => {
    Object.keys(require.cache).forEach((key) => delete require.cache[key]);
    require('chai').should();
    let chai = require('chai');
    let chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
    expect = require('chai').expect;
    kong = require('../controllers/kong');
    controller = require('../controllers/handler');
    usermanagement = require('../database/usermanagement');

    //create API and upstream host
    return kong.addUpstreamHost(hostname, requestHost, upstreamURL)
      .then((host) => {
        expect(host.id).to.not.equal(null);
        hostId = host.id;

        //console.log('upstream host created: ', host);

        return kong.initializePluginOAuth2(hostId, undefined)
          .then((plugin) => {
            //console.log('plugin enabled: ', plugin);
            return;
          });
      })
      .catch(function (error) {
        console.log(error);
        expect(1).to.equal(null);
        return;
      });
  });

  after(() => {
    return kong.deleteUpstreamHost(hostId)
      .then(() => {
        return;
      })
      .catch(function () {
        expect(1).to.equal(null);
        return;
      });
  });

  const dummyUser = {
    email: 'a@b.de',
    nickname: 'dummy',
    location: 'en'
  };
  const githubUser = {
    'nickname': 'TBoonX',
    'id': 3153545,
    'url': 'https://github.com/TBoonX',
    'name': 'Kurt Junghanns',
    'company': 'Institut für Angewandte Informatik e. V.',
    'location': 'Deutschland',
    'email': '',
    'provider': 'github'
  };
  const query = {
    'access_token': '1bdfdd8b299a0ad214f61957d4d31fafc',
    'raw[access_token]': '1bdfdd8b299a0ad214f61957d4d31fafc',
    'raw[scope]': 'user',
    'raw[token_type]': 'bearer'
  };
  const printObject = (data) => {
    console.log('resolve/response: ', data);
  };

  context('creating a user', () => {
    it('should return the new MongoDB Id', () => {
      let promise = controller.testing_CreateUser(dummyUser);
      return Promise.all([
        promise.should.be.fulfilled.and.eventually.not.be.empty,
        promise.should.eventually.not.equal(null),
        promise.should.eventually.not.equal('')
      ]);
    });
  });

  context('creating a new consumer', () => {
    it('should create a kong configuration, the consumer in the database and return the token', (done) => {
      return usermanagement.getConsumer(githubUser, query, 'github')
        .then((consumer) => {
          expect(consumer).to.not.equal(null);
          expect(consumer.applications).to.not.equal(undefined);
          expect(consumer.applications.length).to.not.equal(0);
          expect(consumer.applications[0]).to.not.equal(undefined);
          expect(consumer.applications[0].kong).to.equal(null);
          expect(consumer.applications[0].authentification).to.equal(null);

          console.log('new consumer: ', consumer);

          return controller.testing_secondPath(consumer, 'github', (result) => {
            console.log('auth', result);

            expect(result).to.not.equal(null);
            expect(result.userid).to.not.equal(null);
            expect(result.token).to.not.equal(null);
            expect(result.timestamp).to.not.equal(null);
            expect(result.userid).to.equal('123L564890423454784012A4');

            done();
          });
        });
    });
  });
});
