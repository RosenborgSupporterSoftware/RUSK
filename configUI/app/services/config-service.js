import Service from '@ember/service';
import configModule from '../models/config-module';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { filter } from '@ember/object/computed';

export default Service.extend({

  logger: inject('log-service'),

  async init() {
    this._super(...arguments);
    this.set("configs", []);

    if (window.location.host == "localhost:4200") {
      let json = await $.getJSON("configExample.json");
      this.createConfigArray(json);
    } else {
      chrome.runtime.sendMessage({ getConfigFor: "all" }, msg => {
        let cfg = JSON.parse(msg);
        this.createConfigArray(cfg);
      });
    }
  },

  /**
   * Send messages to RUSK backend to store changed configurations
   * @param callback - Callback to call once all configs are confirmed to be stored
   */
  saveDirtyConfigs(callback) {
    let dirty = this.get('dirtyModules');
    let unconfirmed = 0;

    dirty.forEach(mod => {
      unconfirmed++;
      chrome.runtime.sendMessage({
        storeConfigFor: mod.moduleName,
        config: mod.toStorageObject()
      }, () => {
          mod.setClean();
          if (--unconfirmed == 0) {
            if (callback != null) {
              callback();
            }
          }
      })
    })
  },

  getConfigSections() {
    var cfgs = this.get("configs");

    let names = cfgs.map(mod => mod.moduleName);
    return names;
  },

  getConfig(moduleName) {
    return this.get('configs').find(m => m.moduleName == moduleName);
  },

  createConfigArray(configObject) {
    let res = [];

    Object.keys(configObject).forEach(cfg => {
      if (cfg.startsWith('RUSK-ModConf-')) {
        res.push(configModule.create(configObject[cfg]));
      }
    });
    this.set("configs", res);
  },

  isDirty: computed('configs.@each.isDirty', function () {
    return this.get('configs').any(c => c.isDirty);
  }),

  dirtyModules: filter('configs.@each.isDirty', function (cfg) {
    return cfg.get('isDirty');
  })

});
