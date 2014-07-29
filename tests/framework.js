(function() {
	var analyzerBufSize = 1024;
	var scriptBufSize = 2048;
	var ac = new AudioContext();
	var scn = ac.createScriptProcessor(scriptBufSize, 0, 1);
	var gain = ac.createGain();
	gain.gain.value = 0.5;
	scn.connect(gain);
	gain.connect(ac.destination);
	var canvas = document.createElement("canvas");
	canvas.style.border = "1px solid black";
	document.body.appendChild(canvas);
	canvas.width = analyzerBufSize + analyzerBufSize / 2;
	canvas.height = 600;
	var ctx = canvas.getContext("2d");
	var ana = ac.createAnalyser();
	ana.fftSize = analyzerBufSize;
	ana.maxDecibels = 0;
	var waveformBuf = new Float32Array(analyzerBufSize);
	var fftBuf = new Uint8Array(analyzerBufSize);
	scn.connect(ana);

	function updateCanvas() {
		var w = canvas.width;
		var h = canvas.height;
		var x=0, y, i, skip=true, off;
		ctx.fillStyle = "rgba(255,255,255,0.4)";
		ctx.fillRect(0, 0, w, h);
		var data = ctx.getImageData(0, 0, w, h);
		var DATA = data.data;
		ana.getFloatTimeDomainData(waveformBuf);
		var yStride = w * 4;
		for (i = 0; i < waveformBuf.length; i++) {
			if (skip) {
				if (waveformBuf[i + 1] * waveformBuf[i] < 0 && waveformBuf[i + 1] > waveformBuf[i]) skip = false;
				else continue;
			}
			if (x >= w) break;
			y = waveformBuf[i] * h * 0.5 + h * 0.5;
			//if(i == 33) console.log(y);
			off = (0 | y) * yStride + (0 | x) * 4;

			DATA[off] = 0;
			DATA[off + 1] = 0;
			DATA[off + 2] = 0;
			x++;
		}

		ana.getByteFrequencyData(fftBuf);
		for(x = 0; x < fftBuf.length; x++) {
			if(x >= w) break;
			y = h - (fftBuf[x] / 255) * h;
			off = (0 | y) * yStride + (0 | (analyzerBufSize + x)) * 4;

			DATA[off] = 255;
			DATA[off + 1] = 0;
			DATA[off + 2] = 0;
		}
		ctx.putImageData(data, 0, 0);
	}

	setInterval(updateCanvas, 1000 / 30);

	window.audioContext = ac;
	window.scriptProcessorNode = scn;
}());
