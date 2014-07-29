(function(Stk) {
	var OnePole = Stk.OnePole = function (pole) {
		this.gain = 1.0;
		this.a1 = 0;
		this.b0 = 0;
		this.input0 = 0;
		this.input1 = 0;
		this.output1 = 0;
		this.setPole(pole);
	};

	OnePole.prototype.setPole = function(pole) {
		// Normalize coefficients for peak unity gain.
		if (pole > 0) this.b0 = 1 - pole;
		else this.b0 = 1 + pole;

		this.a1 = -pole;
	};

	OnePole.prototype.tick = function (audioBuffer, channel) {
		var channelData = audioBuffer.getChannelData(channel);
		for (var i = 0; i < audioBuffer.length; i++) {
			this.input0 = this.gain * channelData[i];
			channelData[i] = this.b0 * this.input0 - this.a1 * this.output1;
			this.output1 = channelData[i];
		}
	};

	var OneZero = Stk.OneZero = function (zero) {
		this.gain = 1.0;
		this.a1 = 0;
		this.b0 = 0;
		this.input0 = 0;
		this.input1 = 0;
		this.output1 = 0;
		this.setZero(zero);
	};

	OneZero.prototype.setZero = function(zero) {
		// Normalize coefficients for unity gain.
		if (zero > 0) this.b0 = 1 / (1 + zero);
		else this.b0 = 1 / (1 - zero);
		this.b1 = -zero * this.b0;
	};

	OneZero.prototype.tick = function (audioBuffer, channel) {
		var channelData = audioBuffer.getChannelData(channel);
		for (var i = 0; i < audioBuffer.length; i++) {
			this.input0 = this.gain * channelData[i];
			channelData[i] = this.b1 * this.input1 - this.b0 * this.input0;
			this.input1 = this.input0;
		}
	};
}(Stk));
