/* Copyright 2021 APLY Inc. All rights reserved. */

"use strict";
$(function () {
	flightDetailInit(g_str_current_target);
});

function flightDetailInit(target) {
	map2DInit();
	selectMonitorIndex("private", 0);
	map3DInit();

	if (target == "public") {
		document.title = GET_STRING_CONTENT('page_flight_rec_public_view_title');
	}
	else {
		document.title = GET_STRING_CONTENT('page_flight_rec_view_title');
	}

	$("#head_title").text(document.title);
	$("#modifyBtnForMovieData").text(GET_STRING_CONTENT('modifyBtnForMovieData'));
	$("#desc_for_moviedata_label").text(GET_STRING_CONTENT('input_memo_label'));
	$("#privacy_for_moviedata_label").text(GET_STRING_CONTENT('privacy_for_moviedata_label'));
	$("#option_public_label").text(GET_STRING_CONTENT('option_public_label'));
	$("#option_unlisted_label").text(GET_STRING_CONTENT('option_unlisted_label'));
	$("#option_private_label").text(GET_STRING_CONTENT('option_private_label'));
	$("#uploadVideoToYoutubeButton").text(GET_STRING_CONTENT('uploadVideoToYoutubeButton'));
	$("#flightMemoBtn").text(GET_STRING_CONTENT('msg_modify_memo'));
	$("#flightTagBtn").text(GET_STRING_CONTENT('msg_modify_tag'));
	$("#merge_record_view_btn").text(GET_STRING_CONTENT('merge_record_view_btn_label'));

	$("#input_tag_label").text(GET_STRING_CONTENT('input_tag_label'));

	$("#altitude_label_top").text(GET_STRING_CONTENT('altitude_label'));
	$("#youtube_url_label").text(GET_STRING_CONTENT('youtube_url_label'));
	$("#btnForSetYoutubeID").text(GET_STRING_CONTENT('msg_apply'));
	$("#map_kind_label").text(GET_STRING_CONTENT('map_kind_label'));
	$("#input_memo_label").text(GET_STRING_CONTENT('input_memo_label'));
	//$("#btnForFilter").text(GET_STRING_CONTENT('btnForFilter'));
	$("#btnForSharing").text(GET_STRING_CONTENT('btnForSharing'));
	$("#btnForPublic").text(GET_STRING_CONTENT('btnForOpening'));
	$("#btnForLink").text(GET_STRING_CONTENT('btnForLink'));
	$("#btnForDelete").text(GET_STRING_CONTENT('msg_remove'));
	$("#btnForUpdateTitle").text(GET_STRING_CONTENT('msg_modify'));

	$("#dji_radio_label").text(GET_STRING_CONTENT('msg_dji_file_upload'));
	$("#duni_radio_label").text(GET_STRING_CONTENT('msg_duni_file_upload'));
	$('#btnForUploadFlightList').text(GET_STRING_CONTENT('msg_upload'));
	$('#uploadBtnForFlightRecord').text(GET_STRING_CONTENT('page_flight_rec_upload_title'));

	$('#Aerial_label').text(GET_STRING_CONTENT('Aerial_label'));
	$('#Aerial_label_label').text(GET_STRING_CONTENT('Aerial_label_label'));
	$('#Road_label').text(GET_STRING_CONTENT('Road_label'));
	$('#Road_detail').text(GET_STRING_CONTENT('Road_detail_label'));

	$('#roll_label').text(GET_STRING_CONTENT('roll_label'));
	$('#pitch_label').text(GET_STRING_CONTENT('pitch_label'));
	$('#yaw_label').text(GET_STRING_CONTENT('yaw_label'));

	$("#tab_menu_set_youtube_address").text(GET_STRING_CONTENT('label_set_youtube_url'));
	$("#tab_menu_set_youtube_upload").text(GET_STRING_CONTENT('label_upload_movie'));

	$('#btnSelectMovieFiles').text(GET_STRING_CONTENT('label_select_files'));

	$('#sync_slider_label').text(GET_STRING_CONTENT('sync_slider_label') + " (" + GET_STRING_CONTENT('label_second') + ")");

	$('#flightRecDsecApplyBtn').text(GET_STRING_CONTENT('apply_flight_rec_sync_btn'));
	$('#flightRecDsecSaveBtn').text(GET_STRING_CONTENT('save_flight_rec_sync_btn'));

	$('#sync_explain_label').html(GET_STRING_CONTENT('sync_explain_label'));

	$('#no_record_data_view_label').text(GET_STRING_CONTENT('no_record_data_view_label'));

	$('#record_search_field_label').text(GET_STRING_CONTENT('record_search_field_label'));
	$("#btnForLoadFlightList").text(GET_STRING_CONTENT('btnForLoadFlightList'));
	$('#modal-search-confirm-btn').text(GET_STRING_CONTENT('msg_closed'));


	$("#disclaimer").html(GET_STRING_CONTENT('youtubeTOS'));

	$("#btnForLink").hide();
	$("#btnForSharing").hide();

	$("#set_youtube_address_view").hide();
	$("#set_youtube_upload_view").show();

	$("input[name='media_upload_kind']:radio").change(function () {
		let cVal = this.value;

		if (cVal == "tab_menu_set_youtube_address") {
			$("#set_youtube_address_view").show();
			$("#set_youtube_upload_view").hide();
		}
		else if (cVal == "tab_menu_set_youtube_upload") {
			$("#set_youtube_address_view").hide();
			$("#set_youtube_upload_view").show();
		}
		else {
			$("#set_youtube_address_view").hide();
			$("#set_youtube_upload_view").hide();
		}
	});

	/*
$('#btnForFilter').click(function (e) {
		e.preventDefault();

	GATAGM('btnForFilter', 'CONTENT');
	setKalmanFilter();
});
*/

	$('#merge_record_view_btn').click(function () {
		GATAGM('detail_merge_record_view_btn_click', 'CONTENT');
		$('#dataTable-Flight_area').modal('show');
	});

	$("#record_search_field").attr("placeholder", GET_STRING_CONTENT('msg_record_search_key'));
	$("#record_search_field").keypress(function (e) {
		if (e.which == 13) {
			GATAGM('detail_record_search_field_enter_key', 'CONTENT', $("#record_search_field").val());
			searchFlightRecordForMerge(target, $("#record_search_field").val());
		}
	});

	$('#loadMoreArea').hide();

	$('#btnForLoadFlightList').click(function () {
		GATAGM('detail_record_load_more_btn_click', 'CONTENT');
		getFlightRecords(target, $("#record_search_field").val());
	});

	$('#btnForSetYoutubeID').click(function (e) {
		e.preventDefault();

		GATAGM('detail_set_youtube_btn_click', 'CONTENT');
		setYoutubeID();
	});

	$('#btnForUploadFlightList').click(function (e) {
		e.preventDefault();
		GATAGM('detail_record_upload_btn_click', 'CONTENT');
		uploadFlightList(true);
	});

	$("#recordDataSet").hide();

	g_component_upload_youtube_video = new UploadVideo();
	g_component_upload_youtube_video.onUploadCompleteCallback = function (vid) {
		GATAGM('detail_youtube_upload_completed', 'CONTENT');

		$('#youtube_url_data').val("https://youtube.com/watch?v=" + vid);
		setYoutubePlayerForDetaileViewPureID(vid);
		setYoutubeID();
		$("#videoRecordModifyArea").hide();
	};

	g_component_upload_youtube_video.ready();
	$('#uploadVideoToYoutubeButton').click(function (e) {
		e.preventDefault();
		g_component_upload_youtube_video.handleUploadClicked(videoFileForUploadFile);
	});

	let record_name = getQueryVariable("record_name");
	let target_key = getQueryVariable("target_key");

	$("#movieFile").bind('change', function () {
		GATAGM('detail_movie_file_select_btn_click', 'CONTENT');
		videoFileForUploadFile = this.files[0];
		previewForRecordFile(this.files[0])
	});

	$("#movieFile").click(function () {
		$(this).attr("value", "");
		$("#movieFile").val("");
	});

	if (record_name != null && record_name != "") {
		let rname = decodeURIComponent(unescape(record_name));
		showDataWithName(target, target_key, rname);

		$('#flightRecDsecApplyBtn').click(function (e) {
			e.preventDefault();

			GATAGM('detail_sec_aply_btn_click', 'CONTENT');

			let curVal = $('#goFlightRecItemIndex').val();
			if (!isSet(curVal) || $.isNumeric(curVal) == false) {
				showAlert(GET_STRING_CONTENT("msg_wrong_input"));
				return;
			}

			curVal = parseFloat(curVal);
			updateFlightRecordDsec(curVal);

			showAlert(GET_STRING_CONTENT("msg_sync_adjusted") + " : " + curVal + GET_STRING_CONTENT("label_second"));
		});

		$('#flightRecDsecSaveBtn').click(function (e) {
			e.preventDefault();
			GATAGM('detail_sec_save_btn_click', 'CONTENT');
			updateFlightRecordDetail(rname);
		});
	}
}

function appendFlightRecordTableForMerge(target, target_key, item) {
	let name = item.name;
	let dtimestamp = item.dtimestamp;
	let data = item.data;

	let address = item.address;
	let cada = item.cada;
	let memo = item.memo;
	let owner_email = item.owner_email;
	let sharedList = item.sharedList;
	let youtube_data_id = item.youtube_data_id;
	let curIndex = g_i_appended_data_count;
	let tag_values = item.tag_values;

	let flat = (isSet(item.flat) ? item.flat * 1 : -999);
	let flng = (isSet(item.flng) ? item.flng * 1 : -999);

	dtimestamp = makeDateTimeFormat(new Date(dtimestamp), true);

	let appendRow = "<div class='card shadow mb-4' id='flight-list-" + curIndex + "' name='flight-list-" + curIndex + "'><div class='card-body'><div class='row'><div class='col-sm'>";
	appendRow = appendRow + (curIndex + 1) + " | ";

	appendRow = appendRow + "<a href='#' id='detail_record_list_item_" + curIndex + "'>" + name + "</a>";

	appendRow = appendRow + "</div></div><div class='row'>";

	if (isSet(youtube_data_id)) {
		appendRow = appendRow + "<div class='col-sm' id='youTubePlayer_" + curIndex + "'></div>";
	}

	if (flat != -999) {
		appendRow = appendRow + "<div class='col-sm' id='map_" + curIndex + "' style='height:200px;'></div>";
	}


	appendRow = appendRow + "</div><div class='row'><div class='col-md-12 text-right'><a href='#' class='text-xs' id='map_address_" + curIndex + "'></a>";

	if (target == "public")
		appendRow = appendRow + " / <span id='owner_email_" + curIndex + "' class='text-xs font-weight-bold mb-1'></span><br>";

	appendRow = appendRow + "<hr size='1' color='#efefef'></div></div>";

	appendRow = appendRow + "<div class='row'>";

	if (target == "public")
		appendRow = appendRow + "<div class='col-md-12 text-right'>";
	else
		appendRow = appendRow + "<div class='col-md-10 text-right'>";


	appendRow = appendRow + "<textarea class='form-control' id='memoTextarea_" + curIndex + "' rows='4'>"

	if (isSet(memo)) {
		appendRow = appendRow + memo;
	}

	appendRow = appendRow + "</textarea></div>";

	appendRow = appendRow + "</div>"; //row

	appendRow = appendRow + "<div class='row'><div class='col-md-12'>";

	if (isSet(tag_values) && tag_values != "") {
		let targetList = (target == "public" ? "public" : "");
		try {
			let tag_array = JSON.parse(tag_values);
			tag_array.forEach(function (tg) {
				appendRow = appendRow + "<a href=" + g_array_cur_controller_for_viewmode["pilot"] + "?page_action=" + targetList + "recordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
			});
		}
		catch (e) {
		}
	}

	appendRow = appendRow + "</div></div>";
	appendRow = appendRow + "<div class='row'>";

	appendRow = appendRow + "<div class='col-md-12 text-left'>";

	if (isSet(item.starttime)) {
		appendRow = appendRow + "<span class='text-xs mb-1'>" + GET_STRING_CONTENT('flighttime_input_data_label') + "</span> <span class='text-xs mb-1'>"
			+ makeDateTimeFormat(new Date(item.starttime), true)
			+ "<br></span>";
	}

	appendRow = appendRow + "<span class='text-xs mb-1'>" + GET_STRING_CONTENT('registered_datetime_label') + "</span> <span class='text-xs mb-1'>" + dtimestamp + "</span>";
	appendRow = appendRow + "</div>";
	appendRow = appendRow + "</div></div></div>"; //row, card-body, card

	$('#dataTable-Flight_list').append(appendRow);
	$("#owner_email_" + curIndex).hide();


	$('#detail_record_list_item_' + curIndex).click(function () {
		$('#dataTable-Flight_area').modal('hide');
		loadRecordForMerge(target, target_key, name);
	});

	if (isSet(owner_email)) {
		let oemail = "<a href='" + g_array_cur_controller_for_viewmode["pilot"] + "?page_action=publicrecordlist&user_email=" + encodeURIComponent(owner_email) + "'>" + owner_email + "</a>";
		$("#owner_email_" + curIndex).show();
		$("#owner_email_" + curIndex).html(oemail);
	}

	$("#memoTextarea_" + curIndex).prop('disabled', true);

	let retSource = null;
	if (flat != -999) {
		retSource = makeForFlightListMap(curIndex, flat, flng, (isSet(youtube_data_id) ? true : false));
	}

	setYoutubeVideo(curIndex, youtube_data_id);

	if (isSet(retSource) && isSet(address) && address != "") {
		setAddressAndCada("#map_address_" + curIndex, address, cada, retSource);
		setAddressAndCada("#map_address_" + curIndex, address, cada, g_vector_2D_map_for_flight_rec);
	}
	else {
		if (flat != -999) {
			let dpoint = ol.proj.fromLonLat([flng, flat]);
			drawCadastral("#map_address_" + curIndex, name, dpoint[0], dpoint[1], retSource);
		}
	}

	g_i_appended_data_count++;
}


function loadRecordForMerge(target, target_key, name) {
	let userid = getCookie("dev_user_id");
	let jdata = { "action": "position", "daction": "download_spe", "name": encodeURI(name), "clientid": userid, "target_email": target_key };

	if (target == "public") {
		jdata['public'] = true;
	}

	showLoader();

	ajaxRequest(jdata, function (r) {

		if (r.result != "success") {
			showAlert(GET_STRING_CONTENT('msg_error_sorry'));
			hideLoader();
			return;
		}

		let fdata = r.data;
		mergeFlightRecordToView(fdata);

		hideLoader();

	}, function (request, status, error) {
		hideLoader();
		monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
	});
}

function searchFlightRecordForMerge(target, keyword) {
	if (isSet(keyword) == false) {
		showAlert(GET_STRING_CONTENT('msg_wrong_input'));
		return;
	}

	let userid = getCookie("dev_user_id");
	let isPublic = (target == "public") ? true : false;
	let jdata = { "action": "position", "daction": "find_record", "keyword": keyword, "clientid": userid, "public": isPublic };
	let target_key = $("#target_key").length > 0 ? $("#target_key").val() : "";

	if (target_key != "") {
		jdata["target_email"] = target_key;
	}

	g_more_key_for_data = "";

	$('#loadMoreArea').hide();

	showLoader();
	ajaxRequest(jdata, function (r) {
		if (r.result == "success") {
			if (r.data == null || r.data.length == 0) {
				showAlert(GET_STRING_CONTENT('msg_no_data'));
				hideLoader();
				return;
			}

			if (r.morekey) {
				g_more_key_for_data = r.morekey;
				$('#btnForLoadFlightList').text(GET_STRING_CONTENT('msg_load_more'));
				$('#loadMoreArea').show();
			}
			else {
				g_more_key_for_data = null;
				$('#loadMoreArea').hide(1500);
			}

			g_array_flight_rec = [];
			$('#dataTable-Flight_list').empty();
			g_i_appended_data_count = 0;

			makeFlightRecordsToTableForMerge(target, target_key, r.data);
			hideLoader();
		}
		else {
			if (r.reason == "no data") {
				showAlert(GET_STRING_CONTENT('msg_no_data'));
			}
			else {
				showAlert(GET_STRING_CONTENT('msg_error_sorry'));
			}

			hideLoader();
		}
	}, function (request, status, error) {
		hideLoader();
		monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
	});
}


function makeFlightRecordsToTableForMerge(target, target_key, data) {
	if (data == null || data.length == 0)
		return;

	data.sort(function (a, b) { // \uB0B4\uB9BC\uCC28\uC21C
		return b.dtimestamp - a.dtimestamp;
	});

	data.forEach(function (item) {
		appendFlightRecordTableForMerge(target, target_key, item);
	});
}

function updateFlightRecordDetail(name) {
	let userid = getCookie("dev_user_id");
	let jdata = { "action": "position", "daction": "set_record", "name": encodeURI(name), "clientid": userid, "recorddata": g_array_flight_rec, "fid": g_cur_str_flight_rec_fid };

	showLoader();

	ajaxRequest(jdata, function (r) {
		hideLoader();
		if (r.result == "success") {
			showAlert(GET_STRING_CONTENT('msg_success'));
		}
		else {
			showAlert(GET_STRING_CONTENT('msg_error_sorry'));
		}
	}, function (request, status, error) {

		monitor(GET_STRING_CONTENT('msg_error_sorry'));
		hideLoader();
	});
}


function setFlightRecordDataToView(cdata) {

	if (window.myLine)
		window.myLine.destroy();

	g_array_flight_rec = [];
	let arrayMapPosIcons = [];
	let lineData = [];

	let rlng, rlat;
	cdata.forEach(function (item, i, arr) {

		addChartItem(i, item);

		let pos_icon = new ol.Feature({
			geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
			name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
			mindex: i
		});

		let pos_icon_color = getColorPerAlt(item.alt);

		if ("etc" in item && "marked" in item.etc) {
			pos_icon_color = '#ff0000';
		}

		pos_icon.setStyle(new ol.style.Style({
			image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
				color: pos_icon_color,
				crossOrigin: 'anonymous',
				opacity: 0.55,
				src: "./imgs/position4.png"
			}))
		}));

		arrayMapPosIcons.push(pos_icon);

		lineData.push(ol.proj.fromLonLat([item.lng * 1, item.lat * 1]));

		oldLat = item.lat;
		oldLng = item.lng;
		oldAlt = item.alt;

		if (isSet(rlat) == false) {
			rlat = oldLat;
		}

		if (rlat > oldLat) {
			rlat = oldLat;
			rlng = oldLng;
		}
	});

	if (isSet(g_layer_2D_map_for_line))
		g_cur_2D_mainmap.removeLayer(g_layer_2D_map_for_line);

	if (isSet(g_layer_2D_map_for_icon))
		g_cur_2D_mainmap.removeLayer(g_layer_2D_map_for_icon);

	setSlider(cdata.length - 1);

	drawLineTo2DMap(g_cur_2D_mainmap, lineData);

	addPosIconsTo2DMap(arrayMapPosIcons);

	drawLineGraph();

	draw3DMap();

	return true;
}

function updateFlightRecordDsec(dsec) {
	if (g_array_flight_rec.length <= 0) return;

	let nData = [];
	for (let i = 0; i < g_array_flight_rec.length; i++) {
		g_array_flight_rec[i].dsec += dsec;
		nData.push(g_array_flight_rec[i]);
	}

	setFlightRecordDataToView(nData);
}


function setFlightRecordTitleName() {
	let target_name = $('#record_name_field').val();
	if (target_name == "") {
		showAlert(GET_STRING_CONTENT('msg_wrong_input'));
		return;
	}

	let userid = getCookie("dev_user_id");
	let jdata = { "action": "position", "daction": "set_name", "clientid": userid, "target_name": target_name, "name": encodeURI(g_str_cur_flight_record_name) };

	showLoader();
	ajaxRequest(jdata, function (r) {
		hideLoader();
		if (r.result == "success") {
			showAlert(GET_STRING_CONTENT('msg_success'));
			g_str_cur_flight_record_name = target_name;
			location.href = g_array_cur_controller_for_viewmode["pilot"] + "?page_action=recordlist_detail&record_name=" + encodeURIComponent(target_name);
		}
		else {
			if (r.result_code == 3)
				showAlert(GET_STRING_CONTENT('msg_name_is_already_exist'));
			else
				showAlert(GET_STRING_CONTENT('msg_error_sorry'));
		}
	}, function (request, status, error) {
		hideLoader();
		showAlert(GET_STRING_CONTENT('msg_error_sorry'));
		monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
	});
}

function getFlightRecordTitle() {
	if ($("#record_name_field").length <= 0) return "";

	return $("#record_name_field").text();
}

function setFlightRecordTitle(msg) {
	if ($("#record_name_field").length <= 0) return;

	$("#record_name_field").val(msg);
}


function setFlightRecordToView(target, name, fdata) {

	let n_title = name;
	g_b_video_view_visible_state = false;

	if (target == "private") {
		if ("owner" in fdata && userid != fdata.owner) {
			n_title = name + " : " + GET_STRING_CONTENT('shared_record_data_msg');
			if ("owner_email" in fdata) {
				n_title = name + " : " + GET_STRING_CONTENT('shared_record_data_msg') + " / " + fdata.owner_email;
			}
		}
	}
	else {
		if ("owner_email" in fdata) {
			n_title = name + " / " + fdata.owner_email;
		}
	}

	if ("memo" in fdata && isSet(fdata.memo)) {
		$("#memoTextarea").val(fdata.memo);
	}

	if ("tag_values" in fdata && isSet(fdata.tag_values)) {
		if (target == "private") {
			$("#tagTextarea").val(fdata.tag_values);
		}
		else {
			$("#tagTextarea").hide();
			let targetList = (target == "public" ? "public" : "");
			try {
				let tagArray = JSON.parse(fdata.tag_values);
				let appendRow = "";
				tagArray.forEach(function (tg) {
					appendRow = appendRow + "<a href=" + g_array_cur_controller_for_viewmode["pilot"] + "?page_action=" + targetList + "recordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
				});
				$("#tagArrayarea").html(appendRow);
			}
			catch (e) {
			}
		}
	}

	if (target == "private") {
		let input = document.querySelector('input[name=tagTextarea]');
		new Tagify(input);
	}

	if ((target == "private") && ("sharedList" in fdata)) {
		$("#btnForPublic").show();

		let sharedList = fdata.sharedList;
		let link_text = "";
		let user_text = "";
		sharedList.some(function (item, index, array) {
			let premail = item.email;
			if (item.email == "public@duni.io") {
				premail = GET_STRING_CONTENT('all_member_msg');
				$("#btnForPublic").hide();
			}

			if (item.type == "user") {
				user_text += ("<div id='shareid_" + index + "'> " + premail + " : <a href='#' id='user_share_" + index + "'>" + GET_STRING_CONTENT('stop_share_label') + "</a><hr size=1 color=#efefef width=100%></div>");
			}
		});

		$("#shared_user").html(user_text);
		$("#shared_link").html(link_text);

		sharedList.some(function (item, index, array) {
			let premail = item.email;
			if (item.email == "public@duni.io") {
				premail = GET_STRING_CONTENT('all_member_msg');
			}

			$("#user_share_" + index).click(function (e) {
				e.preventDefault();

				showAskDialog(
					GET_STRING_CONTENT('modal_title'),
					premail + " : " + GET_STRING_CONTENT('msg_are_you_sure'),
					GET_STRING_CONTENT('stop_share_label'),
					false,
					function () { stopShareFlightData(index, name, item.target); },
					function () { }
				);
			});
		});
	}

	$("#btnForUpdateTitle").click(function (e) {
		e.preventDefault();

		GATAGM('detail_update_title_btn_click', 'CONTENT');

		if ("sharedList" in fdata && isSet(fdata.sharedList) && fdata.sharedList.length > 0) {
			showAlert(GET_STRING_CONTENT('msg_stop_share_before_remove'));
			return;
		}

		setFlightRecordTitleName();
	});

	$("#btnForDelete").click(function (e) {
		e.preventDefault();

		GATAGM('detail_delete_btn_click', 'CONTENT');

		if ("sharedList" in fdata && isSet(fdata.sharedList) && fdata.sharedList.length > 0) {
			showAlert(GET_STRING_CONTENT('msg_stop_share_before_remove'));
			return;
		}

		showAskDialog(
			GET_STRING_CONTENT('modal_title'),
			fdata.name + " : " + GET_STRING_CONTENT('msg_are_you_sure'),
			GET_STRING_CONTENT('msg_remove'),
			false,
			function () {
				setTimeout(function () {
					deleteFlightData(name, -1);
				}, 800);
			},
			function () { }
		);
	});

	$("#btnForPublic").click(function (e) {
		e.preventDefault();

		GATAGM('detail_public_btn_click', 'CONTENT');
		showAskDialog(
			GET_STRING_CONTENT('modal_title'),
			GET_STRING_CONTENT('msg_sure_for_public'),
			GET_STRING_CONTENT('modal_confirm_btn'),
			false,
			function (email) {
				makeShareFlightData(fdata.name, "public");
			},
			function () { }
		);
	});

	$("#btnForSharing").click(function (e) {
		e.preventDefault();

		GATAGM('detail_sharing_btn_click', 'CONTENT');

		showAskDialog(
			GET_STRING_CONTENT('modal_title'),
			GET_STRING_CONTENT('msg_input_member_email'),
			GET_STRING_CONTENT('modal_confirm_btn'),
			true,
			function (email) {
				makeShareFlightData(fdata.name, email);
			},
			function () { }
		);
	});

	$("#flightMemoBtn").click(function (e) {
		e.preventDefault();

		GATAGM('detail_memo_btn_click', 'CONTENT');
		updateFlightMemoWithValue(name, $("#memoTextarea").val());
	});

	$("#flightTagBtn").click(function (e) {
		e.preventDefault();

		GATAGM('detail_tag_btn_click', 'CONTENT');
		updateFlightTagWithValue(name, $("#tagTextarea").val());
	});

	if ("youtube_data_id" in fdata) {
		if (fdata.youtube_data_id.indexOf("youtube") >= 0) {
			setYoutubePlayerForDetaileView(fdata.youtube_data_id);
		}
		else {
			setYoutubePlayerForDetaileView("");
		}

		$("#videoRecordModifyArea").hide();
	}
	else {
		$("#youTubePlayer").hide();
	}

	hideMovieDataSet();

	if (target == "public") {
		$("#modifyBtnForMovieData").hide();
		$("#btnForSharing").hide();
		$("#btnForPublic").hide();
		$("#btnForSetYoutubeID").hide();
		$("#flightMemoBtn").hide();
		$("#btnForUpdateTitle").hide();
		$("#btnForDelete").hide();
		$("#recordDataSet").hide();
		$("#flightTagBtn").hide();
		$("#adjustDsecField").hide();
		$("#tagTextarea").prop("disabled", true);
		$("#memoTextarea").prop("disabled", true);
		hideMovieDataSet();
	}
	else {
		if (target == "private") {
			if (("isowner" in fdata && fdata.isowner == true) || !("isowner" in fdata)) {
				$("#btnForSharing").show();
			}

			$("#btnForDelete").show();
			$("#btnForUpdateTitle").show();

			if (!isSet(fdata.flat)) {
				$("#recordDataSet").show();
			}
		}
	}

	addObjectTo2DMapWithGPS(0, "private", "drone", fdata.flat * 1, fdata.flng * 1);
	addObjectTo3DMapWithGPS(0, "private", "drone", fdata.flat * 1, fdata.flng * 1, 1500);
	moveToPositionOnMap("private", 0, fdata.flat * 1, fdata.flng * 1, 1500, 0, 0, 0);

	let exist_data = addFlightRecordDataToView(fdata.data, false);
	if (exist_data == false) {
		$("#map_area").hide();
		$("#altitude_graph_area").hide();
		$("#no_record_data_view").show();
	}
	else {
		$("#no_record_data_view").hide();
		g_cur_str_flight_rec_fid = fdata.fid;
	}

	if (isSet(fdata.cada)) {
		setAddressAndCada("#map_address", fdata.address, fdata.cada, g_vector_2D_mainmap_for_cada);
	}
	else {
		let dpoint = ol.proj.fromLonLat([fdata.flng, fdata.flat]);
		drawCadastral("#map_address", name, dpoint[0], dpoint[1], g_vector_2D_mainmap_for_cada);
	}
}


function showDataWithName(target, target_key, name) {
	let userid = getCookie("dev_user_id");
	let jdata = { "action": "position", "daction": "download_spe", "name": encodeURI(name), "clientid": userid, "target_email": target_key };

	if (target == "public") {
		jdata['public'] = true;
	}

	showLoader();

	setFlightRecordTitle(name);
	g_str_cur_flight_record_name = name;

	$("#btnForPublic").hide();
	$("#btnForDelete").hide();
	$("#btnForUpdateTitle").hide();

	ajaxRequest(jdata, function (r) {

		if (r.result != "success") {
			showAlert(GET_STRING_CONTENT('msg_error_sorry'));
			hideLoader();
			return;
		}

		let fdata = r.data;
		setFlightRecordToView(target, name, fdata);

		hideLoader();

	}, function (request, status, error) {
		hideLoader();
		monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
	});
}

function mergeFlightRecordToView(fdata) {
	addFlightRecordDataToView(fdata.data, false);
	showAlert(GET_STRING_CONTENT('msg_success'));
}


//# sourceURL=record_detail.js