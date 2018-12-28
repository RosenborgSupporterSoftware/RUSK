import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  didInsertElement() {
    this._super(...arguments);

    // let box = this.element.querySelector("div.colorbox");
    // box.style.backgroundColor = this.get('color');
  },

  // Egentlig ikke nødvendig nå som vi har standard format på alle farger i settings.
  color: computed('value', function () {
    return this.get('value');
  })

});
