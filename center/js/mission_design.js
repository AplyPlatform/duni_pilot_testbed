/*
Copyright 2015 Google Inc. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

"use strict";
$(function () {
	designInit();
});

function designInit() {
    debugger;
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

function askMissionNameForDesignRegister() {
    showAskDialog(
        GET_STRING_CONTENT('modal_title'),
        GET_STRING_CONTENT('msg_input_mission_name'),
        GET_STRING_CONTENT('modal_confirm_btn'),
        true,
        function (mname) {
            setTimeout(function () { askSpeedForDesignRegister(mname); }, 1000);
        },
        function () { }
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
        function () { }
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

function removeIconOn2DMap(index) {
    g_cur_2D_mainmap.removeLayer(g_layer_2D_map_for_line);
    g_cur_2D_mainmap.removeLayer(posLayerForDesign);

    setDesignTable();
}

function clearDataToDesignTableWithFlightRecord() {

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

function searchCurrentBrowserAddress() {
    let query = $('#queryData').val();
    searchAddressToCoordinate(query);
}


function searchAddressToCoordinate(address) {    
    requestGPSByAddress(address, function (r) {
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

        moveToPositionOnMap("private", 0, g_loc_address_flat, g_loc_address_flng, 0, 0, 0, 0);
    }, function () {
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
        function () { }
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

//# sourceURL=mission_design.js
//# sourceMappingURL=mission_design.js