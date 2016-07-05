// example unit tests
'use strict';

//Mocking is missing completely TODO add mocked objects

describe('User Management', () => {

  let helper, controller, expect;

  before((done) => {
    helper = require('../database/helper.js');
    helper.cleanDatabase()
      .then(() => done())
      .catch((error) => done(error));
  });

  beforeEach(() => {
    //Clean everything up before doing new tests
    Object.keys(require.cache).forEach((key) => delete require.cache[key]);
    require('chai').should();
    let chai = require('chai');
    let chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
    expect = require('chai').expect;
    controller = require('../database/usermanagement');
  });

  const dummyUser = {
    id: '12335567790',
    email: 'a@b.cd',
    name: 'Dummy User',
    nickname: 'DAU',
    url: 'https://plus.google.com/12335567790',
    location: 'de',
    provider: 'google'
  };
  const dummyUser2 = {
    id: '1',
    email: 'a@b.cd',
    name: 'Dummy User 2',
    nickname: 'DAU2',
    url: 'https://plus.google.com/1',
    location: 'en',
    provider: 'hotmail'
  };
  const example_token = 'ya29.CjL1AqRR4INLLzbJ4FpIMNxspvVEeJ8o6tUAHLPYF73ZrnYKn_iG7pZLlBVwIVLKkECj5A';

  let temp__id = '';

  context('when adding a new user', () => {
    it('should save a new consumer to the database', () => {
      let promise = controller.testing_AddConsumer(dummyUser, {
        access_token: example_token,
        'raw[expires_in]': 3600,
        'raw[scope]': 'user'
      }, 'google');
      return Promise.all([
        promise.should.be.fulfilled.and.eventually.not.be.empty,
        promise.should.eventually.not.equal(null)
      ]);
    });

    it('should find the consumer in the database', () => {
      let promise = controller.testing_SearchConsumerByProvider(dummyUser, 'google');
      return Promise.all([
        promise.should.be.fulfilled.and.eventually.not.be.empty,
        promise.should.eventually.have.property('identities').that.is.not.empty,
        promise.should.eventually.have.deep.property('identities.google.user').that.has.all.keys('id', 'email', 'name', 'nickname', 'url', 'location', 'provider'),
        promise.should.eventually.have.property('applications').that.is.not.empty,
        promise.should.eventually.have.deep.property('applications[0]').that.has.all.keys('name', 'authentification', 'kong'),
      ]);
    });
  });

  context('when having a new social login', () => {
    it('should find the user and return his _id', () => {
      return controller.testing_SearchConsumerByProvider(dummyUser, 'google')
        .then((consumer) => {
          expect(consumer).to.not.equal(null);
          const the_right_id = consumer._id.toString();
          temp__id = the_right_id;
          return controller.getConsumerId(dummyUser, {
            access_token: example_token,
            'raw[expires_in]': 3600,
            'raw[scope]': 'user'
          }, 'google')
            .then((result) => {
              expect(result).to.not.equal(null);
              expect(result.toString()).to.equal(the_right_id);
              return;
            });
        });
    });

    it('should return another _id when another user was used', () => {
      dummyUser.id = '98798different987n97n89';
      dummyUser.url = 'https://plus.google.com/98798different987n97n89';
      return controller.getConsumerId(dummyUser, {
        access_token: example_token,
        'raw[expires_in]': 3600,
        'raw[scope]': 'user'
      }, 'google')
        .then((result) => {
          expect(result).to.not.equal(null);
          expect(result.toString()).to.not.equal(temp__id);
          return;
        });
    });
  });


  context('when having stored consumers', () => {
    it('we should be able to update them', () => {
      dummyUser2._id = temp__id;
      return controller.testing_ReplaceConsumer(dummyUser2)
        .then((oldId) => {
          expect(oldId).to.equal(temp__id);
          return;
        });
    });
  });
});
