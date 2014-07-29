(function() {
	var ac = new AudioContext();
	var scn = ac.createScriptProcessor(2048, 0, 1);
	var gain = ac.createGain();
	gain.gain.value = 0.5;
	scn.connect(gain);
	gain.connect(ac.destination);
	var canvas = document.createElement("canvas");
	canvas.style.border = "1px solid black";
	document.body.appendChild(canvas);
	canvas.width = canvas.height = 600;
	var ctx = canvas.getContext("2d");
	var ana = ac.createAnalyser();
	ana.fftSize = 1024;
	var anaBuf = new Float32Array(1024);
	scn.connect(ana);

	function updateCanvas() {
		ctx.fillStyle = "rgba(255,255,255,0.4)";
		var w = canvas.width;
		var h = canvas.height;
		ctx.fillRect(0, 0, w, h);
		var data = ctx.getImageData(0, 0, w, h);
		var DATA = data.data;
		ana.getFloatTimeDomainData(anaBuf);
		var yStride = w * 4;
		var x = 0, skip = true;
		for (var i = 0; i < anaBuf.length; i++) {
			if (skip) {
				if (anaBuf[i + 1] * anaBuf[i] < 0 && anaBuf[i + 1] > anaBuf[i]) skip = false;
				else continue;
			}
			if (x >= w) break;
			var y = anaBuf[i] * h * 0.5 + h * 0.5;
			//if(i == 33) console.log(y);
			var off = (0 | y) * yStride + (0 | x) * 4;

			DATA[off] = 0;
			DATA[off + 1] = 0;
			DATA[off + 2] = 0;
			x++;
		}
		ctx.putImageData(data, 0, 0);
	}

	setInterval(updateCanvas, 1000 / 30);

	window.audioContext = ac;
	window.scriptProcessorNode = scn;
}());
