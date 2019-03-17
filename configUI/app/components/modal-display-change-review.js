import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({

  configService: service('config-service'),
  lifecycleManager: service('lifecycle-manager'),

  changeReviewOpen: computed('lifecycleManager.displayChangeReview', function () {
    return this.get('lifecycleManager').displayChangeReview;
  }),

  actions: {
    performCloseReview: function () {
      this.get('lifecycleManager').set('displayChangeReview', false);
    }
  }

});
