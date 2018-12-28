import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({

  lifecycleManager: service('lifecycle-manager'),

  didInsertElement() {
    document.querySelector('a.closebutton').addEventListener('click', ev => {
      ev.preventDefault();
      this.lifecycleManager.requestClose();
    });
    window.addEventListener('keyup', ev => {
      if (ev.key == "Escape") {
        ev.preventDefault();
        this.lifecycleManager.requestClose();
      }
    });
  }
});
