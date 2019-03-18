import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let setting = {
  value: true
};

module('Integration | Component | module-setting-bool', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('setting', setting);

    await render(hbs`{{module-setting-bool setting=setting}}`);

    let span = this.element.querySelector('span.x-toggle-container-checked');

    assert.ok(span, 'the element exists with the class name signifying it is toggled on');

    this.set('setting.value', false);

    assert.notOk(span.classList.contains('x-toggle-container-checked'), "element should be toggled off");
  });
});
