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

  moduleSorting: Object.freeze(['moduleName']),

  sortedModules: sort('modules', 'moduleSorting')

});
