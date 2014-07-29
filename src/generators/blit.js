(function(Stk) {

	var PI = Math.PI;
	var TWOPI = Math.PI * 2;
	var CLOSE_TO_TWOPI = TWOPI - 0.1;

	var Blit = function (frequency, nHarmonics, mode) {
		this.phase_ = 0;
		this.rate_ = 0;
		this.p_ = 0;
		this.m_ = 0;
		this.a_ = 0;
		this.C2_ = 0;
		this.state_ = 0;
		this.lastBlitOutput_ = 0;
		this.lastFrame_ = 0;
		this.nHarmonics_ = nHarmonics || 0;
		this.mode_ = (mode || Blit.SINE);
		this.setFrequency(frequency || 1000);
	};

	Blit.SINE = 0;
	Blit.SQUARE = 1;
	Blit.SAW = 2;

	Blit.prototype.setFrequency = function (frequency) {
		switch(this.mode_) {
			case Blit.SQUARE:
				this.p_ = 0.5 * Stk.sampleRate / frequency;
				this.rate_ = PI / this.p_;
				this.state_ = 0; // DC blocker state
				break;
			case Blit.SAW:
				this.p_ = Stk.sampleRate / frequency;
				this.C2_ = 1 / this.p_;
				this.rate_ = PI * this.C2_;
				this.state_ = -0.5 * this.a_;
				break;
			default: // Blit.SINE really
				this.p_ = Stk.sampleRate / frequency;
				this.rate_ = PI / this.p_;
				break;
		}
		this.updateHarmonics();
	};

	Blit.prototype.setHarmonics = function (nHarmonics) {
		this.nHarmonics_ = 0 | nHarmonics;
		this.updateHarmonics();
	};

	Blit.prototype.updateHarmonics = function() {
		if (this.nHarmonics_ <= 0) {
			var maxHarmonics = Math.floor(0.5 * this.p_);
			this.m_ = 2 * maxHarmonics + 1;
		} else {
			this.m_ = 2 * this.nHarmonics_ + 1;
		}
		if(this.mode_ == Blit.SQUARE) {
			// Make sure we end up with an even value of the parameter M here.
			this.m_ += this.m_ % 2;
		}
		this.a_ = this.m_ / this.p_;
	};

	Blit.prototype.setRate = function (newRate) {
		this.rate_ = newRate;
	};

	function _runSine(channelData) {
		var denominator, tmp, length = channelData.length;
		for (var i = 0; i < length; i++) {
			denominator = Math.sin(this.phase_);
			if (denominator <= 0.0001) {
				tmp = 1.0;
			}
			else {
				tmp = Math.sin(this.m_ * this.phase_);
				tmp /= this.m_ * denominator;
			}
			this.phase_ += this.rate_;
			if (this.phase_ >= PI) this.phase_ -= PI;
			channelData[i] = tmp;
		}
	}

	function _runSaw(channelData) {
		var denominator, tmp, length = channelData.length;
		for (var i = 0; i < length; i++) {
			denominator = Math.sin(this.phase_);
			if (Math.abs(denominator) <= 0.0001) {
				tmp = this.a_;
			}
			else {
				tmp = Math.sin(this.m_ * this.phase_);
				tmp /= this.p_ * denominator;
			}
			tmp += this.state_ - this.C2_;
			this.state_ = tmp * 0.995;
			this.phase_ += this.rate_;
			if (this.phase_ >= PI) this.phase_ -= PI;
			channelData[i] = tmp;
		}
	}

	function _runSquare(channelData) {
		var denominator, temp, length = channelData.length;
		for (var i = 0; i < length; i++) {
			temp = this.lastBlitOutput_;
			denominator = Math.sin(this.phase_);
			if (Math.abs(denominator) <= 0.0001) {
				if(this.phase_ < 0.1 || this.phase_ > CLOSE_TO_TWOPI) {
					this.lastBlitOutput_ = this.a_;
				} else {
					this.lastBlitOutput_ = -this.a_;
				}
			}
			else {
				this.lastBlitOutput_ = Math.sin(this.m_ * this.phase_);
				this.lastBlitOutput_ /= this.p_ * denominator;
			}
			this.lastBlitOutput_ += temp;
			this.lastFrame_ = this.lastBlitOutput_ - this.state_ + 0.999 * this.lastFrame_;
			this.state_ = this.lastBlitOutput_;

			this.phase_ += this.rate_;
			if (this.phase_ >= TWOPI) this.phase_ -= TWOPI;
			channelData[i] = this.lastFrame_;
		}
	}

	Blit.prototype.tick = function (audioBuffer, channel) {
		var channelData = audioBuffer.getChannelData(channel);
		switch(this.mode_) {
			case Blit.SAW:
				_runSaw.call(this, channelData);
				break;
			case Blit.SQUARE:
				_runSquare.call(this, channelData);
				break;
			default:
				_runSine.call(this, channelData);
				break;
		}
	};
	Stk.Blit = Blit;
}(Stk));
