import EmberObject from '@ember/object';
import { computed } from '@ember/object';
import keyCombo from './key-combo';

/**
 * Ember representation of a single hotkey in an ExtensionModule
 */
export default EmberObject.extend({

  init() {
    this._super(...arguments);
    let hotkeys = this.get('hotkeys');
    this.set('originalHotkeys', hotkeys);
    let newHotkeys = [];
    hotkeys.forEach(hk => {
      newHotkeys.push(keyCombo.create(hk));
    });
    this.set('hotkeys', newHotkeys);
  },

  toStorageObject() {
    let keyCombos = [];
    this.get('hotkeys').forEach(kc => {
      keyCombos.push(kc.toStorageObject());
    });

    return {
      name: this.get('name'),
      label: this.get('label'),
      visibility: this.get('visibility'),
      validPages: this.get('validPages'),
      hotkeys: keyCombos
    }
  },

  isDirty: computed('hotkeys', 'originalHotkeys', function () {
    let original = this.get('originalHotkeys');
    let current = this.get('hotkeys');

    if (original.length != current.length) return true;

    // TODO: Sammenligne hotkeys-listene
    return false;
  }),

  displayName: computed('label', 'name', function () {
    let dn = this.get('label');
    if (dn == null || dn.length == 0)
      dn = this.get('name');

    return dn;
  })

});
