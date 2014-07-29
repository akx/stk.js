(function(Stk) {
	var SineWave = function (frequency) {
		this.time_ = 0;
		this.rate_ = 0;
		if (!SineWave.table) {
			SineWave.table = table = new Float32Array(SineWave.TABLE_SIZE + 1);
			var temp = 1.0 / SineWave.TABLE_SIZE;
			for (var i = 0; i <= SineWave.TABLE_SIZE; i++) {
				table[i] = Math.sin(Math.PI * 2 * i * temp);
			}
		}
		Stk.addSampleRateAlert(this);
		this.setFrequency(frequency || 1000);
	};

	SineWave.TABLE_SIZE = 2048;

	SineWave.prototype.reset = function() {
		this.time_ = 0;
	};

	SineWave.prototype.sampleRateChanged = function (newRate, oldRate) {
		if (!this.ignoreSampleRateChange) {
			this.setRate(oldRate * this.rate_ / newRate);
		}
	};

	SineWave.prototype.setFrequency = function (frequency) {
		this.setRate(SineWave.TABLE_SIZE * frequency / Stk.sampleRate);
	};

	SineWave.prototype.setRate = function (newRate) {
		this.rate_ = newRate;
	};

	SineWave.prototype.tick = function (audioBuffer, channel) {
		var channelData = audioBuffer.getChannelData(channel);
		for (var i = 0; i < audioBuffer.length; i++) {
			while (this.time_ < 0.0) this.time_ += SineWave.TABLE_SIZE;
			while (this.time_ >= SineWave.TABLE_SIZE) this.time_ -= SineWave.TABLE_SIZE;
			var index = 0 | this.time_;
			var alpha = this.time_ - index;
			var tmp = SineWave.table[index];
			tmp += (alpha * ( SineWave.table[index + 1 ] - tmp));
			this.time_ += this.rate_;
			channelData[i] = tmp;
		}
	};
	Stk.SineWave = SineWave;
}(Stk));
