import Component from '@ember/component';

export default Component.extend({

  /** The currently selected keyCombo in the list */
  selectedKeyCombo: null,
  selectedHotkey: null,
  modalMode: 'add',
  modalOpen: false,

  actions: {
    selectKeyCombo: function (keyCombo) {
      let old = this.selectedKeyCombo;
      if (old === keyCombo) return;
      if (old != null) {
        this.selectedKeyCombo.set('selected', false);
      }
      this.set('selectedKeyCombo', keyCombo);
      this.set('selectedHotkey', keyCombo.parentHotkey)
    },

    deleteKeyCombo: function () {
      let kc = this.selectedKeyCombo;
      let hk = this.selectedHotkey;

      hk.removeKeyCombo(kc);
      this.set('selectedKeyCombo', null);
      this.set('selectedHotkey', null);
    },

    editKeyCombo: function () {
      this.set('modalMode', 'edit');
      this.set('modalOpen', true);
    },

    addKeyCombo: function (hotkey) {
      this.set('selectedHotkey', hotkey);
      this.set('modalMode', 'add');
      this.set('modalOpen', true);
    },

    storeNewKeyCombo: function (keyCombo) {
      this.selectedHotkey.addKeyCombo(keyCombo);
    }
  }
});
