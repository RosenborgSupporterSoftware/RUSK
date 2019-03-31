import EmberObject from '@ember/object';
import { computed } from '@ember/object';
import keyCombo from './key-combo';

/**
 * Ember representation of a single hotkey in an ExtensionModule
 */
export default EmberObject.extend({

  init() {
    this._super(...arguments);
    let hotkeys = this.hotkeys;
    let newHotkeys = [];
    let origHotkeys = [];
    hotkeys.forEach(hk => {
      let kc = keyCombo.create(hk);
      kc.set('parentHotkey', this);
      newHotkeys.push(kc);
      let okc = keyCombo.create(hk);
      origHotkeys.push(okc);
    });
    this.set('hotkeys', newHotkeys);
    this.set('originalHotkeys', origHotkeys);
  },

  hasKeyCombos: computed('hotkeys', function () {
    return this.hotkeys.length > 0;
  }),

  /** Removes a KeyCombo object from this hotkey */
  removeKeyCombo(keyCombo) {
    this.hotkeys.removeObject(keyCombo);
  },

  /** Adds a new KeyCombo to this hotkey */
  addKeyCombo(keyCombo) {
    keyCombo.set('parentHotkey', this);
    this.hotkeys.addObject(keyCombo);
  },

  toStorageObject() {
    let keyCombos = [];
    this.hotkeys.forEach(kc => {
      keyCombos.push(kc.toStorageObject());
    });

    return {
      name: this.name,
      label: this.label,
      visibility: this.visibility,
      validPages: this.validPages,
      hotkeys: keyCombos
    };
  },

  /** Gets a list of keyCombos that no longer exist as they have been changed/removed */
  removedKeyCombos: computed('hotkeys', 'hotkeys.@each', 'originalHotkeys', function () {
    let removed = this.originalHotkeys.filter(ohk => {
      return !this.hotkeys.any(chk => chk.isEqual(ohk));
    })
    return removed;
  }),

  /** Gets a list of keyCombos that have been added to the hotkey */
  addedKeyCombos: computed('hotkeys', 'hotkeys.@each', 'originalHotkeys', function () {
    let added = this.hotkeys.filter(chk => {
      return !this.originalHotkeys.any(ohk => chk.isEqual(ohk));
    })
    return added;
  }),

  isDirty: computed('hotkeys', 'hotkeys.@each', 'originalHotkeys', function () {
    let original = this.originalHotkeys;
    let current = this.hotkeys;

    if (original.length != current.length) return true;

    let allGood = true;
    current.forEach(curHotkey => {
      if (!original.any(ohk => curHotkey.isEqual(ohk)))
        allGood = false;
    });

    if (!allGood) return true;

    // TODO: Sammenligne hotkeys-listene
    return false;
  }),

  displayName: computed('label', 'name', function () {
    let dn = this.label;
    if (dn == null || dn.length == 0)
      dn = this.name;

    return dn;
  })

});
