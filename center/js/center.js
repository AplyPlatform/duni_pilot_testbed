/* Copyright 2021 APLY Inc. All rights reserved. */

"use strict";

var g_b_monitor_started;
var g_b_phonenumber_verified = false;
var g_b_interval_timer = -1;

var g_cur_2D_mainmap;
var g_view_cur_2D_mainmap;
var g_array_point_cur_2D_mainmap_for_object;
var g_array_icon_cur_2D_mainmap_for_object;
var g_vector_2D_mainmap_for_cada;
var g_vector_2D_mainmap_for_object;
var g_vector_2D_mainmap_for_lines;
var g_vector_2D_mainmap_for_design_icon;

var g_array_design_data;
var g_array_flight_rec = [];

var g_cur_str_flight_rec_fid;

var g_layer_2D_map_for_line;
var g_layer_2D_map_for_icon;

var g_more_key_for_data;

var g_b_kalman_filter_on = false;
var g_b_3D_map_on = true;
var g_b_video_view_visible_state = false;

var g_array_altitude_data_for_chart = [];

var g_i_appended_data_count = 0;

var g_youtube_player_for_detail_view = null;
var g_str_youtube_data_id_for_detail_view;

var g_str_cur_flight_record_name = "";

var g_b_is_token_visible = false;

var g_loc_address_flat = -999, g_loc_address_flng = -999;
var g_b_fileupload_for_DJI = true; //dji file or input address


var g_loc_kalmanfilter_lat;
var g_loc_kalmanfilter_lng;
var g_loc_kalmanfilter_alt;
var g_loc_kalmanfilter_yaw;
var g_loc_kalmanfilter_pitch;
var g_loc_kalmanfilter_roll;

var g_b_is_first_for_monitor = true;

var g_array_cur_monitor_object;
var g_i_cur_monitor_object_index = 0;
var g_str_cur_monitor_object_owner = "private";


var g_component_upload_youtube_video;

var g_b_is_youtube_seek = false;

// 유튜브 약관 준수 - 동시에 2개 이상의 영상이 재생되면 안된다!
var g_array_youtube_players = [];
var g_i_youtube_player_index = null;
var g_i_youtube_player_index_stop = null;
var g_i_youtube_player_index_play = null;

var g_str_address_temp_val = "";

var g_params_for_upload_flight_rec = {};

var g_array_str_waypointactions_DJI = ["STAY", "START_TAKE_PHOTO", "START_RECORD", "STOP_RECORD", "ROTATE_AIRCRAFT", "GIMBAL_PITCH", "NONE", "CAMERA_ZOOM", "CAMERA_FOCUS"];

var g_array_cur_controller_for_viewmode = { "pilot" : "/center/main.html", "developer" : "/center/main_dev.html" };

$(function () {
		var lang = getCookie("language");
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

    var image_url = getCookie("image_url");
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
	var segments = window.location.pathname.split('/');
	var toDelete = [];
	for (var i = 0; i < segments.length; i++) {
	    if (segments[i].length < 1) {
	        toDelete.push(i);
	    }
	}
	for (var i = 0; i < toDelete.length; i++) {
	    segments.splice(i, 1);
	}
	var filename = segments[segments.length - 1];

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
	var loadPage = "center.html";

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
        $("#main_contents").load("user_info.html", function () {
            userinfoInit();
        });
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
    		
        $("#main_contents").load("partner_register.html", function () {
            partnerRegisterInit();
        });
    }
    else if (g_str_page_action == "recordupload") {
        $("#main_contents").load("record_upload.html", function () {
            flightrecordUploadInit();
        });
    }
    else if (g_str_page_action == "embedcompass") {
        $("#main_contents").load("embed_compass.html", function () {
        		map2DInit();
            selectMonitorIndex("private", 0);
            addObjectTo2DMap(0, "private", "drone");
            map3DInit();
            addObjectTo3DMap(0, "private", "drone");
            embedCompassInit();
        });
    }
    else if (g_str_page_action == "recordlist") {
        $("#main_contents").load("record_list.html", function () {
            flightRecords2DMapInit();
            flightrecordListInit("private");
        });
    }
    else if (g_str_page_action == "publicrecordlist") {
        $("#main_contents").load("record_list.html", function () {
            selectMonitorIndex("private", 0);
            addObjectTo2DMap(0, "private", "drone");
            flightRecords2DMapInit();
            flightrecordListInit("public");
        });
    }
    else if (g_str_page_action == "publicrecordlist_detail") {
        $("#main_contents").load("record_detail.html", function () {
            map2DInit();
            selectMonitorIndex("private", 0);
            addObjectTo2DMap(0, "private", "drone");
            map3DInit();
            addObjectTo3DMap(0, "private", "drone");
            flightDetailInit("public");
        });
    }
    else if (g_str_page_action == "recordlist_detail") {
        $("#main_contents").load("record_detail.html", function () {
            map2DInit();
            selectMonitorIndex("private", 0);
            addObjectTo2DMap(0, "private", "drone");
            map3DInit();
            addObjectTo3DMap(0, "private", "drone");
            flightDetailInit("private");
        });
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

function userinfoInit() {
	
}

function partnerRegisterInit() {
	
	
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

        var feature = g_cur_2D_mainmap.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                return feature;
            });

        if (feature) {
            var ii = feature.get('mindex');
            if (!isSet(ii)) return;

            setDataToDesignView(ii);

            var item = g_array_design_data[ii];
            setMoveActionFromMap(ii, item);
            return;
        }

        var lonLat = ol.proj.toLonLat(evt.coordinate);
        appendDataToDesignTable(lonLat);
    });

    var mission_name = decodeURIComponent(getQueryVariable("mission_name"));

    if (isSet(mission_name) && mission_name != "") {
        mission_name = mission_name.split('&')[0];
        setMissionDataToDesignView(mission_name);
    }
    else {

        var posLayer = new ol.layer.Vector({
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
						var checked = $("#salecheck").is(":checked");
            var userid = getCookie("dev_user_id");                        
			
						if(checked){
											GATAGM('upload_salecheck_show_btn_click', 'CONTENT');
			                $("#priceinputarea").show();
			                $("#validate_phonenumber_area").hide();
			                // check if user has verfied phoen number
			                var jdata = {
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

    var input = document.querySelector('input[name=tagTextarea]');
		new Tagify(input);

    $("#address_input_data").on("change keyup paste", function() {
		    var currentVal = $(this).val();
		    if(currentVal == g_str_address_temp_val) {
		        return;
		    }

		    g_str_address_temp_val = currentVal;
		    g_loc_address_flat = -999;
		    g_loc_address_flng = -999;
		});


		$("input[name='media_upload_kind']:radio").change(function () {
        var cVal = this.value;

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

  	var d = new Date();
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
    var nativePicker = document.querySelector('.nativeDateTimePicker');
    var fallbackPicker = document.querySelector('.fallbackDateTimePicker');

    var yearSelect = document.querySelector('#year');
    var monthSelect = document.querySelector('#month');
    var daySelect = document.querySelector('#day');
    var hourSelect = document.querySelector('#hour');
    var minuteSelect = document.querySelector('#minute');

    // hide fallback initially
    fallbackPicker.style.display = 'none';

    // test whether a new datetime-local input falls back to a text input or not
    var test = document.createElement('input');

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
			GATAGM('compass_file_drop', 'CONTENT');
			let retSelected = fileDropCheckForCompass(e.originalEvent.dataTransfer.files);
			if (retSelected == true && (isSet(videoFileForUploadFile) && isSet(recordFileForUploadFile))) {
				$("#selectFileArea").hide();
				$("#label_or_directly").hide();
				$('#file_drop_img').hide();
				$('#label_explain_drag').hide();
				$('#btnForUploadFlightList').show();				
			}
		});		

		$("#btnForUploadFlightList").on("click", function(e) {
				GATAGM('compass_record_upload_btn_click', 'CONTENT');
				uploadCheckBeforeCompassEmbed();
		});

		$("#input_direct_file").bind('change', function() {						
			GATAGM('compass_direct_file_select_btn_click', 'CONTENT');
			let retSelected = fileDropCheckForCompass(this.files);
			if (retSelected == true && (isSet(videoFileForUploadFile) && isSet(recordFileForUploadFile))) {
				$('#selectFileArea').hide();
				$("#label_or_directly").hide();
				$('#btnForUploadFlightList').show();
				$('#file_drop_img').hide();
				$('#label_explain_drag').hide();
			}			
		});

		$("#input_direct_file").click(function() {						
			$(this).attr("value", "");
			$("#input_direct_file").val("");
		});

		$("#colorPicker").spectrum({
		  type: "color",
		  showInput: true,
		  showInitial: true,
		  change: function(color) {
		  		let rgb = color.toRgb();
			    setCompassColor(rgb.r, rgb.g, rgb.b, rgb.a);
			}		  
		});
		
		$("#compass_pos_sel").change(function() {
     $("#compass_pos_sel option:selected").each(function() {
     			GATAGM('compass_position_select_click', 'CONTENT');
          setCompassPos($(this).val() * 1);
     });
		});
		
		$("#embed_text_sel").change(function() {
     $("#embed_text_sel option:selected").each(function() {
     			GATAGM('compass_text_select_click', 'CONTENT');
          setCompassText( ($(this).val() * 1) == 1 ? true : false );
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
}

function onOpenCvReady() {
		hideLoader();
}

var recordFileForUploadFile = null;
var videoFileForUploadFile = null;

function fileDropCheckForCompass(files) {
	if (files.length > 2) {
		showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
		return false;
	}

	if (files.length == 2) {
		if (isSet(recordFileForUploadFile) || isSet(videoFileForUploadFile)) {
			showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
			return false;
		}
	}

	var isAdded = false;
	for(var i = 0; i < files.length; i++) {
		var file = files[i];

		if (isRecordFile(file.name)) {
			if (isSet(recordFileForUploadFile)) {
				showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
				return false;
			}
			else {
				console.log(file);
				recordFileForUploadFile = file;												
				previewForCompassFile(file, "record");
				isAdded = true;
			}
		}

		if (isMovieFile(file.name)) {
			if (isSet(videoFileForUploadFile)) {
				showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
				return false;
			}
			else {
				console.log(file);
				videoFileForUploadFile = file;
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


function uploadCheckBeforeCompassEmbed() {
	if (!isSet(recordFileForUploadFile) || !isSet(videoFileForUploadFile)) {
		showAlert(GET_STRING_CONTENT("msg_select_one_video_one_record"));
		return;
	}
	
	showLoader();
	$('#btnForUploadFlightList').prop('disabled', true);

	var params = {file : recordFileForUploadFile};
	getBase64(params, function(ret) {
		requestUploadForCompass(ret.base64file, getFileExtension(videoFileForUploadFile.name), recordFileForUploadFile.target.find("progress"));
	});
}

function requestUploadForCompass(base64Recordfile, tempExt, progressBar) {
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
    		setFlightRecordDataToView("private", r.data, false);
    	}

    	runNextSequence( function () {
					videoFileUpload(videoFileForUploadFile, r.filename, r.extension, r.signedurl);
			} );
    }, function (request, status, error) {
      $('#btnForUploadFlightList').prop('disabled', false);
      hideLoader();
      showAlert(GET_STRING_CONTENT("msg_error_sorry") + " : " + error);
    });
}

function embedRequest(filename, tempExt) {

		var color = $("#colorPicker").spectrum("get");
		var compass_position = $("#compass_pos_sel").children("option:selected").val();
		var embedText = $("#embed_text_sel").children("option:selected").val();		
				
		var userid = getCookie("dev_user_id");
    var jdata = {
    	"action": "position",
    	"daction": "compass_embed",
    	"clientid": userid,
    	"extension" : tempExt,
    	"filename" : filename,
    	"color": color.toRgb(),
    	"show_text": embedText,
    	"pos" : compass_position
    };

    ajaxRequest(jdata, function (r) {
    		hideLoader();
        if (r.result == "success") {
        	setProgress(100); //전체 프로그레스바 진행
        	showAlert(GET_STRING_CONTENT("msg_pre_embed_compass_request_received") + getCookie("user_email") + GET_STRING_CONTENT("msg_post_embed_compass_request_received"));
        	$('#btnForUploadFlightList').prop('disabled', false);

        	$("#file_thumb_video").remove();
        	$("#file_thumb_record").remove();
					recordFileForUploadFile = null;
					videoFileForUploadFile = null;

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

	var isAdded = false;
	for(var i = 0; i < files.length; i++) {
		var file = files[i];

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

function videoFileUpload(videoFile, tempName, tempExt, tempUrl) {
	var $selfProgress = videoFile.target.find("progress");

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
			setProgress(50); //전체 프로그레스바 진행

			runNextSequence( function () {
					embedRequest(tempName, tempExt);
				} );
		}
	});
}

function setProgress(per) {
		var $progressBar = $("#progressBarForUpload");
		$progressBar.val(per);
}

function previewForRecordFile(file) {		
	var iconArea;
	var vDiv;
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


function previewForCompassFile(file, idx) {
	var iconArea = '<i class="fas fa-map-marker-alt"></i>';
	if(isMovieFile(file.name)) {
		iconArea = '<i class="fas fa-video"></i>';
	}

	var $div = $('<div id="file_thumb_' + idx + '" class="text-left">'
		+ '<span style="cursor:pointer" id="file_data_remover_' + idx + '"><b>X</b></span> '
		+ iconArea + ' ' + file.name + '<br><progress value="0" max="100" style="height:5px;"></progress></div>');
	$("#thumbnails").append($div);
	file.target = $div;
	
	$("#file_data_remover_" + idx).on("click", function(e) {
		$("#file_thumb_" + idx).remove();
		if (isRecordFile(file.name)) {
			recordFileForUploadFile = null;
		}
		else {
			videoFileForUploadFile = null;
			
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



function flightDetailInit(target) {

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

    $("#disclaimer").html(GET_STRING_CONTENT('youtubeTOS'));

    $("#btnForLink").hide();
    $("#btnForSharing").hide();
    
    $("#set_youtube_address_view").hide();
		$("#set_youtube_upload_view").show();

		$("input[name='media_upload_kind']:radio").change(function () {
        var cVal = this.value;

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
        setFilter();
    });
    */
    
    $('#merge_record_view_btn').click(function (e) {
    		e.preventDefault();
    		        
        GATAGM('detail_merge_record_view_btn_click', 'CONTENT');
        $("#record_search_field_area").show();
    });
        
    $("#record_search_field").attr("placeholder", GET_STRING_CONTENT('msg_record_search_key'));
		$("#record_search_field").keypress(function(e) {
        if (e.which == 13){
        		GATAGM('detail_record_search_field_enter_key', 'CONTENT', $("#record_search_field").val());
        		searchFlightRecordForMerge(target, $("#record_search_field").val());
        }
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
		$("#record_search_field_area").hide();
		$("#dataTable-Flight_area").hide();

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
    
    $("#movieFile").bind('change', function() {
    	GATAGM('detail_movie_file_select_btn_click', 'CONTENT');			
			videoFileForUploadFile = this.files[0];
			previewForRecordFile(this.files[0])
		});
		
		$("#movieFile").click(function() {			
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
		        updateFlightRecordDsec(target, curVal);
		        
		        showAlert(GET_STRING_CONTENT("msg_sync_adjusted") + " : " + curVal + GET_STRING_CONTENT("label_second"));
		    });
		    
		    $('#flightRecDsecSaveBtn').click(function (e) {
		    		e.preventDefault();
		    		GATAGM('detail_sec_save_btn_click', 'CONTENT');		        
		        updateFlightRecordDetail(rname);
		    });
    }
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
        getFlightRecords(target);
    });

    $('#loadMoreArea').hide();

    g_str_current_target = target;
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
        getFlightRecords(target);
    });

    $('#loadMoreArea').hide();

    g_str_current_target = target;
    initYoutubeAPIForFlightList();
}

function initYoutubeAPIForFlightList() {
		var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
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
		
		var userid = getCookie("dev_user_id");
    var jdata = { "action": "util", "daction": "duni_service_bet", "clientid": userid, "r_id" : (r_id * 1) };
    
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

var curServiceListTimerId = -1;
function getDUNIServiceRequest(page) {				
		var userid = getCookie("dev_user_id");
    var jdata = { "action": "util", "daction": "duni_service_request_list", "clientid": userid, "page" : page };
    
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
				var cur_page = r.page * 1;
												
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

    var userid = getCookie("dev_user_id");
    var jdata = {"clientid" : userid, "action" : "util", "daction": "gps_by_address", "address" : encodeURI(address)};

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

		var userid = getCookie("dev_user_id");
    var jdata = {"clientid" : userid, "action" : "util", "daction": "address_by_gps", "lat" : lat, "lng" : lng};

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
		var data =
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
			var dt = {"lat" : lat, "lng" : lng, "alt" : item.alt + 500, "dsec" : index};
			g_array_flight_rec.push(dt);
		});

    moveToPositionOnMap("private", 0, lat, lng, 600, 0, 0, 0);

    var dpoint = ol.proj.fromLonLat([lng, lat]);
    drawCadastral(null, null, dpoint[0], dpoint[1], g_vector_2D_mainmap_for_cada);

}

function setUploadFileFields() {	
		$('#dropArea').hide();
		$("#nextStageBtnArea").hide();
		$('#uploadfileform').show();
		$('#youtube_address_only_area').hide();
}


function getAllRecordCount() {

    var userid = getCookie("dev_user_id");
    var useremail = getCookie("user_email");
    var jdata = { "action": "position", "daction": "summary", "clientid": userid, "email": useremail };

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
        var pluginid = fdata.pluginid;
        var callsign = fdata.callsign;
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

            var callsign = $("#badge_nickname").val();

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
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "remove_plugin", "clientid": userid };

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
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "make_plugin", "clientid": userid, "callsign": callsign };

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
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "public_count", "clientid": userid };

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

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "data_count", "clientid": userid };

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
    var ctx = document.getElementById("myPieChart");
    var myPieChart = new Chart(ctx, {
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

    var rlabel = new CountUp('r_count_label_time', rcount, coptions);
    if (!rlabel.error) {
        rlabel.start();
    } else {
        console.error(rlabel.error);
    }

    var rlabel = new CountUp('f_count_label_time', fcount, coptions);
    if (!rlabel.error) {
        rlabel.start();
    } else {
        console.error(rlabel.error);
    }

    var mmin = Math.round(alltime / 60);
    var emin = Math.round(ealltime / 60);

    var alabel = new CountUp('a_time_label_time', mmin, coptions);
    if (!alabel.error) {
        alabel.start();
    } else {
        console.error(alabel.error);
    }

    var ctx = document.getElementById("myBarChart1");
    var myBarChart = new Chart(ctx, {
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

    var ctx = document.getElementById("myBarChart2");
    var myBarChart = new Chart(ctx, {
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


function drawLineGraph() {
    var ctx2 = document.getElementById('lineGraph').getContext('2d');
    var linedataSet = {
        datasets: [
            {
                label: GET_STRING_CONTENT('altitude_msg'),
                borderColor: '#4bc6ff',
                backgroundColor: '#9bdfff',
                data: g_array_altitude_data_for_chart
            }
        ]
    };

    document.getElementById("lineGraph").onclick = function (evt) {                
        GATAGM('detail_altitude_graph_click', 'CONTENT');

        var activePoints = window.myLine.getElementsAtEvent(evt);

        if (activePoints.length > 0) {
            var clickedDatasetIndex = activePoints[0]._index;

            var locdata = g_array_flight_rec[clickedDatasetIndex];
            if ("lng" in locdata && "lat" in locdata) {
                setMoveActionFromLineChart(clickedDatasetIndex, locdata);
            }
        }
    };

    window.myLine = new Chart(ctx2, {
        type: 'scatter',
        data: linedataSet,
        tooltipEvents: ["click"],
        options: {
            legend: {
                display: false
            },
            title: {
                display: false,
                text: 'Temperature : RED / Humidity : BLUE'
            },
            events: ['click'],
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var locdata = g_array_flight_rec[tooltipItem.index];
                        return JSON.stringify(locdata);
                    }
                },
                layout: {
                    padding: {
                        left: 20,
                        right: 30,
                        top: 20,
                        bottom: 20
                    }
                }
            }
        }
    });
}

function setSlider(i) {
		if ($("#slider").length <= 0) return;
		
    $("#slider").on("slidestop", function (event, ui) {
        var locdata = g_array_flight_rec[ui.value];
        setMoveActionFromSliderOnStop(ui.value, locdata);
    });

    $('#slider').slider({
        min: 0,
        max: i - 1,
        value: 0,
        step: 1,
        slide: function (event, ui) {
            var locdata = g_array_flight_rec[ui.value];
            setMoveActionFromSliderOnMove(ui.value, locdata);
        }
    });
}


function setSliderPos(i) {
    if ($("#slider").length <= 0) return;

    if (i < 0) {
        $('#sliderText').html("-");
        return;
    }

    $("#slider").slider('value', i);
    $('#sliderText').html(i);
}

function setYawStatus(yaw) {
    if ($('#yawStatus').length <= 0) return;
    var yawStatus = document.getElementById('yawStatus');
    if (!isSet(yawStatus)) return;
    if (!isSet(yaw)) return;

    yaw = yaw * 1;
    var degree = yaw < 0 ? (360 + yaw) : yaw;
    //yaw = Math.PI/180 * yaw;

    $("#yawStatus").attr("src", $("#yawStatus").attr("src"));

    $('#yawStatus').css({
        'transform': 'rotate(' + degree + 'deg)',
        '-ms-transform': 'rotate(' + degree + 'deg)',
        '-moz-transform': 'rotate(' + degree + 'deg)',
        '-webkit-transform': 'rotate(' + degree + 'deg)',
        '-o-transform': 'rotate(' + degree + 'deg)'
    });

    yaw = yaw.toFixed(3);
    $('#yawText').text(yaw);
}


function setPitchStatus(pitch) {
    if ($('#pitchStatus').length <= 0) return;
    var pitchStatus = document.getElementById('pitchStatus');
    if (!isSet(pitchStatus)) return;
    if (!isSet(pitch)) return;

    pitch = pitch * 1; //
    var degree = pitch * -1;
    degree = degree < 0 ? (360 + degree) : degree;
    //degree = Math.PI/180 * degree;

    $("#pitchStatus").attr("src", $("#pitchStatus").attr("src"));

    $('#pitchStatus').css({
        'transform': 'rotate(' + degree + 'deg)',
        '-ms-transform': 'rotate(' + degree + 'deg)',
        '-moz-transform': 'rotate(' + degree + 'deg)',
        '-webkit-transform': 'rotate(' + degree + 'deg)',
        '-o-transform': 'rotate(' + degree + 'deg)'
    });

    pitch = pitch.toFixed(3);
    $('#pitchText').text(pitch);
}

function setRollStatus(roll) {
    if ($('#rollCanvas').length <= 0) return;
    var canvas = document.getElementById('rollCanvas');
    if (!isSet(canvas)) return;
    if (!isSet(roll)) return;

    roll = roll * 1;
    var degrees = 180 + roll;
    var degrees2 = degrees + 180;

    if (degrees2 > 360) degrees2 = degrees2 - 360;

    var radians1 = (Math.PI / 180) * degrees;
    var radians2 = (Math.PI / 180) * degrees2;

    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.arc(30, 30, 20, radians1, radians2, true);
    context.closePath();
    context.lineWidth = 1;
    context.fillStyle = 'blue';
    context.fill();
    context.strokeStyle = '#0000aa';
    context.stroke();

    roll = roll.toFixed(3);
    $('#rollText').text(roll);
}

function updateFlightRecordDetail(name) {
	var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "set_record", "name": encodeURI(name), "clientid": userid, "recorddata" : g_array_flight_rec, "fid" : g_cur_str_flight_rec_fid };

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

function updateFlightRecordDsec(target, dsec) {
	if (g_array_flight_rec.length <= 0) {
    return;
	}
       
  for(var i=0;i<g_array_flight_rec.length;i++)
  {
  		g_array_flight_rec[i].dsec += dsec;
  }
  
  setFlightRecordDataToView(target, g_array_flight_rec, false); 
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

            var d = g_array_design_data[ui.value];

            setDataToDesignView(ui.value);

            setMoveActionFromSliderOnMove(ui.value, d);
        }
    });

    $('#goItemBtn').click(function (e) {
    		e.preventDefault();

        GATAGM('slide_go_item_btn_click', 'CONTENT');

        var index = $('#goItemIndex').val();
        if (!isSet(index) || $.isNumeric(index) == false) {
            showAlert("Please input valid value !");
            return;
        }

        index = parseInt(index);

        if (index < 0 || index >= g_array_design_data.length) {
            showAlert("Please input valid value !");
            return;
        }

        var d = g_array_design_data[index];
        $("#slider").slider('value', index);
        setDataToDesignView(index);

        setMoveActionFromSliderOnStop(index, d);
    });
}

function setMissionDataToDesignView(name) {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "mission", "daction": "get_spec", "mname": encodeURI(name), "clientid": userid };

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
    var nIcon = createNewIconFor2DMap(i, item);
    g_vector_2D_mainmap_for_design_icon.addFeature(nIcon);
}

function removeIconOn2DMap(index) {
    g_cur_2D_mainmap.removeLayer(g_layer_2D_map_for_line);
    g_cur_2D_mainmap.removeLayer(posLayerForDesign);

    setDesignTable();
}

function setDesignTable() {
    var i = 0;
    var coordinates = [];

    g_array_design_data.forEach(function (item) {
        addNewIconToDesignMap(i, item);
        coordinates.push(ol.proj.fromLonLat([item.lng * 1, item.lat * 1]));
        i++;
    });

    setDataToDesignView(0);

    $("#slider").slider('option', { min: 0, max: i - 1 });
    setSliderPos(i);

    var lines = new ol.geom.LineString(coordinates);

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

    var index = g_array_design_data.length;

    if (index <= 0) {
        $("#slider").show();
        $("#dataTable-points").show();
    }

    var data = [];
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

    var camera = v3DMapViewer.camera;

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

    var fobject;
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

        var replaced_str = owner.replace(/@/g, '_at_');
        replaced_str = replaced_str.replace(/\./g, '_dot_');
        var selectorId = "object_sel_" + replaced_str;
        var selHtml = "<select class='form-control bg-light border-0 small' id='" + selectorId + "' name='" + selectorId + "'></select>";
        $("#target_objects").append(selHtml);

        fobject.forEach(function (item, index) {
            var kind = "drone";
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
            var sval = $("#" + selectorId + " option:selected").val();
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

function selectMonitorIndex(owner, index) {
    g_i_cur_monitor_object_index = index;
    g_str_cur_monitor_object_owner = owner;
}

function nextMon() {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "get", "clientid": userid };

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            g_b_monitor_started = true;
            $("#loader").show();
            $('#btnStartMon').text(GET_STRING_CONTENT('btnStopMon'));
            $("#btnStartMon").removeClass("btn-primary").addClass("btn-warning");

            var output = r.data;
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
    var useremail = getCookie("user_email");
    var usertoken = getCookie("user_token");
    var userid = getCookie("dev_user_id");
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
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "mission", "daction": "get", "clientid": userid };

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

        var missionid = item['id'];

        if (missionid == null) {
            missionid = "mission-" + g_i_appended_data_count;
        }

        var act = item['act'];

        if (act >= g_array_str_waypointactions_DJI.length) {
            act = 0;
        }

        var appendRow = "<tr class='odd gradeX' id='" + missionid + "'><td>" + g_i_appended_data_count + "</td><td>"
            + "<table border=0 width='100%'><tr><td width='50%' class='center' bgcolor='#eee'>" + item['lat'] + "</td><td width='50%' class='center' bgcolor='#fff'> " + item['lng'] + "</td></tr>"
            + "<tr><td class='center' bgcolor='#eee'>" + item['alt'] + "/" + item['speed'] + "</td><td class='center'>"
            + g_array_str_waypointactions_DJI[act] + "/" + item['actparam']
            + "</td></tr></table>"
            + "</td></tr>"
        $('#monitorTable-points > tbody:last').append(appendRow);
    });
}

function moveToPositionOnMap(owner, index, lat, lng, alt, yaw, roll, pitch) {
    if (g_i_cur_monitor_object_index == index && g_str_cur_monitor_object_owner == owner) {
        setRollStatus(roll);
        setYawStatus(yaw);
        setPitchStatus(pitch);
    }

    move3DmapIcon(owner, index, lat, lng, alt, pitch, yaw, roll);
    move2DMapIcon(owner, index, lat, lng, alt, yaw);
}

function clearDataToDesignTableWithFlightRecord() {

}

function setDataToDesignView(index) {
    if (g_array_design_data.length <= 0) return;

    var lat = g_array_design_data[index].lat;
    var lng = g_array_design_data[index].lng;
    var alt = g_array_design_data[index].alt;
    var yaw = g_array_design_data[index].yaw;
    var roll = g_array_design_data[index].roll;
    var pitch = g_array_design_data[index].pitch;
    var speed = g_array_design_data[index].speed;
    var act = g_array_design_data[index].act;
    var actparam = g_array_design_data[index].actparam;

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
        var lng = $('#lngdata_index').val();
        var lat = $('#latdata_index').val();
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
    var features = g_vector_2D_mainmap_for_cada.getFeatures();

    if (features != null && features.length > 0) {
        for (x in features) {
            var properties = features[x].getProperties();

            var id = properties.id;
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

    var newIndex = g_array_design_data.length - 1;

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
			var regtime_a = convert2data(a.regtime);
			var regtime_b = convert2data(b.regtime);
    	return regtime_b.getTime() - regtime_a.getTime();
		});


    data.forEach(function (item, index, array) {
        var appendRow = "<div class='card shadow mb-4' id='mission_row_" + index + "'><div class='card-body'><div class='row'><div class='col-sm'>"
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
    var query = $('#queryData').val();
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

var g_i_appended_data_count = 0;

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

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "mission", "daction": "find_mission", "keyword": keyword, "clientid": userid };

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

    var userid = getCookie("dev_user_id");
    var isPublic = (target == "public") ? true : false;
    var jdata = { "action": "position", "daction": "find_record", "keyword": keyword, "clientid": userid, "public": isPublic };
    var target_key = $("#target_key").length > 0 ? $("#target_key").val() : "";

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
            
            $('#dataTable-Flight_area').show();
            $('#dataTable-Flight_area').popup();
            
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

function getFlightRecords(target) {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "download", "clientid": userid };
    var target_key = $("#target_key").length > 0 ? $("#target_key").val() : "";
    if (target_key != "") {
    		jdata["target_email"] = target_key;
    }

    if (target == "public") {
        jdata['public'] = true;
        var targetId = decodeURIComponent(getQueryVariable("user_email"));
        if (isSet(targetId)) {
        	jdata['owner_email'] = targetId;

        	$('#page_about_title').text(targetId + " : " + GET_STRING_CONTENT('open_record_label'));
        }
    }

    var keyword = decodeURIComponent(getQueryVariable("keyword"));
    if (isSet(keyword) && keyword != "") {
    		jdata['daction'] = "find_record";
    		jdata['keyword'] = keyword;
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
        g_array_flight_rec.push(item);
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
        g_array_flight_rec.push(item);
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

function setFilter(target) {
    setFlightRecordDataToView(target, null, true);
    $('#btnForFilter').prop('disabled', true);
}

function stopShareFlightData(index, name, target_id) {

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "stop_share", "name": encodeURI(name), "clientid": userid, "target_id": target_id };

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

    var userid = getCookie("dev_user_id");

    if (user_email == "public")
        user_email = "public@duni.io";

    var jdata = { "action": "position", "daction": "share", "name": encodeURI(name), "clientid": userid, "target": user_email };

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
                var sharedList = r.sharedList;
                var link_text = "";
                var user_text = "";
                sharedList.some(function (item, index, array) {
                    var premail = item.email;
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
                    var premail = item.email;
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

function showDataWithName(target, target_key, name) {

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "download_spe", "name": encodeURI(name), "clientid": userid, "target_email" : target_key };

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

				var fdata = r.data;
        setFlightRecordToView(target, name, fdata);

				hideLoader();

    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function mergeFlightRecordToView(target, fdata) {
		setFlightRecordDataToView(target, fdata.data, false); //todo
}

function setFlightRecordToView(target, name, fdata) {								
        var n_title = name;
        if ((target == "private") && ("owner" in fdata && userid != fdata.owner)) {
            n_title = name + " : " + GET_STRING_CONTENT('shared_record_data_msg');
            if ("owner_email" in fdata) {
                n_title = name + " : " + GET_STRING_CONTENT('shared_record_data_msg') + " / " + fdata.owner_email;
            }
        }
        else {
            if ((target == "public") && "owner_email" in fdata) {
                n_title = name + " / " + fdata.owner_email;
            }
        }        

        g_b_video_view_visible_state = false;

        if ("memo" in fdata && isSet(fdata.memo)) {
            $("#memoTextarea").val(fdata.memo);
        }

        if ("tag_values" in fdata && isSet(fdata.tag_values)) {
	        if (target == "private") {
	            $("#tagTextarea").val(fdata.tag_values);
	        }
	        else {
	        		$("#tagTextarea").hide();
	        		var targetList = (target == "public" ? "public" : "");
	        		try {
				    		var tagArray = JSON.parse(fdata.tag_values);				    		
					    	var appendRow = "";
					    	tagArray.forEach(function(tg) {
					    		appendRow = appendRow + "<a href=" + g_array_cur_controller_for_viewmode["pilot"] + "?page_action=" + targetList + "recordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
					    	});
				    		$("#tagArrayarea").html(appendRow);
				    	}
				    	catch(e) {
				    	}
	        }
	      }

	      if (target == "private") {
		      var input = document.querySelector('input[name=tagTextarea]');
					new Tagify(input);
				}

        if ((target == "private") && ("sharedList" in fdata)) {
            $("#btnForPublic").show();

            var sharedList = fdata.sharedList;
            var link_text = "";
            var user_text = "";
            sharedList.some(function (item, index, array) {
                var premail = item.email;
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
                var premail = item.email;
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
                        function () {}
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
                function () {}
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
                function () {}
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
                function () {}
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
            hideMovieDataSet();
        }
        else {
            $("#youTubePlayer").hide();
        }

        if (g_b_video_view_visible_state == true) {
            hideMovieDataSet();
        }
        else {
            showMovieDataSet();
        }

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
						$("#tagTextarea").prop("disabled",true);
            $("#memoTextarea").prop("disabled", true);
            hideMovieDataSet();
        }
        else {
            if (target == "private") {
            	if(("isowner" in fdata && fdata.isowner == true) || !("isowner" in fdata)) {
                $("#btnForSharing").show();
              }

              $("#btnForDelete").show();
              $("#btnForUpdateTitle").show();

              if (!isSet(fdata.flat)) {
                $("#recordDataSet").show();
            	}
            }
        }

        var exist_data = setFlightRecordDataToView(target, fdata.data, false);
				if (exist_data == false) {
					$("#altitude_graph_area").hide();
          $("#map_area").hide();
          $("#no_record_data_view").show();					
    			moveToPositionOnMap("private", 0, fdata.flat * 1, fdata.flng * 1, 1500, 0, 0, 0);
				}
				else {
					g_cur_str_flight_rec_fid = fdata.fid;
					$("#no_record_data_view").hide();
				}

				if (isSet(fdata.cada)) {
						setAddressAndCada("#map_address", fdata.address, fdata.cada, g_vector_2D_mainmap_for_cada);
        }
        else {
            var dpoint = ol.proj.fromLonLat([fdata.flng, fdata.flat]);
          	drawCadastral("#map_address", name, dpoint[0], dpoint[1], g_vector_2D_mainmap_for_cada);
        }
}

function moveToStartPoint3D(lng, lat, alt) {
		if (isSet(v3DMapViewer) == false) return;

		var camera = v3DMapViewer.camera;
		camera.flyTo({
      destination : Cesium.Cartesian3.fromDegrees(lng, lat, alt),
      orientation : {
        heading : Cesium.Math.toRadians(0.0),
        pitch : Cesium.Math.toRadians(-70.0),
      }
    });
}

function makeForFlightListMap(index, flat, flng, hasYoutube) {
    var dpoint = ol.proj.fromLonLat([flng * 1, flat * 1]);

    var c_view = new ol.View({
        center: dpoint,
        zoom: 12
    });

    var vSource = new ol.source.Vector();

    var vVectorLayer = new ol.layer.Vector({
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

    var vMap = new ol.Map({
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

    var icon = createNewIconFor2DMap(index, { lat: flat, lng: flng, alt: 0, hasYoutube : hasYoutube });
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

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "set_cada", "clientid": userid, "cada": cada_data, "address": encodeURI(address), "name": encodeURI(record_name) };

    ajaxRequest(jdata, function (r) {

    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function drawCadastral(disp_id, name, x, y, vSource) {
		if (isSet(x) == false || isSet(y) == false) return;

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "cada", "clientid": userid, "x": x, "y": y };

    ajaxRequest(jdata, function (r) {
        if (r == null || r.data == null || r.data.response.status !== "OK") {
        	hideLoader();
        	return;
        }

				var response = r.data.response;
        var _features = new Array();
        var _addressText = "";

        for (var idx = 0; idx < response.result.featureCollection.features.length; idx++) {
            try {
                var geojson_Feature = response.result.featureCollection.features[idx];
                var geojsonObject = geojson_Feature.geometry;
                var features = (new ol.format.GeoJSON()).readFeatures(geojsonObject);
                for (var i = 0; i < features.length; i++) {
                    try {
                        var feature = features[i];
                        feature["id_"] = geojson_Feature.id;
                        feature["properties"] = {};
                        for (var key in geojson_Feature.properties) {
                            try {
                                var value = geojson_Feature.properties[key];

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
    var name = item.name;
    var dtimestamp = item.dtimestamp;
    var data = item.data;

    var address = item.address;
    var cada = item.cada;
    var memo = item.memo;
    var owner_email = item.owner_email;
    var sharedList = item.sharedList;
    var youtube_data_id = item.youtube_data_id;
    var curIndex = g_i_appended_data_count;
    var tag_values = item.tag_values;

    var flat = (isSet(item.flat) ? item.flat * 1 : -999);
		var flng = (isSet(item.flng) ? item.flng * 1 : -999);

		dtimestamp = makeDateTimeFormat(new Date(dtimestamp), true);

    var appendRow = "<div class='card shadow mb-4' id='flight-list-" + curIndex + "' name='flight-list-" + curIndex + "'><div class='card-body'><div class='row'><div class='col-sm'>";
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
    	var targetList = (target == "public" ? "public" : "");
    	try {
	    	var tag_array = JSON.parse(tag_values);
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
            var oemail = "<a href='" + g_array_cur_controller_for_viewmode["pilot"] + "?page_action=publicrecordlist&user_email=" + encodeURIComponent(owner_email) + "'>" + owner_email + "</a>";
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

    var retSource = null;
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
            var dpoint = ol.proj.fromLonLat([flng, flat]);
            drawCadastral("#map_address_" + curIndex, name, dpoint[0], dpoint[1], retSource);
        }
    }

    if (g_i_appended_data_count < 2 && flat != -999) {
        moveFlightHistoryMap(flat, flng);
    }

    g_i_appended_data_count++;
}


function appendFlightRecordTableForMerge(target, target_key, item) {
    var name = item.name;
    var dtimestamp = item.dtimestamp;
    var data = item.data;

    var address = item.address;
    var cada = item.cada;
    var memo = item.memo;
    var owner_email = item.owner_email;
    var sharedList = item.sharedList;
    var youtube_data_id = item.youtube_data_id;
    var curIndex = g_i_appended_data_count;
    var tag_values = item.tag_values;

    var flat = (isSet(item.flat) ? item.flat * 1 : -999);
		var flng = (isSet(item.flng) ? item.flng * 1 : -999);

		dtimestamp = makeDateTimeFormat(new Date(dtimestamp), true);

    var appendRow = "<div class='card shadow mb-4' id='flight-list-" + curIndex + "' name='flight-list-" + curIndex + "'><div class='card-body'><div class='row'><div class='col-sm'>";
    appendRow = appendRow + (curIndex + 1) + " | ";
    
    appendRow = appendRow + "<a id='detail_record_list_item_" + curIndex + "'>" + name + "</a>";
    
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
    	var targetList = (target == "public" ? "public" : "");
    	try {
	    	var tag_array = JSON.parse(tag_values);
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
    	$('#dataTable-Flight_area').dialog('close');
    	$('#dataTable-Flight_area').hide();
    	//$('#dataTable-Flight_area').modal('hide');
    	loadRecorForMerge(target, target_key, name);
    });
    
    if (isSet(owner_email)) {
        var oemail = "<a href='" + g_array_cur_controller_for_viewmode["pilot"] + "?page_action=publicrecordlist&user_email=" + encodeURIComponent(owner_email) + "'>" + owner_email + "</a>";
        $("#owner_email_" + curIndex).show();
        $("#owner_email_" + curIndex).html(oemail);
    }

    $("#memoTextarea_" + curIndex).prop('disabled', true);        

    var retSource = null;
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
            var dpoint = ol.proj.fromLonLat([flng, flat]);
            drawCadastral("#map_address_" + curIndex, name, dpoint[0], dpoint[1], retSource);
        }
    }
    
    g_i_appended_data_count++;
}


function loadRecorForMerge(target, target_key, name) {
		var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "download_spe", "name": encodeURI(name), "clientid": userid, "target_email" : target_key };

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

				var fdata = r.data;
        mergeFlightRecordToView(target, fdata);

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

  // Create variable to hold new number of days to inject
  var dayNum;

  // 31 or 30 days?
  if(month === 'January' || month === 'March' || month === 'May' || month === 'July' || month === 'August' || month === 'October' || month === 'December') {
    dayNum = 31;
  } else if(month === 'April' || month === 'June' || month === 'September' || month === 'November') {
    dayNum = 30;
  } else {
  // If month is February, calculate whether it is a leap year or not
    var year = yearSelect.value;
    var isLeap = new Date(year, 1, 29).getMonth() == 1;
    isLeap ? dayNum = 29 : dayNum = 28;
  }

  // inject the right number of new <option> elements into the day <select>
  for(i = 1; i <= dayNum; i++) {
    var option = document.createElement('option');
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
  var date = new Date();
  var year = date.getFullYear();

  // Make this year, and the 100 years before it available in the year <select>
  for(var i = 0; i <= 100; i++) {
    var option = document.createElement('option');
    option.textContent = year-i;
    yearSelect.appendChild(option);
  }
}

function populateHours() {
  // populate the hours <select> with the 24 hours of the day
  for(var i = 0; i <= 23; i++) {
    var option = document.createElement('option');
    option.textContent = (i < 10) ? ("0" + i) : i;
    hourSelect.appendChild(option);
  }
}

function populateMinutes() {
  // populate the minutes <select> with the 60 hours of each minute
  for(var i = 0; i <= 59; i++) {
    var option = document.createElement('option');
    option.textContent = (i < 10) ? ("0" + i) : i;
    minuteSelect.appendChild(option);
  }
}

function verifyPhoneNo(phone_number){
    var userid = getCookie("dev_user_id");
    // check if phone number starts with 01 and is total of 11 digits    
    if((phone_number.length != 11) || phone_number.substring(0,2) !== '01') {
        showAlert(GET_STRING_CONTENT('msg_wrong_phone_format'));
        return;
    }
    
    // send phone verification
    var jdata = {
        "action": "position", 
        "daction" : "validate_phonenumber", 
        "phone_number" : phone_number,
        "clientid" : userid
    };
        
    ajaxRequest(jdata, 
        function (data){
            let result = data.result_code;
                        
            if(result === 0 || result === 3){ //정상응답 - 존재하는 번호이어도 괜찮음
                showAlert(GET_STRING_CONTENT('msg_verification_code_sent'));
                g_b_phonenumber_verified = false;
                // 인증하기 텍스트 -> 재전송
                $('#btn_verify_code').text("재전송");
                var duration = 60 * 3;
                var display = $('#remaining_time');
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
    var userid = getCookie("dev_user_id");    
		if(verification_code == ""){
			showAlert(GET_STRING_CONTENT('msg_code_empty'));
			return;
		} 
		
		var jdata = {
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
    var timer = duration, minutes, seconds;
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

		var vid = getYoutubeQueryVariable(youtube_url);

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
    var userid = getCookie("dev_user_id");

    if (!isSet(memo)) {
        showAlert(GET_STRING_CONTENT('msg_fill_memo'));
        return;
    }
    var jdata = { "action": "position", "daction": "set_memo", "clientid": userid, "name": encodeURI(name), "memo": encodeURI(memo) };

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
		var userid = getCookie("dev_user_id");

    if (!isSet(tag_value)) {
        showAlert(GET_STRING_CONTENT('msg_fill_tag'));
        return;
    }
    var jdata = { "action": "position", "daction": "set_tag", "clientid": userid, "name": encodeURI(name), "tag_values": encodeURI(tag_value) };

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
    var item = g_array_flight_rec[index];

    var userid = getCookie("dev_user_id");

    var memo = $("#memoTextarea_" + index).val();

    if (!isSet(memo)) {
        showAlert(GET_STRING_CONTENT('msg_fill_memo'));
        return;
    }
    var jdata = { "action": "position", "daction": "set_memo", "clientid": userid, "name": encodeURI(item.name), "memo": encodeURI(memo) };

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

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "delete", "clientid": userid, "name": encodeURI(name) };

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
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "mission", "mname": encodeURI(name), "daction": "delete", "clientid": userid };

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
    var info = $('#monitor').html("<font color=red><b>" + msg + "</b></font>");
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
            setTimeout(function () { registMission(mname, mspeed); }, 1000);
        },
        function () {}
    );
}

function registMission(mname, mspeed) {
    if (g_array_design_data.length <= 0) {
        showAlert(GET_STRING_CONTENT('msg_wrong_input'));
        return;
    }

    var nPositions = [];
    var bError = 0;
    for (var index = 0; index < g_array_design_data.length; index++) {
        var item = g_array_design_data[index];

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

        var mid = "mid-" + index;
        nPositions.push({ id: mid, lat: item.lat, lng: item.lng, alt: item.alt, act: item.act, actparam: item.actparam, speed: item.speed, roll: item.roll, pitch: item.pitch, yaw: item.yaw });
    }

    if (bError > 0) {
        showAlert(GET_STRING_CONTENT('msg_error_check'));
        return;
    }

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "mission", "mname": encodeURI(mname), "daction": "set", "missionspeed": mspeed, "missiondata": nPositions, "clientid": userid };

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


function drawLineTo2DMap(map, lineData) {
    var lines = new ol.geom.LineString(lineData);
    var lineSource = new ol.source.Vector({
        features: [new ol.Feature({
            geometry: lines,
            name: 'Line'
        })]
    });
    g_layer_2D_map_for_line = new ol.layer.Vector({
        source: lineSource,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#55a6cc',
                width: 2
            })
        })
    });

    map.addLayer(g_layer_2D_map_for_line);
}

function addPosIconsTo2DMap(posIcons) {
    if (posIcons.length <= 0) return;

    g_cur_2D_mainmap.on('click', function (evt) {        
        GATAGM('small_map_click', 'CONTENT');

        var feature = g_cur_2D_mainmap.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                return feature;
            });

        var locdata = null;
        if (feature) {
            var ii = feature.get('mindex');
            locdata = g_array_flight_rec[ii];

            setMoveActionFromMap(ii, locdata);
        }

        var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        if (locdata)
            showCurrentInfo([lonlat[0], lonlat[1]], locdata.alt);
        else
            showCurrentInfo([lonlat[0], lonlat[1]], '0');

    });

    var pSource = new ol.source.Vector({
        features: posIcons
    });

    g_layer_2D_map_for_icon = new ol.layer.Vector({
        source: pSource
    });

    g_cur_2D_mainmap.addLayer(g_layer_2D_map_for_icon);

}

function setFlightRecordDataToView(target, cdata, bfilter) {

    if (isSet(cdata) == false || cdata.length <= 0 || cdata == "" || cdata == "-") {
        if (bfilter == true) {
            cdata = g_array_flight_rec;
        }
        else {
        		//\uC704\uCE58 \uB370\uC774\uD130\uAC00 \uC5C6\uC74C.
            return false;
        }
    }

    var arrayMapPosIcons = [];
    g_array_flight_rec = [];
    g_array_altitude_data_for_chart = [];
    var lineData = [];

		var rlng, rlat;
    cdata.forEach(function (item, i, arr) {

        if (bfilter && i > 4 && isNeedSkip(item.lat, item.lng, item.alt) == true) {
        	return true;
				}

        addChartItem(i, item);

        var pos_icon = new ol.Feature({
		        geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
		        name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
		        mindex: i
		    });

		    var pos_icon_color = getColorPerAlt(item.alt);

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

    //if (isSet(g_layer_2D_map_for_line))
        g_cur_2D_mainmap.removeLayer(g_layer_2D_map_for_line);

    //if (isSet(g_layer_2D_map_for_icon))
        g_cur_2D_mainmap.removeLayer(g_layer_2D_map_for_icon);

		if (isSet(rlng) && isSet(rlat)) {
				moveToStartPoint3D(rlng, rlat, 600);
		}

    setSlider(cdata.length - 1);

    drawLineTo2DMap(g_cur_2D_mainmap, lineData);

    addPosIconsTo2DMap(arrayMapPosIcons);

    drawLineGraph();

    draw3DMap();

    var item = g_array_flight_rec[0];
    moveToPositionOnMap("private", 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);

    return true;
}

var oldScatterdatasetIndex = -1;
var oldScatterpointIndex = -1;

var oldLinedatasetIndex = -1;
var oldLinepointIndex = -1;


function computeCirclularFlight(start) {
    var property = new Cesium.SampledPositionProperty();

    if (!isSet(v3DMapViewer)) return null;

    v3DMapViewer.entities.removeAll();

    var i = 0;
    g_array_flight_rec.forEach(function (item) {
        var time = Cesium.JulianDate.addSeconds(
            start,
            i,
            new Cesium.JulianDate()
        );
        var position = Cesium.Cartesian3.fromDegrees(
            item.lng,
            item.lat,
            item.alt
        );
        property.addSample(time, position);

        var icon_color = getColorPerAlt3d(item.alt);

        //Also create a point for each sample we generate.
        v3DMapViewer.entities.add({
            position: position,
            point: {
                pixelSize: 1,
                color: icon_color,
                outlineWidth: 0
            },
        });

        i++;
    });

    return property;
}

var fixedFrameTransform;
var planePrimitives;
var v3DMapViewer;
var v3DMapCate;
var p3DMapEntity;
var s3DMapScene;

function getColor(colorName, alpha) {
    var color = Cesium.Color[colorName.toUpperCase()];
    return Cesium.Color.fromAlpha(color, parseFloat(alpha));
}

function draw3DMap() {
    var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));

    var position = computeCirclularFlight(start);
    if (!isSet(position)) return;

    p3DMapEntity.position = position;
    p3DMapEntity.orientation = new Cesium.VelocityOrientationProperty(position);
}

function remove3dObjects() {
    if (planePrimitives != null && planePrimitives.length > 0) {
        planePrimitives.forEach(function (owner) {
            owner.forEach(function (pr) {
                s3DMapScene.primitives.remove(pr);
            });
        });
    }
}

function addObjectTo3DMapWithGPS(index, owner, kind, lat, lng, alt) {

    if (!isSet(planePrimitives)) {
        return;
    }

    if (!(owner in planePrimitives)) {
        planePrimitives[owner] = [];
    }

    var camera = v3DMapViewer.camera;

    var position = Cesium.Cartesian3.fromDegrees(
        lng, lat, alt
    );

    var glbUrl = window.location.origin + "/center/imgs/drone.glb", 
    		gColor, gColor, sColor;
    		
    if (kind == "drone") {        
        gColor = "YELLOW";
        sColor = "RED";
    }
    else {    		
    		gColor = "GREEN";
    		sColor = "CYAN";
    }

    var hpRoll = new Cesium.HeadingPitchRoll();
    var planePrimitive = s3DMapScene.primitives.add(
        Cesium.Model.fromGltf({
            url: glbUrl,
            color: getColor(gColor, 1.0),
            silhouetteColor: getColor(sColor, 0.6),
            silhouetteSize: 1.0,
            modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
                position,
                hpRoll,
                Cesium.Ellipsoid.WGS84,
                fixedFrameTransform
            ),
            scale: 0.15,
            minimumPixelSize: 64,
        })
    );

    planePrimitive.readyPromise.then(function (model) {
        // Play and loop all animations at half-speed
        model.activeAnimations.addAll({
            multiplier: 0.5,
            loop: Cesium.ModelAnimationLoop.REPEAT,
        });

        var r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
        Cesium.Matrix4.multiplyByPoint(
            model.modelMatrix,
            model.boundingSphere.center,
            v3DMapCate
        );
        var heading = Cesium.Math.toRadians(230.0);
        var pitch = Cesium.Math.toRadians(-20.0);
        var hpRange = new Cesium.HeadingPitchRange();
        hpRange.heading = heading;
        hpRange.pitch = pitch;
        hpRange.range = r * 50.0;
        camera.lookAt(v3DMapCate, hpRange);
    });

    planePrimitives[owner].push(planePrimitive);

}

function addObjectTo3DMap(index, owner, kind) {
    addObjectTo3DMapWithGPS(index, owner, kind, 33.3834381, 126.5610038, 3000);
}

function map3DInit() {
  	if(g_b_3D_map_on == false) {
	    $("#main3dMap").hide();//for the license
	    $("#map3dViewer").text(GET_STRING_CONTENT('msg_sorry_now_on_preparing'));
	    return;
	}


    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMjRmOWRiNy1hMTgzLTQzNTItOWNlOS1lYjdmZDYxZWFkYmQiLCJpZCI6MzM1MTUsImlhdCI6MTU5ODg0NDIxMH0.EiuUUUoakHeGjRsUoLkAyNfQw0zXCk6Wlij2z9qh7m0';
    v3DMapViewer = new Cesium.Viewer("main3dMap", {
        infoBox: false, //Disable InfoBox widget
        selectionIndicator: false, //Disable selection indicator
        shouldAnimate: false, // Enable animations
        baseLayerPicker: false,
        timeline: false,
        animation: false,
        clock: false,
        fullscreenButton: true,
        geocoder: false,
        s3DMapSceneOnly: true,
        homeButton: false,
        navigationHelpButton: true,
        navigationInstructionsInitiallyVisible: false,
        automaticallyTrackDataSourceClocks: false,
        orderIndependentTranslucency: false,
        terrainProvider: Cesium.createWorldTerrain(),
    });

    v3DMapViewer.scene.globe.enableLighting = false;
    v3DMapViewer.scene.globe.depthTestAgainstTerrain = true;
    Cesium.Math.setRandomNumberSeed(3);

    fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator(
        "north",
        "west"
    );

    s3DMapScene = v3DMapViewer.scene;

    const osmBuildings = s3DMapScene.primitives.add(Cesium.createOsmBuildings());

    //Actually create the entity
    p3DMapEntity = v3DMapViewer.entities.add({
        path: {
            resolution: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.1,
                color: Cesium.Color.AQUA,
            }),
            width: 10,
        }
    });

    c3ddataSource = new Cesium.GeoJsonDataSource();
    v3DMapViewer.dataSources.add(c3ddataSource);

    v3DMapViewer.trackedEntity = undefined;
    v3DMapViewer.zoomTo(
        v3DMapViewer.entities,
        new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(-90),
            Cesium.Math.toRadians(-15),
            1000
        )
    );

    v3DMapCate = new Cesium.Cartesian3();
    planePrimitives = {};
}

function move3DmapIcon(owner, index, lat, lng, alt, pitch, yaw, roll) {
    if (typeof Cesium !== "undefined") {

        if (!isSet(planePrimitives)) return;

        var position = Cesium.Cartesian3.fromDegrees(
            lng,
            lat,
            alt);

        yaw = yaw * 1;
        yaw = yaw < 0 ? (360 + yaw) : yaw;
        yaw = Math.PI / 180 * yaw;

        pitch = pitch * 1;
        pitch = pitch < 0 ? (360 + pitch) : pitch;
        pitch = Math.PI / 180 * pitch;

        roll = roll * 1;
        roll = roll < 0 ? (360 + roll) : roll;
        roll = Math.PI / 180 * roll;

        var hpRoll = new Cesium.HeadingPitchRoll();
        hpRoll.pitch = pitch;
        hpRoll.heading = yaw;
        hpRoll.roll = roll;

        Cesium.Transforms.headingPitchRollToFixedFrame(
            position,
            hpRoll,
            Cesium.Ellipsoid.WGS84,
            fixedFrameTransform,
            planePrimitives[owner][index].modelMatrix
        );
    }
}

function remove2dObjects() {
    if (g_array_point_cur_2D_mainmap_for_object != null) {
        g_array_point_cur_2D_mainmap_for_object.forEach(function (owner) {
            owner.forEach(function (cur_pos) {
                g_vector_2D_mainmap_for_object.removeFeature(cur_pos);
            });
        });
    }

    g_array_icon_cur_2D_mainmap_for_object = null;
}

function addObjectTo2DMap(index, owner, kind) {
    if (!isSet(g_vector_2D_mainmap_for_object)) return;

    if (!isSet(g_array_point_cur_2D_mainmap_for_object)) {
        g_array_point_cur_2D_mainmap_for_object = [];
        g_array_icon_cur_2D_mainmap_for_object = [];
    }

    if (!(owner in g_array_point_cur_2D_mainmap_for_object)) {
        g_array_point_cur_2D_mainmap_for_object[owner] = [];
        g_array_icon_cur_2D_mainmap_for_object[owner] = [];
    }

    var current_pos = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([126.5610038, 33.3834381]))
    });

    var dsrc;
    if (kind == "drone") {
        dsrc = './imgs/position2.png';
    }
    else {
        dsrc = './imgs/position.png';
    }

    var current_pos_image = new ol.style.Icon(({
        //color: '#8959A8',
        scale: 1.4,
        crossOrigin: 'anonymous',
        src: dsrc
    }));

    if (owner == "private" && kind == "drone")
        current_pos.setStyle(style2DObjectFunction(current_pos_image, ""));
    else
        current_pos.setStyle(style2DObjectFunction(current_pos_image, index + " : " + kind + " / " + owner));

    g_array_point_cur_2D_mainmap_for_object[owner].push(current_pos);
    g_array_icon_cur_2D_mainmap_for_object[owner].push(current_pos_image);

    g_vector_2D_mainmap_for_object.addFeature(current_pos);
}

function map2DInit() {

    var styles = [
    		'Road (Detailed)',
        'Road',
        'Aerial',
        'AerialWithLabels',
    ];
    var maplayers = [];

    maplayers.push(
				new ol.layer.Tile({
		      source: new ol.source.OSM(),
		    })
		);

		let style_len = styles.length;
    for (var i = 1; i <= style_len; i++) {
        maplayers.push(new ol.layer.Tile({
            visible: false,
            preload: Infinity,
            source: new ol.source.BingMaps({
                key: 'AgMfldbj_9tx3cd298eKeRqusvvGxw1EWq6eOgaVbDsoi7Uj9kvdkuuid-bbb6CK',
                imagerySet: styles[i],
                // use maxZoom 19 to see stretched tiles instead of the BingMaps
                // "no photos at this zoom level" tiles
                maxZoom: 19
            })
        }));
    }

    var dokdo = ol.proj.fromLonLat([126.5610038, 33.3834381]);
    var scaleLineControl = new ol.control.ScaleLine();

    g_vector_2D_mainmap_for_design_icon = new ol.source.Vector();

    g_view_cur_2D_mainmap = new ol.View({
        center: dokdo,
        zoom: 17
    });

    var geolocation = new ol.Geolocation({
        trackingOptions: {
            enableHighAccuracy: true
        },
        projection: g_view_cur_2D_mainmap.getProjection()
    });

    g_vector_2D_mainmap_for_cada = new ol.source.Vector({});
    g_vector_2D_mainmap_for_cada.on('tileloaderror', function () {
        showAlert(GET_STRING_CONTENT('msg_failed_to_load_map_sorry'));
    });

    var pointLayer = new ol.layer.Vector({
        source: g_vector_2D_mainmap_for_cada,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
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

    scaleLineControl.setUnits("metric");

		g_vector_2D_mainmap_for_object = new ol.source.Vector();

    var vectorLayer = new ol.layer.Vector({
        source: g_vector_2D_mainmap_for_object,
        zIndex: 100
    });

    maplayers.push(pointLayer);
    maplayers.push(vectorLayer);

    // update the HTML page when the position changes.
    geolocation.on('change', function () {
    		if (!$('#accuracy')) return;

        $('#accuracy').text(geolocation.getAccuracy() + ' [m]');
        $('#altitude').text(geolocation.getAltitude() + ' [m]');
        $('#altitudeAccuracy').text(geolocation.getAltitudeAccuracy() + ' [m]');
        $('#heading').text(geolocation.getHeading() + ' [rad]');
        $('#speed').text(geolocation.getSpeed() + ' [m/s]');
        var pos = geolocation.getPosition();
        var lonLat = ol.proj.toLonLat(pos);
        moveToPositionOnMap("private", 0, lonLat[1], lonLat[0], 0, geolocation.getHeading(), 0, 0);
    });

    // handle geolocation error.
    geolocation.on('error', function (error) {
        var info = $('#monitor');
        if (info)
        	info.text(error.message);
    });

    if ($('#track').length) {
        $('#track').change(function () {
            geolocation.setTracking($("#track").is(":checked"));
        });
    }

    var select = document.getElementById('layer-select');
    if (isSet(select)) {
        select.addEventListener('change', function () {
            var select = document.getElementById('layer-select');
            var style = select.value;
            for (var i = 0; i < style_len; ++i) {
                maplayers[i].setVisible(styles[i] === style);
            }
        });
    }

    maplayers[3].setVisible(true); //AerialWithLabels
    maplayers[4].setVisible(true); //pointLayer
    maplayers[5].setVisible(true); //vectorLayer


  	var overviewMapControl = new ol.control.OverviewMap({
		  layers: [
		    new ol.layer.Tile({
		      source: new ol.source.OSM(),
		    }) ],
		  collapsed : false
		});


    g_cur_2D_mainmap = new ol.Map({
        target: 'mainMap',
        controls: ol.control.defaults().extend([
            scaleLineControl, overviewMapControl
        ]),
        layers: maplayers,
        // Improve user experience by loading tiles while animating. Will make
        // animations stutter on mobile or slow devices.
        loadTilesWhileAnimating: true,
        view: g_view_cur_2D_mainmap
    });


    var curCoodinate;
    var finalPlanGenPositionLonLat = [0,0];

    var modify = new ol.interaction.Modify({
		  hitDetection: vectorLayer,
		  source: g_vector_2D_mainmap_for_object,
		});
		modify.on(['modifystart', 'modifyend'], function (evt) {
		  if(evt.type === 'modifystart')
			  $("#mainMap").css('cursor', 'grabbing');
			else {
				finalPlanGenPositionLonLat = ol.proj.toLonLat(curCoodinate);

				if ($('#lat').length) {
					$('#lat').val(finalPlanGenPositionLonLat[1]);
					$('#lng').val(finalPlanGenPositionLonLat[0]);
				}

				$("#mainMap").css('cursor', 'pointer');
			}
		});
		var overlaySource = modify.getOverlay().getSource();
		overlaySource.on(['addfeature', 'removefeature'], function (evt) {
		  if(evt.type === 'addfeature')
			  $("#mainMap").css('cursor', 'pointer');
			else
				$("#mainMap").css('cursor', '');
		});

		g_cur_2D_mainmap.on('pointermove', function(evt) {
		  curCoodinate = evt.coordinate;

		});

		g_cur_2D_mainmap.addInteraction(modify);
}

function move2DMapIcon(owner, index, lat, lng, alt, yaw) {
    var location = ol.proj.fromLonLat([lng * 1, lat * 1]);

    if (g_array_point_cur_2D_mainmap_for_object != null && owner in g_array_point_cur_2D_mainmap_for_object) {
	    yaw *= 1;
	    yaw = yaw < 0 ? (360 + yaw) : yaw;
	    yaw = Math.PI / 180 * yaw;

    	g_array_point_cur_2D_mainmap_for_object[owner][index].setGeometry(new ol.geom.Point(location));
    	g_array_icon_cur_2D_mainmap_for_object[owner][index].setRotation(yaw);
    }

    if (isSet(g_view_cur_2D_mainmap) && owner == g_str_cur_monitor_object_owner && g_i_cur_monitor_object_index == index)
        g_view_cur_2D_mainmap.setCenter(location);
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

function uploadFlightList(isUpdate) {
		var mname = $("#record_name_field").val();

		if (mname == "") {
			showAlert(GET_STRING_CONTENT('msg_input_record_name'));
			return;
		}

		var mmemo = $("#memoTextarea").val();
		var tag_values = $("#tagTextarea").val();

		var youtube_data = $("#youtube_url_data").val();    
    var cVal = $(":input:radio[name='media_upload_kind']:checked").val();
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

    var params = {};

    var price = 0;

   	if (isUpdate == false && g_str_cur_lang == "KR") {
    	var checked = $("#salecheck").is(":checked");
			if(checked) {
				var t_p = $("#price_input_data").val();
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

    	if (isSet(youtube_data)) {
    		var params = {file: recordFileForUploadFile, mname : mname, mmemo : mmemo, price: price, tag_values : tag_values, youtube_data : youtube_data, isUpdate : isUpdate};
    		askIsSyncData(params, uploadDJIFlightListCallback);
    		return;
    	}

    	showLoader();

    	params = {file : recordFileForUploadFile, mname : mname, mmemo: mmemo, price: price, tag_values : tag_values, youtube_data : youtube_data, isUpdate : isUpdate, isSyncData : false};
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

    	var flightTime = $("#flighttime_input_data").val();
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

   	var youtube_data = massageYotubeUrl(params.youtube_data);
    var jdata = { "action": "position", "daction": "convert",
    	"clientid": userid, "name": encodeURI(params.mname),
    	"youtube_data_id": youtube_data,
    	"update" : params.isUpdate,
    	"sync" : params.isSyncData,
    	"price" : params.price,
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


function showCurrentInfo(dlatlng, alt) {
    if ($("#position_info").length <= 0) return;

    var latlng = ol.proj.fromLonLat(dlatlng);
    var hdms = ol.coordinate.toStringHDMS(latlng);
    var itext = hdms + " [ Lat: " + dlatlng[1] + " / Lng: " + dlatlng[0] + " / Alt: " + alt + " ]";
    $("#position_info").text(itext);
}

function openLineTip(oChart, datasetIndex, pointIndex) {
    if (!isSet(oChart)) return false;

    if (oldLinedatasetIndex >= 0)
        closeTip(oChart, oldLinedatasetIndex, oldLinepointIndex);

    if (oChart.tooltip._active == undefined)
        oChart.tooltip._active = []
    var activeElements = oChart.tooltip._active;
    var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];

    oldLinedatasetIndex = datasetIndex;
    oldLinepointIndex = pointIndex;

    for (var i = 0; i < activeElements.length; i++) {
        if (requestedElem._index == activeElements[i]._index)
            return false;
    }
    activeElements.push(requestedElem);
    oChart.tooltip._active = activeElements;
    oChart.tooltip.update(true);
    oChart.draw();

    return true;
}

function openScatterTip(oChart, datasetIndex, pointIndex) {
    if (!isSet(oChart)) return false;

    if (oldScatterdatasetIndex >= 0)
        closeTip(oChart, oldScatterdatasetIndex, oldScatterpointIndex);

    if (oChart.tooltip._active == undefined)
        oChart.tooltip._active = []
    var activeElements = oChart.tooltip._active;
    var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];

    oldScatterdatasetIndex = datasetIndex;
    oldScatterpointIndex = pointIndex;

    for (var i = 0; i < activeElements.length; i++) {
        if (requestedElem._index == activeElements[i]._index)
            return false;
    }
    activeElements.push(requestedElem);
    oChart.tooltip._active = activeElements;
    oChart.tooltip.update(true);
    oChart.draw();

    return true;
}

function closeTip(oChart, datasetIndex, pointIndex) {
    var activeElements = oChart.tooltip._active;
    if (!isSet(activeElements) || activeElements.length == 0)
        return;

    var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];
    for (var i = 0; i < activeElements.length; i++) {
        if (requestedElem._index == activeElements[i]._index) {
            activeElements.splice(i, 1);
            break;
        }
    }
    oChart.tooltip._active = activeElements;
    oChart.tooltip.update(true);
    oChart.draw();
}


function setMoveActionFromMovie(index, item) {
    openScatterTip(window.myScatter, 0, index);
    openLineTip(window.myLine, 0, index);

    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    setSliderPos(index);

    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    moveToPositionOnMap("private", 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
}

function setMoveActionFromScatterChart(index, item) {
    openLineTip(window.myLine, 0, index);

    if ("dsec" in item) {
        movieSeekTo(item.dsec * 1);
    }

    setSliderPos(index);
    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    moveToPositionOnMap("private", 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
}

function setMoveActionFromLineChart(index, item) {
    openScatterTip(window.myScatter, 0, index);

    if ("dsec" in item) {
        movieSeekTo(item.dsec * 1);
    }

    setSliderPos(index);
    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    moveToPositionOnMap("private", 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
}

function setMoveActionFromSliderOnMove(index, item) {
    $('#sliderText').html(index);

    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    moveToPositionOnMap("private", 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
}

function setMoveActionFromSliderOnStop(index, item) {
    openScatterTip(window.myScatter, 0, index);
    openLineTip(window.myLine, 0, index);
    $('#sliderText').html(index);

    if ("dsec" in item) {
        movieSeekTo(item.dsec * 1);
    }

    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    moveToPositionOnMap("private", 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
}

function setMoveActionFromMap(index, item) {
    openScatterTip(window.myScatter, 0, index);
    openLineTip(window.myLine, 0, index);

    setRollStatus(item.roll);
    setYawStatus(item.yaw);
    setPitchStatus(item.pitch);
    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);

    if ("dsec" in item) {
        movieSeekTo(item.dsec * 1);
    }

    setSliderPos(index);
}

function saveYoutubeUrl(params, callback) {

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "youtube", "youtube_data_id": params.youtube_data, "clientid": userid, "name": encodeURI(params.mname), "tag_values" : params.tag_values, "memo" : params.mmemo, "starttime" : params.startTime };

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


function setFlightRecordTitleName() {
		var target_name = $('#record_name_field').val();
    if (target_name == "") {
        showAlert(GET_STRING_CONTENT('msg_wrong_input'));
        return;
    }

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "set_name", "clientid": userid, "target_name": target_name, "name": encodeURI(g_str_cur_flight_record_name) };

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

function setYoutubeID() {
    var data_id = $('#youtube_url_data').val();
    if (data_id == "") {
        showAlert(GET_STRING_CONTENT('msg_wrong_input'));
        return;
    }

    var youtube_data = massageYotubeUrl(data_id);

    var mmemo = $("#memoTextarea").val();

    var tag_values = $("#tagTextarea").val();

    if (youtube_data.indexOf("youtube") >= 0) {
        setYoutubePlayerForDetaileView(youtube_data);

        var params = {mname: g_str_cur_flight_record_name,
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

    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    g_str_youtube_data_id_for_detail_view = data_id;

    var firstScriptTag = document.getElementsByTagName('script')[0];
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
    var data_id = d_id;
    var r_id = d_id.split('=');
    if (r_id.length > 1) {
        data_id = r_id[1];
    }

    if (g_youtube_player_for_detail_view != null) {
        g_youtube_player_for_detail_view.loadVideoById(data_id, 0, "large");
        return;
    }

    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    g_str_youtube_data_id_for_detail_view = data_id;

    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
		if (g_str_cur_viewmode == "pilot" &&
				(g_str_page_action == "recordlist"
				|| g_str_page_action == "publicrecordlist"
				|| g_str_page_action == "center"
				|| g_str_page_action == "summary_list")) {
			getFullFlightRecords(g_str_current_target);
    	getFlightRecords(g_str_current_target);
    	return;
    }

    if (g_str_cur_viewmode != "pilot"
    		&& g_str_page_action == "center" ) {
    	getFullFlightRecords(g_str_current_target);
    	getFlightRecords(g_str_current_target);
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
    });//youTubePlayer1\uC14B\uD305
}

function onPlayerReady(event) {
    event.target.playVideo();//\uC790\uB3D9\uC7AC\uC0DD

    var lastTime = -1;
    var interval = 1000;

    var checkPlayerTime = function () {
        if (lastTime != -1) {
            if (g_youtube_player_for_detail_view.getPlayerState() == YT.PlayerState.PLAYING) {
                var t = g_youtube_player_for_detail_view.getCurrentTime();
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
		for ( var i = 0 ; i < g_array_youtube_players.length ; i ++ ) { //
				if(typeof g_array_youtube_players[i].getPlayerState === 'undefined') continue;

        var state = g_array_youtube_players[i].getPlayerState();

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

    var index = 0;
    g_array_flight_rec.some(function (item) {
        if ("dsec" in item) {
            var ds = (item.dsec * 1);
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

function addChartItem(i, item) {
    g_array_flight_rec.push(item);
    g_array_altitude_data_for_chart.push({ x: i, y: item.alt });
}


function uploadCheckBeforeUploadFlightList() {

		var cVal = $(":input:radio[name='media_upload_kind']:checked").val();
		if (cVal == "tab_menu_set_youtube_address" || cVal == "tab_menu_set_no_video") {
      uploadFlightList(false);
      return;
    }

  	var mname = $("#record_name_field").val();
		if (mname == "") {
			showAlert(GET_STRING_CONTENT('msg_input_record_name'));
			return;
		}

		var price = 0;
   	if (g_str_cur_lang == "KR") {
    	let tchecked = $("#salecheck").is(":checked");
			if(tchecked) {
				var t_p = $("#price_input_data").val();
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

    var mmemo = $("#memoTextarea").val();
		var tag_values = $("#tagTextarea").val();
        
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
    var userid = getCookie("dev_user_id");
    var jdata = {"clientid" : userid, "action" : "util", "daction": "gps_by_address", "address" : encodeURI(address)};

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
		var userid = getCookie("dev_user_id");
    var jdata = {"clientid" : userid, "action" : "util", "daction": "address_by_gps"};

    var latxlng = $("#latxlng").val();
    var gpsar;
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
