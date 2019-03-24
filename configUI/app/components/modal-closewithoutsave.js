import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({

  lifecycleManager: inject('lifecycle-manager'),
  configService: inject('config-service'),

  unsavedModalOpen: computed('lifecycleManager.displayCloseModal', function() {
    return this.lifecycleManager.get('displayCloseModal');
  }),

  dirtyModules: computed('configService.dirtyModules', function () {
    return this.configService.get('dirtyModules');
  }),

  actions: {
    cancelCloseConfig: function () {
      this.lifecycleManager.cancelClose();
    },

    performCloseConfig() {
      this.lifecycleManager.doClose();
    }
  }

});
