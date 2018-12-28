import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  configService: service('config-service'),

  async model(something) {
    // TODO: Hent modulconfig fra configService
    let res = this.get('configService').getConfig(something.id);
    return res;
  }


});
