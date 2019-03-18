import Route from '@ember/routing/route';

export default Route.extend({

  async model() {
    localStorage.setItem('RUSK-ConfigUI-LastViewedModulePage', "other");
    return null;
  }

});
