var uploadFilesForCompass = [];
var $drop = $("#drop");
var hasMovieFileInFile = false;
var hasRecordFileInFile = false;

$drop.on("dragenter", function(e) { //드래그 요소가 들어왔을떄
	$(this).addClass('drag-over');
}).on("dragleave", function(e) { //드래그 요소가 나갔을때
	$(this).removeClass('drag-over');
}).on("dragover", function(e) {
	e.stopPropagation();
	e.preventDefault();
}).on('drop', function(e) {
	e.preventDefault();
	$(this).removeClass('drag-over');	
	fileDropCheck(e.originalEvent.dataTransfer.files);
});


function isMovieFile(filename) {
	let ext = getFileExtension(filename);
	return compareIgnoreCase(ext, "txt");
}

function isRecordFile(filename) {
	let ext = getFileExtension(filename);
	if (compareIgnoreCase(ext, "mp4")
	 			|| compareIgnoreCase(ext, "mov")
	 			|| compareIgnoreCase(ext, "mpg")
	 			|| compareIgnoreCase(ext, "avi")
	 			|| compareIgnoreCase(ext, "mpeg")
	 			|| compareIgnoreCase(ext, "wmv")
	 			|| compareIgnoreCase(ext, "flv")
	 			|| compareIgnoreCase(ext, "3gpp")
	 			|| compareIgnoreCase(ext, "hevc")) {
	 				return true;
	}
	
	return false; 			
}

function fileDropCheck(files) {
	if (files.length > 2) {
		alert("드론영상 1개와 비행기록파일 1개만 선택해 주세요.");
		return;	
	}
	
	if (files.length == 2 && uploadFilesForCompass.length > 0) {
		alert("드론영상 1개와 비행기록파일 1개만 선택이 가능합니다.");
		return;	
	}
		
	var beforeSize = uploadFilesForCompass.length;
	for(var i = 0; i < files.length; i++) {
		var file = files[i];
												
		if (isRecordFile(file.name)) {
			if (hasRecordFileInFile == true) {
				alert("비행기록파일은 1개만 선택해 주세요.");
				return;
			}
			else {
				hasRecordFileInFile = true;
				console.log(file);
				uploadFilesForCompass.push(file);		
				let idx = uploadFilesForCompass.length - 1;
				preview(files[0], idx);				
			}
		}
		
		if (isMovieFile(file.name)) {
			if (hasMovieFileInFile == true) {
				alert("드론영상은 1개만 선택해 주세요.");
				return;
			}
			else {
				hasMovieFileInFile = true;
				console.log(file);
				uploadFilesForCompass.push(file);		
				let idx = uploadFilesForCompass.length - 1;
				preview(files[0], idx);
			}
		}				
	}
	
	if (beforeSize == uploadFilesForCompass.length) {
		alert("영상 파일 또는 DJI 비행기록 파일만 선택 가능합니다");		
	}
}



var uploadStatus = {
	total : 0,
	count : 0
};

$("#btnForUploadFlightList").on("click", function(e) {		
		uploadCheckBeforeCompassEmbed();	
});

function getFileExtension(filename) {	
	return filename.split('.').pop();
}

function compareIgnoreCase(str1, str2) {
	return str1.toUpperCase() === str2.toUpperCase();	
}


var recordFile;
var videoFile;
	
function uploadCheckBeforeCompassEmbed() {	
	uploadStatus.total = uploadFilesForCompass.length;
			
	for(var i=0;i < uploadFilesForCompass.length; i++) {		
		if (isRecordFile(uploadFilesForCompass.name)) {
			recordFile = uploadFilesForCompass[i];
		}
		else {		
			videoFile = uploadFilesForCompass[i];
		}
	}
	
	var params = {file : recordFile};
	getBase64(params, function(ret) {
		requestUploadForCompass(ret.base64file, getFileExtension(videoFile.name));	
	});		
}

function requestUploadForCompass(base64Recordfile, tempExt) {
		var userid = getCookie("dev_user_id");
    var jdata = {
    	"action": "position",
    	"daction": "req_upload",
    	"clientid": userid,
    	"extension" : tempExt,
    	"recordfile" : base64Recordfile    	
    };

    ajaxRequest(jdata, function (r) {
    	if(r.result != "success") {
    		alert("error! : " + r.reason);
    		return;
    	}
    	
    	runNextSequence( function () {
					videoFileUpload(videoFile, r.filename, r.extension, r.signedurl);
			} );    	    		    		    	        
    }, function (request, status, error) {
        
    });
}

function embedRequest(filename, tempExt) {
		var userid = getCookie("dev_user_id");
    var jdata = {
    	"action": "position",
    	"daction": "compass_embed",
    	"clientid": userid,
    	"extension" : tempExt,    	
    	"filename" : filename
    };

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") alert("success !!");
        else alert("failed - " + r.reason);
    }, function (request, status, error) {
        
    });
}


function videoFileUpload(videoFile, tempName, tempExt, tempUrl) {						
	$.ajax({
		url: tempUrl,
		data : videoFile,
		type : 'PUT',
		contentType : false,
		processData: false,
		cache: false,
		xhr: function() { //XMLHttpRequest 재정의 가능
			var xhr = $.ajaxSettings.xhr();
			xhr.upload.onprogress = function(e) { //progress 이벤트 리스너 추가
				var percent = e.loaded * 100 / e.total;
				$selfProgress.val(percent); //개별 파일의 프로그레스바 진행
			};
	
			return xhr;
		},
		success : function(ret) {
			uploadStatus.count++;
			setProgress(uploadStatus.count / uploadStatus.total * 100); //전체 프로그레스바 진행
										
			runNextSequence( function () {
					embedRequest(tempName, tempExt);
				} );
		}
	});
}


function runNextSequence(nextfunc) {
	setTimeout(nextfunc, 500);
}


function preview(file, idx) {
	var reader = new FileReader();
	reader.onload = (function(f, idx) {
		return function(e) {
			var $div = $('<div class="thumb"> \
				<progress value="0" max="100" ></progress> \
				<div class="close" data-idx="' + idx + '">X</div> \
				<img src="' + e.target.result + '" title="' + escape(f.name) + '"/> \
				</div>');
			$("#thumbnails").append($div);
			f.target = $div;
		};
	})(file, idx);
	
	reader.readAsDataURL(file);
}

var $progressBar = $("#progressBar");
	
function setProgress(per) {
		$progressBar.val(per);
}

$("#thumbnails").on("click", ".close", function(e) {
	var $target = $(e.target);
	var idx = $target.attr('data-idx');	
	$target.parent().remove();
	let fileInfo = uploadFilesForCompass[idx];
	
	if (isRecordFile(fileInfo.name)) {
		hasRecordFileInFile = false;
	}
	else {
		hasMovieFileInFile = false;
	}
	
	uploadFilesForCompass = uploadFilesForCompass.splice(idx, 1);
});