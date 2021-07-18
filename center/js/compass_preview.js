"use strict";

var video_width = 320, video_height = 150;
var compass_video;
var compass_canvas;

var framecount = 0;
var streaming = false;
var compass_r_left;
var compass_r_right;
var compass_r_top;
var compass_r_bottom;
var compass_red = 255, compass_green = 0, compass_blue = 0, compass_alpha = 1, compass_text_show = true;

function successCallback() {    	    		
    compass_video.width = video_width; compass_video.height = video_height;//prevent Opencv.js error.        
    compass_canvas.width = video_width; compass_canvas.height = video_height;
    compass_canvas.style.width  = video_width;
		compass_canvas.style.height = video_height;
		
		compass_video.style.width  = video_width;
		compass_video.style.height = video_height;		
																						
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
    streaming = true;
    setTimeout(process, 0);        
}

function setCompassText(how) {
	compass_text_show = how;
}

function setCompassColor(r, g, b, a) {
	compass_red = r;
	compass_green = g;
	compass_blue = b;
	compass_alpha = a;
}

function setCompassPos(pos) {    	
	compass_r_right = video_width - 5;
  compass_r_left = compass_r_right - 40;
  compass_r_top = 5;
  compass_r_bottom = compass_r_top + 60;
    
  if (pos == 0) {
      compass_r_left = 5;
      compass_r_right = compass_r_left + 40;
      compass_r_top = 5;
      compass_r_bottom = compass_r_top + 60;
  }
  else if(pos == 1) {
      compass_r_left = 5;
      compass_r_right = compass_r_left + 40;	
      compass_r_bottom = video_height - 5;
      compass_r_top = compass_r_bottom - 60;
  }
  else if(pos == 3) {
      compass_r_right = video_width - 5;
      compass_r_left = compass_r_right - 40;
      compass_r_bottom = video_height - 5;
      compass_r_top = compass_r_bottom - 60;	        
  }    	
}

function stopCompassVideo() {
		if (streaming === true) {
			streaming = false;
			compass_video.pause(); compass_video.currentTime = 0;			
		}
}

function drawCompass(frame) {
		let output = new cv.Mat();
		frame.copyTo(output);    				
		cv.circle(output, new cv.Point(20, 20), 20, new cv.Scalar(compass_red, compass_green, compass_blue, 255), 2);
		
		if (compass_text_show == true)
	  	cv.putText(output, "Text", {x: 8, y: 50}, cv.FONT_HERSHEY_SIMPLEX, 0.3, [compass_red, compass_green, compass_blue, 255]);
	  		  
	  return output;
}

function process() {
    if (streaming === true) {
        cap.read(frame);         
        
        let rect = new cv.Rect(compass_r_left, compass_r_top, 40, 60);
				dst = frame.roi(rect);
	      output = drawCompass(dst);
	      
	      let overlay = new cv.Mat();			      
	      cv.addWeighted( dst, 1-compass_alpha, output, compass_alpha, 0.0, overlay, -1);
	      			      
				for (let i = 0; i < overlay.rows; i++) {
				    for (let j = 0; j < overlay.cols; j++) {
				        frame.ucharPtr(compass_r_top + i, compass_r_left + j)[0] = overlay.ucharPtr(i, j)[0];
				    }
				}	                                         
        
        overlay.delete();output.delete();                
        cv.imshow('compass_output', frame);            
        framecount++;
        
        if (framecount >= 200) {
        	framecount = 0;
        	compass_video.pause(); compass_video.currentTime = 0;
        	compass_video.play();
        }
        
        setTimeout(process, 33);
    }
}