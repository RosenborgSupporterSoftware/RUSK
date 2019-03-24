import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  color: computed('_color', {
    get() {
      return this._color;
    },
    set(key, value) {
      this.set('_color', value);
      if (this.element) {
        this.element.childNodes[0].style.backgroundColor = value;
      }
      return value;
    }
  }),

  didInsertElement() {
    this.set('color', this.color);
  }
});
