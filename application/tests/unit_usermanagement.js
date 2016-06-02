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
  const example_token = 'ya29.CjL1AqRR4INLLzbJ4FpIMNxspvVEeJ8o6tUAHLPYF73ZrnYKn_iG7pZLlBVwIVLKkECj5A';

  let temp__id = '';

  context('when adding a new user', () => {
    it('should save a new consumer to the database', () => {
      let promise = controller.testing_AddUser(dummyUser, example_token, 'google');
      return Promise.all([
        promise.should.be.fulfilled.and.eventually.not.be.empty,
        promise.should.eventually.not.equal(null)
      ]);
    });

    it('should find the consumer in the database', () => {
      let promise = controller.testing_SearchUser(dummyUser, example_token, 'google');
      return Promise.all([
        promise.should.be.fulfilled.and.eventually.not.be.empty,
        promise.should.eventually.have.property('identities').that.is.not.empty,
        promise.should.eventually.have.deep.property('identities.google').that.has.all.keys('id', 'email', 'name', 'nickname', 'url', 'location', 'provider'),
        promise.should.eventually.have.property('applications').that.is.not.empty,
        promise.should.eventually.have.deep.property('applications[0].authentification').that.has.all.keys('timestamp', 'token', 'expires_in', 'scopes'),
      ]);
    });
  });

  context('when having a new social login', () => {
    it('should find the user and return his _id', () => {
      return controller.testing_SearchUser(dummyUser, example_token, 'google')
        .then((consumer) => {
          expect(consumer).to.not.equal(null);
          const the_right_id = consumer._id.toString();
          temp__id = the_right_id;
          return controller.getUserId(dummyUser, example_token, 'google')
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
      return controller.getUserId(dummyUser, example_token, 'google')
        .then((result) => {
          expect(result).to.not.equal(null);
          expect(result.toString()).to.not.equal(temp__id);
          return;
        });
    });
  });

});
