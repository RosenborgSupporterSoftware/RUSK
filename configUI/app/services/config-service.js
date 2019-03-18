import Service from '@ember/service';
import configModule from '../models/config-module';
import { sort } from '@ember/object/computed';
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

  /** Gets the names of the config sections we have */
  getConfigSections() {
    var cfgs = this.get("configs");

    let names = cfgs.map(mod => mod.moduleName);
    return names;
  },

  /** Gets a single, named configuration */
  getConfig(moduleName) {
    return this.get('configs').find(m => m.moduleName == moduleName);
  },

  /** Create the config array from the object provided by RUSK */
  createConfigArray(configObject) {
    let res = [];

    Object.keys(configObject).forEach(cfg => {
      if (cfg.startsWith('RUSK-ModConf-')) {
        res.push(configModule.create(configObject[cfg]));
      }
    });
    if (!this.isDestroyed) {
      this.set("configs", res);
    }
  },

  /** Gets a value indicating if we have any configuration changes */
  isDirty: computed('configs.@each.isDirty', function () {
    return this.get('configs').any(c => c.isDirty);
  }),

  /** Gets all modules with unstored configuration changes */
  dirtyModules: filter('configs.@each.isDirty', function (cfg) {
    return cfg.get('isDirty');
  }),

  /** Gets all modules that should be visible to the user */
  visibleModules: computed('configs', function () {
    return this.get('configs').filter(mod => {
      if (mod.moduleVisible === true) return true;
      return false;
    });
  }),

  moduleSorting: Object.freeze(['displayName']),

  sortedModules: sort('modulesWithSettings', 'moduleSorting'),

  /**
   * Lists all modules that have settings and/or hotkeys to edit
   */
  modulesWithSettings: computed('visibleModules', 'visibleModules.@each.enableDisableOnly', function () {
    return this.get('visibleModules').filter(mod => {
      return mod.get('enableDisableOnly') === false;
    });
  }),

  /**
   * Lists all modules that have no settings and/nor hotkeys to edit
   */
  settinglessModules: computed('visibleModules', 'visibleModules.@each.enableDisableOnly', function () {
    return this.get('visibleModules').filter(mod => {
      return mod.get('enableDisableOnly') === true;
    });
  }),

  hasSettinglessModules: computed('settinglessModules', function () {
    return this.get('settinglessModules').length > 0;
  })

});
