import Component from '@ember/component';

export default Component.extend({

  actions: {
    enableSetting() {
      this.set('value', true);
    },

    disableSetting() {
      this.set('value', false);
    }
  }

});
