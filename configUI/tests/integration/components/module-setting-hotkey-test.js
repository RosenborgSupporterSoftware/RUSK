import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | module-setting-hotkey', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    let keyCombo = {
      shiftKey: false,
      altKey: false,
      ctrlKey: false,
      key: "A"
    };
    this.set('keyCombo', keyCombo);

    await render(hbs`{{module-setting-hotkey keycombo=keyCombo}}`);

    let topDiv = this.element.querySelector('div.keycombo');
    assert.ok(topDiv, 'We should have an element representing the key combination');

    let spanQuery = 'span.hotkey-key';
    let spans = [...topDiv.querySelectorAll(spanQuery)];
    assert.equal(spans.length, 1, 'We should only have one span - the one with the A key - at this point');
    assert.equal(spans[0].textContent.trim(), 'A', 'Only the key should be displayed currently');

    this.set('keyCombo.shiftKey', true);
    spans = [...topDiv.querySelectorAll(spanQuery)];
    assert.equal(spans.length, 2, 'We should now have an extra span for the Shift key');
    assert.equal(spans[0].textContent.trim(), 'Shift', 'The Shift key should now be present');

    this.set('keyCombo.altKey', true);
    spans = [...topDiv.querySelectorAll(spanQuery)];
    assert.equal(spans.length, 3, 'We should now have an extra span for the Alt key');
    assert.equal(spans[1].textContent.trim(), 'Alt', 'The Alt key should now be present');

    this.set('keyCombo.ctrlKey', true);
    spans = [...topDiv.querySelectorAll(spanQuery)];
    assert.equal(spans.length, 4, 'We should now have an extra span for the Ctrl key');
    assert.equal(spans[2].textContent.trim(), 'Ctrl', 'The Ctrl key should now be present');
  });
});
