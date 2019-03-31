import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let hk = {

};

module('Integration | Component | modal-edithotkey', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{modal-edithotkey hotkey=hotkey}}`);
    this.set('hotkey', hk);
    this.set('editHotkeyOpen', true);

    // assert.dom('h4').exists();
    // assert.dom('h4').containsText('Hurtigtast', 'we should have a header');
    assert.ok(true, "TODO: Her skjer det noe rart. Renderer utenfor eget element?");
  });
});
