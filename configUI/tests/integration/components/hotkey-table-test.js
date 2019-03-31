import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let mod = {
  hasHotkeys: true,
  visibleHotkeys: [
    {
      displayName: "Hotkey 1",
      isDirty: false,
      hasKeyCombos: true,
      hotkeys: [
        {
          shiftKey: true,
          altKey: false,
          ctrlKey: false,
          key: "M"
        }
      ]
    }
  ]
};

module('Integration | Component | hotkey-table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{hotkey-table module=module}}`);
    this.set('module', mod);

    assert.dom('div.hotkeyBlock').exists('since we have hotkeys the element should exist');
    assert.dom('table.table').exists('hotkey table should be present');
    assert.dom('table.table > tbody > tr').exists('we should have a row in the table');
    // TODO: More DOM tests
  });
});
