import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let setting = {
  value: '#00FF00'
}

module('Integration | Component | module-setting-color', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{module-setting-color setting=setting}}`);

    this.set('setting', setting);

    // At the moment this renders a color-box, which in turn is just an <input type="color">.

    let input = this.element.querySelector('input');
    assert.ok(input);
    assert.equal(input.value, "#00ff00");

    this.set('setting.value', '#123456');
    assert.equal(input.value, '#123456');
  });
});
