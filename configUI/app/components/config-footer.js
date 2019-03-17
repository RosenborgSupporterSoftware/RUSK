import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({

  configService: service('config-service'),
  lifecycleManager: service('lifecycle-manager'),

  configDirty: computed('configService.isDirty', {
    get() {
      return this.get('configService.isDirty');
    }
  }),

  discardButtonText: computed('configDirty', {
    get() {
      let changes = this.get('configDirty');
      return changes ? "Forkast & lukk" : "Lukk config";
    }
  }),

  actions: {
    saveConfiguration: function () {
      let configService = this.get('configService');
      return new Promise(function (resolve/*), reject*/) {

        configService.saveDirtyConfigs(() => {
          resolve();
        });

      });
    },

    closeConfigUI: function () {
      this.get('lifecycleManager').requestClose();
    },

    reviewChanges: function () {
      this.get('lifecycleManager').set('displayChangeReview', true);
    }
  }
});
