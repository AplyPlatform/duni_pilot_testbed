/* Copyright 2022 APLY Inc. All rights reserved. */

"use strict";
$(function () {
	missionListInit();
});


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

//# sourceURL=mission_list.js