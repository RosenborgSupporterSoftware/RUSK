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
    this.set('originalModuleEnabled', this.moduleEnabled);

    this.setupSettings();
    this.setupHotkeys();
  },

  setupSettings() {
    let passedInSettings = this.settings;
    if (passedInSettings == null || passedInSettings.length == 0) return;

    let newSettings = [];
    passedInSettings.forEach(setting => {
      let newSetting = configSetting.create(setting);
      newSettings.push(newSetting);
    })
    this.set('settings', newSettings);
  },

  setupHotkeys() {
    let passedInHotkeys = this.hotkeys;
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

    this.settings.forEach(s => {
      settings.push(s.toStorageObject());
    });
    this.hotkeys.forEach(hk => {
      hotkeys.push(hk.toStorageObject());
    });

    return {
      moduleName: this.moduleName,
      displayName: this.displayName,
      moduleDescription: this.moduleDescription,
      moduleEnabled: this.moduleEnabled,
      moduleVisible: this.moduleVisible,
      settings,
      hotkeys
    };
  },

  /**
   * Sets the configModule object to a clean state.
   * Used after saving this as the new configuration.
   */
  setClean() {
    this.set('originalModuleEnabled', this.moduleEnabled);
    this.setupSettings();
    this.setupHotkeys();
  },

  isDirty: computed('moduleEnabled', 'settings.@each.isDirty', 'hotkeys.@each.isDirty', function () {
    if (this.moduleEnabled != this.originalModuleEnabled)
      return true;
    let settings = this.settings;
    if (settings.any(s => s.isDirty)) {
      return true;
    }
    let hotkeys = this.hotkeys;
    if (hotkeys.any(h => h.isDirty)) {
      return true;
    }
    return false;
  }),

  /** A bool that is true if the moduleEnabled property has been changed */
  enabledChanged: computed('moduleEnabled', 'originalModuleEnabled', function () {
    return this.moduleEnabled !== this.originalModuleEnabled;
  }),

  /** A list of settings with changed values */
  changedSettings: computed('visibleSettings', 'visibleSettings.@each.isDirty', function () {
    return this.visibleSettings.filter(s => {
      return s.isDirty;
    });
  }),

  /** A list of hotkeys with changes made */
  changedHotkeys: computed('visibleHotkeys', 'visibleHotkeys.@each.isDirty', function () {
    return this.visibleHotkeys.filter(hk => {
      return hk.isDirty;
    });
  }),

  visibleSettings: computed('settings', function () {
    return this.settings.filter(s => {
      // FIXME: Logikk for når vi viser alpha/beta settings her.
      if (s.visibility == "COV_ALWAYS") return true;
      if (s.visibility == "COV_ALPHA") return true;
      if (s.visibility == "COV_BETA") return true;
      return false;
    });
  }),

  visibleHotkeys: computed('hotkeys', function () {
    return this.hotkeys.filter(h => {
      // FIXME: Logikk for når vi viser alpha/beta settings her.
      if (h.visibility == "COV_ALWAYS") return true;
      if (h.visibility == "COV_ALPHA") return true;
      if (h.visibility == "COV_BETA") return true;
      return false;
    });
  }),

  hasSettings: computed('visibleSettings', function () {
    return this.visibleSettings.length > 0;
  }),

  hasHotkeys: computed('visibleHotkeys', function () {
    return this.visibleHotkeys.length > 0;
  }),

  enableDisableOnly: computed('hasSettings', 'hasHotkeys', function () {
    if (this.hasSettings) return false;
    if (this.hasHotkeys) return false;
    return true;
  })

});
