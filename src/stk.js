var Stk = (function() {
	var sampleRateAlertReceivers = [];

	function setSampleRate(newRate) {
		var oldRate = Stk.sampleRate;
		newRate = 0 | newRate;
		if(newRate <= 0 || newRate >= 192000) throw new Error("Invalid sample rate.");
		Stk.sampleRate = newRate;
		sampleRateAlertReceivers.forEach(function(receiver) {
			if(receiver && receiver.sampleRateChanged) {
				receiver.sampleRateChanged(newRate, oldRate);
			}
		});
	}

	function addSampleRateAlert(receiver) {
		sampleRateAlertReceivers.push(receiver);
	}

	function removeSampleRateAlert(receiver) {
		sampleRateAlertReceivers = sampleRateAlertReceivers.filter(function(o) {
			return o !== receiver;
		});
	}

	return {
		setSampleRate: setSampleRate,
		sampleRate: 44100,
		addSampleRateAlert: addSampleRateAlert,
		removeSampleRateAlert: removeSampleRateAlert
	}
}());
