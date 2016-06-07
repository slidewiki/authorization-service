// example unit tests
'use strict';

//Mocking is missing completely TODO add mocked objects

describe('Kong', () => {

  let controller, expect, request;

  const hostname = 'unit_oauth2_test',
    requestHost = 'oauth2test.localhost',
    upstreamURL = 'http://localhost:9897';

  let hostId = '';

  before(() => {
    request = require('request');
    Object.keys(require.cache).forEach((key) => delete require.cache[key]);
    require('chai').should();
    let chai = require('chai');
    let chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
    expect = require('chai').expect;
    controller = require('../controllers/kong');

    return controller.addUpstreamHost(hostname, requestHost, upstreamURL)
      .then((host) => {
        expect(host.id).to.not.equal(null);
        hostId = host.id;

        console.log('upstream host created: ', host);

        return controller.initializePluginOAuth2(hostId, undefined)
          .then((plugin) => {
            console.log('plugin enabled: ', plugin);
            return;
          });
      })
      .catch(function(error) {
        console.log(error);
        expect(1).to.equal(null);
        return;
      });
  });

  beforeEach(() => {
    //Clean everything up before doing new tests
    Object.keys(require.cache).forEach((key) => delete require.cache[key]);
    require('chai').should();
    let chai = require('chai');
    let chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
    expect = require('chai').expect;
    controller = require('../controllers/kong');
  });

  after(() => {
    return controller.deleteUpstreamHost(hostId)
      .then(() => {
        return;
      })
      .catch(function() {
        expect(1).to.equal(null);
        return;
      });
  });

  const consumerId = '123456789101213141516178';
  let consumerKongId = '',
    standardApplication = {};
  const applicationName = 'standard';
  const applicationRedirectURI = 'http://oauth2test.localhost/stdapplication/';

  context('when creating a new consumer', () => {
    it('should return the identifier and a date', () => {
      let promise = controller.createConsumer(consumerId);
      return promise.then((consumer) => {
        expect(consumer).to.not.equal(null);
        expect(consumer.id).to.not.equal(undefined);
        expect(consumer.custom_id).to.equal(consumerId);
        expect(consumer.created_at).to.not.equal(undefined);

        consumerKongId = consumer.id;

        return;
      });
    });

    it('should be possible to add an application for the consumer', () => {
      let promise = controller.createApplication(consumerKongId, applicationName, applicationRedirectURI);
      return promise.then((application) => {
        expect(application).to.not.equal(null);
        expect(application.client_secret).to.not.equal(undefined);
        expect(application.redirect_uri).to.equal(applicationRedirectURI);
        expect(application.created_at).to.not.equal(undefined);

        standardApplication = application;

        return;
      });
    });



    it('should be possible to retrieve an access token', () => {
      let promise = controller.getAccessToken(standardApplication.client_id, standardApplication.client_secret, undefined);
      return promise.then((grant) => {
        expect(grant).to.not.equal(null);
        expect(grant.token_type).to.not.equal(undefined);
        expect(grant.access_token).to.equal(undefined);
        expect(grant.expires_in).to.not.equal(undefined);

        console.log('We got the access grant: ', grant);

        return;
      });
    });
  });

});
