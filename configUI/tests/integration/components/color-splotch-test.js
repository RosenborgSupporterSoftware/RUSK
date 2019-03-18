import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | color-splotch', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('testColor', '#FFFFFF');

    await render(hbs`{{color-splotch color=testColor}}`);

    let div = this.element.querySelector('div.colorsplotch');
    assert.notEqual(div, null, "The component renders a div with the colorsplotch class");
    assert.equal(div.style.backgroundColor, "rgb(255, 255, 255)", "Background color is set correctly");
  });
});
