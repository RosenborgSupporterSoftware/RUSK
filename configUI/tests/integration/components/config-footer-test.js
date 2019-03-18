import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

const configStub = Service.extend({
  isDirty: false,
});

module('Integration | Component | config-footer', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:config-service', configStub);
  })

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{config-footer}}`);

    let buttons = [...this.element.querySelectorAll('button')];
    assert.equal(buttons.length, 1, "Only one button should be visible when config is not dirty");
    assert.equal(buttons[0].textContent.trim(), "Lukk config", "Button should only display 'Lukk config'");
  });

  test('it shows correct buttons when config is dirty', async function (assert) {
    await render(hbs`{{config-footer}}`);

    this.configService = this.owner.lookup('service:config-service');
    this.set('configService.isDirty', true);

    let buttons = [...this.element.querySelectorAll('button')];
    assert.equal(buttons.length, 3, "Three buttons should be visible");
    assert.equal(buttons[0].textContent.trim(), "Lagre endringer", "Button 1 should display 'Lagre endringer'");
    assert.equal(buttons[1].textContent.trim(), "Sjekk endringer", "Button 2 should display 'Sjekk endringer'");
    assert.equal(buttons[2].textContent.trim(), "Forkast & lukk", "Button 3 should display 'Forkast & lukk'");
  });

});
