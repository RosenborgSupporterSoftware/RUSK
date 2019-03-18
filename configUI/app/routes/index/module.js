import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  configService: service('config-service'),

  async model(something) {
    let res = this.get('configService').getConfig(something.id);
    if (res != null) {
      localStorage.setItem('RUSK-ConfigUI-LastViewedModulePage', res.moduleName);
    }
    return res;
  }

});
