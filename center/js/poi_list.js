/* Copyright 2022 APLY Inc. All rights reserved. */

"use strict";
$(function () {
	poiListInit();
});


function poiListInit() {

    document.title = GET_STRING_CONTENT('page_list_title');
    $("#head_title").text(document.title);

    $("#page_about_title").text(GET_STRING_CONTENT('page_list_title'));
    $("#page_about_content").text(GET_STRING_CONTENT('poi_about_content'));
    $("#name_label").text(GET_STRING_CONTENT('name_label'));
    $("#status_label").text(GET_STRING_CONTENT('status_label'));
    $("#date_label").text(GET_STRING_CONTENT('date_label'));
    $("#manage_label").text(GET_STRING_CONTENT('manage_label'));
    $("#btnForGetPoiList").text(GET_STRING_CONTENT('btnForGetPoiList'));
    $("#search_key").attr("placeholder", GET_STRING_CONTENT('msg_poi_search_key'));

    $('#btnForSearchPoi').click(function (e) {
        e.preventDefault();

        GATAGM('poi_list_search_btn_click', 'CONTENT');
        searchPoi($("#search_key").val());
    });

    $('#btnForGetPoiList').click(function (e) {
        e.preventDefault();

        GATAGM('poi_list_load_more_btn_click', 'CONTENT');
        getPoiList();
    });

    $('#btnForGetPoiList').hide();
    getPoiList();
}

function getPoiList() {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "poi", "daction": "get", "clientid": userid };

    if (g_more_key_for_data) {
        jdata["morekey"] = g_more_key_for_data;
    }

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            appendMissionList(r.data);

            if (r.morekey) {
                $('#btnForGetPoiList').text(GET_STRING_CONTENT('msg_load_more'));
                g_more_key_for_data = r.morekey;
                $('#btnForGetPoiList').show();
            }
            else {
                $('#btnForGetPoiList').hide(1500);
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



function searchPoi(keyword) {
    if (isSet(keyword) == false) {
        showAlert(GET_STRING_CONTENT('msg_wrong_input'));
        return;
    }

    let userid = getCookie("dev_user_id");
    let jdata = { "action": "poi", "daction": "find_poi", "keyword": keyword, "clientid": userid };

    g_more_key_for_data = "";

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {

            $('#dataTable-pois').empty();
            g_i_appended_data_count = 0;

            appendPoiList(r.data);

            if (r.morekey) {
                $('#btnForGetPoiList').text(GET_STRING_CONTENT('msg_load_more'));
                g_more_key_for_data = r.morekey;
            }
            else {
                $('#btnForGetPoiList').hide(1500);
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


//# sourceURL=poi_list.js