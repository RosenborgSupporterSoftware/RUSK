import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | config-header', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{config-header}}`);

    let h2 = this.element.querySelector('h2');
    assert.equal(h2.textContent, "RUSK-innstillinger", "We have the right headline");
    let a = this.element.querySelector('a.closebutton');
    assert.ok(a, "We have a close button");
  });
});
