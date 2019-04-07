import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

let modules = [
  {
    moduleName: "Module 1",
    displayName: "Number 1",
    moduleEnabled: true,
    isDirty: false
  },
  {
    moduleName: "Module 2",
    displayName: "Grin",
    moduleEnabled: false,
    isDirty: true
  }
];

const configStub = Service.extend({
  isDirty: false,
});

module('Integration | Component | module-selector', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:config-service', configStub);
  })

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{module-selector}}`);

    this.configService = this.owner.lookup('service:config-service');
    this.set('configService.sortedModules', modules);

    let links = [...this.element.querySelectorAll('a.list-group-item')];
    assert.equal(links.length, 2, "we should have two links in the module list");
    assert.dom(links[0]).hasText('Number 1', "we should see the displayname of the first module");
    assert.ok(links[1].textContent.trim().startsWith("Grin"), "we should see the displayname of the second module (dirty)");
    assert.ok(links[1].textContent.trim().endsWith(" ⃰"), "we should see an asterisk since the module is dirty");
  });
});
