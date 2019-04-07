import EmberObject from '@ember/object';
import { computed } from '@ember/object';

/**
 * Ember representation of a single setting in an ExtensionModule
 */
export default EmberObject.extend({

  init() {
    this._super(...arguments);
    if (this.type == "ST_COLOR") {
      this.set('value', this.value.toLowerCase());
    }
    this.set('originalValue', this.value);
  },

  toStorageObject() {
    return {
      setting: this.setting,
      type: this.type,
      value: this.value,
      label: this.label,
      isShared: this.isShared,
      visibility: this.visibility
    };
  },

  isDirty: computed('value', 'originalValue', function () {
    return this.value != this.originalValue;
  }),

  displayName: computed('label', 'setting', function () {
    let dn = this.label;
    if (dn == null || dn.length == 0)
      dn = this.setting;

    return dn;
  })

});
