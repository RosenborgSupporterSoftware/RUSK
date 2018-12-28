import EmberObject from '@ember/object';
import { computed } from '@ember/object';

/**
 * Ember representation of a single setting in an ExtensionModule
 */
export default EmberObject.extend({

  init() {
    this._super(...arguments);
    this.set('originalValue', this.get('value'));
  },

  toStorageObject() {
    return {
      setting: this.get('setting'),
      type: this.get('type'),
      value: this.get('value'),
      label: this.get('label'),
      isShared: this.get('isShared'),
      visibility: this.get('visibility')
    }
  },

  isDirty: computed('value', 'originalValue', function () {
    return this.get('value') != this.get('originalValue');
  }),

  displayName: computed('label', 'setting', function () {
    let dn = this.get('label');
    if (dn == null || dn.length == 0)
      dn = this.get('setting');

    return dn;
  })

});
