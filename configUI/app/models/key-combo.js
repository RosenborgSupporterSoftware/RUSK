import EmberObject, { computed } from '@ember/object';

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
    this.set('selected', false);
  },

  toStorageObject() {
    return {
      _shiftKey: this.shiftKey,
      _altKey: this.altKey,
      _ctrlKey: this.ctrlKey,
      _key: this.key
    };
  },

  isEqual(other) {
    if (other == null) return false;

    if (this.key != other.key) return false;
    if (this.shiftKey != other.shiftKey) return false;
    if (this.altKey != other.altKey) return false;
    if (this.ctrlKey != other.ctrlKey) return false;

    return true;
  },

  displayName: computed('shiftKey', 'altKey', 'ctrlKey', 'key', function () {
    let name = "";
    if (this.shiftKey) name += "Shift+";
    if (this.altKey) name += "Alt+";
    if (this.ctrlKey) name += "Ctrl+";
    name += this.key;

    return name;
  })

});
