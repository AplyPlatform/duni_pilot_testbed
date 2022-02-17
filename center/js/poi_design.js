/* Copyright 2022 APLY Inc. All rights reserved. */

"use strict";
$(function () {
	poiDesignInit();
});

function poiDesignInit() {

    map2DInit();
    selectMonitorIndex("private", 0);
    addObjectTo2DMap(0, "private", "drone");

    g_array_design_data = [];

    document.title = GET_STRING_CONTENT('page_poi_design_title');
    $("#head_title").text(document.title);

    $('#page_about_title').text(GET_STRING_CONTENT('page_poi_design_title'));
    $('#page_about_content').text(GET_STRING_CONTENT('poi_about_content'));
    $('#msg_tracker').text(GET_STRING_CONTENT('msg_tracker'));
    $('#map_kind_label').text(GET_STRING_CONTENT('map_kind_label'));
    $('#go_index_direct_label').text(GET_STRING_CONTENT('go_index_direct_label'));
    $('#btnForRegistPoi').text(GET_STRING_CONTENT('btnForRegistPoi'));
    $('#btnForClearPoi').text(GET_STRING_CONTENT('btnForClearPoi'));
    $('#removeItemBtn').text(GET_STRING_CONTENT('msg_remove'));
    $('#saveItemBtn').text(GET_STRING_CONTENT('msg_apply'));
    $('#help_label').text(GET_STRING_CONTENT('help_label'));
    $('#Aerial_label').text(GET_STRING_CONTENT('Aerial_label'));
    $('#Aerial_label_label').text(GET_STRING_CONTENT('Aerial_label_label'));
    $('#Road_label').text(GET_STRING_CONTENT('Road_label'));
    $('#Road_detail').text(GET_STRING_CONTENT('Road_detail_label'));

    $('#latitude_label').text(GET_STRING_CONTENT('latitude_label'));
    $('#longitude_label').text(GET_STRING_CONTENT('longitude_label'));
    $('#name_label').text(GET_STRING_CONTENT('name_label'));

    initSliderForDesign(1);

    g_cur_2D_mainmap.on('click', function (evt) {
        GATAGM('poidesign_map_click', 'CONTENT');

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

    let poi_name = decodeURIComponent(getQueryVariable("name"));

    if (isSet(poi_name) && poi_name != "") {
        poi_name = poi_name.split('&')[0];
        setPoiDataToDesignView(poi_name);
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

    $('#btnForRegistPoi').off('click');
    $('#btnForRegistPoi').click(function (e) {
        GATAGM('poi_register_btn_click', 'CONTENT');
        askPoiNameForDesignRegister();
    });

    $('#btnForClearPoi').off('click');
    $('#btnForClearPoi').click(function (e) {
        GATAGM('poi_clear_btn_click', 'CONTENT');
        askClearCurrentDesign();
    });
}

function askPoiNameForDesignRegister() {
    showAskDialog(
        GET_STRING_CONTENT('modal_title'),
        GET_STRING_CONTENT('msg_input_poi_name'),
        GET_STRING_CONTENT('modal_confirm_btn'),
        true,
        function (mname) {
            setTimeout(function () { registerPoi(mname); }, 1000);
        },
        function () { }
    );
}


function registerPoi(mname) {
    if (g_array_design_data.length <= 0) {
        showAlert(GET_STRING_CONTENT('msg_wrong_input'));
        return;
    }

    let nPositions = [];
    let bError = 0;
    for (let index = 0; index < g_array_design_data.length; index++) {
        let item = g_array_design_data[index];

        if (item.lat == undefined || item.lat === ""
            || item.lng == undefined || item.lng === ""
            || item.name == undefined || item.name === "") {
            monitor(GET_STRING_CONTENT('msg_error_index_pre') + (index) + GET_STRING_CONTENT('msg_error_index_post'));
            bError++;
            return;
        }

        let pid = "pid-" + index;
        nPositions.push({ id: pid, lat: item.lat, lng: item.lng, name: item.name });
    }

    if (bError > 0) {
        showAlert(GET_STRING_CONTENT('msg_error_check'));
        return;
    }

    let userid = getCookie("dev_user_id");
    let jdata = { "action": "poi", "name": encodeURI(mname), "daction": "set", "data": nPositions, "clientid": userid };

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            showAskDialog(
                GET_STRING_CONTENT('modal_title'),
                mname + " : " + GET_STRING_CONTENT('msg_success'),
                GET_STRING_CONTENT('modal_confirm_btn'),
                false,
                function () {
                    setTimeout(function () {
                        location.href = g_array_cur_controller_for_viewmode["developer"] + "?page_action=poilist";
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
            GATAGM('poi_slider_click', 'CONTENT');

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

        GATAGM('poi_slide_go_item_btn_click', 'CONTENT');

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

function setPoiDataToDesignView(name) {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "poi", "daction": "get", "name": encodeURI(name), "clientid": userid };

    showLoader();

    $("#poi_name_field").text(name);

    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result == "success") {

            if (!isSet(r.data.poi) || r.data.poi.length == 0) return;
            g_array_design_data = r.data.poi;
            setDesignTable();
        }
        else {
            showAlert(GET_STRING_CONTENT('msg_no_poi'));
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
    data['name'] = "Name of POI";
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
    let name = g_array_design_data[index].name;

    $('#tr_index').text(index);
    $('#latdata_index').val(lat);
    $('#lngdata_index').val(lng);
    $('#namedata_index').val(name);

    $('#removeItemBtn').off('click');
    $('#removeItemBtn').click(function (e) {
        e.preventDefault();

        GATAGM('poi_design_remove_item_btn_click', 'CONTENT');
        removePoiData(index);
        removeIconOn2DMap(index);
    });

    $('#saveItemBtn').off('click');
    $('#saveItemBtn').click(function (e) {
        e.preventDefault();

        GATAGM('poi_design_save_item_btn_click', 'CONTENT');
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
            0,
            0,
            0,
            0
        );
    }

    g_array_design_data[index].lat = parseFloat($('#latdata_index').val());
    g_array_design_data[index].lng = parseFloat($('#lngdata_index').val());
    g_array_design_data[index].name = $('#namedata_index').val();    
}

function removeIconOn2DMap(index) {
    g_cur_2D_mainmap.removeLayer(g_layer_2D_map_for_line);
    g_cur_2D_mainmap.removeLayer(posLayerForDesign);

    setDesignTable();
}

function clearDataToDesignTableWithFlightRecord() {

}


function removePoiData(index) {
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
        0,
        0,
        0,
        0);
}

function askClearCurrentDesign() {
    showAskDialog(
        GET_STRING_CONTENT('modal_title'),
        GET_STRING_CONTENT('msg_are_you_sure'),
        GET_STRING_CONTENT('btnForClearPoi'),
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

//# sourceURL=poi_design.js