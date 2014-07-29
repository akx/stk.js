(function(Stk) {
	"use strict";
	var WhiteNoise = Stk.WhiteNoise = function () {
		// Nothing here.
	};

	WhiteNoise.prototype.tick = function (audioBuffer, channel) {
		var channelData = audioBuffer.getChannelData(channel), length = audioBuffer.length;
		for (var i = 0; i < length; i++) {
			channelData[i] = Math.random() * 2 - 1;
		}
	};

	// Variable Pink Noise implementation based on http://sampo.kapsi.fi/PinkNoise/PinkNoise.java
	// Alpha should be between (0..2).
	var VariablePinkNoise = Stk.VariablePinkNoise = function(alpha, poles) {
		this.alpha = alpha = (alpha === undefined ? 1 : alpha);
		this.poles = poles = (poles === undefined ? 5 : poles);

		this.multipliers = new Float32Array(poles);
        this.values = new Float32Array(poles);

        var a = 1, i;
        for (i = 0; i < poles; i++) {
            a = (i - alpha / 2) * a / (i + 1);
            this.multipliers[i] = a;
        }
	};

	VariablePinkNoise.prototype.tick = function (audioBuffer, channel) {
		var channelData = audioBuffer.getChannelData(channel), i = 0, p, x,
			length = audioBuffer.length;
		var M = this.multipliers, V = this.values, nP = this.poles;
		for (; i < length; i++) {
			x = Math.random() - 0.5;
	        for (p = 0; p < nP; p++) x -= M[p] * V[p];
			for (p = V.length - 1; p >= 1; p --) {
				V[p] = V[p - 1];
			}
			channelData[i] = V[0] = x;
		}
	};

	// KelletPinkNoise implementation based on http://noisehack.com/generate-noise-web-audio-api/

	var KelletPinkNoise = Stk.KelletPinkNoise = function () {
		this.b0 = 0;
		this.b1 = 0;
		this.b2 = 0;
		this.b3 = 0;
		this.b4 = 0;
		this.b5 = 0;
		this.b6 = 0;
	};

	KelletPinkNoise.prototype.tick = function (audioBuffer, channel) {
		var channelData = audioBuffer.getChannelData(channel), i=0, length = audioBuffer.length;
		for (; i < length; i++) {
            var white = Math.random() * 2 - 1;
            this.b0 = 0.99886 * this.b0 + white * 0.0555179;
            this.b1 = 0.99332 * this.b1 + white * 0.0750759;
            this.b2 = 0.96900 * this.b2 + white * 0.1538520;
            this.b3 = 0.86650 * this.b3 + white * 0.3104856;
            this.b4 = 0.55000 * this.b4 + white * 0.5329522;
            this.b5 = -0.7616 * this.b5 - white * 0.0168980;
            channelData[i] = 0.11 * (this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + white * 0.5362);
            this.b6 = white * 0.115926;
        }
	};

	// BrownNoise implementation also based on http://noisehack.com/generate-noise-web-audio-api/

	var BrownNoise = Stk.BrownNoise = function () {
		this.last = 0;
	};
	BrownNoise.prototype.tick = function (audioBuffer, channel) {
		var channelData = audioBuffer.getChannelData(channel), i=0, length = audioBuffer.length;
		for (; i < length; i++) {
            var white = Math.random() * 2 - 1;
            this.last = (this.last + (0.02 * white)) / 1.02;
            channelData[i] = this.last * 3.5;
        }
	};
}(Stk));
