window.activeOverTimers = [];

window.setOverTimeout = function(func, delay) {
    var timer = window.setTimeout(func, delay);
    window.activeOverTimers.push(timer)
    return timer;
};

window.clearOverTimeout = function(timerID) {
    window.activeOverTimers = window.activeOverTimers.filter(a => a !== timeID)
    window.clearTimeout(timerID);
};

window.clearAllOverTimers = function() {
  var currentTimers = [...window.activeOverTimers]
  window.activeOverTimers = []
  for (let tID of currentTimers) {
    window.clearTimeout(tID);
  }
}
