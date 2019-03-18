import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function () {
  this.route('index', { path: '/' }, function () {
    this.route('module', { path: '/:id' });
    this.route('other');
  });
});

export default Router;
