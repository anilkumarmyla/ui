import { test } from 'qunit';
import { authenticateSession } from 'screwdriver-ui/tests/helpers/ember-simple-auth';
import moduleForAcceptance from 'screwdriver-ui/tests/helpers/module-for-acceptance';
import Pretender from 'pretender';

import makePipeline from '../mock/pipeline';
import makeEvents from '../mock/events';
import makeBuilds from '../mock/builds';
import makeGraph from '../mock/workflow-graph';
import makeJobs from '../mock/jobs';

let server;

moduleForAcceptance('Acceptance | pipeline build', {
  beforeEach() {
    const graph = makeGraph();
    const jobs = makeJobs();
    const pipeline = makePipeline(graph);
    const events = makeEvents(graph);

    server = new Pretender();

    server.get('http://localhost:8080/v4/pipelines/4', () => [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(pipeline)
    ]);

    server.get('http://localhost:8080/v4/pipelines/4/jobs', () => [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(jobs)
    ]);

    server.get('http://localhost:8080/v4/pipelines/4/events', () => [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(events)
    ]);

    server.get('http://localhost:8080/v4/events/:eventId/builds', (request) => {
      const eventId = parseInt(request.params.eventId, 10);

      return [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(makeBuilds(eventId))
      ];
    });

    server.get('http://localhost:8080/v4/jobs/:jobId/builds', (request) => {
      const jobId = parseInt(request.params.jobId, 10);

      return [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(makeBuilds(jobId))
      ];
    });

    server.get('http://localhost:8080/v4/collections', () => [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify([])
    ]);
  },
  afterEach() {
    server.shutdown();
  }
});

test('visiting /pipelines/4 when not logged in', function (assert) {
  visit('/pipelines/4');

  andThen(() => {
    assert.equal(currentURL(), '/login');
  });
});

test('visiting /pipelines/4 when logged in', function (assert) {
  authenticateSession(this.application, { token: 'fakeToken' });

  visit('/pipelines/4');

  andThen(() => {
    assert.equal(currentURL(), '/pipelines/4/events');
    assert.equal(find('a h1').text().trim(), 'foo/bar', 'incorrect pipeline name');
    assert.equal(find('.pipelineWorkflow svg').length, 1, 'not enough workflow');
    assert.equal(find('button.start-button').length, 1, 'should have a start button');
    assert.equal(find('ul.nav-pills').length, 1, 'should show tabs');
    assert.equal(find('.column-tabs-view .nav-link').eq(0).text().trim(), 'Events');
    assert.equal(find('.column-tabs-view .nav-link.active').eq(0).text().trim(), 'Events');
    assert.equal(find('.column-tabs-view .nav-link').eq(1).text().trim(), 'Pull Requests');
    assert.equal(find('.separator').length, 1);
    assert.equal(find('.partial-view').length, 2);

    visit('/pipelines/4/pulls');

    andThen(() => {
      assert.equal(currentURL(), '/pipelines/4/pulls');
      assert.equal(find('.column-tabs-view .nav-link.active').eq(0).text().trim(), 'Pull Requests');
    });
  });
});
