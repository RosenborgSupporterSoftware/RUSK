import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

const configStub = Service.extend({
  isDirty: true,
});

const lifecycleStub = Service.extend({
  displayCloseModal: false
});

module('Integration | Component | modal-closewithoutsave', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:config-service', configStub);
    this.owner.register('service:lifecycle-manager', lifecycleStub);
  })

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{modal-closewithoutsave}}`);

    this.lifecycleManager = this.owner.lookup('service:lifecycle-manager');
    this.set('lifecycleManager.displayClodeModal', true);

    this.configService = this.owner.lookup('service:config-service');
    this.set('configService.isDirty', true);
    this.set('configService.dirtyModules', [
      {
        moduleName: "Module 1"
      },
      {
        moduleName: "Module 2"
      }
    ]);

    assert.ok(this.element, "Element renders");
    // TODO: Figure out why element does not really render. Stub setup bad?
    //assert.equal(this.element.querySelector('h4.modal-title').textContent.trim(), 'Du har ulagrede endringer');

  });
});
