/* Copyright 2022 APLY Inc. All rights reserved. */

"use strict";

let oldAddressVal = "";
let g_current_design_item_count = 0;
let g_array_icon_data;
let g_popup_overlay;

$(function () {
	poiDesignInit();
});


function poiDesignInit() {

    map2DInit(0, mapMovedCallback);
    map2DInitForPoi();

    g_array_design_data = [];
    g_array_icon_data = [];

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
    $('#btnGetGpsByAddress').text(GET_STRING_CONTENT('msg_address_find'));

    
    $("#map_lat_lable").text("33.3834381");
    $("#map_lng_lable").text("126.5610038");

    initSliderForDesign(1);

    g_cur_2D_mainmap.on('click', function (evt) {
        GATAGM('poidesign_map_click', 'CONTENT');

        var feature = g_cur_2D_mainmap.forEachFeatureAtPixel(evt.pixel, function(feature) {
            return feature;
        });
        
        processDesignMapClick(evt, feature);            
    });
    
    let posLayer = new ol.layer.Vector({
        source: g_vector_2D_mainmap_for_design_icon
    });
    g_cur_2D_mainmap.addLayer(posLayer);

    $("#address").keypress(function (e) {
        if (e.which == 13){
                GATAGM("poi_address_input_key_enter", "CONTENT");
                requestGPS();  //
        }
    });
    
    $('#btnGetGpsByAddress').off('click');
    $('#btnGetGpsByAddress').click(function (e) {
        e.preventDefault();

        GATAGM("poi_address_input_btn_click", "CONTENT");
        requestGPS();
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

    let poi_name = decodeURIComponent(getQueryVariable("name"));
    if (isSet(poi_name) && poi_name != "") {
        poi_name = poi_name.split('&')[0];
        setPoiDataToDesignView(poi_name);
    }
    else {
        $("#poi_name_field").hide();        
        hideLoader();
    }    
}

function map2DInitForPoi() {
    g_container_2D_map_for_popup = document.getElementById('popup');
    g_content_2D_map_for_popup = document.getElementById('popup-content');
    g_closer_2D_map_for_popup = document.getElementById('popup-closer');

    g_container_2D_map_for_popup.style.visibility = "visible";
    g_popup_overlay = new ol.Overlay({
        element: g_container_2D_map_for_popup,
        autoPan: true,
        autoPanAnimation: {
            duration: 250,
        },
    });

    g_closer_2D_map_for_popup.onclick = function () {
        g_popup_overlay.setPosition(undefined);
        g_closer_2D_map_for_popup.blur();
        return false;
    };

    g_cur_2D_mainmap.addOverlay(g_popup_overlay);
}


function processDesignMapClick(evt, feature) {    
    let item = null;
    let ii = -1;
    if (feature) {
        ii = feature.get('mindex');
        if (isSet(ii)) {
            g_array_design_data.some(function(d) {
                if (d[0] == ii) {
                    item = d;
                    return true;
                }   
    
                return false;
            });        
        }
    }
    else {
        ii = g_array_design_data.length;
    }

    setPoiPopup(ii, item, evt.coordinate);
}

function setPoiPopup(ii = -1, item = null, coordinate) {
    let htmlText = '<table class="table table-striped table-bordered table-hover">'
                + '<tbody>'
                + '<tr class="odd gradeX">'
                + '<td><span class="badge badge-light" id="tr_index">0</span></td>'
                + '<td>'
                + '<label for="latdata_index" class="text-xs font-weight-bold text-dark text-uppercase mb-1" id="latitude_label">Latitude</label><input name="latdata_index" id="latdata_index" type="text" placeholder="Latitude" value="0" class="form-control">'
                + '<label for="lngdata_index" class="text-xs font-weight-bold text-dark text-uppercase mb-1" id="longitude_label">Longitude</label><input name="lngdata_index" id="lngdata_index" type="text" placeholder="Longitude" value="0" class="form-control">'
                + '<label for="namedata_index" class="text-xs font-weight-bold text-dark text-uppercase mb-1" id="name_label">Name</label><input name="namedata_index" id="namedata_index" type="text" placeholder="POI Name" value="" class="form-control">'
                + '<br>'
                + '<button type="button" class="btn btn-warning" id="saveItemBtn">적용</button>';

    if (item) htmlText += '<button type="button" class="btn btn-primary" id="removeItemBtn">삭제</button>';

    htmlText += '</td></tr></tbody></table>';                
    g_content_2D_map_for_popup.innerHTML = htmlText;
    g_popup_overlay.setPosition(coordinate);
    

    if (item) {        
        $("#namedata_index").text(item[1].name);
    }
    
    $('#removeItemBtn').click(function (e) {
        e.preventDefault();

        GATAGM('poi_design_remove_item_btn_click', 'CONTENT');
        removePoiData(ii);
        g_popup_overlay.setPosition(undefined);
        g_closer_2D_map_for_popup.blur();
    });

    $('#saveItemBtn').click(function (e) {
        e.preventDefault();

        GATAGM('poi_design_save_item_btn_click', 'CONTENT');
        saveDesignData(ii);
        g_popup_overlay.setPosition(undefined);
        g_closer_2D_map_for_popup.blur();
    });                

    $("#tr_index").text(ii + 1);

    if (item) {
        $("#map_lat_lable").text(item[1].lat);
        $("#map_lng_lable").text(item[1].lng);
        $("#latdata_index").val(item[1].lat);
        $("#lngdata_index").val(item[1].lng);
        $("#namedata_index").val(item[1].name);
    }
    else {
        let lonlat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
        $("#map_lat_lable").text(lonlat[1]);
        $("#map_lng_lable").text(lonlat[0]);
        $("#latdata_index").val(lonlat[1]);
        $("#lngdata_index").val(lonlat[0]);
    }
}

function mapMovedCallback(evt) {
    const view = g_cur_2D_mainmap.getView();
    let lonLat = ol.proj.toLonLat(view.getCenter());
    $("#map_lat_lable").text(lonLat[1]);
    $("#map_lng_lable").text(lonLat[0]);
}

function requestGPS() {
    let userid = getCookie("dev_user_id");
    var jdata = {"action" : "util", "daction" : "gps_by_address", "clientid" : userid};
    jdata["address"] = encodeURI($("#address").val());

    if (isSet(jdata["address"]) == false) {
            showAlert("주소를 " + GET_STRING_CONTENT('msg_wrong_input'));
            return;
    }

    //같은 값으로 조회 시도
    if (oldAddressVal == jdata["address"]) return;

    oldAddressVal = jdata["address"];

    GATAGM("poi_gps_by_address_btn_click", "SERVICE", oldAddressVal);

    showLoader();
    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {            
            
            $("#map_lat_lable").text(r.data.lat);
            $("#map_lng_lable").text(r.data.lng);

            oldAddressVal = r.data.address;

            setTimeout(function() {
                var npos = ol.proj.fromLonLat([r.data.lng  * 1, r.data.lat * 1]);                
                g_cur_2D_mainmap.getView().setCenter(npos);         
            }, 0);            

            showAlert(GET_STRING_CONTENT('msg_address_checked'));
            hideLoader();
        }
        else {
            hideLoader();
            showAlert("주소를 " + GET_STRING_CONTENT('msg_wrong_input'));
        }
    }, function (request, status, error) { });                                       				    					    					          
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
        let item = g_array_design_data[index][1];

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
        min: 1,
        max: i,
        value: 1,
        step: 1,
        slide: function (event, ui) {
            GATAGM('poi_slider_click', 'CONTENT');

            if (g_array_design_data.length <= 0) {
                return;
            }

            g_array_design_data.some(function(d) {
                if (d[0] == (ui.value - 1)) {
                    let item = d[1];
                    setMoveActionFromSliderOnMove(ui.value, item);
                    return true;
                }

                return false;
            });
            
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

        if (index <= 0) {
            showAlert("Please input valid value !");
            return;
        }

        if (g_array_design_data.length <= 0) {
            return;
        }

        $("#slider").slider('value', index);

        g_array_design_data.some(function(d) {
            if (d[0] == (index - 1)) {
                let item = d[1];
                setMoveActionFromSliderOnMove(index, item);
            }
        });
    });
}

function setPoiDataToDesignView(name) {
    let userid = getCookie("dev_user_id");
    let jdata = { "action": "poi", "daction": "get_spec", "name": encodeURI(name), "clientid": userid };

    showLoader();

    $("#poi_name_field").text(name);

    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result == "success") {

            if (!isSet(r.data) || r.data.data.length == 0) return;

            g_array_design_data = [];
            r.data.data.forEach(function(d,index,arr) {
                g_array_design_data.push([index, d]);
            });
            
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


function createPoiIconFor2DMap(i, item) {
    let pos_icon = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
        name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
        mindex: i
    });    
                
    let style = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 11,
            opacity: 0.7,
            fill: new ol.style.Fill({ color: '#FFF' }),
            stroke: new ol.style.Stroke({ color: '#45cdba', width: 2 })
        }),
        text: new ol.style.Text({
            font: '10 px Roboto',
            text: "" + (i + 1),
            fill: new ol.style.Fill({ color: '#000' })
        })
    });

    pos_icon.setStyle(style);
    return pos_icon;
}

function addNewIconToDesignMap(i, item) {
    let nIcon = createPoiIconFor2DMap(i, item);
    g_array_icon_data.push([i, nIcon]);
    g_vector_2D_mainmap_for_design_icon.addFeature(nIcon);
}

function setDesignTable() {        
    g_array_design_data.forEach(function (item) {
        addNewIconToDesignMap(item[0], item[1]);        
    });

    $("#slider").slider('option', { min: 1, max: g_array_design_data.length});
    setSliderPos(0);
    moveToPositionOnMap("private", 0, g_array_design_data[0][1].lat,
                                    g_array_design_data[0][1].lng, 
                                    g_array_design_data[0][1].alt, 
                                    g_array_design_data[0][1].yaw, 
                                    g_array_design_data[0][1].roll, 
                                    g_array_design_data[0][1].pitch);
}


function appendDataToDesignTable(lonLat, name) {

    let index = g_array_design_data.length;

    if (index <= 0) {
        $("#slider").show();
        $("#dataTable-points").show();
    }

    let data = [];
    data['name'] = name;
    data['lng'] = lonLat[0];
    data['lat'] = lonLat[1];

    g_array_design_data.push([index, data]);

    $("#slider").slider('option', { min: 1, max: index + 1});
    $("#slider").slider('value', index + 1);

    addNewIconToDesignMap(index, data);
}

function saveDesignData(index) {
    if (index >= g_array_design_data.length) {
        let lng = $('#lngdata_index').val();
        let lat = $('#latdata_index').val();
        let name = $('#namedata_index').val();
        appendDataToDesignTable([lng * 1, lat * 1], name);
        moveToPositionOnMap("private", 0, lat * 1,
            lng * 1,
            0,
            0,
            0,
            0
        );
    }
    else {
        g_array_design_data.forEach(function(d, i, arr) {
            if (d[0] == index) {
                g_array_design_data[i][1].lat = parseFloat($('#latdata_index').val());
                g_array_design_data[i][1].lng = parseFloat($('#lngdata_index').val());
                g_array_design_data[i][1].name = $('#namedata_index').val();
            }
        });
    }    
}

function removeIconOn2DMap(index) {
    g_array_icon_data.some(function (ele, i, arr) {
        if (ele[0] == index) {            
            g_vector_2D_mainmap_for_design_icon.removeFeature(ele[1]);
            g_array_icon_data.splice(i,1);
            return true;
        }        

        return false;
    });
}

function clearDataToDesignTableWithFlightRecord() {

}


function removePoiData(index) {
    g_array_design_data.some(function(d, i, arr) {
        if (d[0] == index) {
            g_array_design_data.splice(i, 1);
            return true;
        }        
        return false;
    });
    
    removeIconOn2DMap(index);

    if (g_array_design_data.length <= 0) {
        $("#slider").hide();
        $("#dataTable-points").hide();
        return;
    }

    let newIndex = g_array_design_data.length - 1;

    $("#slider").slider('value', newIndex);
    $("#slider").slider('option', { min: 1, max: newIndex });

    moveToPositionOnMap("private", 0, g_array_design_data[newIndex][1].lat,
        g_array_design_data[newIndex][1].lng,
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