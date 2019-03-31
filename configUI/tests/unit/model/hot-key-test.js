import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import HotKey from 'config-ui/models/hot-key';

module('Unit | Model | hot-key', function(hooks) {
  setupTest(hooks);

  let src = {
    name: 'Test-hotkey',
    label: 'Test hotkey',
    validPages: ["RBKwebPageType_ALL"],
    hotkeys: [
      {
        hotkeys: [
          {
            _shiftKey: true,
            _altKey: false,
            _ctrlKey: false,
            key: "J"
          }
        ]
      }
    ]
  };

  // Specify the other units that are required for this test.
  test('basic object creation/property tests', function(assert) {

    let sut = HotKey.create(src);

    assert.equal(sut.hotkeys.length, 1, "Object should have one hotkey defined");
    // run(() => d = sut.get('displayName'));

    assert.equal(sut.get('name'), "Test-hotkey", "We should get the name properly");
    assert.equal(sut.get('label'), "Test hotkey", "We should get the label properly");
    assert.equal(sut.get('displayName'), "Test hotkey", "displayName should be label when it is set");
    sut.set('label', null);
    assert.equal(sut.get('displayName'), "Test-hotkey", "displayName should be equal to name when label is not set");
  });
});
