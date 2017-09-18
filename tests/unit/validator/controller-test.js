import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

const serviceMock = {
  isTemplate: sinon.stub(),
  getValidationResults: sinon.stub()
};

const validatorStub = Ember.Service.extend(serviceMock);

const EXAMPLE_TEMPLATE = `
name: batman/batmobile
version: 2.0.1
description: Big noisy car
maintainer: batman@batcave.com
config:
  image: batman:4
  steps:
    - forgreatjustice: ba.sh`;

const EXAMPLE_CONFIG = `
jobs:
  main:
    image: batman:4
    steps:
      - forgreatjustice: ba.sh
`;

moduleFor('controller:validator', 'Unit | Controller | validator', {
  // Specify the other units that are required for this test.
  // needs: ['service:validator'],
  beforeEach() {
    this.register('service:validator', validatorStub);
    this.inject.service('validator');

    serviceMock.isTemplate.reset();
    serviceMock.getValidationResults.reset();
  }
});

test('it handles template yaml', function (assert) {
  const controller = this.subject();
  const expectedResult = { foo: 'bar' };

  serviceMock.isTemplate.withArgs(EXAMPLE_TEMPLATE).returns(true);
  serviceMock.getValidationResults.withArgs(EXAMPLE_TEMPLATE).returns(
    Ember.RSVP.resolve(expectedResult)
  );

  // wrap the test in the run loop because we are dealing with async functions
  return Ember.run(() => {
    controller.set('yaml', EXAMPLE_TEMPLATE);

    return wait().then(() => {
      assert.equal(controller.get('isTemplate'), true);
      assert.deepEqual(controller.get('results'), expectedResult);
    });
  });
});

test('it handles screwdriver yaml', function (assert) {
  const controller = this.subject();
  const expectedResult = { foo: 'bar' };

  serviceMock.isTemplate.withArgs(EXAMPLE_CONFIG).returns(false);
  serviceMock.getValidationResults.withArgs(EXAMPLE_CONFIG).returns(
    Ember.RSVP.resolve(expectedResult)
  );

  // wrap the test in the run loop because we are dealing with async functions
  return Ember.run(() => {
    controller.set('yaml', EXAMPLE_CONFIG);

    return wait().then(() => {
      assert.equal(controller.get('isTemplate'), false);
      assert.deepEqual(controller.get('results'), expectedResult);
    });
  });
});

test('it handles clearing yaml', function (assert) {
  const controller = this.subject();
  const expectedResult = { foo: 'bar' };

  serviceMock.isTemplate.withArgs(EXAMPLE_CONFIG).returns(false);
  serviceMock.getValidationResults.withArgs(EXAMPLE_CONFIG).returns(
    Ember.RSVP.resolve(expectedResult)
  );

  // wrap the test in the run loop because we are dealing with async functions
  return Ember.run(() => {
    controller.set('yaml', EXAMPLE_CONFIG);

    return wait().then(() => {
      assert.equal(controller.get('isTemplate'), false);
      assert.deepEqual(controller.get('results'), expectedResult);
      controller.set('yaml', '');

      assert.equal(controller.get('results'), '');
    });
  });
});
