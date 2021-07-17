"use strict";

var video_width = 320, video_height = 240;
var compass_video;
const compass_canvas;

var framecount = 0;
var streaming = false;
var compass_center_x = 20;
var compass_center_y = 100;
var compass_center_r = 20;
var compass_red = 255, compass_green = 0, compass_blue = 0, compass_alpha = 255, compass_text_show = true;

function successCallback() {    	    		
    compass_video.width = video_width; compass_video.height = video_height;//prevent Opencv.js error.        
    canvas.width = video_width; canvas.height = video_height;
    canvas.style.width  = video_width;
		canvas.style.height = video_height;
		
		compass_video.style.width  = video_width;
		compass_video.style.height = video_height;
		
		setCompassColor(255,0,0,0.8);
  	setCompassPos(1);
																						
		compass_video.play();                
    setupCV(compass_video);
    streaming = true;		
}

function errorCallback(error) {
    console.log(error);
}

function playCompassVideo(videofile) {
	var stream = URL.createObjectURL(videofile);  
  compass_video.src = stream;		  
	compass_video.onloadedmetadata = function(){
	    setTimeout(successCallback, 0);
	}
}

let frame, cap;
async function setupCV(video) {    		
    if (frame == undefined) {        		
        cap = await new cv.VideoCapture(video);
        frame = await new cv.Mat(video_height, video_width, cv.CV_8UC4);        
    }                        
    cap.read(frame);
    cv.imshow('output', frame);        
    streaming = true;
    setTimeout(process, 0);        
}

function setCompassText(how) {
	compass_text_show = how;
}

function setCompassColor(r, g, b, a) {
	red = r;
	green = g;
	blue = b;
	alpha = a * 255;
}

function setCompassPos(towhere) {    	
	if (towhere == 0) {
		compass_center_x = 25;
		compass_center_y = 25;
	}
	else if (towhere == 1) {
		compass_center_x = 25;
		compass_center_y = video_height - 35;
	}
	else if (towhere == 2) {
		compass_center_x = video_width - 25;
		compass_center_y = 25;
	}
	else if (towhere == 3) {
		compass_center_x = video_width - 25;
		compass_center_y = video_height - 35;
	}    	
}

function process() {
    if (streaming === true) {
        cap.read(frame);            
        cv.circle(frame, new cv.Point(compass_center_x, compass_center_y), compass_center_r, new cv.Scalar(red, green, blue, alpha), 2);
        
        if (compass_text_show == true) {
        	cv.putText(frame, "Text", {x: compass_center_x - (compass_center_r / 2) - 2, y: compass_center_y + compass_center_r + 10}, cv.FONT_HERSHEY_SIMPLEX, 0.3, [red, green, blue, 255]);
        }
        
        cv.imshow('output', frame);            
        framecount++;
        
        if (framecount >= 100) {
        	framecount = 0;
        	compass_video.pause(); compass_video.currentTime = 0;
        	compass_video.play();
        }
        
        setTimeout(process, 33);
    }
}