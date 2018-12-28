import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  init: function () {
    this._super();
  },

  meh: computed('checked', function () {
  })

});
