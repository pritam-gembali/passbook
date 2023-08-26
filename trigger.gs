function startTracking() {
  ScriptApp.newTrigger("processTransactionEmails")
  .timeBased()
  .everyMinutes(1).create();

  return "Started tracking successfully!";
}

function stopTracking() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == "processTransactionEmails") {
      ScriptApp.deleteTrigger(triggers[i]);
      return "Stopped tracking successfully";
    }
  }
  return "Error in stopping tracking!"
}

function getTrackingStatus() {
  var triggerName = "processTransactionEmails";
  var triggers = ScriptApp.getProjectTriggers();
  var isTrackingStarted = false;

  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === triggerName) {
      isTrackingStarted = true;
      break;
    }
  }

  return isTrackingStarted ? "STARTED" : "STOPPED";
}
