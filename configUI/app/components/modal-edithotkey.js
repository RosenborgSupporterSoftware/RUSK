import Component from '@ember/component';
import KeyCombo from '../models/key-combo';
//import * as keycode from 'keycode';

export default Component.extend({

  init() {
    this._super(...arguments);
  },

  didInsertElement() {
    let modal = this;
    document.addEventListener("keydown", function (ev) {
      if (modal.get('editHotkeyOpen')) {
        if (modal.keyIsModifier(ev.key)) return;

        ev.preventDefault();
        modal.set('shiftKey', ev.shiftKey);
        modal.set('altKey', ev.altKey);
        modal.set('ctrlKey', ev.ctrlKey);
        //modal.set('key', keycode(ev).toUpperCase());
        modal.set('key', ev.key.toUpperCase());
      }
    });
  },

  keyIsModifier(key) {
    // Almost optimally bad implementation
    if (key == "Shift" || key == "Alt" || key == "Control")
      return true;
    return false;
  },

  actions: {

    save() {
      this.keyCombo.set('shiftKey', this.shiftKey);
      this.keyCombo.set('altKey', this.altKey);
      this.keyCombo.set('ctrlKey', this.ctrlKey);
      this.keyCombo.set('key', this.key);

      this.set('shiftKey', false);
      this.set('altKey', false);
      this.set('ctrlKey', false);
      this.set('key', null);

      this.addNewAction(this.keyCombo);

      this.set('editHotkeyOpen', false);
    },

    cancel() {
      this.set('editHotkeyOpen', false);
    },

    showModal() {
      if (this.mode == "edit") {
        this.set('shiftKey', this.keyCombo.shiftKey);
        this.set('altKey', this.keyCombo.altKey);
        this.set('ctrlKey', this.keyCombo.ctrlKey);
        this.set('key', this.keyCombo.key);
      } else {
        let keyCombo = KeyCombo.create({
          shiftKey: this.shiftKey,
          altKey: this.altKey,
          ctrlKey: this.ctrlKey,
          key: this.key
        });
        this.set('keyCombo', keyCombo);
      }
    }
  },

});
