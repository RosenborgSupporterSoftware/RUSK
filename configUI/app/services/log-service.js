import Service from '@ember/service';

/**
 * Service that allows the settings app to log stuff using our RUSK logging scheme.
 */

export default Service.extend({

  /**
   * Log messages to RUSK
   * @param {The message to log to RUSK} logMessage
   * @param {The log level - EL_DEBUG, EL_WARNING or EL_ERROR} logLevel
   */
  log(logMessage, logLevel) {
    if (window.location.host == "localhost:4200") {
      chrome.runtime.sendMessage("cagdakojdggbjifgecdcfemflkagkekc", {
        logMessage,
        logLevel
      });
    } else {
      chrome.runtime.sendMessage({
        logMessage,
        logLevel
      });
    }
  }

});
