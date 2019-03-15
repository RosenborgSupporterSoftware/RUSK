import Component from '@ember/component';
import { computed } from '@ember/object';
import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({

  configService: service('config-service'),

  // moduleNames: computed('configService.configs', function () {
  //   return this.get('configService').get('configs').map(mod => mod.moduleName);
  // }),

  modules: computed('configService.configs', function () {
    return this.get('configService').get('configs').filter(mod => {
      if (mod.moduleVisible === true) return true;
      return false;
    });
  }),

  moduleNames: computed('modules', function () {
    return this.get('modules').map(mod => mod.moduleName);
  }),

  moduleSorting: Object.freeze(['displayName']),

  sortedModules: sort('modulesWithSettings', 'moduleSorting'),

  /**
   * Lists all modules that have settings and/or hotkeys to edit
   */
  modulesWithSettings: computed('modules', 'modules.@each.enableDisableOnly', function () {
    return this.get('modules').filter(mod => {
      return mod.get('enableDisableOnly') === false;
    });
  }),

  /**
   * Lists all modules that have no settings and/nor hotkeys to edit
   */
  settinglessModules: computed('modules', 'modules.@each.enableDisableOnly', function () {
    return this.get('modules').filter(mod => {
      return mod.get('enableDisableOnly') === true;
    });
  }),

  hasSettinglessModules: computed('settinglessModules', function () {
    return this.get('settinglessModules').length > 0;
  })

});
