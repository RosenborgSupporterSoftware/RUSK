import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  configService: service('config-service'),

  model() {
    return new Promise((resolve) => {
      function checkData(context, resolve) {
        if (context.get('configService.configs').length > 0) {
          return resolve(context.get('configService.configs'));
        } else {
          setTimeout(() => {
            checkData(context, resolve);
          }, 100);
        }
      }
      checkData(this, resolve);
    })
  },

  afterModel(model) {
    let route = "index.module";
    let module = localStorage.getItem('RUSK-ConfigUI-LastViewedModulePage');
    if (module == null) {
      module = model[0].moduleName;
    } else if (module == 'other') {
      route = "index.other";
    } else {
      let found = false;
      model.forEach(cfg => {
        if (cfg.moduleName == module) {
          found = true;
        }
      });
      if (!found) {
        module = model[0].moduleName;
      }
    }
    if (route == "index.other") {
      this.transitionTo(route);
    } else {
      this.transitionTo(route, module);
    }
  }
});
