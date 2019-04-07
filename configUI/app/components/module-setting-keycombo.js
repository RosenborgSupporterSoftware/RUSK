import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  tagName: 'li',
  classNames: 'keycombo',
  classNameBindings: ['selected'],

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
