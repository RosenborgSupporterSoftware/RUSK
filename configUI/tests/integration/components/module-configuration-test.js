import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let extmod = {
  moduleName: "TestModule",
  displayName: "Module for testing",
  moduleEnabled: true,
  moduleDescription: "Just for testing",
  hasSettings: true,
  visibleSettings: [
    {
      setting: "Test"
    }
  ],
  hasHotkeys: true,
  visibleHotkeys: [
    {
      blabla: "Hei"
    }
  ]
};

module('Integration | Component | module-configuration', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{module-configuration module=model}}`);

    this.set('model', extmod);

    assert.ok(this.element, "Element should render");
    let displayName = this.element.querySelector('div.col>span.h3').textContent.trim();
    assert.equal(displayName, extmod.displayName, "displayName should be displayed");

    let desc = this.element.querySelector('p#module-description').textContent.trim();
    assert.equal(desc, extmod.moduleDescription, "Description should be displayed");

  });

  test('settings block displayed when settings are present', async function(assert) {

    await render(hbs`{{module-configuration module=model}}`);

    this.set('model', extmod);

    let table = this.element.querySelector('div.settingsBlock table');
    assert.ok(table, "module hasSettings so settings table is rendered");
  });

});
