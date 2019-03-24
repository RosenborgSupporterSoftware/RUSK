import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import Service from '@ember/service';

const configStub = Service.extend({
  init() {
    this._super(...arguments);
    this.set('configs', [
      EmberObject.create({
        moduleName: "Module 1",
        moduleVisible: true,
        enableDisableOnly: true,
        moduleDescription: "Mod 1"
      }),
      EmberObject.create({
        moduleName: "Module 2",
        moduleVisible: true,
        enableDisableOnly: false,
        moduleDescription: "Mod 2"
      }),
      EmberObject.create({
        moduleName: "Module 3",
        moduleVisible: false,
        enableDisableOnly: true,
        moduleDescription: "Mod 3"
      })
    ]);
  }
});

module('Integration | Component | other-modules', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:config-service', configStub);
  })

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{other-modules}}`);

    let rows = [...this.element.querySelectorAll('div > table tbody tr')];
    assert.equal(rows.length, 1, "We should have only one visible module");

    let td = rows[0].querySelector('td.configLabel');
    assert.equal(td.childNodes[1].textContent.trim(), "Module 1", "Module name should be displayed");
    assert.dom(td.childNodes[4]).hasText('Mod 1', "Module description too");

    td = rows[0].querySelector('td.configValue');
    assert.ok(td.querySelector('span.x-toggle-container'), "Toggle widget should be rendered");
  });
});
