import Service from '@ember/service';
import { inject } from '@ember/service';

export default Service.extend({

  configService: inject('config-service'),

  displayCloseModal: false,
  displayChangeReview: false,

  /**
   * The function to call in order to request a shutdown of the config UI.
   */
  requestClose() {
    if (this.configService.get('isDirty')) {
      this.set('displayCloseModal', true);
    } else {
      this.doClose();
    }
  },

  cancelClose() {
    this.set('displayCloseModal', false);
  },

  doClose() {
    this.set('displayCloseModal', false);
    // Send message to RUSK about closing settings overlay
    chrome.runtime.sendMessage({
      setConfigState: "closed",
      closeConfigOverlay: true
    });
  }

});
