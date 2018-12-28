import Component from '@ember/component';

export default Component.extend({

  init() {
    this._super(...arguments);
  },

  actions: {
    disableModule() {
      this.set('module.moduleEnabled', false);
    },
    enableModule() {
      this.set('module.moduleEnabled', true);
    },
    saveConfiguration() {
      chrome.runtime.sendMessage({
        storeConfigFor: this.get('module.moduleName'),
        config: this.get('module').toStorageObject()
      }, rep => {
        if (rep == 'ok') {
          this.get('module').setClean();
        }
      })
    }
  }
});
