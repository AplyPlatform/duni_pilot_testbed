﻿/* Copyright 2021 APLY Inc. All rights reserved. */

"use strict";

let g_b_monitor_started;
let g_b_phonenumber_verified = false;
let g_b_interval_timer = -1;

let g_cur_2D_mainmap;
let g_view_cur_2D_mainmap;
let g_array_point_cur_2D_mainmap_for_object;
let g_array_icon_cur_2D_mainmap_for_object;
let g_vector_2D_mainmap_for_cada;
let g_vector_2D_mainmap_for_object;
let g_vector_2D_mainmap_for_lines;
let g_vector_2D_mainmap_for_design_icon;

let g_array_design_data;
let g_array_flight_rec = [];

let g_cur_str_flight_rec_fid;

let g_layer_2D_map_for_line;
let g_layer_2D_map_for_icon;

let g_more_key_for_data;

let g_b_kalman_filter_on = false;
let g_b_3D_map_on = true;
let g_b_video_view_visible_state = false;

let g_array_altitude_data_for_chart = [];

let g_i_appended_data_count = 0;

let g_youtube_player_for_detail_view = null;
let g_str_youtube_data_id_for_detail_view;

let g_str_cur_flight_record_name = "";

let g_b_is_token_visible = false;

let g_loc_address_flat = -999, g_loc_address_flng = -999;
let g_b_fileupload_for_DJI = true; //dji file or input address


let g_loc_kalmanfilter_lat;
let g_loc_kalmanfilter_lng;
let g_loc_kalmanfilter_alt;
let g_loc_kalmanfilter_yaw;
let g_loc_kalmanfilter_pitch;
let g_loc_kalmanfilter_roll;

let g_b_is_first_for_monitor = true;

let g_array_cur_monitor_object;

let g_component_upload_youtube_video;

let g_b_is_youtube_seek = false;

// 유튜브 약관 준수 - 동시에 2개 이상의 영상이 재생되면 안된다!
let g_array_youtube_players = [];
let g_i_youtube_player_index = null;
let g_i_youtube_player_index_stop = null;
let g_i_youtube_player_index_play = null;

let g_str_address_temp_val = "";

let g_params_for_upload_flight_rec = {};

let g_array_str_waypointactions_DJI = ["STAY", "START_TAKE_PHOTO", "START_RECORD", "STOP_RECORD", "ROTATE_AIRCRAFT", "GIMBAL_PITCH", "NONE", "CAMERA_ZOOM", "CAMERA_FOCUS"];

let g_array_cur_controller_for_viewmode = { "pilot" : "/center/main.html", "developer" : "/center/main_dev.html" };

let recordFileForUploadFile = null;
let videoFileForUploadFile = null;

$(function () {
		let lang = getCookie("language");
    if (isSet(lang))
        g_str_cur_lang = lang;


		if (askToken() == false) {
      showAskDialog(
          GET_STRING_CONTENT('modal_title'),
          GET_STRING_CONTENT('msg_do_login'),
          GET_STRING_CONTENT('modal_confirm_btn'),
          false,
          function () {
          	setTimeout(function () {
					        		goIndex("");
					        	}, 500);
          },
          null
      );
      return;
  	}

    mixpanel.identify(getCookie("dev_user_id"));

    let image_url = getCookie("image_url");
    if (image_url == "") $('#profile_image').hide();
    else $('#profile_image').attr("src", image_url);

    setViewMode();
    setCommonText();
    initPilotCenter();

    //사이드바 기본 접기
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
	  $('.sidebar .collapse').collapse('hide');
});

function setCurrentViewMode() {
	let segments = window.location.pathname.split('/');
	let toDelete = [];
	for (let i = 0; i < segments.length; i++) {
	    if (segments[i].length < 1) {
	        toDelete.push(i);
	    }
	}
	for (let i = 0; i < toDelete.length; i++) {
	    segments.splice(i, 1);
	}
	let filename = segments[segments.length - 1];

	if (isSet(filename) && filename.indexOf("main_dev.html") >= 0) {
		g_str_cur_viewmode = "developer";
	}
	else {
		g_str_cur_viewmode = "pilot";
	}

	/* 앱에서 접속하면 상단, 사이드, 하단의 메뉴와 푸터 감추기 */
	// --[
	let from = getCookie("user_from");
	if (from == "app") {
		$("#sideTopBar").hide();
		$("#accordionSidebar").hide();
		$("#footerArea").hide();
		if ($("#titleSection").length)
			$("#titleSection").hide();
	}
	// ]--
}

function setViewMode() {
	setCurrentViewMode();

	$('#view_mode_selector').off('click');

	if(g_str_cur_viewmode == "") g_str_cur_viewmode = "pilot";

	if(g_str_cur_viewmode == "pilot") {
		$('#view_mode_selector').click(function(e){
			e.preventDefault();

			setCookie("viewmode", "developer", 1);
			GATAGM('developer_view_link_click', 'MEMU');
			location.href = "/center/main_dev.html?page_action=center";
		});
	}
	else {

		$('#view_mode_selector').click(function(e){
			e.preventDefault();

			setCookie("viewmode", "pilot", 1);
			GATAGM('pilot_view_link_click', 'MEMU');
			location.href = "/center/main.html?page_action=center";
		});
	}
}

function setCommonText() {
    if (g_str_cur_viewmode == "developer") {
    	$('#side_menu_dev').text(GET_STRING_CONTENT('side_menu_dev'));
    	$('#side_menu_lab').text(GET_STRING_CONTENT('side_menu_lab'));
    	$('#side_menu_links_apis').text(GET_STRING_CONTENT('side_menu_links_apis'));
    	$('#side_menu_links_dev').text(GET_STRING_CONTENT('side_menu_links_dev'));
    	$('#side_menu_links_samples').text(GET_STRING_CONTENT('side_menu_links_samples'));
    	$('#side_menu_links_codes').text(GET_STRING_CONTENT('side_menu_links_codes'));
    	$('#side_menu_flight_plan').text(GET_STRING_CONTENT('side_menu_flight_plan'));
    	$('#side_menu_flight_plan_design').text(GET_STRING_CONTENT('side_menu_flight_plan_design'));
    	$('#side_menu_flight_plan_list').text(GET_STRING_CONTENT('side_menu_flight_plan_list'));
    	$('#side_menu_flight_plan_mon').text(GET_STRING_CONTENT('side_menu_flight_plan_mon'));

    	$('#top_menu_token').text(GET_STRING_CONTENT('top_menu_token'));
			$("#view_mode_selector").text(GET_STRING_CONTENT('mode_pilot_label'));
			$("#droneplaytoken_view").val(getCookie("dev_token"));
    }
    else {
    	$("#view_mode_selector").text(GET_STRING_CONTENT('mode_developer_label'));
    	$('#side_menu_flight_record').text(GET_STRING_CONTENT('side_menu_flight_record'));
	    $('#side_menu_flight_record_upload').text(GET_STRING_CONTENT('side_menu_flight_record_upload'));
	    $('#side_menu_flight_record_list').text(GET_STRING_CONTENT('side_menu_flight_record_list'));
	    $('#side_menu_flight_record_public_list').text(GET_STRING_CONTENT('side_menu_flight_record_public_list'));
	    $('#side_menu_compass_embed').text(GET_STRING_CONTENT('side_menu_flight_record_embed_compass'));
    }

    $('#contact_us_bottom_label').text(GET_STRING_CONTENT('side_menu_qa'));
    $('#contact_us_bottom_label').attr("href", "/contact" + (g_str_cur_lang == "KR" ? "" : "_EN") + ".html");
    $('#top_menu_contact').attr("href", "/contact" + (g_str_cur_lang == "KR" ? "" : "_EN") + ".html");

    $('#menu_left_top_title_label').text(GET_STRING_CONTENT('menu_left_top_title_label'));

    $('#side_menu_dashboard').text(GET_STRING_CONTENT('side_menu_dashboard'));
    $('#side_menu_qa').text(GET_STRING_CONTENT('side_menu_qa'));
    $('#side_menu_links').text(GET_STRING_CONTENT('side_menu_links'));
    $('#side_menu_links_comm').text(GET_STRING_CONTENT('side_menu_links_comm'));
    $('#side_menu_links_blog').text(GET_STRING_CONTENT('side_menu_links_blog'));

    $('#top_menu_logout').text(GET_STRING_CONTENT('top_menu_logout'));
    $('#contact_field').text(GET_STRING_CONTENT('top_menu_contact_field'));

    $('#askModalCancelButton').text(GET_STRING_CONTENT('msg_cancel'));
}

function setLogoutBtn() {
    $('#btnLogout').click(function (e) {
    		e.preventDefault();

        GATAGM('logout_topmenu_btn_click', 'MEMU');

        showAskDialog(
            GET_STRING_CONTENT('modal_title'),
            GET_STRING_CONTENT('msg_are_you_sure'),
            GET_STRING_CONTENT('top_menu_logout'),
            false,
            function () { setTimeout("logOut()", 100); },
            null
        );
    });
}

function centerPageInit() {
	let loadPage = "center.html";

	if (g_str_cur_viewmode == "developer") {
			loadPage = "center_dev.html";
	}

  $("#main_contents").load(loadPage, function () {
      flightRecords2DMapInit();
      centerInit();
  });

  $("#dashboard_menu").addClass("active");
}

function initPilotCenter() {
    g_array_flight_rec = [];
    setLogoutBtn();
    showLoader();

    g_str_page_action = getQueryVariable("page_action");

    if (!isSet(g_str_page_action)) {
    		g_str_page_action = "center";
    }

    if (g_str_page_action == "center") {
    		centerPageInit();
    }
    else if (g_str_page_action == "user_info") {
        $("#main_contents").load("user_info.html", function () { });
    }
    else if (g_str_page_action == "missiondesign") {
        $("#main_contents").load("mission_design.html", function () {
            designInit();
        });
    }
    else if (g_str_page_action == "missiongen") {
        $("#main_contents").load("mission_gen.html", function () {
            missionGenInit();
        });
    }
    else if (g_str_page_action == "missionlist") {
        $("#main_contents").load("mission_list.html", function () {
            missionListInit();
        });
    }
    else if (g_str_page_action == "monitor") {
        $("#main_contents").load("monitor.html", function () {
            monitorInit();
        });
    }
    else if (g_str_page_action == "partner_register") {
    		if (getCookie("user_kind") == "partner") {
    			showAskDialog(
			          GET_STRING_CONTENT('modal_title'),
			          "이미 파트너 신청을 완료 하셨습니다.",
			          GET_STRING_CONTENT('modal_confirm_btn'),
			          false,
			          function () {
			          	 location.href = g_array_cur_controller_for_viewmode["pilot"] + "?page_action=center";
			          	 return;
			          },
			          null
			      );
    			return;
    		}

        $("#main_contents").load("partner_register.html", function () { });
    }
    else if (g_str_page_action == "recordupload") {
        $("#main_contents").load("record_upload.html", function () {
            flightrecordUploadInit();
        });
    }
    else if (g_str_page_action == "embedcompass") {
        $("#main_contents").load("embed_compass.html", function () { });
    }
    else if (g_str_page_action == "recordlist") {
    		g_str_current_target = "private";
        $("#main_contents").load("record_list.html", function () {            
            flightrecordListInit("private");
        });
    }
    else if (g_str_page_action == "publicrecordlist") {
    		g_str_current_target = "public";
        $("#main_contents").load("record_list.html", function () {
            selectMonitorIndex("private", 0);
            addObjectTo2DMap(0, "private", "drone");            
            flightrecordListInit("public");
        });
    }
    else if (g_str_page_action == "publicrecordlist_detail") {
    		g_str_current_target = "public";
        $("#main_contents").load("record_detail.html", function () { });
    }
    else if (g_str_page_action == "recordlist_detail") {
    		g_str_current_target = "private";
        $("#main_contents").load("record_detail.html", function () { });
    }
    else if (g_str_page_action == "summary_list") {
        $("#main_contents").load("record_list_summary.html", function () {
           flightRecords2DMapInit();
           flightrecordsListSummaryInit("private");
        });
    }
    else if (g_str_page_action == "summary") {
        $("#main_contents").load("summary.html", function () {
            summaryInit();
        });
    }
    else if (g_str_page_action == "util") {
        $("#main_contents").load("util.html", function () {
            utilInit();
        });
    }
    else {
    		showAlert(GET_STRING_CONTENT('msg_error'));
    		centerPageInit();
    }

    //한국, 파트너 아닌 대상만 파트너 가입
    if (getCookie("user_kind") != "partner" && g_str_cur_lang == "KR"){
    	$("#partner_register_top_menu").show();
    }
    else {
    	$("#partner_register_top_menu").hide();
    }
}


function utilInit() {
		$("#latxlng").keypress(function (e) {
        if (e.which == 13){
                   requestAddress();  // 실행할 이벤트
        }
    });

		hideLoader();
}

function summaryInit() {
    document.title = GET_STRING_CONTENT('page_center_title');

    getAllRecordCount();
}


function centerInit() {
    document.title = GET_STRING_CONTENT('page_center_title');

    if (g_str_cur_viewmode == "developer") {
        $('#head_title').html(GET_STRING_CONTENT('head_developer_title'));
        $('#page_about_title').html(GET_STRING_CONTENT('center_about_developer_title'));
        $('#page_about_content').html(GET_STRING_CONTENT('center_about_developer_content'));
        $('#dev_token_title').text(GET_STRING_CONTENT('top_menu_token'));
        $("#show_token").text(GET_STRING_CONTENT('msg_show_token'));
        $("#droneplaytoken_view_section").val(getCookie("dev_token"));
        $("#droneplaytoken_view_section").hide();
        $("#show_token").click(function(e){
        	e.preventDefault();

        	if (g_b_is_token_visible) {
        		GATAGM('show_token_link_click', 'CONTENT');

        		$("#droneplaytoken_view_section").hide();
        		$("#show_token").text(GET_STRING_CONTENT('msg_show_token'));
        	}
        	else {
        		GATAGM('hide_token_link_click', 'CONTENT');
        		$("#droneplaytoken_view_section").show();
        		$("#show_token").text(GET_STRING_CONTENT('msg_hide_token'));
        	}

        	g_b_is_token_visible = !g_b_is_token_visible;
        });
    }
    else {
        $('#head_title').html(GET_STRING_CONTENT('head_pilot_title'));
        $('#page_about_title').html(GET_STRING_CONTENT('center_about_pilot_title'));
        $('#page_about_content').html(GET_STRING_CONTENT('center_about_pilot_content'));
    }

    $('#msg_notice').text(GET_STRING_CONTENT('msg_notice'));
    $('#center_example_title').html(GET_STRING_CONTENT('center_example_title'));
    $('#data_title').text("'" + getCookie("user_email") + "'" + GET_STRING_CONTENT('data_count_msg'));

    $("#r_count_label").text(GET_STRING_CONTENT("r_count_label"));
    $("#f_count_label").text(GET_STRING_CONTENT("f_count_label"));
    $("#a_time_label").text(GET_STRING_CONTENT("a_time_label"));
    $("#a_time_min_label").text(GET_STRING_CONTENT("a_time_min_label"));

    $("#badge_nickname").attr("placeholder", GET_STRING_CONTENT('badge_nickname_label'));
    $("#badge_code_label").text(GET_STRING_CONTENT("badge_code_label"));
    $("#help_label").text(GET_STRING_CONTENT("help_label"));
    $("#badgeHelpContent").text(GET_STRING_CONTENT("badgeHelpContent"));

    $("#open_record_label").text(GET_STRING_CONTENT("open_record_label"));
    $("#more_label").text(GET_STRING_CONTENT("more_label"));

    $("#dev_token_title").text(GET_STRING_CONTENT("dev_token_title"));

		$("#label_duni_service_request_list").text(GET_STRING_CONTENT("label_duni_service_request_list"));
		$("#label_duni_service_request_list_content").text(GET_STRING_CONTENT("label_duni_service_request_list_content"));

    $("#open_company_label").text(GET_STRING_CONTENT("title_for_company_flightlist"));
    $("#title_history_chkbox").text(GET_STRING_CONTENT("title_history_chkbox"));
    $("#title_company_chkbox").text(GET_STRING_CONTENT("title_company_chkbox"));

    getRecordCount();
    g_str_current_target = "public";
    initYoutubeAPIForFlightList();

		$("#chkFlightHistory").change(function(){
			showFlightRecordsList($("#chkFlightHistory").is(":checked"));
	  });

	  $("#chkCompany").change(function(){
			showCompanyList($("#chkCompany").is(":checked"));
	  });

    getCompanyList();
    getDUNIServiceRequest(1);
}


function designInit() {
		map2DInit();
    selectMonitorIndex("private", 0);
    addObjectTo2DMap(0, "private", "drone");

    g_array_design_data = [];

    document.title = GET_STRING_CONTENT('page_mission_design_title');
    $("#head_title").text(document.title);

    $('#page_about_title').text(GET_STRING_CONTENT('page_mission_design_title'));
    $('#page_about_content').text(GET_STRING_CONTENT('design_about_content'));
    $('#msg_tracker').text(GET_STRING_CONTENT('msg_tracker'));
    $('#map_kind_label').text(GET_STRING_CONTENT('map_kind_label'));
    $('#go_index_direct_label').text(GET_STRING_CONTENT('go_index_direct_label'));
    $('#btnForRegistMission').text(GET_STRING_CONTENT('btnForRegistMission'));
    $('#btnForClearMission').text(GET_STRING_CONTENT('btnForClearMission'));
    $('#removeItemBtn').text(GET_STRING_CONTENT('msg_remove'));
    $('#saveItemBtn').text(GET_STRING_CONTENT('msg_apply'));
    $('#help_label').text(GET_STRING_CONTENT('help_label'));
    $('#Aerial_label').text(GET_STRING_CONTENT('Aerial_label'));
    $('#Aerial_label_label').text(GET_STRING_CONTENT('Aerial_label_label'));
    $('#Road_label').text(GET_STRING_CONTENT('Road_label'));
		$('#Road_detail').text(GET_STRING_CONTENT('Road_detail_label'));

    $('#roll_label').text(GET_STRING_CONTENT('roll_label'));
    $('#pitch_label').text(GET_STRING_CONTENT('pitch_label'));
    $('#yaw_label').text(GET_STRING_CONTENT('yaw_label'));

    $('#latitude_label').text(GET_STRING_CONTENT('latitude_label'));
    $('#longitude_label').text(GET_STRING_CONTENT('longitude_label'));
    $('#altitude_label').text(GET_STRING_CONTENT('altitude_label'));
    $('#action_label').text(GET_STRING_CONTENT('action_label'));
    $('#speed_label').text(GET_STRING_CONTENT('speed_label'));

    initSliderForDesign(1);

    g_cur_2D_mainmap.on('click', function (evt) {
        GATAGM('design_map_click', 'CONTENT');

        let feature = g_cur_2D_mainmap.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                return feature;
            });

        if (feature) {
            let ii = feature.get('mindex');
            if (!isSet(ii)) return;

            setDataToDesignView(ii);

            let item = g_array_design_data[ii];
            setMoveActionFromMap(ii, item);
            return;
        }

        let lonLat = ol.proj.toLonLat(evt.coordinate);
        appendDataToDesignTable(lonLat);
    });

    let mission_name = decodeURIComponent(getQueryVariable("mission_name"));

    if (isSet(mission_name) && mission_name != "") {
        mission_name = mission_name.split('&')[0];
        setMissionDataToDesignView(mission_name);
    }
    else {

        let posLayer = new ol.layer.Vector({
            source: g_vector_2D_mainmap_for_design_icon
        });

        g_cur_2D_mainmap.addLayer(posLayer);

        hideLoader();
    }


    $('#saveItemBtn').off('click');
    $('#saveItemBtn').click(function (e) {
    		e.preventDefault();

        GATAGM('design_save_item_btn_click', 'CONTENT');
        saveDesignData(0);
    });

    $('#btnForRegistMission').off('click');
    $('#btnForRegistMission').click(function (e) {
        GATAGM('design_register_btn_click', 'CONTENT');
        askMissionNameForDesignRegister();
    });

    $('#btnForClearMission').off('click');
    $('#btnForClearMission').click(function (e) {
        GATAGM('design_clear_btn_click', 'CONTENT');
        askClearCurrentDesign();
    });

    $('#btnForSearchAddress').off('click');
    $('#btnForSearchAddress').click(function (e) {
        GATAGM('design_search_btn_click', 'CONTENT');
        searchCurrentBrowserAddress();
    });
}




function missionGenInit() {
		selectMonitorIndex("private", 0);
		map2DInit();
		addObjectTo2DMap(0, "private", "drone");

		g_array_design_data = [];

		$('#btnForGenMissionByAddress').click(function (e) {
				e.preventDefault();

        GATAGM('design_gen_mission_by_address_btn_click', 'CONTENT');

        genPlanByAddress($('#gen_address').val());
    });

    $('#btnForGenMissionByGPS').click(function (e) {
    		e.preventDefault();

        GATAGM('design_gen_mission_by_gps_btn_click', 'CONTENT');

        genPlanByGPS($('#lat').val() * 1, $('#lng').val() * 1);
    });

    $('#btnForRegistMission').off('click');
    $('#btnForRegistMission').click(function (e) {
    		e.preventDefault();

        GATAGM('design_register_btn_click', 'CONTENT');
        askMissionNameForDesignRegister();
    });

    hideLoader();
}



function verifyPhoneCodeCommonSuccessCallback(data) {
	g_b_phonenumber_verified = true;
  $('#verification_code').val("");
  $('#validate_phonenumber_area').hide();
  $("#code_verification_input").hide();
  setCookie("temp_phone", $('#user_phonenumber').val(), 1);
	showAlert(GET_STRING_CONTENT('msg_phone_verified'));
	if (g_b_interval_timer >= 0)
		clearInterval(g_b_interval_timer);
  $('#auth_code').val(data.auth_code);
}


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


    $('#btnForUploadFlightList').click(function (e) {
    		e.preventDefault();

        GATAGM('upload_record_upload_btn_click', 'CONTENT');

        uploadCheckBeforeUploadFlightList();
    });

    $("#address_input_data").keypress(function (e) {
        if (e.which == 13){
            GATAGM('upload_address_input_enter_key', 'CONTENT');
            // 상세주소
        		checkAddress($("#address_input_data").val());
        }
    });

    $('#btnForAddressCheck').click(function (e) {
    		e.preventDefault();

        GATAGM('upload_address_check_btn_click', 'CONTENT');
        checkAddress($("#address_input_data").val());
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

    $("#salecheck").click(function(e){
						let checked = $("#salecheck").is(":checked");
            let userid = getCookie("dev_user_id");

						if(checked){
											GATAGM('upload_salecheck_show_btn_click', 'CONTENT');
			                $("#priceinputarea").show();
			                $("#validate_phonenumber_area").hide();
			                // check if user has verfied phoen number
			                let jdata = {
			                    "action": "position",
			                    "daction": "check_phonenumber_exists",
			                    "clientid": userid
			                };
			                ajaxRequest(jdata, function(r){
			                        if(r.result_code === 0){
			                            $("#validate_phonenumber_area").show();
			                            showAlert(GET_STRING_CONTENT('msg_phone_vid_not_verified'));
			                            g_b_phonenumber_verified = false;
			                            return;
			                        }
			                        if(r.result_code === 3){
			                            $("#validate_phonenumber_area").hide();
			                            return;
			                        }
			                        showAlert(GET_STRING_CONTENT('msg_error_sorry'));
			                        return
			                    },
			                    function (request, status, error) {
			                        showAlert(GET_STRING_CONTENT("msg_error_sorry") + " : " + error);
			                    }
			                );

			            }
						else{
											GATAGM('upload_salecheck_hide_btn_click', 'CONTENT');
			                $("#priceinputarea").hide();
			                g_b_phonenumber_verified = true;
			      }
		});

    let input = document.querySelector('input[name=tagTextarea]');
		new Tagify(input);

    $("#address_input_data").on("change keyup paste", function() {
		    let currentVal = $(this).val();
		    if(currentVal == g_str_address_temp_val) return;

		    g_str_address_temp_val = currentVal;
		    g_loc_address_flat = -999;
		    g_loc_address_flng = -999;
		});


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

    	g_params_for_upload_flight_rec['youtube_data'] = "https://youtube.com/watch?v=" + vid;

    	hideLoader();

    	if (g_b_fileupload_for_DJI == true) {
    		askIsSyncData(g_params_for_upload_flight_rec, uploadDJIFlightListCallback);
    		return;
    	}

    	saveYoutubeUrl(g_params_for_upload_flight_rec, function(bSuccess) {
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

  	let d = new Date();
  	let retDateTime = makeDateTimeFormat(d, true);

		$("#flighttime_input_data").val(retDateTime);

  	$("#set_youtube_address_view").hide();
    $("#set_youtube_upload_view").show();

    let dropArea = $("#dropArea");
		dropArea.on("drag dragstart dragend dragover dragenter dragleave drop", function(e) {
			e.stopPropagation();
			e.preventDefault();
		})
		.on("dragover dragenter", function() {
			dropArea.css('background-color', '#E3F2FC');
			$("#file_upload_img").show();
			$("#file_drop_img").hide();
			$("#selectFileArea").hide();
			$("#label_or_directly").hide();
		})
		.on('dragleave dragend drop', function() {
			dropArea.css('background-color', '#FFFFFF');
			$("#file_upload_img").hide();
			$("#file_drop_img").show();
			$("#selectFileArea").show();
			$("#label_or_directly").show();
		})
		.on('drop', function(e) {
			GATAGM('upload_file_drop', 'CONTENT');
			let retSelected = fileDropCheckRecordUpload(e.originalEvent.dataTransfer.files);
			if (retSelected == 2) setUploadFileFields();
			else if (retSelected == 1) $("#btnNextStage").attr('disabled', false);
			else $("#btnNextStage").attr('disabled', true);
		});

		$("#btnNextStage").click(function(e) {
			e.preventDefault();

			GATAGM('upload_next_stage_btn_click', 'CONTENT');
			$("#nextStageBtnArea").hide();
			setUploadFileFields();
		});

		$("#label_youtube_address_only").click(function(e) {
			e.preventDefault();

			GATAGM('upload_youtube_address_only_link_click', 'CONTENT');
			$("#nextStageBtnArea").hide();
			$("#set_youtube_address_view").show();
      $("#set_youtube_upload_view").hide();
      $("#video_upload_kind_sel").show();
      $('input:radio[name=media_upload_kind]:input[value=tab_menu_set_youtube_address]').attr("checked", true);
			setUploadFileFields();
		});

		$("#input_direct_file").bind('change', function() {
			GATAGM('upload_direct_file_select_btn_click', 'CONTENT');
			let retSelected = fileDropCheckRecordUpload(this.files);
			if (retSelected == 2) setUploadFileFields();
			else if (retSelected == 1) $("#btnNextStage").attr('disabled', false);
			else $("#btnNextStage").attr('disabled', true);
		});

		$("#movieFile").bind('change', function() {
			GATAGM('upload_movie_file_select_btn_click', 'CONTENT');
			videoFileForUploadFile = null;
			let retSelected = fileDropCheckRecordUpload(this.files);
		});

		$("#flight_record_file").bind('change', function() {
			GATAGM('upload_record_file_select_btn_click', 'CONTENT');
			recordFileForUploadFile = null;
			let retSelected = fileDropCheckRecordUpload(this.files);
		});

		$("#input_direct_file").click(function() {
			$(this).attr("value", "");
			$("#input_direct_file").val("");
		});

		$("#movieFile").click(function() {
			$(this).attr("value", "");
			$("#movieFile").val("");
		});

		$("#flight_record_file").click(function() {
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

    let yearSelect = document.querySelector('#year');
    let monthSelect = document.querySelector('#month');
    let daySelect = document.querySelector('#day');
    let hourSelect = document.querySelector('#hour');
    let minuteSelect = document.querySelector('#minute');

    // hide fallback initially
    fallbackPicker.style.display = 'none';

    // test whether a new datetime-local input falls back to a text input or not
    let test = document.createElement('input');

    try {
    test.type = 'datetime-local';
    } catch (e) {
    console.log(e.description);
    }

    // if it does, run the code inside the if() {} block
    if(test.type === 'text') {
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


function fileDropCheckRecordUpload(files) {
	if (files.length > 2) {
		showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
		return 0;
	}

	if (files.length == 2) {
		if (isSet(recordFileForUploadFile) || isSet(videoFileForUploadFile)) {
			showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
			return 0;
		}
	}

	let isAdded = false;
	for(let i = 0; i < files.length; i++) {
		let file = files[i];

		if (isRecordFile(file.name)) {
			if (isSet(recordFileForUploadFile)) {
				showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
				return 0;
			}
			else {
				recordFileForUploadFile = file;
				previewForRecordFile(file);
				isAdded = true;
			}
		}

		if (isMovieFile(file.name)) {
			if (isSet(videoFileForUploadFile)) {
				showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
				return 0;
			}
			else {
				videoFileForUploadFile = file;
				previewForRecordFile(file);
				isAdded = true;
			}
		}
	}

	if (isAdded == 0) {
		showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
		return 0;
	}

	if (isSet(recordFileForUploadFile) && isSet(videoFileForUploadFile)) {
		return 2;
	}

	return 1;
}


function previewForRecordFile(file) {
	let iconArea;
	let vDiv;
	if(isMovieFile(file.name)) {
		$("#selectMovieFileArea").css("display","none");
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

		$("#file_data_remover_video1").on("click", function(e) {
			$("#videoFileName").empty();
			$("#thumbnail_video").remove();
			videoFileForUploadFile = null;
			$("#selectMovieFileArea").show();
			$("#video_upload_kind_sel").show();
		});

		$("#file_data_remover_video2").on("click", function(e) {
			$("#videoFileName").empty();
			$("#thumbnail_video").remove();
			videoFileForUploadFile = null;
			$("#selectMovieFileArea").show();
			$("#video_upload_kind_sel").show();
		});

		$("#video_upload_kind_sel").hide();
	}
	else {
		$("#selectDJIFileArea").css("display","none");
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

		$("#file_data_remover_record1").on("click", function(e) {
			$("#flightRecordFileName").empty();
			$("#thumbnail_record").remove();
			recordFileForUploadFile = null;
			$("#selectDJIFileArea").show();
			$("#dji_file_upload_sel").show();
			$("#dji_file_get_howto").show();
		});

		$("#file_data_remover_record2").on("click", function(e) {
			$("#flightRecordFileName").empty();
			$("#thumbnail_record").remove();
			recordFileForUploadFile = null;
			$("#selectDJIFileArea").show();
			$("#dji_file_upload_sel").show();
			$("#dji_file_get_howto").show();
		});

		$("#dji_file_upload_sel").hide();
		$("#dji_file_get_howto").hide();
	}
}



function monitorInit() {
		map2DInit();
    map3DInit();

    g_b_monitor_started = false;
    g_b_kalman_filter_on = false;

    document.title = GET_STRING_CONTENT('page_monitor_title');
    $("#head_title").text(document.title);

    $('#page_about_title').text(GET_STRING_CONTENT('page_monitor_title'));
    $('#page_about_content').text(GET_STRING_CONTENT('monitor_about_content'));
    $('#map_kind_label').text(GET_STRING_CONTENT('map_kind_label'));
    $("#altitude_label").text(GET_STRING_CONTENT('altitude_label'));

    $('#roll_label').text(GET_STRING_CONTENT('roll_label'));
    $('#pitch_label').text(GET_STRING_CONTENT('pitch_label'));
    $('#yaw_label').text(GET_STRING_CONTENT('yaw_label'));

    $("#youtube_url_label").text(GET_STRING_CONTENT('youtube_url_label'));
    $("#btnForSetYoutubeID").text(GET_STRING_CONTENT('msg_apply'));
    $("#monitor_target_label").text(GET_STRING_CONTENT('monitor_target_label'));

    $("#modifyBtnForMovieData").text(GET_STRING_CONTENT('modifyBtnForMovieData'));

    $('#Aerial_label').text(GET_STRING_CONTENT('Aerial_label'));
    $('#Aerial_label_label').text(GET_STRING_CONTENT('Aerial_label_label'));
    $('#Road_label').text(GET_STRING_CONTENT('Road_label'));
		$('#Road_detail').text(GET_STRING_CONTENT('Road_detail_label'));

    $("#btnForFilter").hide();
    $("#btnForFilter").text(GET_STRING_CONTENT('btnForFilter'));
    $("#btnForFilter").click(function (e) {
    		e.preventDefault();
        GATAGM('monitor_filter_btn_click', 'CONTENT');
        setMonFilter();
    });

    $("#btnStartMon").text(GET_STRING_CONTENT('btnStartMon'));
    $("#btnStartMon").click(function (e) {
    		e.preventDefault();
        GATAGM('monitor_start_btn_click', 'CONTENT');
        startMon();
    });

    $('#btnForSetYoutubeID').click(function (e) {
    		e.preventDefault();
        GATAGM('monitor_set_youtube_btn_click', 'CONTENT');
        setYoutubeID();
    });

    g_b_video_view_visible_state = true;
    showMovieDataSet();

    drawLineGraph();
    hideLoader();
}


function flightrecordListInit(target) {

    if (target == "public") {
        document.title = GET_STRING_CONTENT('page_flight_rec_public_view_title');
        $('#page_about_title').text(GET_STRING_CONTENT('page_flight_rec_public_view_title'));
        $('#page_about_content').text(GET_STRING_CONTENT('record_public_list_about_content'));
    }
    else {
        document.title = GET_STRING_CONTENT('page_flight_rec_view_title');
        $('#page_about_title').text(GET_STRING_CONTENT('page_flight_rec_view_title'));
        $('#page_about_content').text(GET_STRING_CONTENT('record_list_about_content'));
    }

    $("#head_title").text(document.title);

    $("#btnForLoadFlightList").text(GET_STRING_CONTENT('btnForLoadFlightList'));

    $("#name_label").text(GET_STRING_CONTENT('name_label'));
    $("#date_label").text(GET_STRING_CONTENT('date_label'));
    $("#manage_label").text(GET_STRING_CONTENT('manage_label'));
    
    flightRecords2DMapInit();

    $("#search_key").attr("placeholder", GET_STRING_CONTENT('msg_record_search_key'));

		$("#search_key").keypress(function(e) {
        if (e.which == 13){
        		GATAGM('list_search_input_enter_key_' + $("#search_key").val(), 'CONTENT');
        		searchFlightRecord(target, $("#search_key").val());
        }
    });

    $("#btnForSearchFlightRecord").click(function (e) {
    		e.preventDefault();

    		GATAGM('list_search_btn_click', 'CONTENT');
        searchFlightRecord(target, $("#search_key").val());
    });

    $('#btnForLoadFlightList').click(function (e) {
    		e.preventDefault();

    		GATAGM('list_load_more_btn_click', 'CONTENT');
        getFlightRecords(target, "");
    });

    $('#loadMoreArea').hide();
    
    initYoutubeAPIForFlightList();
}


function flightrecordsListSummaryInit(target) {

    document.title = GET_STRING_CONTENT('page_flight_rec_view_title');
    $('#page_about_title').text(GET_STRING_CONTENT('page_flight_rec_view_title'));
    $('#page_about_content').text(GET_STRING_CONTENT('record_list_about_content'));

    $("#head_title").text(document.title);

    $("#btnForLoadFlightList").text(GET_STRING_CONTENT('btnForLoadFlightList'));

    $("#name_label").text(GET_STRING_CONTENT('name_label'));
    $("#date_label").text(GET_STRING_CONTENT('date_label'));
    $("#manage_label").text(GET_STRING_CONTENT('manage_label'));

    $("#search_key").attr("placeholder", GET_STRING_CONTENT('msg_record_search_key'));

    $("#btnForSearchFlightRecord").click(function (e) {
    		e.preventDefault();

        GATAGM('summary_search_btn_click', 'CONTENT');

        searchFlightRecord(target, $("#search_key").val());
    });

    $('#btnForLoadFlightList').click(function (e) {
    		e.preventDefault();

        GATAGM('summary_load_more_btn_click', 'CONTENT');
        getFlightRecords(target, "");
    });

    $('#loadMoreArea').hide();

    g_str_current_target = target;
    initYoutubeAPIForFlightList();
}

function initYoutubeAPIForFlightList() {
		let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function missionListInit() {

    document.title = GET_STRING_CONTENT('page_list_title');
    $("#head_title").text(document.title);

    $("#page_about_title").text(GET_STRING_CONTENT('page_list_title'));
    $("#page_about_content").text(GET_STRING_CONTENT('mission_about_content'));
    $("#name_label").text(GET_STRING_CONTENT('name_label'));
    $("#status_label").text(GET_STRING_CONTENT('status_label'));
    $("#date_label").text(GET_STRING_CONTENT('date_label'));
    $("#manage_label").text(GET_STRING_CONTENT('manage_label'));
    $("#btnForGetMissionList").text(GET_STRING_CONTENT('btnForGetMissionList'));
    $("#search_key").attr("placeholder", GET_STRING_CONTENT('msg_mission_search_key'));

    $('#btnForSearchMission').click(function (e) {
    		e.preventDefault();

        GATAGM('mission_list_search_btn_click', 'CONTENT');
        searchMission($("#search_key").val());
    });

    $('#btnForGetMissionList').click(function (e) {
    		e.preventDefault();

        GATAGM('mission_list_load_more_btn_click', 'CONTENT');
        getMissionList();
    });

    $('#btnForGetMissionList').hide();
    getMissionList();
}

function askParnterRequestExt() {
	showAskDialog(
          GET_STRING_CONTENT('modal_title'),
          GET_STRING_CONTENT('msg_you_are_not_partner'),
          GET_STRING_CONTENT('modal_yes_btn'),
          false,
          function () {
          	 location.href = g_array_cur_controller_for_viewmode["pilot"] + "?page_action=partner_register";
          	 return;
          },
          function () {}
      );
}

function requestDUNIServiceRequest(r_id, index) {
		GATAGM('center_request_service_btn_click_' + r_id, 'CONTENT');

		let userid = getCookie("dev_user_id");
    let jdata = { "action": "util", "daction": "duni_service_bet", "clientid": userid, "r_id" : (r_id * 1) };

		showLoader();

  	ajaxRequest(jdata, function (r) {
  		hideLoader();

	    if(r.result == "success") {
				showAlert(GET_STRING_CONTENT('msg_request_is_accepted'));

				$("#request_duni_" + index).empty();
				$("#request_duni_" + index).text(GET_STRING_CONTENT('msg_accepted'));
	    }
	    else {
	    	if(r.result_code == 6) {
	    		setTimeout("askParnterRequestExt()", 300);
          return;
	    	}

	    	showAlert(GET_STRING_CONTENT('msg_error_sorry'));
	    }
	  },
	  	function(request,status,error) {
	  		hideLoader();
	  		showAlert(GET_STRING_CONTENT('msg_error_sorry'));
	  });
}

let curServiceListTimerId = -1;
function getDUNIServiceRequest(page) {
		let userid = getCookie("dev_user_id");
    let jdata = { "action": "util", "daction": "duni_service_request_list", "clientid": userid, "page" : page };

		showLoader();

  	ajaxRequest(jdata, function (r) {
	    if(r.result == "success") {
	    	hideLoader();

	      if (r.data == null || r.data.length == 0) {
	      	$("#duni_service_request_list").html("No request");
	        return;
	      }

	      $("#duni_service_request_list").empty();
	      $("#duni_service_request_list").append("<table class='table' id='service_request_list_table'><thead><tr><th scope='col' class='text-center'>#</th><th scope='col' class='text-center'>" + GET_STRING_CONTENT('label_service') + "</th><th scope='col' class='text-center'>" + GET_STRING_CONTENT('label_location') + "</th><th scope='col' class='text-center'>" + GET_STRING_CONTENT('label_status') + "</th></tr></thead><tbody></tbody></table>");

				let retData = r.data;

				let allcount = r.allcount * 1;
				let cur_page = r.page * 1;

				retData.forEach(function(d, index, arr) {

					let htmlString = "<tr><th scope='row' class='text-center'>" + (index + 1) + "</th><td class='text-center'>" + d.kind + "</td><td class='text-center'>" + d.title + "</td><td class='text-center'><div id='request_duni_" + index + "'>";

					if (d.status == "P") {
						if (d.requested == true) {
							htmlString += GET_STRING_CONTENT('msg_accepted');
							htmlString += ( "(" + makeDateTimeFormat(new Date(d.requested_time), true) + ")" );
						}
						else {
							htmlString += "<button class='btn btn-info btn-sm' type='button' id='partnerServiceRequest_" + index + "'>";
	            htmlString += (GET_STRING_CONTENT('btnRequest') + "</button>");
	          }
					}
					else if (d.status == "C") {
						htmlString += GET_STRING_CONTENT('msg_closed');
					}
					else if (d.status == "R") {
						htmlString += GET_STRING_CONTENT('msg_on_ready');
					}


					htmlString += "</div></td></tr>";
					$("#service_request_list_table").append(htmlString);

					$("#partnerServiceRequest_" + index).click(function(e) {
							e.preventDefault();

							showAskDialog(
                GET_STRING_CONTENT('modal_title'),
                GET_STRING_CONTENT('msg_are_you_sure'),
                GET_STRING_CONTENT('modal_confirm_btn'),
                false,
                function () {
                		setTimeout("requestDUNIServiceRequest(" + d.r_id + ", " + index + ")", 300);
                	},
                function () {}
            	);
					});
				});

				if (cur_page == 1) {
					if (allcount > 1) {
						$("#duni_service_request_list").append('<div class="row"><div class="col-md-12 text-right"><button type="button" class="btn btn-light" id="service_list_next">more</button></div></div>');

						$("#service_list_next").click(function() {
							cur_page++;
							getDUNIServiceRequest(cur_page);
						});
					}
				}
				else if (cur_page < allcount && allcount > 1) {
					$("#duni_service_request_list").append('<div class="row"><div class="col-md-12 text-right"><button type="button" class="btn btn-light" id="service_list_prev"><</button> <button type="button" class="btn btn-link" id="service_list_next">></button></div></div>');

					$("#service_list_next").click(function() {
							cur_page++;
							getDUNIServiceRequest(cur_page);
					});

					$("#service_list_prev").click(function() {
							cur_page--;
							getDUNIServiceRequest(cur_page);
					});
				}
				else if (cur_page == allcount) {
					$("#duni_service_request_list").append('<div class="row"><div class="col-md-12 text-right"><button type="button" class="btn btn-light" id="service_list_prev">ㅡ</button></div></div>');

					$("#service_list_prev").click(function() {
							cur_page--;
							getDUNIServiceRequest(cur_page);
					});
				}

				startRequestTableAnimation();
	    }
	  },
	  	function(request,status,error) {
	  		$("#duni_service_request_list").html("No request");
	  		hideLoader();
	  });
}

function startRequestTableAnimation() {
	if (curServiceListTimerId >= 0)
			clearTimeout(curServiceListTimerId);

	$("#service_request_list_table tr").each(function(index){
		$(this).css("visibility","hidden");
	});

	$("#service_request_list_table tr").each(function(index){
		//$(this).delay(index*500).show(1000);
		$(this).css({"visibility":"visible", "opacity": 0.0}).delay(index * 500).animate({opacity: 1.0},500);
	});

	setTimeout("startRequestTableAnimation()", 15000);
}

function drawFlightArea() {
		setAddressAndCada("#map_address", fdata.address, fdata.cada, g_vector_2D_mainmap_for_cada);
}

function genPlanByAddress(address) {
		if (isSet(address) == false) {
    		showAlert(GET_STRING_CONTENT('msg_wrong_input'));
        return;
    }

    if (g_str_address_temp_val == address) return;

    g_str_address_temp_val = address;

    let userid = getCookie("dev_user_id");
    let jdata = {"clientid" : userid, "action" : "util", "daction": "gps_by_address", "address" : encodeURI(address)};

		showLoader();
		ajaxRequest(jdata, function (r) {
	    	if(r.result == "success") {
		      if (r.data == null) {
		      	hideLoader();
		      	showAlert(GET_STRING_CONTENT('msg_wrong_input'));
		        return;
		      }

					$('#lat').val(r.data.lat);
					$('#lng').val(r.data.lng);

		     	genPlan(r.data.lat * 1, r.data.lng * 1);
	    	}
	    	else {
	    		hideLoader();
	    		showAlert(GET_STRING_CONTENT('msg_input_corrent_address'));
	    	}
	  	},
	  	function(request,status,error) {
	  		hideLoader();
	  		showAlert(GET_STRING_CONTENT('msg_error_sorry'));
	  });
}

function genPlanByGPS(lat, lng) {
		if (isSet(lat) == false || isSet(lng) == false) {
			showAlert(GET_STRING_CONTENT('msg_wrong_input'));
			return;
		}

		if (g_loc_address_flat == lat && g_loc_address_flng == lng) return;

		g_loc_address_flat = lat;
		g_loc_address_flng = lng;

		let userid = getCookie("dev_user_id");
    let jdata = {"clientid" : userid, "action" : "util", "daction": "address_by_gps", "lat" : lat, "lng" : lng};

    showLoader();
  	ajaxRequest(jdata, function (r) {
	    if(r.result == "success") {

				$("#gen_address").val(r.address);

				genPlan(lat, lng);
	    }
	    else {
	    	showAlert(GET_STRING_CONTENT('msg_wrong_input'));
				hideLoader();
	    }
	  }, function(request,status,error) {
	    hideLoader();
	  });
}


function genPlan(lat, lng) {
		let data =
			[
				{"alt" : 10, "speed" : 1.2, "act" : 0, "actparam" : "0", "lat" : lat, "lng" : lng}, // 2m 고도, 1.5 m/s 속도로 타겟 지점으로 이동
				{"alt" : 10, "speed" : 1.2, "act" : 5, "actparam" : "-89", "lat" : lat, "lng" : lng}, // gimbal_pitch, 직각아래
				{"alt" : 10, "speed" : 1.2, "act" : 4, "actparam" : "0", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 정북
				{"alt" : 10, "speed" : 1.2, "act" : 2, "actparam" : "0", "lat" : lat, "lng" : lng}, // //start_record
				{"alt" : 40, "speed" : 1.2, "act" : 0, "actparam" : "0", "lat" : lat, "lng" : lng}, // //stay // 고도 40m까지 업
				{"alt" : 40, "speed" : 1.2, "act" : 5, "actparam" : "-45", "lat" : lat, "lng" : lng}, // gimbal_pitch, 정면
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "15", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "30", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "45", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "60", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "75", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "90", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "105", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "120", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "135", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "150", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "165", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "180", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "-15", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "-30", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "-45", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "-60", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "-75", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "-90", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "-105", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "-120", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "-135", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "-150", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "-165", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 40, "speed" : 1.2, "act" : 4, "actparam" : "-180", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 180
				{"alt" : 41, "speed" : 1.2, "act" : 4, "actparam" : "0", "lat" : lat, "lng" : lng}, // ROTATE_AIRCRAFT, 정북
				{"alt" : 10, "speed" : 1.2, "act" : 0, "actparam" : "0", "lat" : lat, "lng" : lng}, // 10m 고도
				{"alt" : 10, "speed" : 1.2, "act" : 3, "actparam" : "0", "lat" : lat, "lng" : lng} // stop_record, 촬영 정지
			];

		g_array_design_data = data;

		g_array_design_data.forEach(function(item,index,d) {
			let dt = {"lat" : lat, "lng" : lng, "alt" : item.alt + 500, "dsec" : index};
			g_array_flight_rec.push(dt);
		});

    moveToPositionOnMap("private", 0, lat, lng, 600, 0, 0, 0);

    let dpoint = ol.proj.fromLonLat([lng, lat]);
    drawCadastral(null, null, dpoint[0], dpoint[1], g_vector_2D_mainmap_for_cada);

}

function setUploadFileFields() {
		$('#dropArea').hide();
		$("#nextStageBtnArea").hide();
		$('#uploadfileform').show();
		$('#youtube_address_only_area').hide();
}


function getAllRecordCount() {

    let userid = getCookie("dev_user_id");
    let useremail = getCookie("user_email");
    let jdata = { "action": "position", "daction": "summary", "clientid": userid, "email": useremail };

    showLoader();
    ajaxRequest(jdata, function (r) {
    		hideLoader();

        if (r.result == "success") {
            setSummaryDashBoard(r.b_count, r.record_count, r.mission_count, r.member_count);
        }
        else {
            setSummaryDashBoard(0, 0, 0, 0);
        }
    }, function (request, status, error) {
        setSummaryDashBoard(0, 0, 0, 0);
        hideLoader();
    });
}

function setBadgeView(fdata) {
    if (isSet(fdata) && isSet(fdata.pluginid) && fdata.pluginid != "-") {
        let pluginid = fdata.pluginid;
        let callsign = fdata.callsign;
        $("#btnForBadge").text(GET_STRING_CONTENT('btnForBadge_del'));
        $("#badge_view").show();

        $("#badge_nickname").val(callsign);
        $('#badge_code_iframe').attr('src', window.location.origin + "/plugin/code.html?code=" + pluginid + "&lang=" + g_str_cur_lang + "&parent_url=" + encodeURIComponent(window.location.href));
        $('#badge_code').text("<iframe id=\"badge_frame\" src=\"javascript:void(0)\" scrolling=\"no\" frameborder=\"0\" style=\"border:0;\" allowfullscreen=\"\"  aria-hidden=\"false\" tabindex=\"0\" width=\"100%\" height=\"500\"></iframe><script type=\"text/javascript\">document.getElementById(\"badge_frame\").src = \"" + window.location.origin + "/plugin/code.html?code=" + pluginid + "&parent_url=\" + encodeURIComponent(window.location.href) + \"&lang=" + g_str_cur_lang + "\";</script>");

        $('#btnForBadge').off('click');
        $("#btnForBadge").click(function (e) {
        		e.preventDefault();

            GATAGM('center_delete_badge_btn_click', 'CONTENT');
            showAskDialog(
                GET_STRING_CONTENT('modal_title'),
                GET_STRING_CONTENT('msg_are_you_sure'),
                GET_STRING_CONTENT('btnForBadge_del'),
                false,
                function () { removePlugin(); },
                function () {}
            );
        });
    }
    else {
        $("#btnForBadge").text(GET_STRING_CONTENT('btnForBadge_make'));
        $("#badge_view").hide();

        $('#btnForBadge').off('click');
        $("#btnForBadge").click(function (e) {
        		e.preventDefault();

            GATAGM('center_make_badge_btn_click', 'CONTENT');

            let callsign = $("#badge_nickname").val();

            if (!isSet(callsign)) {
                showAlert(GET_STRING_CONTENT('msg_wrong_input'));
                $("#badge_nickname").focus();
                return;
            }

            generatePlugin(callsign);
        });
    }
}


function removePlugin() {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "position", "daction": "remove_plugin", "clientid": userid };

    showLoader();
    ajaxRequest(jdata, function (r) {
    		hideLoader();

        if (r.result == "success") {
            setBadgeView(null);
        }
        else {
            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        }
    }, function (request, status, error) {
        showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        hideLoader();
    });
}

function generatePlugin(callsign) {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "position", "daction": "make_plugin", "clientid": userid, "callsign": callsign };

    showLoader();
    ajaxRequest(jdata, function (r) {
    		hideLoader();
        if (r.result == "success") {
            setBadgeView(r);
        }
        else {
            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        }
    }, function (request, status, error) {
        showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        hideLoader();
    });
}

function getPublicRecordCount(rcount, mcount, alltime) {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "position", "daction": "public_count", "clientid": userid };

    showLoader();
    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            setDashBoard(rcount, mcount, alltime, r.ercount, r.ealltime);
        }
        else {
            setDashBoard(0, 0, 0, 0, 0, 0);
            setBadgeView(null);
        }

        hideLoader();
    }, function (request, status, error) {
        setDashBoard(0, 0, 0, 0, 0, 0);
        hideLoader();
    });
}

function getRecordCount() {

    let userid = getCookie("dev_user_id");
    let jdata = { "action": "position", "daction": "data_count", "clientid": userid };

    showLoader();
    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            setBadgeView(r);
            getPublicRecordCount(r.record_count, r.mission_count, r.alltime);
        }
        else {
            setDashBoard(0, 0, 0, 0, 0, 0);
            setBadgeView(null);
            hideLoader();
        }
    }, function (request, status, error) {
        setDashBoard(0, 0, 0, 0, 0, 0);
        hideLoader();
    });
}

function setSummaryDashBoard(bcount, rcount, fcount, mcount) {

    if (rcount == 0 && fcount == 0) {
        $("#r_count_label").text(GET_STRING_CONTENT("r_count_label") + " : 0");
        $("#f_count_label").text(GET_STRING_CONTENT("f_count_label") + " : 0");
        rcount = 1;
        fcount = 1;
    }
    else {
        $("#r_count_label").text(GET_STRING_CONTENT("r_count_label") + " : " + rcount);
        $("#f_count_label").text(GET_STRING_CONTENT("f_count_label") + " : " + fcount);
    }

    $("#f_member_count_label").text(mcount);
    $("#b_count_label").text("\uC0DD\uC131\uD55C \uBC30\uC9C0\uC218 : " + bcount);

    // Set new default font family and font color to mimic Bootstrap's default styling
    Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
    Chart.defaults.global.defaultFontColor = '#858796';

    // Pie Chart Example
    let ctx = document.getElementById("myPieChart");
    let myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [GET_STRING_CONTENT("r_count_label"), GET_STRING_CONTENT("f_count_label")],
            datasets: [{
                data: [rcount, fcount],
                backgroundColor: ['#4e73df', '#1cc88a'],
                hoverBackgroundColor: ['#2e59d9', '#17a673'],
                hoverBorderColor: "rgba(234, 236, 244, 1)",
            }],
        },
        options: {
            maintainAspectRatio: false,
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                caretPadding: 10,
            },
            legend: {
                display: false
            },
            cutoutPercentage: 80,
        },
    });
}

function setDashBoard(rcount, fcount, alltime, efcount, ealltime) {
    const coptions = {
        duration: 5,
    };

    let rlabel = new CountUp('r_count_label_time', rcount, coptions);
    if (!rlabel.error) {
        rlabel.start();
    } else {
        console.error(rlabel.error);
    }

    let flabel = new CountUp('f_count_label_time', fcount, coptions);
    if (!flabel.error) {
        flabel.start();
    } else {
        console.error(flabel.error);
    }

    let mmin = Math.round(alltime / 60);
    let emin = Math.round(ealltime / 60);

    let alabel = new CountUp('a_time_label_time', mmin, coptions);
    if (!alabel.error) {
        alabel.start();
    } else {
        console.error(alabel.error);
    }

    let ctx = document.getElementById("myBarChart1");
    let myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [GET_STRING_CONTENT("a_time_label"), GET_STRING_CONTENT("average_alltime_label")],
            datasets: [
                {
                    label: "",
                    hoverBackgroundColor: "#2e59d9",
                    borderColor: "#4e73df",
                    data: [mmin, emin],
                    backgroundColor: ["#8c96bd", "#586ebc"]
                }
            ],
        },
        options: {
            responsive: true,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    display: false, //this will remove all the x-axis grid lines,
                    ticks: {
                        display: false //this will remove only the label
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

    ctx = document.getElementById("myBarChart2");
    myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [GET_STRING_CONTENT("r_count_label"), GET_STRING_CONTENT("average_rcount_label")],
            datasets: [
                {
                    label: "",
                    hoverBackgroundColor: "#2e59d9",
                    borderColor: "#4e73df",
                    data: [rcount, Math.round(efcount)],
                    backgroundColor: ["#7ea8b9", "#529ab8"]
                }
            ],
        },
        options: {
            responsive: true,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    display: false, //this will remove all the x-axis grid lines,
                    ticks: {
                        display: false //this will remove only the label
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}



function initSliderForDesign(i) {

    $('#slider').slider({
        min: 0,
        max: i - 1,
        value: 0,
        step: 1,
        slide: function (event, ui) {
            GATAGM('slider_click', 'CONTENT');

            if (g_array_design_data.length <= 0) {
                return;
            }

            let d = g_array_design_data[ui.value];

            setDataToDesignView(ui.value);

            setMoveActionFromSliderOnMove(ui.value, d);
        }
    });

    $('#goItemBtn').click(function (e) {
    		e.preventDefault();

        GATAGM('slide_go_item_btn_click', 'CONTENT');

        let index = $('#goItemIndex').val();
        if (!isSet(index) || $.isNumeric(index) == false) {
            showAlert("Please input valid value !");
            return;
        }

        index = parseInt(index);

        if (index < 0 || index >= g_array_design_data.length) {
            showAlert("Please input valid value !");
            return;
        }

        let d = g_array_design_data[index];
        $("#slider").slider('value', index);
        setDataToDesignView(index);

        setMoveActionFromSliderOnStop(index, d);
    });
}

function setMissionDataToDesignView(name) {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "mission", "daction": "get_spec", "mname": encodeURI(name), "clientid": userid };

    showLoader();

    $("#mission_name_field").text(name);

    ajaxRequest(jdata, function (r) {
    		hideLoader();
        if (r.result == "success") {

            if (!isSet(r.data.mission) || r.data.mission.length == 0) return;
            g_array_design_data = r.data.mission;
            setDesignTable();
        }
        else {
            showAlert(GET_STRING_CONTENT('msg_no_mission'));
        }
    }, function (request, status, error) {

        monitor(GET_STRING_CONTENT('msg_error_sorry'));
        hideLoader();
    });
}



function addNewIconToDesignMap(i, item) {
    let nIcon = createNewIconFor2DMap(i, item);
    g_vector_2D_mainmap_for_design_icon.addFeature(nIcon);
}

function removeIconOn2DMap(index) {
    g_cur_2D_mainmap.removeLayer(g_layer_2D_map_for_line);
    g_cur_2D_mainmap.removeLayer(posLayerForDesign);

    setDesignTable();
}

function setDesignTable() {
    let i = 0;
    let coordinates = [];

    g_array_design_data.forEach(function (item) {
        addNewIconToDesignMap(i, item);
        coordinates.push(ol.proj.fromLonLat([item.lng * 1, item.lat * 1]));
        i++;
    });

    setDataToDesignView(0);

    $("#slider").slider('option', { min: 0, max: i - 1 });
    setSliderPos(i);

    let lines = new ol.geom.LineString(coordinates);

    g_vector_2D_mainmap_for_lines = new ol.source.Vector({
        features: [new ol.Feature({
            geometry: lines,
            name: 'Line'
        })]
    });

    g_layer_2D_map_for_line = new ol.layer.Vector({
        source: g_vector_2D_mainmap_for_lines,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#00ff00',
                width: 2
            })
        })
    });


    g_layer_2D_map_for_icon = new ol.layer.Vector({
        source: g_vector_2D_mainmap_for_design_icon
    });

    g_cur_2D_mainmap.addLayer(g_layer_2D_map_for_line);
    g_cur_2D_mainmap.addLayer(g_layer_2D_map_for_icon);


    moveToPositionOnMap("private", 0, g_array_design_data[0].lat, g_array_design_data[0].lng, g_array_design_data[0].alt, g_array_design_data[0].yaw, g_array_design_data[0].roll, g_array_design_data[0].pitch);
}


function appendDataToDesignTable(lonLat) {

    let index = g_array_design_data.length;

    if (index <= 0) {
        $("#slider").show();
        $("#dataTable-points").show();
    }

    let data = [];
    data['alt'] = 0;
    data['speed'] = 0;
    data['yaw'] = 0;
    data['pitch'] = 0;
    data['roll'] = 0;
    data['act'] = 0;
    data['actparam'] = "0";
    data['lng'] = lonLat[0];
    data['lat'] = lonLat[1];

    g_array_design_data.push(data);

    $("#slider").slider('option', { min: 0, max: index });
    $("#slider").slider('value', index);

    setDataToDesignView(index);
    addNewIconToDesignMap(index, data);
}


function startMon() {
    if (g_b_monitor_started == true) {
        g_b_monitor_started = false;
        g_b_is_first_for_monitor = true;
        g_array_cur_monitor_object = null;

        g_array_point_cur_2D_mainmap_for_object = null;
        g_array_icon_cur_2D_mainmap_for_object = null;

        remove2dObjects();
        remove3dObjects();

        $("#btnForFilter").hide();
        $("#monitor_target_label").hide();
        $('#btnStartMon').text(GET_STRING_CONTENT('btnStartMon'));
        $("#btnStartMon").removeClass("btn-warning").addClass("btn-primary");
        $("#loader").hide();
    }
    else {
        $("#btnForFilter").show();
        $("#monitor_target_label").show();
        $("#target_objects").empty();
        nextMon();
    }
}


function first3DcameraMove(item) {
    if (!isSet(v3DMapViewer)) return;

    let camera = v3DMapViewer.camera;

    camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            item.lng * 1,
            item.lat * 1,
            item.alt + 100
        ),
        complete: function () {
            setTimeout(function () {
                camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(
                        item.lng * 1,
                        item.lat * 1,
                        item.alt + 100
                    ),
                    orientation: {
                        heading: Cesium.Math.toRadians(200.0),
                        pitch: Cesium.Math.toRadians(-50.0),
                    },
                    easingFunction: Cesium.EasingFunction.LINEAR_NONE,
                });
            }, 2500);
        },
    });
}

function processMon(owner, output) {
    if (!isSet(g_array_cur_monitor_object)) {
        g_array_cur_monitor_object = {};

        g_loc_kalmanfilter_lat = {};
        g_loc_kalmanfilter_lng = {};
        g_loc_kalmanfilter_alt = {};
        g_loc_kalmanfilter_yaw = {};
        g_loc_kalmanfilter_pitch = {};
        g_loc_kalmanfilter_roll = {};
    }

    if (!(owner in g_array_cur_monitor_object)) {
        g_array_cur_monitor_object[owner] = 0;

        g_loc_kalmanfilter_lat[owner] = [];
        g_loc_kalmanfilter_lng[owner] = [];
        g_loc_kalmanfilter_alt[owner] = [];
        g_loc_kalmanfilter_yaw[owner] = [];
        g_loc_kalmanfilter_pitch[owner] = [];
        g_loc_kalmanfilter_roll[owner] = [];

        g_loc_kalmanfilter_lat[owner].push(new KalmanFilter());
        g_loc_kalmanfilter_lng[owner].push(new KalmanFilter());
        g_loc_kalmanfilter_alt[owner].push(new KalmanFilter());
        g_loc_kalmanfilter_yaw[owner].push(new KalmanFilter());
        g_loc_kalmanfilter_pitch[owner].push(new KalmanFilter());
        g_loc_kalmanfilter_roll[owner].push(new KalmanFilter());
    }

    let fobject;
    if ("objects" in output) {
        fobject = output.objects;

        while (g_loc_kalmanfilter_lat[owner].length < fobject.length) {
            g_loc_kalmanfilter_lat[owner].push(new KalmanFilter());
            g_loc_kalmanfilter_lng[owner].push(new KalmanFilter());
            g_loc_kalmanfilter_alt[owner].push(new KalmanFilter());
            g_loc_kalmanfilter_yaw[owner].push(new KalmanFilter());
            g_loc_kalmanfilter_pitch[owner].push(new KalmanFilter());
            g_loc_kalmanfilter_roll[owner].push(new KalmanFilter());
        }

        fobject.forEach(function (item, index) {
            if (g_b_kalman_filter_on) {
                item.lat = g_loc_kalmanfilter_lat[owner][index].filter(item.lat * 1);
                item.lng = g_loc_kalmanfilter_lng[owner][index].filter(item.lng * 1);
                item.alt = g_loc_kalmanfilter_alt[owner][index].filter(item.alt * 1);
                item.yaw = g_loc_kalmanfilter_yaw[owner][index].filter(item.yaw * 1);
                item.pitch = g_loc_kalmanfilter_pitch[owner][index].filter(item.pitch * 1);
                item.roll = g_loc_kalmanfilter_roll[owner][index].filter(item.roll * 1);
            }
            else {
                g_loc_kalmanfilter_lat[owner][index].filter(item.lat * 1);
                g_loc_kalmanfilter_lng[owner][index].filter(item.lng * 1);
                g_loc_kalmanfilter_alt[owner][index].filter(item.alt * 1);
                g_loc_kalmanfilter_yaw[owner][index].filter(item.yaw * 1);
                g_loc_kalmanfilter_pitch[owner][index].filter(item.pitch * 1);
                g_loc_kalmanfilter_roll[owner][index].filter(item.roll * 1);
            }
        });
    }
    else {
        if (g_b_kalman_filter_on) {
            output.lat = g_loc_kalmanfilter_lat[owner][0].filter(output.lat * 1);
            output.lng = g_loc_kalmanfilter_lng[owner][0].filter(output.lng * 1);
            output.alt = g_loc_kalmanfilter_alt[owner][0].filter(output.alt * 1);
            output.yaw = g_loc_kalmanfilter_yaw[owner][0].filter(output.yaw * 1);
            output.pitch = g_loc_kalmanfilter_pitch[owner][0].filter(output.pitch * 1);
            output.roll = g_loc_kalmanfilter_roll[owner][0].filter(output.roll * 1);
        }
        else {
            g_loc_kalmanfilter_lat[owner][0].filter(output.lat * 1);
            g_loc_kalmanfilter_lng[owner][0].filter(output.lng * 1);
            g_loc_kalmanfilter_alt[owner][0].filter(output.alt * 1);
            g_loc_kalmanfilter_yaw[owner][0].filter(output.yaw * 1);
            g_loc_kalmanfilter_pitch[owner][0].filter(output.pitch * 1);
            g_loc_kalmanfilter_roll[owner][0].filter(output.roll * 1);
        }

        fobject = [output];
    }

    if (g_array_cur_monitor_object[owner] == 0) {
        g_array_cur_monitor_object[owner] = fobject.length;

        let replaced_str = owner.replace(/@/g, '_at_');
        replaced_str = replaced_str.replace(/\./g, '_dot_');
        let selectorId = "object_sel_" + replaced_str;
        let selHtml = "<select class='form-control bg-light border-0 small' id='" + selectorId + "' name='" + selectorId + "'></select>";
        $("#target_objects").append(selHtml);

        fobject.forEach(function (item, index) {
            let kind = "drone";
            if ("kind" in item) {
                kind = item.kind;
            }

            $("#" + selectorId).append($("<option>", {
                value: index,
                text: (index + 1) + " : " + kind + " / " + owner
            }));

            if (index == 0) {
                $("#" + selectorId).val(0);
            }

            addObjectTo3DMap((index + 1), owner, kind);
            addObjectTo2DMap((index + 1), owner, kind);
        });


        $("#" + selectorId).on('change', function () {
            selectMonitorIndex(owner, this.value);
        });


        $("#" + selectorId).on("click", function () {
            let sval = $("#" + selectorId + " option:selected").val();
            selectMonitorIndex(owner, sval);
        })
    }

    if (g_b_is_first_for_monitor) {
        g_b_is_first_for_monitor = false;
        selectMonitorIndex(owner, 0);

        if (!isSet(v3DMapViewer))
            nexttour(owner, fobject);
        else {
            first3DcameraMove(fobject[0]);
            fobject.forEach(function (d, index) {
				        moveToPositionOnMap(owner, index, d.lat * 1, d.lng * 1, d.alt, d.yaw, d.roll, d.pitch);
				    });

				    setTimeout(function () {
				        if (g_b_monitor_started == false) return;
				        nextMon();
				    }, 1000);
        }
    }
    else nexttour(owner, fobject);

}

function nextMon() {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "position", "daction": "get", "clientid": userid };

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            g_b_monitor_started = true;
            $("#loader").show();
            $('#btnStartMon').text(GET_STRING_CONTENT('btnStopMon'));
            $("#btnStartMon").removeClass("btn-primary").addClass("btn-warning");

            let output = r.data;
            processMon(r.owner, output);
        }
        else {
            showAlert(GET_STRING_CONTENT('msg_failed_to_get_position'));
            hideLoader();
        }
    }, function (request, status, error) {
        showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        hideLoader();
    });
}

function askToken() {
    let useremail = getCookie("user_email");
    let usertoken = getCookie("user_token");
    let userid = getCookie("dev_user_id");
    if (isSet(useremail) == false || isSet(userid) == false || isSet(usertoken) == false) {
				let page_action = getQueryVariable("page_action");
				if (page_action != "") {
					setCookie("last_action", page_action, 1);
        	return false;
				}
		}

    $("#email_field").text(useremail);

    return true;
}


function getMissionList() {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "mission", "daction": "get", "clientid": userid };

    if (g_more_key_for_data) {
        jdata["morekey"] = g_more_key_for_data;
    }

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            appendMissionList(r.data);

            if (r.morekey) {
                $('#btnForGetMissionList').text(GET_STRING_CONTENT('msg_load_more'));
                g_more_key_for_data = r.morekey;
                $('#btnForGetMissionList').show();
            }
            else {
                $('#btnForGetMissionList').hide(1500);
                g_more_key_for_data = null;
            }
        }
        else {
            if (r.reason == "no data") {
                showAlert(GET_STRING_CONTENT('msg_no_data'));
            }
            else {
                showAlert(GET_STRING_CONTENT('msg_error_sorry'));
            }
        }

        hideLoader();
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}


function appendMissionsToMonitor(mission) {
    if (mission == null) return;
    if (mission.length == 0) return;
    mission.forEach(function (item, index, array) {
        g_i_appended_data_count++;

        let missionid = item['id'];

        if (missionid == null) {
            missionid = "mission-" + g_i_appended_data_count;
        }

        let act = item['act'];

        if (act >= g_array_str_waypointactions_DJI.length) {
            act = 0;
        }

        let appendRow = "<tr class='odd gradeX' id='" + missionid + "'><td>" + g_i_appended_data_count + "</td><td>"
            + "<table border=0 width='100%'><tr><td width='50%' class='center' bgcolor='#eee'>" + item['lat'] + "</td><td width='50%' class='center' bgcolor='#fff'> " + item['lng'] + "</td></tr>"
            + "<tr><td class='center' bgcolor='#eee'>" + item['alt'] + "/" + item['speed'] + "</td><td class='center'>"
            + g_array_str_waypointactions_DJI[act] + "/" + item['actparam']
            + "</td></tr></table>"
            + "</td></tr>"
        $('#monitorTable-points > tbody:last').append(appendRow);
    });
}

function clearDataToDesignTableWithFlightRecord() {

}

function setDataToDesignView(index) {
    if (g_array_design_data.length <= 0) return;

    let lat = g_array_design_data[index].lat;
    let lng = g_array_design_data[index].lng;
    let alt = g_array_design_data[index].alt;
    let yaw = g_array_design_data[index].yaw;
    let roll = g_array_design_data[index].roll;
    let pitch = g_array_design_data[index].pitch;
    let speed = g_array_design_data[index].speed;
    let act = g_array_design_data[index].act;
    let actparam = g_array_design_data[index].actparam;

    $('#tr_index').text(index);
    $('#latdata_index').val(lat);
    $('#lngdata_index').val(lng);
    $('#altdata_index').val(alt);
    $('#rolldata_index').val(roll);
    $('#pitchdata_index').val(pitch);
    $('#yawdata_index').val(yaw);

    $('#speeddata_index').val(speed);
    $('#actiondata_index').val(act).prop("selected", true);
    $('#actionparam_index').val(actparam);

    $('#removeItemBtn').off('click');
    $('#removeItemBtn').click(function (e) {
    		e.preventDefault();

        GATAGM('design_remove_item_btn_click', 'CONTENT');
        removeMissionData(index);
        removeIconOn2DMap(index);
    });

    $('#saveItemBtn').off('click');
    $('#saveItemBtn').click(function (e) {
    		e.preventDefault();

        GATAGM('design_save_item_btn_click', 'CONTENT');
        saveDesignData(index);
    });
}

function saveDesignData(index) {
    if (g_array_design_data.length <= 0) {
        let lng = $('#lngdata_index').val();
        let lat = $('#latdata_index').val();
        appendDataToDesignTable([lng * 1, lat * 1]);
        moveToPositionOnMap("private", 0, lat * 1,
            lng * 1,
            parseFloat($('#altdata_index').val()),
            parseFloat($('#yawdata_index').val()),
            parseFloat($('#rolldata_index').val()),
            parseFloat($('#pitchdata_index').val())
        );
    }

    g_array_design_data[index].lat = parseFloat($('#latdata_index').val());
    g_array_design_data[index].lng = parseFloat($('#lngdata_index').val());
    g_array_design_data[index].alt = parseFloat($('#altdata_index').val());
    g_array_design_data[index].yaw = parseFloat($('#yawdata_index').val());
    g_array_design_data[index].roll = parseFloat($('#rolldata_index').val());
    g_array_design_data[index].pitch = parseFloat($('#pitchdata_index').val());
    g_array_design_data[index].speed = parseFloat($('#speeddata_index').val());
    g_array_design_data[index].act = parseInt($('#actiondata_index').val());
    g_array_design_data[index].actparam = $('#actionparam_index').val() + "";
}

function removeSelectedFeature(selectedFeatureID) {
    let features = g_vector_2D_mainmap_for_cada.getFeatures();

    if (features != null && features.length > 0) {
        for (x in features) {
            let properties = features[x].getProperties();

            let id = properties.id;
            if (id == selectedFeatureID) {
                g_vector_2D_mainmap_for_cada.removeFeature(features[x]);
                break;
            }
        }
    }
}

function removeMissionData(index) {
    g_array_design_data.splice(index, 1);

    removeSelectedFeature(index);

    if (g_array_design_data.length <= 0) {
        $("#slider").hide();
        $("#dataTable-points").hide();
        return;
    }

    let newIndex = g_array_design_data.length - 1;

    setDataToDesignView(newIndex);
    $("#slider").slider('value', newIndex);
    $("#slider").slider('option', { min: 0, max: newIndex });

    moveToPositionOnMap("private", 0, g_array_design_data[newIndex].lat,
        g_array_design_data[newIndex].lng,
        g_array_design_data[newIndex].alt,
        g_array_design_data[newIndex].yaw,
        g_array_design_data[newIndex].roll,
        g_array_design_data[newIndex].pitch);
}

function appendMissionList(data) {
    if (data == null) return;
    if (data.length == 0) return;

		data.sort(function(a, b) { // \uB0B4\uB9BC\uCC28\uC21C
			let regtime_a = convert2data(a.regtime);
			let regtime_b = convert2data(b.regtime);
    	return regtime_b.getTime() - regtime_a.getTime();
		});


    data.forEach(function (item, index, array) {
        let appendRow = "<div class='card shadow mb-4' id='mission_row_" + index + "'><div class='card-body'><div class='row'><div class='col-sm'>"
            + "<a href='" + g_array_cur_controller_for_viewmode["developer"] + "?page_action=missiondesign&mission_name=" + encodeURIComponent(item['name']) + "' class='font-weight-bold mb-1'>"
            + item['name']
            + "</a></div></div><div class='row'><div class='col-sm text-xs font-weight-bold mb-1'>"
            + item['regtime']
            + "</div><div class='col-sm text-xs font-weight-bold mb-1'>"
            + "<a class='btn btn-warning text-xs' href='" + g_array_cur_controller_for_viewmode["developer"] + "?page_action=missiondesign&mission_name=" + encodeURIComponent(item['name']) + "' role='button'>" + GET_STRING_CONTENT('msg_modify') + "</a>&nbsp;"
            + "<button class='btn btn-primary text-xs' type='button' id='missionListBtnForRemove_" + index + "'>"
            + GET_STRING_CONTENT('msg_remove') + "</button></div></div></div></div>";
        $('#dataTable-missions').append(appendRow);

        $('#missionListBtnForRemove_' + index).click(function (e) {
        		e.preventDefault();
            GATAGM('list_mission_remove_btn_click', 'CONTENT');
            askRemoveMissionItem(item['name'], "mission_row_" + index);
        });
    });
}


function ajaxRequestAddress(address, callback, errorcallback) {
    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyANkdJYJ3zKXAjOdPFrhEEeq4M8WETn0-4",
        crossDomain: true,
        cache: false,
        type: "GET",
        success: function (r) {
            callback(r);
        },
        error: function (request, status, error) {
            monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            errorcallback(request, status, error);
        }
    });
}

function searchCurrentBrowserAddress() {
    let query = $('#queryData').val();
    searchAddressToCoordinate(query);
}

// result by latlng coordinate
function searchAddressToCoordinate(address) {
    ajaxRequestAddress(address, function (r) {

        moveToPositionOnMap("private", 0, r['results'][0].geometry.location.lat, r['results'][0].geometry.location.lng, 0, 0, 0, 0);

    }, function (request, status, error) {
        showAlert(GET_STRING_CONTENT('msg_error_sorry'));
    });
}

function askClearCurrentDesign() {
    showAskDialog(
        GET_STRING_CONTENT('modal_title'),
        GET_STRING_CONTENT('msg_are_you_sure'),
        GET_STRING_CONTENT('btnForClearMission'),
        false,
        function () { clearCurrentDesign(); },
        function () {}
    );
}

function clearCurrentDesign() {
    if (isSet(g_vector_2D_mainmap_for_lines))
        g_vector_2D_mainmap_for_lines.clear();

    g_vector_2D_mainmap_for_cada.clear();
    g_vector_2D_mainmap_for_design_icon.clear();
    g_array_design_data = Array();
    $("#dataTable-points").hide();
}


function searchMission(keyword) {
    if (isSet(keyword) == false) {
        showAlert(GET_STRING_CONTENT('msg_wrong_input'));
        return;
    }

    let userid = getCookie("dev_user_id");
    let jdata = { "action": "mission", "daction": "find_mission", "keyword": keyword, "clientid": userid };

    g_more_key_for_data = "";

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {

            $('#dataTable-missions').empty();
            g_i_appended_data_count = 0;

            appendMissionList(r.data);

            if (r.morekey) {
                $('#btnForGetMissionList').text(GET_STRING_CONTENT('msg_load_more'));
                g_more_key_for_data = r.morekey;
            }
            else {
                $('#btnForGetMissionList').hide(1500);
                g_more_key_for_data = null;
            }
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
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function searchFlightRecord(target, keyword) {
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

						if ($('#historyMap').length)
            	$('#historyMap').show();

            g_array_flight_rec = [];
            $('#dataTable-Flight_list').empty();
            g_i_appended_data_count = 0;

            makeFlightRecordsToTable(target, target_key, r.data);
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

function getFlightRecords(target, keyword) {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "position", "daction": "download", "clientid": userid };
    let target_key = $("#target_key").length > 0 ? $("#target_key").val() : "";
    if (target_key != "") {
    		jdata["target_email"] = target_key;
    }

    if (target == "public") {
        jdata['public'] = true;
        let targetId = decodeURIComponent(getQueryVariable("user_email"));
        if (isSet(targetId)) {
        	jdata['owner_email'] = targetId;

        	$('#page_about_title').text(targetId + " : " + GET_STRING_CONTENT('open_record_label'));
        }
    }

		if (isSet(keyword)) {
			jdata['daction'] = "find_record";
		  jdata['keyword'] = keyword;
		}
		else {
			let query_keyword = getQueryVariable("keyword");
			if (isSet(query_keyword)) {
		    let query_decoded_keyword = decodeURIComponent(query_keyword);
		    if (isSet(query_decoded_keyword)) {
		    		jdata['daction'] = "find_record";
		    		jdata['keyword'] = query_decoded_keyword;
		    }
		  }
		}

    if (isSet(g_more_key_for_data)) {
        jdata["morekey"] = g_more_key_for_data;
    }

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

            $('#historyMap').show();

            makeFlightRecordsToTable(target, target_key, r.data);
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

    data.sort(function(a, b) { // \uB0B4\uB9BC\uCC28\uC21C
    	return b.dtimestamp - a.dtimestamp;
		});

    data.forEach(function (item) {
        appendFlightRecordTableForMerge(target, target_key, item);
    });
}


function makeFlightRecordsToTable(target, target_key, data) {
    if (data == null || data.length == 0)
        return;

    data.sort(function(a, b) { // \uB0B4\uB9BC\uCC28\uC21C
    	return b.dtimestamp - a.dtimestamp;
		});

    data.forEach(function (item) {
        appendFlightRecordTable(target, target_key, item);
    });
}


function stopShareFlightData(index, name, target_id) {

    let userid = getCookie("dev_user_id");
    let jdata = { "action": "position", "daction": "stop_share", "name": encodeURI(name), "clientid": userid, "target_id": target_id };

    showLoader();

    ajaxRequest(jdata, function (r) {
        if (r.result != "success") {
            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        }
        else {
            $("#shareid_" + index).hide();
            if (target_id == "public@duni.io") {
                $("#btnForPublic").show();
            }
        }

        hideLoader();
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });

}


function makeShareFlightData(name, user_email) {

    let userid = getCookie("dev_user_id");

    if (user_email == "public")
        user_email = "public@duni.io";

    let jdata = { "action": "position", "daction": "share", "name": encodeURI(name), "clientid": userid, "target": user_email };

    showLoader();

    ajaxRequest(jdata, function (r) {
        if (r.result != "success") {
            if (r.reason == "no user") {
                showAlert(GET_STRING_CONTENT('msg_no_email'));
            }
            else {
                showAlert(GET_STRING_CONTENT('msg_error_sorry'));
            }
        }
        else {
            if ("sharedList" in r) {
                let sharedList = r.sharedList;
                let link_text = "";
                let user_text = "";
                sharedList.some(function (item, index, array) {
                    let premail = item.email;
                    if (item.email == "public@duni.io") {
                        premail = GET_STRING_CONTENT('all_member_msg');
                    }

                    if (item.type == "user") {
                        user_text += ("<div id='shareid_" + index + "'> " + premail + " : <a href='#' id='user_share_" + index + "'>" + GET_STRING_CONTENT('stop_share_label') + "</a><hr size=1 color=#efefef width=100%></div>");
                    }
                });

                $("#shared_user").show();
                $("#shared_user").html(user_text);
                $("#shared_link").html(link_text);

                sharedList.some(function (item, index, array) {
                    let premail = item.email;
                    if (item.email == "public@duni.io") {
                        premail = GET_STRING_CONTENT('all_member_msg');

                        $("#btnForPublic").hide();
                    }

                    $("#user_share_" + index).click(function (e) {
                    		e.preventDefault();

                        showAskDialog(
                            GET_STRING_CONTENT('modal_title'),
                            premail + " : " + GET_STRING_CONTENT('msg_are_you_sure'),
                            GET_STRING_CONTENT('stop_share_label'),
                            false,
                            function () { stopShareFlightData(index, name, item.target); },
                            function () {}
                        );
                    });
                });

                showAlert(GET_STRING_CONTENT("msg_success"));
            }
        }

        hideLoader();
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });

}


function moveToStartPoint3D(lat, lng, alt) {
		if (isSet(v3DMapViewer) == false) return;

		let camera = v3DMapViewer.camera;
		camera.flyTo({
      destination : Cesium.Cartesian3.fromDegrees(lng, lat, alt),
      orientation : {
        heading : Cesium.Math.toRadians(0.0),
        pitch : Cesium.Math.toRadians(-70.0),
      }
    });
}

function makeForFlightListMap(index, flat, flng, hasYoutube) {
    let dpoint = ol.proj.fromLonLat([flng * 1, flat * 1]);

    let c_view = new ol.View({
        center: dpoint,
        zoom: 12
    });

    let vSource = new ol.source.Vector();

    let vVectorLayer = new ol.layer.Vector({
        source: vSource,
        zIndex: 10000,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ff0000',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ff0000'
                })
            })
        })
    });

    let vMap = new ol.Map({
        target: 'map_' + index,
        layers: [
            new ol.layer.Tile({
                preload: 4,
                source: new ol.source.OSM()
            }), vVectorLayer
        ],
        // Improve user experience by loading tiles while animating. Will make
        // animations stutter on mobile or slow devices.
        loadTilesWhileAnimating: true,
        view: c_view
    });

    let icon = createNewIconFor2DMap(index, { lat: flat, lng: flng, alt: 0, hasYoutube : hasYoutube });
    vSource.addFeature(icon);

    return vSource;
}

function updateCadaData(record_name, address, cada_data) {
		if (isSet(record_name) == false
			|| isSet(address) == false
			|| isSet(cada_data) == false) {
				hideLoader();
				return;
		}

    let userid = getCookie("dev_user_id");
    let jdata = { "action": "position", "daction": "set_cada", "clientid": userid, "cada": cada_data, "address": encodeURI(address), "name": encodeURI(record_name) };

    ajaxRequest(jdata, function (r) {

    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function drawCadastral(disp_id, name, x, y, vSource) {
		if (isSet(x) == false || isSet(y) == false) return;

    let userid = getCookie("dev_user_id");
    let jdata = { "action": "position", "daction": "cada", "clientid": userid, "x": x, "y": y };

    ajaxRequest(jdata, function (r) {
        if (r == null || r.data == null || r.data.response.status !== "OK") {
        	hideLoader();
        	return;
        }

				let response = r.data.response;
        let _features = new Array();
        let _addressText = "";

        for (let idx = 0; idx < response.result.featureCollection.features.length; idx++) {
            try {
                let geojson_Feature = response.result.featureCollection.features[idx];
                let geojsonObject = geojson_Feature.geometry;
                let features = (new ol.format.GeoJSON()).readFeatures(geojsonObject);
                for (let i = 0; i < features.length; i++) {
                    try {
                        let feature = features[i];
                        feature["id_"] = geojson_Feature.id;
                        feature["properties"] = {};
                        for (let key in geojson_Feature.properties) {
                            try {
                                let value = geojson_Feature.properties[key];

                                if (_addressText == "" && key == "addr") {
                                    _addressText = value;
                                }

                                feature.values_[key] = value;
                                feature.properties[key] = value;
                            } catch (e) {
                            }
                        }
                        _features.push(feature)
                    } catch (e) {
                    }
                }
            } catch (e) {
            }
        }

        setAddressAndCada(disp_id, _addressText, response.result.featureCollection.features, vSource);
        setAddressAndCada(disp_id, _addressText, response.result.featureCollection.features, g_vector_2D_map_for_flight_rec);

        if (isSet(name))
        	updateCadaData(name, _addressText, response.result.featureCollection.features);

        hideLoader();
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });

}

function appendFlightRecordTable(target, target_key, item) {
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
    if (target == "public") {
        appendRow = appendRow
            + "<a onclick='GATAGM(\"flight_record_title_click_"
            + name + "\", \"CONTENT\");' href='" + g_array_cur_controller_for_viewmode["pilot"] + "?target_key=" + target_key + "&page_action=publicrecordlist_detail&record_name="
            + encodeURIComponent(name) + "'>" + name + "</a>";
    }
    else {
        appendRow = appendRow + "<a onclick='GATAGM(\"flight_record_title_click_" + name + "\", \"CONTENT\");' href='" + g_array_cur_controller_for_viewmode["pilot"] + "?target_key=" + target_key + "&page_action=recordlist_detail&record_name="
            + encodeURIComponent(name) + "'>" + name + "</a>";
    }

    appendRow = appendRow + "</div></div><div class='row'>";//row

    if(isSet(youtube_data_id)) {
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

    if (target == "private") {
    	appendRow = appendRow + "<div class='col-md-2'>";
    	appendRow = appendRow + "<button class='btn btn-primary text-xs btn-block' type='button' id='btnForUpdateMemo_" + curIndex + "'>" + GET_STRING_CONTENT('msg_modify_memo') + "</button></div>";
    }

    appendRow = appendRow + "</div>"; //row

    appendRow = appendRow + "<div class='row'><div class='col-md-12'>";

    if (isSet(tag_values) && tag_values != "") {
    	let targetList = (target == "public" ? "public" : "");
    	try {
	    	let tag_array = JSON.parse(tag_values);
	    	tag_array.forEach(function(tg) {
	    		appendRow = appendRow + "<a href=" + g_array_cur_controller_for_viewmode["pilot"] + "?page_action=" + targetList + "recordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
	    	});
	    }
	    catch(e) {
	    }
    }

    appendRow = appendRow + "</div></div>";
    appendRow = appendRow + "<div class='row'>";

    if (target == "private")
    	appendRow = appendRow + "<div class='col-md-10 text-left'>";
		else
			appendRow = appendRow + "<div class='col-md-12 text-left'>";

    if (isSet(item.starttime)) {
    	appendRow = appendRow + "<span class='text-xs mb-1'>" + GET_STRING_CONTENT('flighttime_input_data_label') + "</span> <span class='text-xs mb-1'>"
    							+ makeDateTimeFormat(new Date(item.starttime), true)
    							+ "<br></span>";
    }

    appendRow = appendRow + "<span class='text-xs mb-1'>" + GET_STRING_CONTENT('registered_datetime_label') + "</span> <span class='text-xs mb-1'>" + dtimestamp + "</span>";
    appendRow = appendRow + "</div>";

    if (target == "private") {
    	appendRow = appendRow + "<div class='col-md-2 text-right'>"
        + "<h6><span class='badge badge-secondary' style='cursor: pointer' id='btnForRemoveFlightData_" + curIndex + "'>" + GET_STRING_CONTENT('msg_remove') + "</span></h6>"
        + "</div>"; //col
    }

    appendRow = appendRow + "</div></div></div>"; //row, card-body, card

    $('#dataTable-Flight_list').append(appendRow);
    $("#owner_email_" + curIndex).hide();

    if (target == "public") {
        if (isSet(owner_email)) {
            let oemail = "<a href='" + g_array_cur_controller_for_viewmode["pilot"] + "?page_action=publicrecordlist&user_email=" + encodeURIComponent(owner_email) + "'>" + owner_email + "</a>";
            $("#owner_email_" + curIndex).show();
            $("#owner_email_" + curIndex).html(oemail);
        }

        $("#memoTextarea_" + curIndex).prop('disabled', true);
    }
    else {
        $('#btnForRemoveFlightData_' + curIndex).click(function (e) {
        		e.preventDefault();

            GATAGM('remove_record_in_list_btn_click', 'CONTENT');
            if (isSet(sharedList) && sharedList.length > 0) {
                showAlert(GET_STRING_CONTENT('msg_stop_share_before_remove'));
            }
            else askDeleteFlightData(name, curIndex);
        });

        $('#btnForUpdateMemo_' + curIndex).click(function (e) {
        		e.preventDefault();

            GATAGM('update_memo_in_list_btn_click', 'CONTENT');
            updateFlightMemo(curIndex);
        });
    }

    $('#map_address_' + curIndex).click(function (e) {
    		e.preventDefault();

        GATAGM('map_address_in_list_link_click', 'CONTENT');
        moveFlightHistoryMap(flat, flng);
    });

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

    if (g_i_appended_data_count < 2 && flat != -999) {
        moveFlightHistoryMap(flat, flng);
    }

    g_i_appended_data_count++;
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

    if(isSet(youtube_data_id)) {
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
	    	tag_array.forEach(function(tg) {
	    		appendRow = appendRow + "<a href=" + g_array_cur_controller_for_viewmode["pilot"] + "?page_action=" + targetList + "recordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
	    	});
	    }
	    catch(e) {
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


    $('#detail_record_list_item_' + curIndex).click(function() {
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
    let jdata = { "action": "position", "daction": "download_spe", "name": encodeURI(name), "clientid": userid, "target_email" : target_key };

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


function populateDays(month) {
  // delete the current set of <option> elements out of the
  // day <select>, ready for the next set to be injected
  while(daySelect.firstChild){
    daySelect.removeChild(daySelect.firstChild);
  }

  // Create letiable to hold new number of days to inject
  let dayNum;

  // 31 or 30 days?
  if(month === 'January' || month === 'March' || month === 'May' || month === 'July' || month === 'August' || month === 'October' || month === 'December') {
    dayNum = 31;
  } else if(month === 'April' || month === 'June' || month === 'September' || month === 'November') {
    dayNum = 30;
  } else {
  // If month is February, calculate whether it is a leap year or not
    let year = yearSelect.value;
    let isLeap = new Date(year, 1, 29).getMonth() == 1;
    isLeap ? dayNum = 29 : dayNum = 28;
  }

  // inject the right number of new <option> elements into the day <select>
  for(i = 1; i <= dayNum; i++) {
    let option = document.createElement('option');
    option.textContent = i;
    daySelect.appendChild(option);
  }

  // if previous day has already been set, set daySelect's value
  // to that day, to avoid the day jumping back to 1 when you
  // change the year
  if(previousDay) {
    daySelect.value = previousDay;

    // If the previous day was set to a high number, say 31, and then
    // you chose a month with less total days in it (e.g. February),
    // this part of the code ensures that the highest day available
    // is selected, rather than showing a blank daySelect
    if(daySelect.value === "") {
      daySelect.value = previousDay - 1;
    }

    if(daySelect.value === "") {
      daySelect.value = previousDay - 2;
    }

    if(daySelect.value === "") {
      daySelect.value = previousDay - 3;
    }
  }
}

function populateYears() {
  // get this year as a number
  let date = new Date();
  let year = date.getFullYear();

  // Make this year, and the 100 years before it available in the year <select>
  for(let i = 0; i <= 100; i++) {
    let option = document.createElement('option');
    option.textContent = year-i;
    yearSelect.appendChild(option);
  }
}

function populateHours() {
  // populate the hours <select> with the 24 hours of the day
  for(let i = 0; i <= 23; i++) {
    let option = document.createElement('option');
    option.textContent = (i < 10) ? ("0" + i) : i;
    hourSelect.appendChild(option);
  }
}

function populateMinutes() {
  // populate the minutes <select> with the 60 hours of each minute
  for(let i = 0; i <= 59; i++) {
    let option = document.createElement('option');
    option.textContent = (i < 10) ? ("0" + i) : i;
    minuteSelect.appendChild(option);
  }
}

function verifyPhoneNo(phone_number){
    let userid = getCookie("dev_user_id");
    // check if phone number starts with 01 and is total of 11 digits
    if((phone_number.length != 11) || phone_number.substring(0,2) !== '01') {
        showAlert(GET_STRING_CONTENT('msg_wrong_phone_format'));
        return;
    }

    // send phone verification
    let jdata = {
        "action": "position",
        "daction" : "validate_phonenumber",
        "phone_number" : phone_number,
        "clientid" : userid
    };

    ajaxRequest(jdata,
        function (data){
            let result = data.result_code;
            clearInterval(interval_timer);
            if(result === 0 || result === 3){ //정상응답 - 존재하는 번호이어도 괜찮음
                showAlert(GET_STRING_CONTENT('msg_verification_code_sent'));
                g_b_phonenumber_verified = false;
                // 인증하기 텍스트 -> 재전송
                $('#btn_verify_code').text("재전송");
                let duration = 60 * 3;
                let display = $('#remaining_time');
                startTimer(duration, display);
                //$('#droneplay_phonenumber').prop( "disabled", true );
                $("#code_verification_input").show();
                return;
            }
            if (result === 2) {
                showAlert(GET_STRING_CONTENT('msg_wrong_phone_format'));
                return;
            }

            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
            return;
        },
        function (err, stat, error) {
            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        }
    );

}

function verifyCode(verification_code, successCallback){
    let userid = getCookie("dev_user_id");
		if(verification_code == ""){
			showAlert(GET_STRING_CONTENT('msg_code_empty'));
			return;
		}

		let jdata = {
                "action" : "position",
                "daction" : "check_verifycode",
                "phone_number" : $('#user_phonenumber').val(),
                "verify_code" : verification_code,
                "clientid" : userid
            };
		ajaxRequest(jdata,
			function(data){

				let result = data.result_code;

				if(result === 0){
					successCallback(data);
				}
				else if(result === 2){
					showAlert(GET_STRING_CONTENT('msg_wrong_verification_code'));
				}
				else if(result === 4){
					showAlert(GET_STRING_CONTENT('msg_phone_verification_timeout'));
					if (g_b_interval_timer >= 0)
						clearInterval(g_b_interval_timer);
				}
				else {
					showAlert(GET_STRING_CONTENT('msg_error_sorry'));
				}

			},
			function (err, stat, error) {
				showAlert(GET_STRING_CONTENT('msg_error_sorry'));
			}
		);
}


function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    g_b_interval_timer = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(minutes + ":" + seconds);

        if (--timer < 0) {
						clearInterval(g_b_interval_timer);
						g_b_interval_timer = -1;
            showAlert(GET_STRING_CONTENT('msg_phone_verification_timeout'));
            $("#code_verification_input").hide();
        }
    }, 1000);
}

function setYoutubeVideo(index, youtube_url) {
		if (isSet(youtube_url) == false) {
				return;
		}

		let vid = getYoutubeQueryVariable(youtube_url);

		if (typeof YT == "undefined") return;

		g_array_youtube_players[index] = new YT.Player("youTubePlayer_" + index, {
      height: '200',
      width: '100%',
      videoId: vid,
      host: 'https://www.youtube.com',
      events: {
        'onReady': onPlayerReadyForList,
        'onStateChange': onPlayerStateChange
      }
    });
}

function onPlayerReadyForList(event) {
  	event.target.stopVideo();
}

function updateFlightMemoWithValue(name, memo) {
    let userid = getCookie("dev_user_id");

    if (!isSet(memo)) {
        showAlert(GET_STRING_CONTENT('msg_fill_memo'));
        return;
    }
    let jdata = { "action": "position", "daction": "set_memo", "clientid": userid, "name": encodeURI(name), "memo": encodeURI(memo) };

    showLoader();
    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result != "success") {
            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        }
        else {
            showAlert(GET_STRING_CONTENT('msg_success'));
        }
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function updateFlightTagWithValue(name, tag_value) {
		let userid = getCookie("dev_user_id");

    if (!isSet(tag_value)) {
        showAlert(GET_STRING_CONTENT('msg_fill_tag'));
        return;
    }
    let jdata = { "action": "position", "daction": "set_tag", "clientid": userid, "name": encodeURI(name), "tag_values": encodeURI(tag_value) };

    showLoader();
    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result != "success") {
            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        }
        else {
            showAlert(GET_STRING_CONTENT('msg_success'));
        }
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function updateFlightMemo(index) {
    let item = g_array_flight_rec[index];

    let userid = getCookie("dev_user_id");

    let memo = $("#memoTextarea_" + index).val();

    if (!isSet(memo)) {
        showAlert(GET_STRING_CONTENT('msg_fill_memo'));
        return;
    }
    let jdata = { "action": "position", "daction": "set_memo", "clientid": userid, "name": encodeURI(item.name), "memo": encodeURI(memo) };

    showLoader();
    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result != "success") {
            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        }
        else {
            showAlert(GET_STRING_CONTENT('msg_success'));
        }
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function askDeleteFlightData(name, index) {
    showAskDialog(
        GET_STRING_CONTENT('modal_title'),
        name + " : " + GET_STRING_CONTENT('msg_are_you_sure'),
        GET_STRING_CONTENT('msg_remove'),
        false,
        function () {
        	setTimeout(function () { deleteFlightData(name, index); }, 1000);
        },
        function () {}
    );
}

function deleteFlightData(name, index) {

    let userid = getCookie("dev_user_id");
    let jdata = { "action": "position", "daction": "delete", "clientid": userid, "name": encodeURI(name) };

    showLoader();
    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result != "success") {
            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        }
        else {
        		if (index >= 0)
            	removeTableRow("flight-list-" + index);
            else {
            	showAskDialog(
					        GET_STRING_CONTENT('modal_title'),
					        GET_STRING_CONTENT('msg_success'),
					        GET_STRING_CONTENT('modal_confirm_btn'),
					        false,
					        function () {
					        	setTimeout(function () {
					        		location.href = g_array_cur_controller_for_viewmode["pilot"] + "?page_action=recordlist";
					        	}, 800);
					        },
					        null
					    );
            }
        }
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}


function askRemoveMissionItem(name, trname) {
    showAskDialog(
        GET_STRING_CONTENT('modal_title'),
        name + " : " + GET_STRING_CONTENT('msg_are_you_sure'),
        GET_STRING_CONTENT('msg_remove'),
        false,
        function () {
        	setTimeout(function () { removeMissionItem(name, trname); }, 1000);
        },
        function () {}
    );
}
function removeMissionItem(name, trname) {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "mission", "mname": encodeURI(name), "daction": "delete", "clientid": userid };

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            $("#" + trname).hide();
        }
        else {
            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        }
    }, function (request, status, error) { });
}

function monitor(msg) {
    let info = $('#monitor').html("<font color=red><b>" + msg + "</b></font>");
}

function askMissionNameForDesignRegister() {
    showAskDialog(
        GET_STRING_CONTENT('modal_title'),
        GET_STRING_CONTENT('msg_input_mission_name'),
        GET_STRING_CONTENT('modal_confirm_btn'),
        true,
        function (mname) {
            setTimeout(function () { askSpeedForDesignRegister(mname); }, 1000);
        },
        function () {}
    );
}

function askSpeedForDesignRegister(mname) {
    showAskDialog(
        GET_STRING_CONTENT('modal_title'),
        GET_STRING_CONTENT('msg_input_speed'),
        GET_STRING_CONTENT('modal_confirm_btn'),
        true,
        function (mspeed) {
            if (parseFloat(mspeed) <= 0.0) {
                showAlert(GET_STRING_CONTENT('msg_wrong_input'));
                return;
            }
            setTimeout(function () { registerMission(mname, mspeed); }, 1000);
        },
        function () {}
    );
}

function registerMission(mname, mspeed) {
    if (g_array_design_data.length <= 0) {
        showAlert(GET_STRING_CONTENT('msg_wrong_input'));
        return;
    }

    let nPositions = [];
    let bError = 0;
    for (let index = 0; index < g_array_design_data.length; index++) {
        let item = g_array_design_data[index];

        if (item.act == undefined || item.act === ""
            || item.lat == undefined || item.lat === ""
            || item.lng == undefined || item.lng === ""
            || item.alt == undefined || item.alt === ""
            //|| item.speed == undefined || item.speed === ""
            //|| item.pitch == undefined || item.pitch === ""
            //|| item.roll == undefined || item.roll === ""
            //|| item.yaw == undefined || item.yaw === ""
            || item.actparam == undefined || item.actparam === "") {
            monitor(GET_STRING_CONTENT('msg_error_index_pre') + (index) + GET_STRING_CONTENT('msg_error_index_post'));
            bError++;
            return;
        }

        let mid = "mid-" + index;
        nPositions.push({ id: mid, lat: item.lat, lng: item.lng, alt: item.alt, act: item.act, actparam: item.actparam, speed: item.speed, roll: item.roll, pitch: item.pitch, yaw: item.yaw });
    }

    if (bError > 0) {
        showAlert(GET_STRING_CONTENT('msg_error_check'));
        return;
    }

    let userid = getCookie("dev_user_id");
    let jdata = { "action": "mission", "mname": encodeURI(mname), "daction": "set", "missionspeed": mspeed, "missiondata": nPositions, "clientid": userid };

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
				    showAskDialog(
					        GET_STRING_CONTENT('modal_title'),
					        mname + " (" + mspeed + "m/s) : " + GET_STRING_CONTENT('msg_success'),
					        GET_STRING_CONTENT('modal_confirm_btn'),
					        false,
					        function () {
					        	setTimeout(function () {
					        		location.href = g_array_cur_controller_for_viewmode["developer"] + "?page_action=missionlist";
					        	}, 800);
					        },
					        null
					   );

        }
        else {
            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        }
    }, function (request, status, error) { });
}





function nexttour(owner, fobject) {

    fobject.forEach(function (item, index) {
        addChartItem(g_i_appended_data_count, item);
        moveToPositionOnMap(owner, index, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
    });

    g_i_appended_data_count++;
    window.myLine.update();

    setTimeout(function () {
        if (g_b_monitor_started == false) return;
        nextMon();
    }, 2500);
}



function uploadFlightList(isUpdate) {
		let mname = $("#record_name_field").val();

		if (mname == "") {
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
					hideLoader();
					return;
				}
    }

    let params = {};
    let price = 0;

   	if (isUpdate == false && g_str_cur_lang == "KR") {
    	let checked = $("#salecheck").is(":checked");
			if(checked) {
				let t_p = $("#price_input_data").val();
				if (t_p == "") {
					showAlert("영상의 판매를 원하시면 판매 희망 가격을 입력해 주세요.");
					hideLoader();
					return;
				}

				if (youtube_data == "") {
					showAlert("영상의 판매를 원하시면 판매하실 원본영상의 유튜브 URL을 입력해 주세요.");
					hideLoader();
					return;
				}

				price = t_p * 1;
			}
    }

    if (g_b_fileupload_for_DJI == true) {
    	if (isSet(recordFileForUploadFile) == false) {
    		showAlert(GET_STRING_CONTENT('msg_select_file'));
    		return;
    	}

			let record_kind = "dji";
			if (getFileExtension(recordFileForUploadFile.name).toUpperCase() == "CSV") {
				record_kind = "litchi";
			}

    	if (isSet(youtube_data)) {
    		params = {file: recordFileForUploadFile, record_kind : record_kind, mname : mname, mmemo : mmemo, price: price, tag_values : tag_values, youtube_data : youtube_data, isUpdate : isUpdate};
    		askIsSyncData(params, uploadDJIFlightListCallback);
    		return;
    	}

    	showLoader();

    	params = {file : recordFileForUploadFile, record_kind : record_kind, mname : mname, mmemo: mmemo, price: price, tag_values : tag_values, youtube_data : youtube_data, isUpdate : isUpdate, isSyncData : false};
      getBase64(params, uploadDJIFlightListCallback);
      return;
    }

    if (isUpdate == true || youtube_data == "") {
    	showAlert(GET_STRING_CONTENT('msg_select_any_file'));
    }
    else {
    	if (g_loc_address_flat == -999) {
    			showAlert(GET_STRING_CONTENT('msg_input_corrent_address'));
    			return;
    	}

    	let flightTime = $("#flighttime_input_data").val();
    	if (flightTime == "") {
    			showAlert(GET_STRING_CONTENT('msg_wrong_input') + " : 촬영일시");
    			return;
    	}

    	let startTime = Date.parse(flightTime);
    	if (isNaN(startTime)) {
		    	showAlert(GET_STRING_CONTENT('msg_wrong_input') + " : 촬영일시");
    			return;
    	}

    	// var uTime = new Date();
    	// uTime.setTime(fTime);
			// uTime.setHours(uTime.getHours() - 9);
			// startTime = uTime.getTime();

    	youtube_data = massageYotubeUrl(youtube_data);

	    params = {mname : mname, mmemo: mmemo, price: price, tag_values : tag_values, youtube_data : youtube_data, flat: g_loc_address_flat, flng: g_loc_address_flng, startTime : startTime};

    	saveYoutubeUrl(params, function(bSuccess) {
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
    let jdata = { "action": "position", "daction": "convert",
    	"clientid": userid, "name": encodeURI(params.mname),
    	"youtube_data_id": youtube_data,
    	"update" : params.isUpdate,
    	"sync" : params.isSyncData,
    	"price" : params.price,
			"record_kind" : params.record_kind,
    	"tag_values" : encodeURI(params.tag_values),
    	"memo" : encodeURI(params.mmemo),
    	"recordfile": params.base64file };

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
            	GATAGM('dji_file_upload_analyze_failed', 'CONTENT');
            	if (r.reason.indexOf("failed to decode") >= 0) {
            		showAlert(GET_STRING_CONTENT('msg_select_another_file'));
            	}
            	else {
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



function saveYoutubeUrl(params, callback) {

    let userid = getCookie("dev_user_id");
    let jdata = { "action": "position", "daction": "youtube", "youtube_data_id": params.youtube_data, "clientid": userid, "name": encodeURI(params.mname), "tag_values" : params.tag_values, "memo" : params.mmemo, "starttime" : params.startTime };

    if (params.flat != -999) {
    		jdata["flat"] = params.flat;
    		jdata["flng"] = params.flng;
    }

    if (params.price > 0) {
    		jdata["price"] = params.price;
    }

    showLoader();
    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result == "success") {
        	if (callback) callback(true);
        }
        else {
        	if (callback) callback(false);
        }
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        if (callback) callback(false);
    });
}

function hideMovieDataSet() {
    $('#movieDataSet').hide();
    $('#modifyBtnForMovieData').text(GET_STRING_CONTENT('msg_modify_youtube_data'));

    $('#modifyBtnForMovieData').off('click');
    $('#modifyBtnForMovieData').click(function (e) {
    		e.preventDefault();

        GATAGM('detail_modify_show_click', 'CONTENT');
        showMovieDataSet();
    });

}

function showMovieDataSet() {
    $('#movieDataSet').show();
    $('#modifyBtnForMovieData').text(GET_STRING_CONTENT('msg_close_youtube_data'));

    $('#modifyBtnForMovieData').off('click');
    $('#modifyBtnForMovieData').click(function (e) {
    		e.preventDefault();

				GATAGM('detail_modify_hide_click', 'CONTENT');
        hideMovieDataSet();
    });
}


function setYoutubeID() {
    let data_id = $('#youtube_url_data').val();
    if (data_id == "") {
        showAlert(GET_STRING_CONTENT('msg_wrong_input'));
        return;
    }

    let youtube_data = massageYotubeUrl(data_id);

    let mmemo = $("#memoTextarea").val();

    let tag_values = $("#tagTextarea").val();

    if (youtube_data.indexOf("youtube") >= 0) {
        setYoutubePlayerForDetaileView(youtube_data);

        let params = {mname: g_str_cur_flight_record_name,
        							mmemo : mmemo,
        							tag_values : tag_values,
        							youtube_data : youtube_data,
        							price : -1, flat : -999, flng : -999};

        saveYoutubeUrl(params, function(bSuccess) {
        	if (bSuccess == true) {
        		hideMovieDataSet();
        		$("#videoRecordModifyArea").hide();
        		showAlert(GET_STRING_CONTENT('msg_success'));
        	}
        	else {
        		showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        	}
        });
    }
    else {
        showAlert(GET_STRING_CONTENT('msg_wrong_youtube_url_input'));
        setYoutubePlayerForDetaileView("");
    }
}

function setYoutubePlayerForDetaileViewPureID(data_id) {
    if (!isSet(data_id) || data_id == "-") {
        $("#youTubePlayer").hide();
        g_b_video_view_visible_state = false;
        return;
    }
    else {
        $("#youtube_url_data").val("https://youtube.com/watch?v=" + data_id);
        $("#youTubePlayer").show();
        g_b_video_view_visible_state = true;
    }


    if (g_youtube_player_for_detail_view != null) {
        g_youtube_player_for_detail_view.loadVideoById(data_id, 0, "large");
        return;
    }

    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    g_str_youtube_data_id_for_detail_view = data_id;

    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function setYoutubePlayerForDetaileView(d_id) {
    if (!isSet(d_id) || d_id == "-") {
        $("#youTubePlayer").hide();

        g_b_video_view_visible_state = false;
        return;
    }
    else {
        $("#youTubePlayer").show();
        g_b_video_view_visible_state = true;
    }

    $("#youtube_url_data").val(d_id);
    let data_id = d_id;
    let r_id = d_id.split('=');
    if (r_id.length > 1) {
        data_id = r_id[1];
    }

    if (g_youtube_player_for_detail_view != null) {
        g_youtube_player_for_detail_view.loadVideoById(data_id, 0, "large");
        return;
    }

    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    g_str_youtube_data_id_for_detail_view = data_id;

    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
		if (g_str_cur_viewmode == "pilot" &&
				(g_str_page_action == "recordlist"
				|| g_str_page_action == "publicrecordlist"
				|| g_str_page_action == "center"
				|| g_str_page_action == "summary_list")) {
			getFullFlightRecords(g_str_current_target);
    	getFlightRecords(g_str_current_target, "");
    	return;
    }

    if (g_str_cur_viewmode != "pilot"
    		&& g_str_page_action == "center" ) {
    	getFullFlightRecords(g_str_current_target);
    	getFlightRecords(g_str_current_target, "");
    	return;
    }

    if (g_str_cur_viewmode != "pilot") return;

    g_youtube_player_for_detail_view = new YT.Player('youTubePlayer', {
        width: '1000',
        height: '400',
        videoId: g_str_youtube_data_id_for_detail_view,
        host: 'https://www.youtube.com',
        playerVars: { rel: 0 },//\uCD94\uCC9C\uC601\uC0C1 \uC548\uBCF4\uC5EC\uC8FC\uAC8C \uC124\uC815
        events: {
            'onReady': onPlayerReady, //\uB85C\uB529\uD560\uB54C \uC774\uBCA4\uD2B8 \uC2E4\uD589
            'onStateChange': onPlayerStateChange //\uD50C\uB808\uC774\uC5B4 \uC0C1\uD0DC \uBCC0\uD654\uC2DC \uC774\uBCA4\uD2B8\uC2E4\uD589
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();//\uC790\uB3D9\uC7AC\uC0DD

    let lastTime = -1;
    let interval = 500;

    let checkPlayerTime = function () {
        if (lastTime != -1) {
            if (g_youtube_player_for_detail_view.getPlayerState() == YT.PlayerState.PLAYING) {
                let t = g_youtube_player_for_detail_view.getCurrentTime();
                ///expecting 1 second interval , with 500 ms margin
                if (Math.abs(t - lastTime) > 1) {
                    // there was a seek occuring
                    processSeek(t);
                }
            }
        }
        lastTime = g_youtube_player_for_detail_view.getCurrentTime();
        setTimeout(checkPlayerTime, interval); /// repeat function call in 1 second
    }
    setTimeout(checkPlayerTime, interval); /// initial call delayed
}

function onPlayerStateChange(event) {
		for ( let i = 0 ; i < g_array_youtube_players.length ; i ++ ) { //
				if(!g_array_youtube_players[i]
						|| typeof g_array_youtube_players[i]  === 'undefined'
						|| typeof g_array_youtube_players[i].getPlayerState === 'undefined') continue;

        let state = g_array_youtube_players[i].getPlayerState();

        // 초기 화면에서 재생 된 경우
        if ( state === YT.PlayerState.PLAYING && g_i_youtube_player_index === null ) {
        	g_i_youtube_player_index = i;
        	// 다른 플레이어가 재생 중에 그 선수 이외가 재생 된 경우
        } else if ( ( state === YT.PlayerState.BUFFERING || state === YT.PlayerState.PLAYING ) && g_i_youtube_player_index !== i ) {
        	g_i_youtube_player_index_stop = g_i_youtube_player_index;
          g_i_youtube_player_index_play = i;
        }
    }

    // 재생 중이던 플레이어를 일시 중지
    if ( g_i_youtube_player_index_stop !== null ) { g_array_youtube_players[g_i_youtube_player_index_stop].pauseVideo();
    	g_i_youtube_player_index_stop = null;
    }

		if ( g_i_youtube_player_index_play !== null ) { g_i_youtube_player_index = g_i_youtube_player_index_play ;
		   g_i_youtube_player_index_play = null;
		}
}


function processSeek(curTime) {
    if (g_b_is_youtube_seek == true) {
        g_b_is_youtube_seek = false;
        return;
    }

    let index = 0;
    g_array_flight_rec.some(function (item) {
        if ("dsec" in item) {
            let ds = (item.dsec * 1);
            if ((ds + 5) >= curTime && (ds - 5) <= curTime) {
                setMoveActionFromMovie(index, item);
                return true;
            }
        }

        index++;
        return false;
    });
}

function movieSeekTo(where) {
    g_b_is_youtube_seek = true;

    if (g_youtube_player_for_detail_view != null && $('#youTubePlayer').is(":visible") == true) {
        g_youtube_player_for_detail_view.seekTo(where, true);
    }
}



function askIsSyncData(params, callback) {
    showAskDialog(
        GET_STRING_CONTENT('modal_title'),
        GET_STRING_CONTENT('msg_is_sync_data'),
        GET_STRING_CONTENT('modal_yes_btn'),
        false,
        function () {
        		showLoader();
        		params['isSyncData'] = true;
			      getBase64(params, callback);
        },
        function () {
        		showLoader();
        		params['isSyncData'] = false;
			      getBase64(params, callback);
        }
    );
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
			if(tchecked) {
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
    	if (isSet(recordFileForUploadFile) == false) {
    		showAlert(GET_STRING_CONTENT('msg_select_file'));
    		return;
    	}

    	showLoader();

    	g_params_for_upload_flight_rec = {file : recordFileForUploadFile, mname : mname, mmemo: mmemo, tag_values : tag_values, isUpdate : false, isSyncData : false, price : price};
      g_component_upload_youtube_video.handleUploadClicked(videoFileForUploadFile);
      return;
    }

  	if (g_loc_address_flat == -999) {    	// 주소 기반
  			showAlert(GET_STRING_CONTENT('msg_input_corrent_address'));
  			return;
      }

    // 전화번호 인증여부 체크
    if(!g_b_phonenumber_verified){
        showAlert(GET_STRING_CONTENT('msg_phone_not_verified'));
        return;
    }


  	showLoader();
  	g_params_for_upload_flight_rec = {mname : mname, mmemo: mmemo, tag_values : tag_values, isUpdate : false, isSyncData : false, price : price, flat: g_loc_address_flat, flng : g_loc_address_flng};
  	g_component_upload_youtube_video.handleUploadClicked(videoFileForUploadFile);
}

function setFlightRecordUploadMode(bWhich) {
		if (bWhich == true) {
			g_b_fileupload_for_DJI = true;
			$("#dji_upload_filed").show();
			$("#address_location_field").hide();
			return;
		}

		g_b_fileupload_for_DJI = false;
		$("#dji_upload_filed").hide();
		$("#address_location_field").show();
}

function checkAddress(address) {
    if (isSet(address) == false) {
    		showAlert(GET_STRING_CONTENT('msg_wrong_input'));
    		g_loc_address_flat = -999;
	     	g_loc_address_flng = -999;
        return;
    }

    showLoader();
    let userid = getCookie("dev_user_id");
    let jdata = {"clientid" : userid, "action" : "util", "daction": "gps_by_address", "address" : encodeURI(address)};

		ajaxRequest(jdata, function (r) {
				hideLoader();
	    	if(r.result == "success") {
		      if (r.data == null) {
		      	g_loc_address_flat = -999;
		     		g_loc_address_flng = -999;
		      	showAlert(GET_STRING_CONTENT('msg_wrong_input'));
		        return;
		      }

		     	g_loc_address_flat = r.data.lat;
		     	g_loc_address_flng = r.data.lng;

		     	$("#address_result").text(r.data.address);
		     	showAlert(GET_STRING_CONTENT('msg_address_checked'));
	    	}
	    	else {
	    		g_loc_address_flat = -999;
		     	g_loc_address_flng = -999;
		  		showAlert(GET_STRING_CONTENT('msg_input_corrent_address'));
	    	}
	  	},
	  	function(request,status,error) {
	  		hideLoader();
	  		g_loc_address_flat = -999;
	     	g_loc_address_flng = -999;
	  		showAlert(GET_STRING_CONTENT('msg_error_sorry'));
	  });
}

function setMonFilter() {
    if (g_b_kalman_filter_on == false) {
        g_b_kalman_filter_on = true;
        $("#btnForFilter").text(GET_STRING_CONTENT('btnForFilter_rel'));
    }
    else {
        g_b_kalman_filter_on = false;
        $("#btnForFilter").text(GET_STRING_CONTENT('btnForFilter'));
    }
}


function requestAddress() {
		let userid = getCookie("dev_user_id");
    let jdata = {"clientid" : userid, "action" : "util", "daction": "address_by_gps"};

    let latxlng = $("#latxlng").val();
    let gpsar;
    if (latxlng != "") {
    	gpsar = latxlng.split(",");
    	jdata["lat"] = gpsar[0];
    	jdata["lng"] = gpsar[1];
    }
    else {
    	jdata["lat"] = $("#lat").val();
    	jdata["lng"] = $("#lng").val();
    }


		showLoader();
  	ajaxRequest(jdata, function (r) {
	    hideLoader();
	    if(r.result == "success") {

				$("#address").val(r.address);
				hideLoader();
	    }
	    else {
	    	showAlert(GET_STRING_CONTENT('msg_wrong_input'));
				hideLoader();
	    }
	  }, function(request,status,error) {
	    hideLoader();
	  });
}
