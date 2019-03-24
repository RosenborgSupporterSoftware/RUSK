import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | module-setting', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    let testSetting = {
      setting: "Test",
      type: "ST_COLOR"
    };
    this.set('testSetting', testSetting);

    await render(hbs`{{module-setting setting=testSetting}}`);

    let colorElement = this.element.querySelector('input[type="color"]');
    assert.ok(colorElement, "we found the expected color element");
    this.set('testSetting.value', '#ff00ff');
    assert.equal(colorElement.value, '#ff00ff', 'setting the value of the setting also sets the color of the input');

    this.set('testSetting.type', 'ST_TEXT');
    // TODO: Text assertions if and when we actually have something here.

    this.set('testSetting.type', 'ST_BOOL');
    this.set('testSetting.value', true);
    let boolElement = this.element.querySelector('span.x-toggle-container');
    assert.dom(boolElement).hasClass('x-toggle-container-checked', 'the boolean should be toggled to on');
    this.set('testSetting.value', false);
    assert.dom(boolElement).hasNoClass('x-toggle-container-checked', 'the boolean should be toggled to off');
  });
});
