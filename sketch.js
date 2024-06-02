// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet using p5.js
=== */
/* eslint-disable */

// Grab elements, create settings, etc.
var video = document.getElementById("video");

var canvasBrut = document.getElementById("canvas-brut");
var ctxBrut = canvasBrut.getContext("2d");

var imgServer = document.getElementById("img-clown");

const socket = new WebSocket("ws://localhost:3000");
var canvasProcessing = document.createElement("canvas");
canvasProcessing.width = 640;
canvasProcessing.height = 480;
var ctxProcessing = canvasProcessing.getContext("2d");

// The detected positions will be inside an array
let poses = [];

// Create a webcam capture
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
	navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
		video.srcObject = stream;
		video.play();
	});
}

// A function to draw the video and poses into the canvas.
// This function is independent of the result of posenet
// This way the video will not seem slow if poseNet
// is not detecting a position
function drawCameraIntoCanvas() {
	// Draw the video element into the canvasServer
	drawKeypoints();
}

function drawCameraBrut() {
	ctxBrut.drawImage(video, 0, 0, 640, 480);
	window.requestAnimationFrame(drawCameraBrut);
}

drawCameraBrut();
setInterval(() => {
	drawCameraIntoCanvas();
}, 200);

// Create a new poseNet method with a single detection
const poseNet = ml5.poseNet(video, modelReady);
poseNet.on("pose", gotPoses);

// A function that gets called every time there's an update from the model
function gotPoses(results) {
	poses = results;
}

function modelReady() {
	console.log("model ready");
	poseNet.multiPose(video);
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
	// Loop through all the poses detected
	ctxProcessing.clearRect(0, 0, canvasProcessing.width, canvasProcessing.height);
	ctxProcessing.drawImage(canvasBrut, 0, 0, 640, 480);
	for (let i = 0; i < poses.length; i += 1) {
		// For each pose detected, loop through all the keypoints
		for (let j = 0; j < poses[i].pose.keypoints.length; j += 1) {
			let keypoint = poses[i].pose.keypoints[j];

			if (keypoint.part === 'nose' && keypoint.score > 0.5) {
				ctxProcessing.beginPath();
				ctxProcessing.arc(keypoint.position.x, keypoint.position.y, 20, 0, 2 * Math.PI);
				ctxProcessing.fillStyle = 'red';
				ctxProcessing.fill();
				ctxProcessing.stroke();
			}
		}
	}
	if (socket.readyState === WebSocket.OPEN) {
		const imageDataURL = canvasProcessing.toDataURL();
		socket.send(imageDataURL);
	}
}

socket.addEventListener('message', function (event) {
	reader = new FileReader();
	reader.onload = () => {
		imgServer.src = reader.result;
	};
	reader.readAsText(event.data);
});