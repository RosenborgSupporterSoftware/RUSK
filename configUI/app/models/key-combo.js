import EmberObject from '@ember/object';

/**
 * Ember representation of a keyboard combination in a hotkey definition
 */
export default EmberObject.extend({

  init() {
    this._super(...arguments);

    this.set('shiftKey', this.get('_shiftKey'));
    this.set('altKey', this.get('_altKey'));
    this.set('ctrlKey', this.get('_ctrlKey'));
    this.set('key', this.get('_key'));
  },

  toStorageObject() {

    return {
      _shiftKey: this.get('shiftKey'),
      _altKey: this.get('altKey'),
      _ctrlKey: this.get('ctrlKey'),
      _key: this.get('key')
    };

  }
});
