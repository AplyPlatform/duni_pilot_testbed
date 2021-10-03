"use strict";

let g_f_recordFileForUploadFile = null;
let g_f_videoFileForUploadFile = null;

let video_width = 640, video_height = 300;
let compass_video;
let compass_canvas;

let framecount = 0;
let streaming = false;
let compass_r_left;
let compass_r_right;
let compass_r_top;
let compass_r_bottom;
let compass_red = 255, compass_green = 0, compass_blue = 0, compass_alpha = 1, compass_text_show = true;
let frame, cap;

function onOpenCvReady() {
	hideLoader();
}

$(function () {
	embedCompassInit();
});

function embedCompassInit() {
	document.title = GET_STRING_CONTENT('side_menu_flight_record_embed_compass');
	$("#head_title").text(document.title);

	$('#page_about_title').text(GET_STRING_CONTENT('req_compass_embed_lable'));
	$('#page_about_content').text(GET_STRING_CONTENT('req_compass_embed_content'));

	$('#btnForUploadFlightList').text(GET_STRING_CONTENT('req_compass_embed_lable'));

	$('#label_compass_file_drop_area').text(GET_STRING_CONTENT('label_compass_file_drop_area'));

	$('#btnSelectFiles').text(GET_STRING_CONTENT('label_select_files'));

	$('#label_explain_drag').text(GET_STRING_CONTENT('label_explain_drag'));
	$('#label_or_directly').text(GET_STRING_CONTENT('label_or_directly'));

	$('#label_for_colorpicker').text(GET_STRING_CONTENT('label_for_colorpicker'));

	$("#dji_radio_label").text(GET_STRING_CONTENT('msg_dji_file_upload'));
	$('#dji_flight_record_get_label').text(GET_STRING_CONTENT('dji_flight_record_get_label'));
	$('#collapseRecordFileParams').html(GET_STRING_CONTENT('collapseRecordFileParams'));

	$('#Aerial_label').text(GET_STRING_CONTENT('Aerial_label'));
	$('#Aerial_label_label').text(GET_STRING_CONTENT('Aerial_label_label'));
	$('#Road_label').text(GET_STRING_CONTENT('Road_label'));
	$('#Road_detail').text(GET_STRING_CONTENT('Road_detail_label'));
	$('#map_kind_label').text(GET_STRING_CONTENT('map_kind_label'));

	$('#roll_label').text(GET_STRING_CONTENT('roll_label'));
	$('#pitch_label').text(GET_STRING_CONTENT('pitch_label'));
	$('#yaw_label').text(GET_STRING_CONTENT('yaw_label'));

	$("#altitude_label_top").text(GET_STRING_CONTENT('altitude_label'));

	$('#compass_pos_sel_label').text(GET_STRING_CONTENT('compass_pos_sel_label'));
	$('#compass_pos_sel_option_0').text(GET_STRING_CONTENT('compass_pos_sel_option_0_label'));
	$('#compass_pos_sel_option_1').text(GET_STRING_CONTENT('compass_pos_sel_option_1_label'));
	$('#compass_pos_sel_option_2').text(GET_STRING_CONTENT('compass_pos_sel_option_2_label'));
	$('#compass_pos_sel_option_3').text(GET_STRING_CONTENT('compass_pos_sel_option_3_label'));


	$('#compass_embed_text_sel_label').text(GET_STRING_CONTENT('compass_embed_text_sel_label'));
	$('#embed_text_sel_show').text(GET_STRING_CONTENT('embed_text_sel_show_label'));
	$('#embed_text_sel_hide').text(GET_STRING_CONTENT('embed_text_sel_hide_label'));

	map2DInit();
	map3DInit();
	selectMonitorIndex("private", 0);
	addObjectTo2DMap(0, "private", "drone");
	addObjectTo3DMap(0, "private", "drone");

	let dropArea = $("#dropArea");
	dropArea.on("drag dragstart dragend dragover dragenter dragleave drop", function (e) {
		e.stopPropagation();
		e.preventDefault();
	})
		.on("dragover dragenter", function () {
			dropArea.css('background-color', '#E3F2FC');
			$("#file_upload_img").show();
			$("#file_drop_img").hide();
			$("#selectFileArea").hide();
			$("#label_or_directly").hide();
		})
		.on('dragleave dragend drop', function () {
			dropArea.css('background-color', '#FFFFFF');
			$("#file_upload_img").hide();
			$("#file_drop_img").show();
			$("#selectFileArea").show();
			$("#label_or_directly").show();
		})
		.on('drop', function (e) {
			GATAGM('compass_file_drop', 'CONTENT');
			let retSelected = fileDropCheckForCompass(e.originalEvent.dataTransfer.files);
			if (retSelected == true && (isSet(g_f_videoFileForUploadFile) && isSet(g_f_recordFileForUploadFile))) {
				$("#selectFileArea").hide();
				$("#label_or_directly").hide();
				$('#file_drop_img').hide();
				$('#label_explain_drag').hide();
				$('#btnForUploadFlightList').show();
			}
		});

	$("#btnForUploadFlightList").on("click", function (e) {
		GATAGM('compass_record_upload_btn_click', 'CONTENT');
		uploadCheckBeforeCompassEmbed();
	});

	$("#input_direct_file").bind('change', function () {
		GATAGM('compass_direct_file_select_btn_click', 'CONTENT');
		let retSelected = fileDropCheckForCompass(this.files);
		if (retSelected == true && (isSet(g_f_videoFileForUploadFile) && isSet(g_f_recordFileForUploadFile))) {
			$('#selectFileArea').hide();
			$("#label_or_directly").hide();
			$('#btnForUploadFlightList').show();
			$('#file_drop_img').hide();
			$('#label_explain_drag').hide();
		}
	});

	$("#input_direct_file").click(function () {
		$(this).attr("value", "");
		$("#input_direct_file").val("");
	});

	$("#colorPicker").spectrum({
		type: "color",
		showInput: true,
		showInitial: true,
		change: function (color) {
			let rgb = color.toRgb();
			setCompassColor(rgb.r, rgb.g, rgb.b, rgb.a);
		}
	});

	$("#compass_pos_sel").change(function () {
		$("#compass_pos_sel option:selected").each(function () {
			GATAGM('compass_position_select_click', 'CONTENT');
			setCompassPos($(this).val() * 1);
		});
	});

	$("#embed_text_sel").change(function () {
		$("#embed_text_sel option:selected").each(function () {
			GATAGM('compass_text_select_click', 'CONTENT');
			setCompassText(($(this).val() * 1) == 1 ? true : false);
		});
	});


	$("#file_upload_img").hide();
	$('#btnForUploadFlightList').hide();
	$('#selectFileArea').show();
	$("#label_or_directly").show();
	$("#mapArea").hide();
	$("#youtube_example_area").show();
	$("#video_example_area").hide();

	if (g_str_cur_lang != "KR") {
		$("#ad_for_pilot").hide(); //드론 영상으로 수익 창출 광고 감추기 (국내만 대상으로 하기)
	}

	compass_video = document.getElementById("compass_video");
	compass_canvas = document.getElementById('compass_output');

	hideLoader();
}

function fileDropCheckForCompass(files) {
	if (files.length > 2) {
		showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
		return false;
	}

	if (files.length == 2) {
		if (isSet(g_f_recordFileForUploadFile) || isSet(g_f_videoFileForUploadFile)) {
			showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
			return false;
		}
	}

	let isAdded = false;
	for (let i = 0; i < files.length; i++) {
		let file = files[i];

		if (isRecordFile(file.name)) {
			if (isSet(g_f_recordFileForUploadFile)) {
				showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
				return false;
			}
			else {
				g_f_recordFileForUploadFile = file;
				previewForCompassFile(file, "record");
				isAdded = true;
			}
		}

		if (isMovieFile(file.name)) {
			if (isSet(g_f_videoFileForUploadFile)) {
				showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
				return false;
			}
			else {
				g_f_videoFileForUploadFile = file;
				playCompassVideo(file);

				$("#video_example_area").show();
				$("#youtube_example_area").hide();

				previewForCompassFile(file, "video");
				isAdded = true;
			}
		}
	}

	if (isAdded == false) {
		showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
		return false;
	}

	return true;
}

function previewForCompassFile(file, idx) {
	let iconArea = '<i class="fas fa-map-marker-alt"></i>';
	if (isMovieFile(file.name)) {
		iconArea = '<i class="fas fa-video"></i>';
	}

	let $div = $('<div id="file_thumb_' + idx + '" class="text-left">'
		+ '<span style="cursor:pointer" id="file_data_remover_' + idx + '"><b>X</b></span> '
		+ iconArea + ' ' + file.name + '<br><progress value="0" max="100" style="height:5px;"></progress></div>');
	$("#thumbnails").append($div);
	file.target = $div;

	$("#file_data_remover_" + idx).on("click", function (e) {
		$("#file_thumb_" + idx).remove();
		if (isRecordFile(file.name)) {
			g_f_recordFileForUploadFile = null;
		}
		else {
			g_f_videoFileForUploadFile = null;

			stopCompassVideo();

			$("#video_example_area").hide();
			$("#youtube_example_area").show();
		}

		$('#selectFileArea').show();
		$("#label_or_directly").show();
		$('#btnForUploadFlightList').hide();
		$('#file_drop_img').show();
		$('#label_explain_drag').show();
	});
}


function uploadCheckBeforeCompassEmbed() {
	if (!isSet(g_f_recordFileForUploadFile) || !isSet(g_f_videoFileForUploadFile)) {
		showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
		return;
	}

	showLoader();
	$('#btnForUploadFlightList').prop('disabled', true);

	let record_kind = "dji";
	if (getFileExtension(g_f_recordFileForUploadFile.name).toUpperCase() == "CSV") {
		record_kind = "litchi";
	}

	let params = { file: g_f_recordFileForUploadFile };
	getBase64(params, function (ret) {
		requestUploadForCompass(ret.base64file, record_kind, getFileExtension(g_f_videoFileForUploadFile.name), g_f_recordFileForUploadFile.target.find("progress"));
	});
}

function requestUploadForCompass(base64Recordfile, record_kind, tempExt, progressBar) {
	let userid = getCookie("dev_user_id");
	let jdata = {
		"action": "position",
		"daction": "req_upload",
		"record_kind": record_kind,
		"clientid": userid,
		"extension": tempExt,
		"recordfile": base64Recordfile
	};

	ajaxRequest(jdata, function (r) {
		if (r.result != "success") {
			$('#btnForUploadFlightList').prop('disabled', false);
			hideLoader();

			if (r.result_code == -1 && r.reason.indexOf("failed to decode") >= 0) {
				GATAGM('compass_dji_file_upload_analyze_compass_failed', 'CONTENT');
				showAlert(GET_STRING_CONTENT('msg_select_another_file'));
			}
			else showAlert(GET_STRING_CONTENT("msg_error_sorry") + " : " + r.reason);

			return;
		}

		progressBar.val(100);

		if (isSet(r.data)) {
			$("#mapArea").show();
			addFlightRecordDataToView(r.data, false);
			moveToPositionOnMap("private", 0, r.data[0].lat * 1, r.data[0].lng * 1, 1500, 0, 0, 0);
		}

		runNextSequence(function () {
			videoFileUpload(g_f_videoFileForUploadFile, r.filename, r.extension, r.signedurl);
		});
	}, function (request, status, error) {
		$('#btnForUploadFlightList').prop('disabled', false);
		hideLoader();
		showAlert(GET_STRING_CONTENT("msg_error_sorry") + " : " + error);
	});
}

function videoFileUpload(videoFile, tempName, tempExt, tempUrl) {
	let $selfProgress = videoFile.target.find("progress");

	$.ajax({
		url: tempUrl,
		data: videoFile,
		type: 'PUT',
		contentType: false,
		processData: false,
		cache: false,
		xhr: function () { //XMLHttpRequest 재정의 가능
			let xhr = $.ajaxSettings.xhr();
			xhr.upload.onprogress = function (e) { //progress 이벤트 리스너 추가
				let percent = e.loaded * 100 / e.total;
				$selfProgress.val(percent); //개별 파일의 프로그레스바 진행
			};

			return xhr;
		},
		success: function (ret) {
			setProgress(50); //전체 프로그레스바 진행

			runNextSequence(function () {
				embedRequest(tempName, tempExt);
			});
		}
	});
}

function setProgress(per) {
	let $progressBar = $("#progressBarForUpload");
	$progressBar.val(per);
}

function embedRequest(filename, tempExt) {

	let color = $("#colorPicker").spectrum("get");
	let compass_position = $("#compass_pos_sel").children("option:selected").val();
	let embedText = $("#embed_text_sel").children("option:selected").val();

	let userid = getCookie("dev_user_id");
	let jdata = {
		"action": "position",
		"daction": "compass_embed",
		"clientid": userid,
		"extension": tempExt,
		"filename": filename,
		"color": color.toRgb(),
		"show_text": embedText,
		"pos": compass_position
	};

	ajaxRequest(jdata, function (r) {
		hideLoader();
		if (r.result == "success") {
			setProgress(100); //전체 프로그레스바 진행
			showAlert(GET_STRING_CONTENT("msg_pre_embed_compass_request_received") + getCookie("user_email") + GET_STRING_CONTENT("msg_post_embed_compass_request_received"));
			$('#btnForUploadFlightList').prop('disabled', false);

			$("#file_thumb_video").remove();
			$("#file_thumb_record").remove();
			g_f_recordFileForUploadFile = null;
			g_f_videoFileForUploadFile = null;

			$('#selectFileArea').show();
			$("#label_or_directly").show();
			$('#btnForUploadFlightList').hide();
		}
		else {
			$('#btnForUploadFlightList').prop('disabled', false);
			showAlert(GET_STRING_CONTENT("msg_error_sorry") + " : " + r.reason);
		}
	}, function (request, status, error) {
		hideLoader();
		$('#btnForUploadFlightList').prop('disabled', false);
		showAlert(GET_STRING_CONTENT("msg_error_sorry") + " : " + error);
	});
}


function successCallback() {
	compass_video.width = video_width; compass_video.height = video_height;//prevent Opencv.js error.        
	compass_canvas.width = video_width; compass_canvas.height = video_height;
	compass_canvas.style.width = video_width;
	compass_canvas.style.height = video_height;

	compass_video.style.width = video_width;
	compass_video.style.height = video_height;

	setCompassPos(0);
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
	compass_video.onloadedmetadata = function () {
		setTimeout(successCallback, 0);
	}
}

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
	else if (pos == 1) {
		compass_r_left = 5;
		compass_r_right = compass_r_left + 40;
		compass_r_bottom = video_height - 5;
		compass_r_top = compass_r_bottom - 60;
	}
	else if (pos == 3) {
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
		cv.putText(output, "Text", { x: 8, y: 50 }, cv.FONT_HERSHEY_SIMPLEX, 0.3, [compass_red, compass_green, compass_blue, 255]);

	return output;
}

function process() {
	if (streaming === true) {
		cap.read(frame);

		let rect = new cv.Rect(compass_r_left, compass_r_top, 40, 60);
		let dst = frame.roi(rect);
		let output = drawCompass(dst);

		let overlay = new cv.Mat();
		cv.addWeighted(dst, 1 - compass_alpha, output, compass_alpha, 0.0, overlay);

		for (let i = 0; i < overlay.rows; i++) {
			for (let j = 0; j < overlay.cols; j++) {
				frame.ucharPtr(compass_r_top + i, compass_r_left + j)[0] = overlay.ucharPtr(i, j)[0];
				frame.ucharPtr(compass_r_top + i, compass_r_left + j)[1] = overlay.ucharPtr(i, j)[1];
				frame.ucharPtr(compass_r_top + i, compass_r_left + j)[2] = overlay.ucharPtr(i, j)[2];
			}
		}

		cv.imshow('compass_output', frame);
		overlay.delete(); output.delete();
		framecount++;

		if (framecount >= 200) {
			framecount = 0;
			compass_video.pause(); compass_video.currentTime = 0;
			compass_video.play();
		}

		setTimeout(process, 33);
	}
}

//# sourceURL=embed_compass.js