/* Copyright 2021 APLY Inc. All rights reserved. */

"use strict";

let g_b_monitor_started;
let g_b_phonenumber_verified = false;

let g_cur_2D_mainmap;
let g_view_cur_2D_mainmap;
let g_array_point_cur_2D_mainmap_for_object;
let g_array_icon_cur_2D_mainmap_for_object;
let g_vector_2D_mainmap_for_cada;
let g_vector_2D_mainmap_for_object;
let g_vector_2D_mainmap_for_lines;

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

let g_loc_kalmanfilter_lat;
let g_loc_kalmanfilter_lng;
let g_loc_kalmanfilter_alt;
let g_loc_kalmanfilter_yaw;
let g_loc_kalmanfilter_pitch;
let g_loc_kalmanfilter_roll;

let g_b_is_first_for_monitor = true;

let g_array_cur_monitor_object;

let g_b_is_youtube_seek = false;

// 유튜브 약관 준수 - 동시에 2개 이상의 영상이 재생되면 안된다!
let g_array_youtube_players = [];
let g_i_youtube_player_index = null;
let g_i_youtube_player_index_stop = null;
let g_i_youtube_player_index_play = null;

let g_str_address_temp_val = "";

let g_array_str_waypointactions_DJI = ["STAY", "START_TAKE_PHOTO", "START_RECORD", "STOP_RECORD", "ROTATE_AIRCRAFT", "GIMBAL_PITCH", "NONE", "CAMERA_ZOOM", "CAMERA_FOCUS"];

let g_array_cur_controller_for_viewmode = { "pilot": "/center/main.html", "developer": "/center/main_dev.html" };

let g_i_cur_serviceListTimerId = -1;

let g_component_upload_youtube_video;

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

    if (g_str_cur_viewmode == "") g_str_cur_viewmode = "pilot";

    if (g_str_cur_viewmode == "pilot") {
        $('#view_mode_selector').click(function (e) {
            e.preventDefault();

            setCookie("viewmode", "developer", 1);
            GATAGM('developer_view_link_click', 'MEMU');
            location.href = "/center/main_dev.html?page_action=center";
        });
    }
    else {

        $('#view_mode_selector').click(function (e) {
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
        $('#side_menu_poi_design').text(GET_STRING_CONTENT('side_menu_poi_design'));
        $('#side_menu_poi_list').text(GET_STRING_CONTENT('side_menu_poi_list'));

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
        $("#main_contents").load("mission_design.html", function () { });        
    }
    else if (g_str_page_action == "missionlist") {
        $("#main_contents").load("mission_list.html", function () { });
    }
    else if (g_str_page_action == "missiongen") {
        $("#main_contents").load("mission_gen.html", function () {
            missionGenInit();
        });
    }    
    else if (g_str_page_action == "poidesign") {
        $("#main_contents").load("poi_design.html", function () { });        
    }
    else if (g_str_page_action == "poilist") {
        $("#main_contents").load("poi_list.html", function () { });        
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
                "이미 파트너 등록을 완료 하였습니다.",
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
        $("#main_contents").load("record_upload.html", function () { });
    }
    else if (g_str_page_action == "recordupload_ex") {
        $("#main_contents").load("record_upload_ex.html", function () { });
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
    if (getCookie("user_kind") != "partner" && g_str_cur_lang == "KR") {
        $("#partner_register_top_menu").show();
    }
    else {
        $("#partner_register_top_menu").hide();
    }
}

function utilInit() {
    $("#latxlng").keypress(function (e) {
        if (e.which == 13) {
            let latxlng = $("#latxlng").val();
            let lat, lng;
            if (isSet(latxlng)) {
                let gpsar = latxlng.split(",");
                lat = gpsar[0];
                lng = gpsar[1];
            }
            else {
                lat = $("#lat").val();
                lng = $("#lng").val();
            }

            requestAddressByGPS(lat, lng, function() {
                    if (r.result == "success") {
                        $("#address").val(r.address);                
                    }
                    else {
                        showAlert(GET_STRING_CONTENT('msg_wrong_input'));                
                    }
                }, function (request, status, error) {
                    hideLoader();
            }); 
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
        $("#show_token").click(function (e) {
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

    $("#chkFlightHistory").change(function () {
        showFlightRecordsList($("#chkFlightHistory").is(":checked"));
    });

    $("#chkCompany").change(function () {
        showCompanyList($("#chkCompany").is(":checked"));
    });

    getCompanyList();
    getDUNIServiceRequest(1);
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

    $("#search_key").keypress(function (e) {
        if (e.which == 13) {
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
        function () { }
    );
}

function requestDUNIServiceRequest(r_id, index) {
    GATAGM('center_request_service_btn_click_' + r_id, 'CONTENT');

    let userid = getCookie("dev_user_id");
    let jdata = { "action": "util", "daction": "duni_service_bet", "clientid": userid, "r_id": (r_id * 1) };

    showLoader();

    ajaxRequest(jdata, function (r) {
        hideLoader();

        if (r.result == "success") {
            showAlert(GET_STRING_CONTENT('msg_request_is_accepted'));

            $("#request_duni_" + index).empty();
            $("#request_duni_" + index).text(GET_STRING_CONTENT('msg_accepted'));
        }
        else {
            if (r.result_code == 6) {
                setTimeout("askParnterRequestExt()", 300);
                return;
            }

            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        }
    },
        function (request, status, error) {
            hideLoader();
            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        });
}

function getDUNIServiceRequest(page) {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "util", "daction": "duni_service_request_list", "clientid": userid, "page": page };

    showLoader();

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
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

            retData.forEach(function (d, index, arr) {

                let htmlString = "<tr><th scope='row' class='text-center'>" + (index + 1) + "</th><td class='text-center'>" + d.kind + "</td><td class='text-center'>" + d.title + "</td><td class='text-center'><div id='request_duni_" + index + "'>";

                if (d.status == "P") {
                    if (d.requested == true) {
                        htmlString += GET_STRING_CONTENT('msg_accepted');
                        htmlString += ("(" + makeDateTimeFormat(new Date(d.requested_time), true) + ")");
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

                $("#partnerServiceRequest_" + index).click(function (e) {
                    e.preventDefault();

                    showAskDialog(
                        GET_STRING_CONTENT('modal_title'),
                        GET_STRING_CONTENT('msg_are_you_sure'),
                        GET_STRING_CONTENT('modal_confirm_btn'),
                        false,
                        function () {
                            setTimeout("requestDUNIServiceRequest(" + d.r_id + ", " + index + ")", 300);
                        },
                        function () { }
                    );
                });
            });

            if (cur_page == 1) {
                if (allcount > 1) {
                    $("#duni_service_request_list").append('<div class="row"><div class="col-md-12 text-right"><button type="button" class="btn btn-light" id="service_list_next">more</button></div></div>');

                    $("#service_list_next").click(function () {
                        cur_page++;
                        getDUNIServiceRequest(cur_page);
                    });
                }
            }
            else if (cur_page < allcount && allcount > 1) {
                $("#duni_service_request_list").append('<div class="row"><div class="col-md-12 text-right"><button type="button" class="btn btn-light" id="service_list_prev"><</button> <button type="button" class="btn btn-link" id="service_list_next">></button></div></div>');

                $("#service_list_next").click(function () {
                    cur_page++;
                    getDUNIServiceRequest(cur_page);
                });

                $("#service_list_prev").click(function () {
                    cur_page--;
                    getDUNIServiceRequest(cur_page);
                });
            }
            else if (cur_page == allcount) {
                $("#duni_service_request_list").append('<div class="row"><div class="col-md-12 text-right"><button type="button" class="btn btn-light" id="service_list_prev">ㅡ</button></div></div>');

                $("#service_list_prev").click(function () {
                    cur_page--;
                    getDUNIServiceRequest(cur_page);
                });
            }

            startRequestTableAnimation();
        }
    },
        function (request, status, error) {
            $("#duni_service_request_list").html("No request");
            hideLoader();
        });
}

function startRequestTableAnimation() {
    if (g_i_cur_serviceListTimerId >= 0)
        clearTimeout(g_i_cur_serviceListTimerId);

    g_i_cur_serviceListTimerId = -1;

    $("#service_request_list_table tr").each(function (index) {
        $(this).css("visibility", "hidden");
    });

    $("#service_request_list_table tr").each(function (index) {
        //$(this).delay(index*500).show(1000);
        $(this).css({ "visibility": "visible", "opacity": 0.0 }).delay(index * 500).animate({ opacity: 1.0 }, 500);
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

    requestGPSByAddress(address, function(r) {

            if (!isSet(r.data)) {                    
                showAlert(GET_STRING_CONTENT('msg_wrong_input'));
                return;
            }

            if(r.result == "success") {                
                $('#lat').val(r.data.lat);
                $('#lng').val(r.data.lng);

                genPlan(r.data.lat * 1, r.data.lng * 1);
            }
            else {        
                showAlert(GET_STRING_CONTENT('msg_input_correct_address'));
            }
        },
        function () {
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

    requestAddressByGPS(lat, lng, function (r) {
            if (r.result == "success") {
                $("#gen_address").val(r.address);
                genPlan(lat, lng);
            }
            else {
                showAlert(GET_STRING_CONTENT('msg_wrong_input'));                
            }
        }, function () {
            hideLoader();
        });
}


function genPlan(lat, lng) {
    let data =
        [
            { "alt": 10, "speed": 1.2, "act": 0, "actparam": "0", "lat": lat, "lng": lng }, // 2m 고도, 1.5 m/s 속도로 타겟 지점으로 이동
            { "alt": 10, "speed": 1.2, "act": 5, "actparam": "-89", "lat": lat, "lng": lng }, // gimbal_pitch, 직각아래
            { "alt": 10, "speed": 1.2, "act": 4, "actparam": "0", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 정북
            { "alt": 10, "speed": 1.2, "act": 2, "actparam": "0", "lat": lat, "lng": lng }, // //start_record
            { "alt": 40, "speed": 1.2, "act": 0, "actparam": "0", "lat": lat, "lng": lng }, // //stay // 고도 40m까지 업
            { "alt": 40, "speed": 1.2, "act": 5, "actparam": "-45", "lat": lat, "lng": lng }, // gimbal_pitch, 정면
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "15", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "30", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "45", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "60", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "75", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "90", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "105", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "120", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "135", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "150", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "165", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "180", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "-15", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "-30", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "-45", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "-60", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "-75", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "-90", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "-105", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "-120", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "-135", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "-150", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "-165", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 40, "speed": 1.2, "act": 4, "actparam": "-180", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 180
            { "alt": 41, "speed": 1.2, "act": 4, "actparam": "0", "lat": lat, "lng": lng }, // ROTATE_AIRCRAFT, 정북
            { "alt": 10, "speed": 1.2, "act": 0, "actparam": "0", "lat": lat, "lng": lng }, // 10m 고도
            { "alt": 10, "speed": 1.2, "act": 3, "actparam": "0", "lat": lat, "lng": lng } // stop_record, 촬영 정지
        ];

    g_array_design_data = data;

    g_array_design_data.forEach(function (item, index, d) {
        let dt = { "lat": lat, "lng": lng, "alt": item.alt + 500, "dsec": index };
        g_array_flight_rec.push(dt);
    });

    moveToPositionOnMap("private", 0, lat, lng, 600, 0, 0, 0);

    let dpoint = ol.proj.fromLonLat([lng, lat]);
    drawCadastral(null, null, dpoint[0], dpoint[1], g_vector_2D_mainmap_for_cada);

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
                function () { }
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

function makeFlightRecordsToTable(target, target_key, data) {
    if (data == null || data.length == 0)
        return;

    data.sort(function (a, b) { // \uB0B4\uB9BC\uCC28\uC21C
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
                            function () { }
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
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, alt),
        orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-70.0),
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

    let icon = createNewIconFor2DMap(index, { lat: flat, lng: flng, alt: 0, hasYoutube: hasYoutube });
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
            tag_array.forEach(function (tg) {
                appendRow = appendRow + "<a href=" + g_array_cur_controller_for_viewmode["pilot"] + "?page_action=" + targetList + "recordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
            });
        }
        catch (e) {
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


function verifyPhoneNo(phone_number) {
    let userid = getCookie("dev_user_id");
    // check if phone number starts with 01 and is total of 11 digits
    if ((phone_number.length != 11) || phone_number.substring(0, 2) !== '01') {
        showAlert(GET_STRING_CONTENT('msg_wrong_phone_format'));
        return;
    }

    // send phone verification
    let jdata = {
        "action": "position",
        "daction": "validate_phonenumber",
        "phone_number": phone_number,
        "clientid": userid
    };

    ajaxRequest(jdata,
        function (data) {
            let result = data.result_code;
            stopTimer();
            if (result === 0 || result === 3) { //정상응답 - 존재하는 번호이어도 괜찮음
                showAlert(GET_STRING_CONTENT('msg_verification_code_sent'));
                g_b_phonenumber_verified = false;
                // 인증하기 텍스트 -> 재전송
                $('#btn_verify_code').text("재전송");
                let duration = 60 * 3;
                let display = $('#remaining_time');
                startTimer(duration, display, function () {
                    showAlert(GET_STRING_CONTENT('msg_phone_verification_timeout'));
                    $("#code_verification_input").hide();
                });

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

function verifyCode(verification_code, successCallback) {
    let userid = getCookie("dev_user_id");
    if (verification_code == "") {
        showAlert(GET_STRING_CONTENT('msg_code_empty'));
        return;
    }

    let jdata = {
        "action": "position",
        "daction": "check_verifycode",
        "phone_number": $('#user_phonenumber').val(),
        "verify_code": verification_code,
        "clientid": userid
    };
    ajaxRequest(jdata,
        function (data) {

            let result = data.result_code;

            if (result === 0) {
                successCallback(data);
            }
            else if (result === 2) {
                showAlert(GET_STRING_CONTENT('msg_wrong_verification_code'));
            }
            else if (result === 4) {
                showAlert(GET_STRING_CONTENT('msg_phone_verification_timeout'));
                stopTimer();
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
        function () { }
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
        function () { }
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

        let params = {
            mname: g_str_cur_flight_record_name,
            mmemo: mmemo,
            tag_values: tag_values,
            youtube_data: youtube_data,
            price: -1, flat: -999, flng: -999
        };

        saveYoutubeUrl(params, function (bSuccess) {
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
        && g_str_page_action == "center") {
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
    let interval = 1000;

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
    };

    setTimeout(checkPlayerTime, interval); /// initial call delayed
}


function appendMissionList(data) {
    if (data == null) return;
    if (data.length == 0) return;

    data.sort(function (a, b) { // \uB0B4\uB9BC\uCC28\uC21C
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

function onPlayerStateChange(event) {
    for (let i = 0; i < g_array_youtube_players.length; i++) { //
        if (!g_array_youtube_players[i]
            || typeof g_array_youtube_players[i] === 'undefined'
            || typeof g_array_youtube_players[i].getPlayerState === 'undefined') continue;

        let state = g_array_youtube_players[i].getPlayerState();

        // 초기 화면에서 재생 된 경우
        if (state === YT.PlayerState.PLAYING && g_i_youtube_player_index === null) {
            g_i_youtube_player_index = i;
            // 다른 플레이어가 재생 중에 그 선수 이외가 재생 된 경우
        } else if ((state === YT.PlayerState.BUFFERING || state === YT.PlayerState.PLAYING) && g_i_youtube_player_index !== i) {
            g_i_youtube_player_index_stop = g_i_youtube_player_index;
            g_i_youtube_player_index_play = i;
        }
    }

    // 재생 중이던 플레이어를 일시 중지
    if (g_i_youtube_player_index_stop !== null) {
        g_array_youtube_players[g_i_youtube_player_index_stop].pauseVideo();
        g_i_youtube_player_index_stop = null;
    }

    if (g_i_youtube_player_index_play !== null) {
        g_i_youtube_player_index = g_i_youtube_player_index_play;
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