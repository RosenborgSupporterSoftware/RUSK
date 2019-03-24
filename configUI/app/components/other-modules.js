import Component from '@ember/component';
import { computed } from '@ember/object';
import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({

  configService: service('config-service'),

  modules: computed('configService.configs', function () {
    return this.configService.get('configs').filter(mod => {
      if (mod.moduleVisible === true) return true;
      return false;
    });
  }),

  /**
  * Lists all modules that have no settings and/nor hotkeys to edit
  */
  settinglessModules: computed('modules', 'modules.@each.enableDisableOnly', function () {
    return this.modules.filter(mod => {
      return mod.get('enableDisableOnly') === true;
    });
  }),

  moduleSorting: Object.freeze(['displayName']),

  sortedModules: sort('settinglessModules', 'moduleSorting'),

});
