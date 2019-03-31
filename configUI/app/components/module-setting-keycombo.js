import Component from '@ember/component';
//import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Component.extend({

  selected: computed('keycombo.selected', {
    get() {
      return this.get('keycombo.selected');
    },
    set(key, value) {
      this.set('keycombo.selected', value);
      return value;
    }
  }),

});
