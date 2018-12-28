import EmberObject from '@ember/object';
import configSetting from './config-setting';
import hotKey from './hot-key';
import { computed } from '@ember/object';

/**
 * Ember representation of an ExtensionModule - or rather, the module configuration belonging to it.
 */
export default EmberObject.extend({

  init() {
    this._super(...arguments);
    this.set('originalModuleEnabled', this.get('moduleEnabled'));

    this.setupSettings();
    this.setupHotkeys();
  },

  setupSettings() {
    let passedInSettings = this.get('settings');
    if (passedInSettings == null || passedInSettings.length == 0) return;

    let newSettings = [];
    passedInSettings.forEach(setting => {
      let newSetting = configSetting.create(setting);
      newSettings.push(newSetting);
    })
    this.set('settings', newSettings);
  },

  setupHotkeys() {
    let passedInHotkeys = this.get('hotkeys');
    if (passedInHotkeys == null || passedInHotkeys.length == 0) return;

    let newHotkeys = [];
    passedInHotkeys.forEach(hotkey => {
      let newHotkey = hotKey.create(hotkey);
      newHotkeys.push(newHotkey);
    });
    this.set('hotkeys', newHotkeys);
  },

  /**
   * Create an object representation of this module configuration, ready to store in RUSK config.
   */
  toStorageObject() {
    let settings = [];
    let hotkeys = [];

    this.get('settings').forEach(s => {
      settings.push(s.toStorageObject());
    });
    this.get('hotkeys').forEach(hk => {
      hotkeys.push(hk.toStorageObject());
    });

    return {
      moduleName: this.get('moduleName'),
      displayName: this.get('displayName'),
      moduleDescription: this.get('moduleDescription'),
      moduleEnabled: this.get('moduleEnabled'),
      moduleVisible: this.get('moduleVisible'),
      settings,
      hotkeys
    }
  },

  /**
   * Sets the configModule object to a clean state.
   * Used after saving this as the new configuration.
   */
  setClean() {
    this.set('originalModuleEnabled', this.get('moduleEnabled'));
    this.setupSettings();
    this.setupHotkeys();
  },

  isDirty: computed('moduleEnabled', 'settings.@each.isDirty', 'hotkeys.@each.isDirty', function () {
    if (this.get('moduleEnabled') != this.get('originalModuleEnabled'))
      return true;
    let settings = this.get('settings');
    if (settings.any(s => s.isDirty)) {
      return true;
    }
    let hotkeys = this.get('hotkeys');
    if (hotkeys.any(h => h.isDirty)) {
      return true;
    }
    return false;
  }),

  visibleSettings: computed('settings', function () {
    return this.get('settings').filter(s => {
      // FIXME: Logikk for når vi viser alpha/beta settings her.
      if (s.visibility == "COV_ALWAYS") return true;
      if (s.visibility == "COV_ALPHA") return true;
      if (s.visibility == "COV_BETA") return true;
      return false;
    })
  }),

  visibleHotkeys: computed('hotkeys', function () {
    return this.get('hotkeys').filter(h => {
      // FIXME: Logikk for når vi viser alpha/beta settings her.
      if (h.visibility == "COV_ALWAYS") return true;
      if (h.visibility == "COV_ALPHA") return true;
      if (h.visibility == "COV_BETA") return true;
      return false;
    })
  }),

  hasSettings: computed('visibleSettings', function () {
    return this.get('visibleSettings').length > 0;
  }),

  hasHotkeys: computed('visibleHotkeys', function () {
    return this.get('visibleHotkeys').length > 0;
  })

});
