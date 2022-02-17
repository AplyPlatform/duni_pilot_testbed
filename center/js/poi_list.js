/* Copyright 2022 APLY Inc. All rights reserved. */

"use strict";
$(function () {
	poiListInit();
});


function poiListInit() {

    document.title = GET_STRING_CONTENT('page_poi_list_title');
    $("#head_title").text(document.title);

    $("#page_about_title").text(GET_STRING_CONTENT('page_poi_list_title'));
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
            appendPoiList(r.data);

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



function appendPoiList(data) {
    if (data == null) return;
    if (data.length == 0) return;

    data.sort(function (a, b) { // \uB0B4\uB9BC\uCC28\uC21C
        let regtime_a = convert2data(a.regtime);
        let regtime_b = convert2data(b.regtime);
        return regtime_b.getTime() - regtime_a.getTime();
    });


    data.forEach(function (item, index, array) {
        let appendRow = "<div class='card shadow mb-4' id='poi_row_" + index + "'><div class='card-body'><div class='row'><div class='col-sm'>"
            + "<a href='" + g_array_cur_controller_for_viewmode["developer"] + "?page_action=poidesign&name=" + encodeURIComponent(item['name']) + "' class='font-weight-bold mb-1'>"
            + item['name']
            + "</a></div></div><div class='row'><div class='col-sm text-xs font-weight-bold mb-1'>"
            + item['regtime']
            + "</div><div class='col-sm text-xs font-weight-bold mb-1'>"
            + "<a class='btn btn-warning text-xs' href='" + g_array_cur_controller_for_viewmode["developer"] + "?page_action=poidesign&name=" + encodeURIComponent(item['name']) + "' role='button'>" + GET_STRING_CONTENT('msg_modify') + "</a>&nbsp;"
            + "<button class='btn btn-primary text-xs' type='button' id='poiListBtnForRemove_" + index + "'>"
            + GET_STRING_CONTENT('msg_remove') + "</button></div></div></div></div>";
        $('#dataTable-pois').append(appendRow);

        $('#poiListBtnForRemove_' + index).click(function (e) {
            e.preventDefault();
            GATAGM('list_poi_remove_btn_click', 'CONTENT');
            askRemovePoiItem(item['name'], "poi_row_" + index);
        });
    });
}



function askRemovePoiItem(name, trname) {
    showAskDialog(
        GET_STRING_CONTENT('modal_title'),
        name + " : " + GET_STRING_CONTENT('msg_are_you_sure'),
        GET_STRING_CONTENT('msg_remove'),
        false,
        function () {
            setTimeout(function () { removePoiItem(name, trname); }, 1000);
        },
        function () { }
    );
}



function removePoiItem(name, trname) {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "poi", "name": encodeURI(name), "daction": "delete", "clientid": userid };

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            $("#" + trname).hide();
        }
        else {
            showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        }
    }, function (request, status, error) { });
}




//# sourceURL=poi_list.js