import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';

export default Component.extend({

  configService: service('config-service'),

  modules: readOnly('configService.visibleModules'),

  moduleNames: computed('modules', function () {
    return this.modules.map(mod => mod.moduleName);
  }),

  sortedModules: readOnly('configService.sortedModules'),

  hasSettinglessModules: readOnly('configService.hasSettinglessModules')

});
