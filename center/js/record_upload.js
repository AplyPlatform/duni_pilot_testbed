/* Copyright 2021 APLY Inc. All rights reserved. */

"use strict";

let g_b_fileupload_for_DJI = true; //dji file or input address
let g_params_for_upload_flight_rec = {};
let g_f_recordFileForUploadFile = null;
let g_f_videoFileForUploadFile = null;

$(function () {
	flightrecordUploadInit();
});

function flightrecordUploadInit() {

	document.title = GET_STRING_CONTENT('page_flight_rec_upload_title');
	$("#head_title").text(document.title);

	$('#page_about_title').text(GET_STRING_CONTENT('page_flight_rec_upload_title'));
	$('#page_about_content').text(GET_STRING_CONTENT('upload_about_content'));

	$('#btnForUploadFlightList').text(GET_STRING_CONTENT('msg_upload'));

	$("#desc_for_moviedata_label").text(GET_STRING_CONTENT('input_memo_label'));
	$("#privacy_for_moviedata_label").text(GET_STRING_CONTENT('privacy_for_moviedata_label'));
	$("#option_public_label").text(GET_STRING_CONTENT('option_public_label'));
	$("#option_unlisted_label").text(GET_STRING_CONTENT('option_unlisted_label'));
	$("#option_private_label").text(GET_STRING_CONTENT('option_private_label'));

	$('#dji_flight_record_get_label').text(GET_STRING_CONTENT('dji_flight_record_get_label'));
	$('#duni_flight_record_format_label').text(GET_STRING_CONTENT('duni_flight_record_format_label'));

	$("#record_name_field").attr("placeholder", GET_STRING_CONTENT('msg_input_record_name'));
	$("#name_label").text(GET_STRING_CONTENT('name_label'));
	$("#youtube_url_label").text(GET_STRING_CONTENT('youtube_url_label'));
	$("#input_memo_label").text(GET_STRING_CONTENT('input_memo_label'));

	$("#input_tag_label").text(GET_STRING_CONTENT('input_tag_label'));
	$('#label_explain_drag').text(GET_STRING_CONTENT('label_explain_drag'));
	$('#label_or_directly').text(GET_STRING_CONTENT('label_or_directly'));

	$("#dji_radio_label").text(GET_STRING_CONTENT('msg_dji_file_upload'));
	$('#collapseRecordFileParams').html(GET_STRING_CONTENT('collapseRecordFileParams'));
	$("#btnForAddressCheck").text(GET_STRING_CONTENT('btnForAddressCheck'));

	$("#tab_menu_upload_selector_dji").text(GET_STRING_CONTENT('tab_menu_upload_selector_dji'));
	$("#tab_menu_upload_selector_address").text(GET_STRING_CONTENT('tab_menu_upload_selector_address'));

	$("#tab_menu_set_youtube_address").text(GET_STRING_CONTENT('label_set_youtube_url'));
	$("#tab_menu_set_youtube_upload").text(GET_STRING_CONTENT('label_upload_movie'));
	$("#tab_menu_set_no_video").text(GET_STRING_CONTENT('label_set_no_video'));

	$('#btnSelectMovieFiles').text(GET_STRING_CONTENT('label_select_files'));
	$('#btnSelectDJIFiles').text(GET_STRING_CONTENT('label_select_files'));
	$('#btnSelectFiles').text(GET_STRING_CONTENT('label_select_files'));
	$('#btnNextStage').text(GET_STRING_CONTENT('btnNextStage'));
	$('#label_flightrec_file_drop_area').html(GET_STRING_CONTENT('msg_drop_flightrecord_file'));
	$("#flighttime_input_data_label").text(GET_STRING_CONTENT('flighttime_input_data_label'));

	$("#disclaimer").html(GET_STRING_CONTENT('youtubeTOS'));

	$("#label_youtube_address_only").text(GET_STRING_CONTENT('label_youtube_address_only'));

	$("#upload_progress_view").hide();

	$('#btnForUploadFlightList').click(function (e) {
		e.preventDefault();

		GATAGM('upload_record_upload_btn_click', 'CONTENT');

		uploadCheckBeforeUploadFlightList();
	});

	$("#findAddressBtn").click(function (e) {
		e.preventDefault();

		GATAGM('upload_address_find_btn_click', 'CONTENT');

		execDaumPostcode(function (addr) {
			requestGPSByAddress(addr, function (r) {
					if (r.result == "success") {
						if (r.data == null) {
							g_loc_address_flat = -999;
							g_loc_address_flng = -999;
							showAlert(GET_STRING_CONTENT('msg_wrong_input'));
							return;
						}

						g_loc_address_flat = r.data.lat;
						g_loc_address_flng = r.data.lng;
					}
					else {
						g_loc_address_flat = -999;
						g_loc_address_flng = -999;
						showAlert(GET_STRING_CONTENT('msg_input_correct_address'));
					}
				},
				function () {
					GATAGM('upload_address_find_failed', 'CONTENT');
					g_loc_address_flat = -999;
					g_loc_address_flng = -999;
					showAlert(GET_STRING_CONTENT('msg_error_sorry'));
				}
			);
		});
	});


	$('#btn_check_code').click(function (e) {
		e.preventDefault();

		GATAGM('upload_code_check_btn_click', 'CONTENT');
		verifyCode($('#verification_code').val(), verifyPhoneCodeCommonSuccessCallback);
	});

	$('#btn_verify_code').click(function (e) {
		e.preventDefault();

		GATAGM('upload_code_verify_btn_click', 'CONTENT');

		verifyPhoneNo($('#user_phonenumber').val());
	});

	//판매국가는 우선 한국만!
	$("#priceinputarea").hide();

	if (g_str_cur_lang != "KR") {
		$("#sale_select").hide();
	}

	$("#salecheck").click(function (e) {
		let checked = $("#salecheck").is(":checked");
		let userid = getCookie("dev_user_id");

		if (checked) {
			GATAGM('upload_salecheck_show_btn_click', 'CONTENT');
			$("#priceinputarea").show();

			let phone_number = getCookie("temp_phone");
			if (isSet(phone_number)) {
				$("#validate_phonenumber_area").hide();
				g_b_phonenumber_verified = true;
			}
			else {
				showAlert(GET_STRING_CONTENT('msg_phone_vid_not_verified'));
				$("#validate_phonenumber_area").show();
				g_b_phonenumber_verified = false;
			}
		}
		else {
			GATAGM('upload_salecheck_hide_btn_click', 'CONTENT');
			$("#priceinputarea").hide();
			g_b_phonenumber_verified = true;
		}
	});

	let input = document.querySelector('input[name=tagTextarea]');
	new Tagify(input);

	$("input[name='media_upload_kind']:radio").change(function () {
		let cVal = this.value;

		if (cVal == "tab_menu_set_youtube_address") {
			$("#set_youtube_address_view").show();
			$("#set_youtube_upload_view").hide();
			GATAGM('upload_youtube_address_check_click', 'CONTENT');
		}
		else if (cVal == "tab_menu_set_youtube_upload") {
			$("#set_youtube_address_view").hide();
			$("#set_youtube_upload_view").show();
			GATAGM('upload_youtube_upload_check_click', 'CONTENT');
		}
		else {
			$("#set_youtube_address_view").hide();
			$("#set_youtube_upload_view").hide();
			GATAGM('upload_youtube_no_check_click', 'CONTENT');
		}
	});

	g_component_upload_youtube_video = new UploadVideo();
	g_component_upload_youtube_video.onUploadCompleteCallback = function (vid) {
		GATAGM('upload_youtube_upload_completed', 'CONTENT');

		$('#youtube_url_data').val("https://youtube.com/watch?v=" + vid);
		$("input:radio[name='media_upload_kind']:radio[value='tab_menu_set_youtube_address']").prop('checked', true);
		$("#set_youtube_address_view").show();
		$("#set_youtube_upload_view").hide();
		$("#videoRecordModifyArea").hide();
		$("#upload_progress_view").hide();

		g_params_for_upload_flight_rec['youtube_data'] = "https://youtube.com/watch?v=" + vid;

		hideLoader();

		if (g_b_fileupload_for_DJI == true) {
			askIsSyncData(g_params_for_upload_flight_rec, uploadDJIFlightListCallback);
			return;
		}

		let flightTime = $("#flighttime_input_data").val();
		if (flightTime == "") {
			showAlert(GET_STRING_CONTENT('msg_wrong_input') + " : " + GET_STRING_CONTENT('flighttime_input_data_label'));
			return;
		}

		let startTime = Date.parse(flightTime);
		if (isNaN(startTime) || ((startTime - Date.now()) <= (1000 * 60 * 60 * 2))) {
			showAlert(GET_STRING_CONTENT('msg_wrong_input') + " : " + GET_STRING_CONTENT('flighttime_input_data_label'));
			return;
		}

		g_params_for_upload_flight_rec['startTime'] = startTime;

		saveYoutubeUrl(g_params_for_upload_flight_rec, function (bSuccess) {
			if (bSuccess == true) {
				showAlert(GET_STRING_CONTENT('msg_success'));
				location.href = g_array_cur_controller_for_viewmode["pilot"] + "?page_action=recordlist";
			}
			else {
				showAlert(GET_STRING_CONTENT('msg_error_sorry'));
			}
		});
	};

	g_component_upload_youtube_video.ready();

	setFlightRecordUploadMode(true);

	let retDateTimeNow = new Date();
	retDateTimeNow.setMinutes(retDateTimeNow.getMinutes() - retDateTimeNow.getTimezoneOffset());
	$("#flighttime_input_data").val(retDateTimeNow.toISOString().slice(0, -1));

	$("#set_youtube_address_view").hide();
	$("#set_youtube_upload_view").show();

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
			GATAGM('upload_file_drop', 'CONTENT');
			let retSelected = fileDropCheckRecordUpload(e.originalEvent.dataTransfer.files);
			if (retSelected == 2) setUploadFileFields();
			else if (retSelected == 1) $("#btnNextStage").attr('disabled', false);
			else $("#btnNextStage").attr('disabled', true);
		});

	$("#btnNextStage").click(function (e) {
		e.preventDefault();

		GATAGM('upload_next_stage_btn_click', 'CONTENT');
		$("#nextStageBtnArea").hide();
		setUploadFileFields();
	});

	$("#label_youtube_address_only").click(function (e) {
		e.preventDefault();

		GATAGM('upload_youtube_address_only_link_click', 'CONTENT');
		$("#nextStageBtnArea").hide();
		$("#set_youtube_address_view").show();
		$("#set_youtube_upload_view").hide();
		$("#video_upload_kind_sel").show();
		$('input:radio[name=media_upload_kind]:input[value=tab_menu_set_youtube_address]').attr("checked", true);
		setUploadFileFields();
	});

	$("#input_direct_file").bind('change', function () {
		GATAGM('upload_direct_file_select_btn_click', 'CONTENT');
		let retSelected = fileDropCheckRecordUpload(this.files);
		if (retSelected == 2) setUploadFileFields();
		else if (retSelected == 1) $("#btnNextStage").attr('disabled', false);
		else $("#btnNextStage").attr('disabled', true);
	});

	$("#movieFile").bind('change', function () {
		GATAGM('upload_movie_file_select_btn_click', 'CONTENT');
		g_f_videoFileForUploadFile = null;
		let retSelected = fileDropCheckRecordUpload(this.files);
	});

	$("#flight_record_file").bind('change', function () {
		GATAGM('upload_record_file_select_btn_click', 'CONTENT');
		g_f_recordFileForUploadFile = null;
		let retSelected = fileDropCheckRecordUpload(this.files);
	});

	$("#input_direct_file").click(function () {
		$(this).attr("value", "");
		$("#input_direct_file").val("");
	});

	$("#movieFile").click(function () {
		$(this).attr("value", "");
		$("#movieFile").val("");
	});

	$("#flight_record_file").click(function () {
		$(this).attr("value", "");
		$("#flight_record_file").val("");
	});

	$("#dropArea").show();
	$("#uploadfileform").hide();
	$("#file_upload_img").hide();
	$("#nextStageBtnArea").show();
	$("#btnNextStage").attr('disabled', true);

	// define variables
	let nativePicker = document.querySelector('.nativeDateTimePicker');
	let fallbackPicker = document.querySelector('.fallbackDateTimePicker');
	let monthSelect = document.querySelector('#month');

	// hide fallback initially
	fallbackPicker.style.display = 'none';

	// test whether a new datetime-local input falls back to a text input or not
	let testInput = document.createElement('input');

	try {
		testInput.type = 'datetime-local';
	} catch (e) {
		console.log(e.description);
	}

	// if it does, run the code inside the if() {} block
	if (testInput.type === 'text') {
		// hide the native picker and show the fallback
		nativePicker.style.display = 'none';
		fallbackPicker.style.display = 'block';

		// populate the days and years dynamically
		// (the months are always the same, therefore hardcoded)
		populateDays(monthSelect.value);
		populateYears();
		populateHours();
		populateMinutes();
	}

	hideLoader();
}



function populateDays(month) {
	let daySelect = document.querySelector('#day');
    while (daySelect.firstChild) {
        daySelect.removeChild(daySelect.firstChild);
    }

    // Create letiable to hold new number of days to inject
    let dayNum;

    // 31 or 30 days?
    if (month === 'January' || month === 'March' || month === 'May' || month === 'July' || month === 'August' || month === 'October' || month === 'December') {
        dayNum = 31;
    } else if (month === 'April' || month === 'June' || month === 'September' || month === 'November') {
        dayNum = 30;
    } else {
        let year = yearSelect.value;
        let isLeap = new Date(year, 1, 29).getMonth() == 1;
        isLeap ? dayNum = 29 : dayNum = 28;
    }

    for (i = 1; i <= dayNum; i++) {
        let option = document.createElement('option');
        option.textContent = i;
        daySelect.appendChild(option);
    }

    if (previousDay) {
        daySelect.value = previousDay;

        if (daySelect.value === "") {
            daySelect.value = previousDay - 1;
        }

        if (daySelect.value === "") {
            daySelect.value = previousDay - 2;
        }

        if (daySelect.value === "") {
            daySelect.value = previousDay - 3;
        }
    }
}

function populateYears() {
	let yearSelect = document.querySelector('#year');
    // get this year as a number
    let date = new Date();
    let year = date.getFullYear();

    // Make this year, and the 100 years before it available in the year <select>
    for (let i = 0; i <= 100; i++) {
        let option = document.createElement('option');
        option.textContent = year - i;
        yearSelect.appendChild(option);
    }
}

function populateHours() {
	let hourSelect = document.querySelector('#hour');
    // populate the hours <select> with the 24 hours of the day
    for (let i = 0; i <= 23; i++) {
        let option = document.createElement('option');
        option.textContent = (i < 10) ? ("0" + i) : i;
        hourSelect.appendChild(option);
    }
}

function populateMinutes() {
	let minuteSelect = document.querySelector('#minute');
    // populate the minutes <select> with the 60 hours of each minute
    for (let i = 0; i <= 59; i++) {
        let option = document.createElement('option');
        option.textContent = (i < 10) ? ("0" + i) : i;
        minuteSelect.appendChild(option);
    }
}



function setUploadFileFields() {
    $('#dropArea').hide();
    $("#nextStageBtnArea").hide();
    $('#uploadfileform').show();
    $('#youtube_address_only_area').hide();
}

function previewForRecordFile(file) {
	let iconArea;
	let vDiv;
	if (isMovieFile(file.name)) {
		$("#selectMovieFileArea").css("display", "none");
		$("#videoFileName").empty();
		iconArea = '<i class="fas fa-video" style="color:black"></i>';

		vDiv = $('<div class="text-left">'
			+ '<span style="cursor:pointer" id="file_data_remover_video1"><b>X</b></span> '
			+ iconArea + ' <span class="text-xs mb-1" style="color:black">' + file.name + '</span></div>');
		$("#videoFileName").append(vDiv);

		vDiv = $('<div class="text-left" id="thumbnail_video">'
			+ '<span style="cursor:pointer" id="file_data_remover_video2"><b>X</b></span> '
			+ iconArea + ' <span class="text-xs mb-1" style="color:black">' + file.name + '</span></div>');
		$("#thumbnails").append(vDiv);

		$("#file_data_remover_video1").on("click", function (e) {
			$("#videoFileName").empty();
			$("#thumbnail_video").remove();
			g_f_videoFileForUploadFile = null;
			$("#selectMovieFileArea").show();
			$("#video_upload_kind_sel").show();
		});

		$("#file_data_remover_video2").on("click", function (e) {
			$("#videoFileName").empty();
			$("#thumbnail_video").remove();
			g_f_videoFileForUploadFile = null;
			$("#selectMovieFileArea").show();
			$("#video_upload_kind_sel").show();
		});

		$("#video_upload_kind_sel").hide();
	}
	else {
		$("#selectDJIFileArea").css("display", "none");
		$("#flightRecordFileName").empty();
		iconArea = '<i class="fas fa-map-marker-alt" style="color:black"></i>';
		vDiv = $('<div class="text-left">'
			+ '<span style="cursor:pointer" id="file_data_remover_record1"><b>X</b></span> '
			+ iconArea + ' <span class="text-xs mb-1" style="color:black">' + file.name + '</span></div>');
		$("#flightRecordFileName").append(vDiv);


		vDiv = $('<div class="text-left" id="thumbnail_record">'
			+ '<span style="cursor:pointer" id="file_data_remover_record2"><b>X</b></span> '
			+ iconArea + ' <span class="text-xs mb-1" style="color:black">' + file.name + '</span></div>');
		$("#thumbnails").append(vDiv);

		$("#file_data_remover_record1").on("click", function (e) {
			$("#flightRecordFileName").empty();
			$("#thumbnail_record").remove();
			g_f_recordFileForUploadFile = null;
			$("#selectDJIFileArea").show();
			$("#dji_file_upload_sel").show();
			$("#dji_file_get_howto").show();
		});

		$("#file_data_remover_record2").on("click", function (e) {
			$("#flightRecordFileName").empty();
			$("#thumbnail_record").remove();
			g_f_recordFileForUploadFile = null;
			$("#selectDJIFileArea").show();
			$("#dji_file_upload_sel").show();
			$("#dji_file_get_howto").show();
		});

		$("#dji_file_upload_sel").hide();
		$("#dji_file_get_howto").hide();
	}
}

function fileDropCheckRecordUpload(files) {
	if (files.length > 2) {
		showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
		return 0;
	}

	if (files.length == 2) {
		if (isSet(g_f_recordFileForUploadFile) || isSet(g_f_videoFileForUploadFile)) {
			showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
			return 0;
		}
	}

	let isAdded = false;
	for (let i = 0; i < files.length; i++) {
		let file = files[i];

		if (isRecordFile(file.name)) {
			if (isSet(g_f_recordFileForUploadFile)) {
				showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
				return 0;
			}
			else {
				g_f_recordFileForUploadFile = file;
				previewForRecordFile(file);
				isAdded = true;
			}
		}

		if (isMovieFile(file.name)) {
			if (isSet(g_f_videoFileForUploadFile)) {
				showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
				return 0;
			}
			else {
				g_f_videoFileForUploadFile = file;
				previewForRecordFile(file);
				isAdded = true;
			}
		}
	}

	if (isAdded == 0) {
		showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
		return 0;
	}

	if (isSet(g_f_recordFileForUploadFile) && isSet(g_f_videoFileForUploadFile)) {
		return 2;
	}

	return 1;
}


function uploadCheckBeforeUploadFlightList() {

	let cVal = $(":input:radio[name='media_upload_kind']:checked").val();
	if (cVal == "tab_menu_set_youtube_address" || cVal == "tab_menu_set_no_video") {
		uploadFlightList(false);
		return;
	}

	let mname = $("#record_name_field").val();
	if (mname == "") {
		showAlert(GET_STRING_CONTENT('msg_input_record_name'));
		return;
	}

	let price = 0;
	if (g_str_cur_lang == "KR") {
		let tchecked = $("#salecheck").is(":checked");
		if (tchecked) {
			let t_p = $("#price_input_data").val();
			if (t_p == "" || t_p == "원" || t_p == "0") {
				showAlert("영상의 판매를 원하시면 판매 희망 가격을 입력해 주세요.");
				return;
			}

			if (g_b_phonenumber_verified == false) {
				showAlert(GET_STRING_CONTENT('msg_phone_vid_not_verified'));
				return;
			}

			price = t_p * 1;
		}
	}

	let mmemo = $("#memoTextarea").val();
	let tag_values = $("#tagTextarea").val();

	if (g_b_fileupload_for_DJI == true) { //비행기록 업로드
		if (isSet(g_f_recordFileForUploadFile) == false) {
			showAlert(GET_STRING_CONTENT('msg_select_file'));
			return;
		}

		showLoader();

		g_params_for_upload_flight_rec = { file: g_f_recordFileForUploadFile, mname: mname, mmemo: mmemo, tag_values: tag_values, isUpdate: false, isSyncData: false, price: price };
		g_component_upload_youtube_video.handleUploadClicked(g_f_videoFileForUploadFile);
		return;
	}

	if (g_loc_address_flat == -999) {    	// 주소 기반
		showAlert(GET_STRING_CONTENT('msg_input_correct_address'));
		return;
	}

	showLoader();
	g_params_for_upload_flight_rec = { mname: mname, mmemo: mmemo, tag_values: tag_values, isUpdate: false, isSyncData: false, price: price, flat: g_loc_address_flat, flng: g_loc_address_flng };
	g_component_upload_youtube_video.handleUploadClicked(g_f_videoFileForUploadFile);
}

function setFlightRecordUploadMode(bWhich) {
	if (bWhich == true) {
		g_b_fileupload_for_DJI = true;
		$("#dji_upload_field").show();
		$("#address_location_field").hide();
		return;
	}

	g_b_fileupload_for_DJI = false;
	$("#dji_upload_field").hide();
	$("#address_location_field").show();
}


function uploadFlightList(isUpdate) {
	let mname = $("#record_name_field").val();

	if (isSet(mname) == false) {
		showAlert(GET_STRING_CONTENT('msg_input_record_name'));
		return;
	}

	let mmemo = $("#memoTextarea").val();
	let tag_values = $("#tagTextarea").val();

	let youtube_data = $("#youtube_url_data").val();
	let cVal = $(":input:radio[name='media_upload_kind']:checked").val();
	if (cVal == "tab_menu_set_no_video") {
		youtube_data = "";
	}
	else if (cVal == "tab_menu_set_youtube_address") {
		youtube_data = massageYotubeUrl(youtube_data);
		if (youtube_data == "") {
			showAlert(GET_STRING_CONTENT('msg_wrong_youtube_url_input'));
			return;
		}
	}

	let params = {};
	let price = 0;

	if (isUpdate == false && g_str_cur_lang == "KR") {
		let checked = $("#salecheck").is(":checked");
		if (checked) {
			let t_p = $("#price_input_data").val();
			if (t_p == "") {
				showAlert("영상의 판매를 원하시면 판매 희망 가격을 입력해 주세요.");
				return;
			}

			if (youtube_data == "") {
				showAlert("영상의 판매를 원하시면 판매하실 원본영상의 유튜브 URL을 입력해 주세요.");
				return;
			}

			price = t_p * 1;
		}
	}

	if (g_b_fileupload_for_DJI == true) {
		if (isSet(g_f_recordFileForUploadFile) == false) {
			showAlert(GET_STRING_CONTENT('msg_select_file'));
			return;
		}

		let record_kind = "dji";
		if (getFileExtension(g_f_recordFileForUploadFile.name).toUpperCase() == "CSV") {
			record_kind = "litchi";
		}

		if (isSet(youtube_data)) {
			params = { file: g_f_recordFileForUploadFile, record_kind: record_kind, mname: mname, mmemo: mmemo, price: price, tag_values: tag_values, youtube_data: youtube_data, isUpdate: isUpdate };
			askIsSyncData(params, uploadDJIFlightListCallback);
			return;
		}

		showLoader();

		params = { file: g_f_recordFileForUploadFile, record_kind: record_kind, mname: mname, mmemo: mmemo, price: price, tag_values: tag_values, youtube_data: youtube_data, isUpdate: isUpdate, isSyncData: false };
		getBase64(params, uploadDJIFlightListCallback);
		return;
	}

	if (isUpdate == true || youtube_data == "") {
		showAlert(GET_STRING_CONTENT('msg_select_any_file'));
	}
	else {
		if (g_loc_address_flat == -999) {
			showAlert(GET_STRING_CONTENT('msg_input_correct_address'));
			return;
		}

		let flightTime = $("#flighttime_input_data").val();
		if (flightTime == "") {
			showAlert(GET_STRING_CONTENT('msg_wrong_input') + " : " + GET_STRING_CONTENT('flighttime_input_data_label'));
			return;
		}
		
		let startTime = Date.parse(flightTime);
		if (isNaN(startTime) || ((startTime - Date.now()) <= (1000 * 60 * 60 * 2))) {
			showAlert(GET_STRING_CONTENT('msg_wrong_input') + " : " + GET_STRING_CONTENT('flighttime_input_data_label'));
			return;
		}

		youtube_data = massageYotubeUrl(youtube_data);

		params = { mname: mname, mmemo: mmemo, price: price, tag_values: tag_values, youtube_data: youtube_data, flat: g_loc_address_flat, flng: g_loc_address_flng, startTime: startTime };

		saveYoutubeUrl(params, function (bSuccess) {
			if (bSuccess == true) {
				showAlert(GET_STRING_CONTENT('msg_success'));
				location.href = g_array_cur_controller_for_viewmode["pilot"] + "?page_action=recordlist";
			}
			else {
				showAlert(GET_STRING_CONTENT('msg_error_sorry'));
			}
		});
	}
}


function uploadDJIFlightListCallback(params) {
	let userid = getCookie("dev_user_id");

	let youtube_data = massageYotubeUrl(params.youtube_data);
	let jdata = {
		"action": "position", "daction": "convert",
		"clientid": userid, "name": encodeURI(params.mname),
		"youtube_data_id": youtube_data,
		"update": params.isUpdate,
		"sync": params.isSyncData,
		"price": params.price,
		"record_kind": params.record_kind,
		"tag_values": encodeURI(params.tag_values),
		"memo": encodeURI(params.mmemo),
		"recordfile": params.base64file
	};

	ajaxRequest(jdata, function (r) {
		if (r.result == "success") {
			$('#btnForUploadFlightList').hide(1500);
			$('#uploadFileform').hide(1500);
			GATAGM('dji_file_upload_success', 'CONTENT');

			showAskDialog(
				GET_STRING_CONTENT('modal_title'),
				GET_STRING_CONTENT('msg_success'),
				GET_STRING_CONTENT('modal_confirm_btn'),
				false,
				function () {
					setTimeout(function () {
						location.href = g_array_cur_controller_for_viewmode["pilot"] + "?page_action=recordlist";
					}, 1000);
				},
				null
			);

		}
		else {
			if (r.result_code == 3) {
				GATAGM('dji_file_upload_failed_same_data_exist', 'CONTENT');
				showAlert(GET_STRING_CONTENT('msg_error_same_record_exist'));
			}
			else {
				if (r.reason.indexOf("failed to decode") >= 0) {
					GATAGM('dji_file_upload_analyze_failed', 'CONTENT');
					if (isSet(youtube_data)) {
						showAlert(GET_STRING_CONTENT('msg_dji_analyze_failed_input_address')); //with video
						$("#flightRecordFileName").empty();
						$("#thumbnail_record").remove();
						g_f_recordFileForUploadFile = null;
						$("#selectDJIFileArea").show();
						$("#dji_file_upload_sel").show();
						$("#dji_file_get_howto").show();
						$('#address_location_kind').prop('checked', true);
						setFlightRecordUploadMode(false);
					}
					else {
						showAlert(GET_STRING_CONTENT('msg_select_another_file'));
					}
				}
				else {
					GATAGM('dji_file_upload_analyze_failed', 'CONTENT', r.reason);
					showAlert(GET_STRING_CONTENT('msg_error_sorry') + " (" + r.reason + ")");
				}
			}

			hideLoader();
		}
	}, function (request, status, error) {
		hideLoader();
		monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
	});
}

//# sourceURL=record_upload.js
