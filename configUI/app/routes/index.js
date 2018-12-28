import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import $ from 'jquery';

export default Route.extend({

  configService: service('config-service'),

  async model() {
    let promise = new Promise(async (resolve, reject) => {
      if (chrome.storage) {
        chrome.storage.sync.get(null, items => {
          if (items == null) {
            reject({ message: "Did not get any configuration" });
          }
          // Über-objekt fra Chrome storage med all config i
          resolve(this.createConfigArray(items));
        });
      } else {  // Bare for å ha litt data å leke med i standalone-modus
        let json = await $.getJSON("configExample.json");
        resolve(this.createConfigArray(json));
      }
    });
    return promise;
  },

  createConfigArray(configObject) {

    let res = {};
    res.moduleConfigs = [];

    Object.keys(configObject).forEach(cfg => {
      if (cfg.startsWith('RUSK-ModConf-')) {
        res.moduleConfigs.push(configObject[cfg]);
      }
    });
    return res;
  }
});
