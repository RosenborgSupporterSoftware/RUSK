import EmberObject from '@ember/object';

/**
 * Ember representation of a keyboard combination in a hotkey definition
 */
export default EmberObject.extend({

  init() {
    this._super(...arguments);

    this.set('shiftKey', this._shiftKey);
    this.set('altKey', this._altKey);
    this.set('ctrlKey', this._ctrlKey);
    this.set('key', this._key);
  },

  toStorageObject() {

    return {
      _shiftKey: this.shiftKey,
      _altKey: this.altKey,
      _ctrlKey: this.ctrlKey,
      _key: this.key
    };

  }
});
