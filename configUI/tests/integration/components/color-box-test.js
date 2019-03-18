import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | color-box', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('testColor', '#ff0000');
    await render(hbs`{{color-box value=testColor}}`);

    assert.equal(this.element.textContent.trim(), '');
    let input = this.element.querySelector('input');
    assert.ok('input', 'Input element is rendered');
    assert.equal(input.getAttribute('type'), "color", "Input element is color type");
    assert.equal(input.value, '#ff0000', "Input element is connected to correct value");
    assert.ok(input.classList.contains('form-control'));
    assert.ok(input.classList.contains('form-control-lg'));

    this.set('testColor', '#123456');
    assert.equal(input.value, '#123456', 'Component picks up value changes');
  });
});
