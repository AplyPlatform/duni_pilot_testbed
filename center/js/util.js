/*
Copyright 2021 APLY Inc. All rights reserved.
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

let g_str_page_action = "center";
let g_str_current_target = "private";
let g_str_cur_lang = "KR";
let g_str_cur_viewmode = "pilot"; // or "developer"

let g_array_full_flight_rec = [];
let g_array_full_company_list = [];

let g_vector_2D_map_for_flight_rec;
let g_layer_2D_map_for_flight_rec;
let g_view_2D_map_for_flight_rec;
let g_vector_2D_map_for_cada;
let g_vector_2D_map_for_flight_area;

let g_vector_2D_map_for_company;
let g_layer_2D_map_for_company;

let g_str_pilot_controller_for_viewmode;
let g_str_dev_controller_for_viewmode;

let oldLat = 0, oldLng = 0, oldAlt = 0;

let c3ddataSource;

// duni map의 기업정보 팝업
let g_container_2D_map_for_popup;
let g_content_2D_map_for_popup;
let g_closer_2D_map_for_popup;


let fixedFrameTransform;
let planePrimitives;
let v3DMapViewer;
let v3DMapCate;
let p3DMapEntity;
let s3DMapScene;

let oldScatterdatasetIndex = -1;
let oldScatterpointIndex = -1;

let oldLinedatasetIndex = -1;
let oldLinepointIndex = -1;

let g_i_cur_monitor_object_index = 0;
let g_str_cur_monitor_object_owner = "private";

function selectMonitorIndex(owner, index) {
    g_i_cur_monitor_object_index = index;
    g_str_cur_monitor_object_owner = owner;
}


function isRecordFile(filename) {
	let ext = getFileExtension(filename);
	return compareIgnoreCase(ext, "txt") || compareIgnoreCase(ext, "csv");
}

function isMovieFile(filename) {
	let ext = getFileExtension(filename);
	if (compareIgnoreCase(ext, "mp4")
	 			|| compareIgnoreCase(ext, "mov")
	 			|| compareIgnoreCase(ext, "mpg")
	 			|| compareIgnoreCase(ext, "avi")
	 			|| compareIgnoreCase(ext, "mpeg")
	 			|| compareIgnoreCase(ext, "wmv")
	 			|| compareIgnoreCase(ext, "flv")
	 			|| compareIgnoreCase(ext, "3gpp")
	 			|| compareIgnoreCase(ext, "hevc")) {
	 				return true;
	}

	return false;
}


function isEmail(email) {
    var regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/igm;
    return regex.test(email);
}


function validateNumber(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode === 8 || event.keyCode === 46) {
        return true;
    } else if ( key < 48 || key > 57 ) {
        return false;
    } else {
        return true;
    }
}

function getFileExtension(filename) {
	return filename.split('.').pop();
}

function compareIgnoreCase(str1, str2) {
	return str1.toUpperCase() === str2.toUpperCase();
}


function runNextSequence(nextfunc) {
	setTimeout(nextfunc, 500);
}

function checkLang() {
    var lang = getCookie("language");

    if (isSet(lang)) {
        g_str_cur_lang = lang;
    }
    else {
        setLang("KR");
    }
}

function setLang(lang) {
    setCookie("language", lang, 1);
    g_str_cur_lang = lang;
}

function isSet(value) {
		if ( typeof(value) === 'number' )
        return true;
    if (value == "" || value == null || value == "undefined" || value == undefined)
        return false;
    return true;
}


function removeTableRow(rowname) {
    $("#" + rowname).hide();
}

function isNeedSkip(lat, lng, alt) {
    var ddl1 = Math.abs(lat - oldLat);
    var ddl2 = Math.abs(lng - oldLng);
    var ddl3 = Math.abs(alt - oldAlt);

    if (ddl1 > 0.001 || ddl2 > 0.002 || ddl3 > 3) { //\uC784\uC758 \uD544\uD130
        return true;
    }

    return false;
}

function ajaxRequest(data, callback, errorcallback) {
    $.ajax({
        url: "https://api.duni.io/v1/",
        dataType: "json",
        crossDomain: true,
        cache: false,
        data: JSON.stringify(data),
        type: "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (request) {
            request.setRequestHeader("droneplay-token", getCookie('user_token'));
        },
        success: function (r) {
        		if (r.result != "success" && r.result_code == 1) {
        			setCookie("dev_user_id", "", -1);
					    setCookie("user_token", "", -1);
					    setCookie("dev_token", "", -1);
					    setCookie("user_kind", "", -1);
					    setCookie("device_kind", "", -1);
					    setCookie("device_id", "", -1);
			        setCookie("user_email", "", -1);
			        setCookie("image_url", "", -1);
			        setCookie("temp_sns_token", "", -1);
			        setCookie("dev_sns_token", "", -1);
			        setCookie("temp_image_url", "", -1);
			        setCookie("temp_email", "", -1);
			        setCookie("temp_name", "", -1);
			        setCookie("user_google_auth_token", "", -1);

			        goIndex("logout");

			        if (data.daction != "logout")
        				alert(GET_STRING_CONTENT('msg_login_another_device_sorry'));
        			return;
        		}

            callback(r);
        },
        error: function (request, status, error) {
            monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            errorcallback(request, status, error);
        }
    });
}

function goIndex(doAction) {
  if (g_str_cur_lang == "KR" || g_str_cur_lang == "")
    location.href="index.html?action=" + doAction;
  else
  	location.href="index_en.html?action=" + doAction;
}

function logOut() {
		var userid = getCookie("dev_user_id");
    var jdata = {
    	"action": "member",
    	"daction": "logout",
    	"clientid": userid
    };

    ajaxRequest(jdata, function (r) {
        //if (r.result == "success") {}
        setCookie("dev_user_id", "", -1);
		    setCookie("user_token", "", -1);
		    setCookie("dev_token", "", -1);
		    setCookie("user_kind", "", -1);
		    setCookie("device_kind", "", -1);
		    setCookie("device_id", "", -1);
        setCookie("user_email", "", -1);
        setCookie("image_url", "", -1);
        setCookie("temp_sns_token", "", -1);
        setCookie("dev_sns_token", "", -1);
        setCookie("temp_image_url", "", -1);
        setCookie("temp_email", "", -1);
        setCookie("temp_name", "", -1);
        setCookie("user_from", "", -1);
        setCookie("dev_kind", "", -1);
        setCookie("user_google_auth_token", "", -1);

        goIndex("logout");
    }, function (request, status, error) {
        setCookie("dev_user_id", "", -1);
        setCookie("user_token", "", -1);
        setCookie("user_kind", "", -1);
        setCookie("dev_token", "", -1);
        setCookie("device_kind", "", -1);
        setCookie("device_id", "", -1);
        setCookie("user_email", "", -1);
        setCookie("image_url", "", -1);
        setCookie("temp_sns_token", "", -1);
        setCookie("dev_sns_token", "", -1);
        setCookie("temp_image_url", "", -1);
        setCookie("temp_email", "", -1);
        setCookie("temp_name", "", -1);
        setCookie("user_from", "", -1);
        setCookie("dev_kind", "", -1);
        setCookie("user_google_auth_token", "", -1);

    		goIndex("logout");
    });
}

function style2DObjectFunction(pImage, textMsg) {
    return [
        new ol.style.Style(
            {
                image: pImage
                ,
                text: new ol.style.Text({
                    font: '12px Calibri,sans-serif',
                    fill: new ol.style.Fill({ color: '#000' }),
                    stroke: new ol.style.Stroke({
                        color: '#fff', width: 2
                    }),
                    text: textMsg
                })
            })
    ];
}


function showLoader() {
    $("#loading").show();
}

function hideLoader() {
    $("#loading").fadeOut(800);
}

function showAskDialog(atitle, acontent, oktitle, needInput, okhandler, cancelhandler) {

    if (needInput == true) {
    		$('#askModalLabel').text(atitle);
        $('#askModalInput').show();
        $('#askModalContent').html(acontent);
        $('#askModalInput').val("");
        //$("#askModalInput").attr("placeholder", acontent);
    }
    else {
        $('#askModalContent').show();
        $('#askModalInput').hide();
    }

    $('#askModalLabel').text(atitle);
    $('#askModalContent').html(acontent);
    $('#askModalOKButton').text(oktitle);


    if (cancelhandler) {
      $('#askModalCancelButton').show();
      $('#askModalCancelButton').off('click');
      $('#askModalCancelButton').click(function (e) {
      		e.preventDefault();

          cancelhandler();
      });
    }
    else {
      $('#askModalCancelButton').hide();
    }

    $('#askModalOKButton').off('click');
    $('#askModalOKButton').click(function (e) {
    		e.preventDefault();

        $('#askModal').modal('hide');
        if (needInput == true) {
            var ret = $('#askModalInput').val();

            if (!isSet(ret)) {
                showAlert(GET_STRING_CONTENT('msg_wrong_input'));
                return;
            }

            okhandler(ret);
        }
        else {
            okhandler();
        }
    });

    $('#askModal').modal('show');

}

function showAlert(msg) {
    $('#modal-title').text(GET_STRING_CONTENT('modal_title'));
    $('#modal-confirm-btn').text(GET_STRING_CONTENT('modal_confirm_btn'));

    $('#errorModalLabel').html(msg);
    $('#errorModal').modal('show');
}

function getBase64(params, callback) {

    var reader = new FileReader();

    reader.readAsDataURL(params.file);
    reader.onload = function () {
    		params['base64file'] = reader.result;
        callback(params);
    };
    reader.onerror = function (error) {
        hideLoader();
        monitor('Error: ', error);
    };
}

function delCoockie(cName) {
    document.cookie = name + "= " + "; expires=" + date.toUTCString() + "; path=/; domain=.duni.io";
}

function setCookie(cName, cValue, cDay) {
    var date = new Date();
    date.setTime(date.getTime() + cDay * 60 * 60 * 24 * 1000);
    document.cookie = cName + '=' + cValue + '; expires=' + date.toUTCString() + '; path=/; domain=.duni.io';
}

function getCookie(cName) {
		let matches = document.cookie.match(new RegExp(
    	"(?:^|; )" + cName.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  	));

  	return matches ? matches[1] : null;
}

function massageYotubeUrl(data_id) {
    if (!isSet(data_id)) return "";

    if (data_id.indexOf("?v=") >= 5) return data_id;

    if (data_id.indexOf("youtu.be") >= 0) {
        var splitUrl = data_id.split('/');
        if (splitUrl.length < 4) return "";

        return "https://www.youtube.com/watch?v=" + splitUrl[3];
    }

    return "";
}

function convert2time(stime) {
    var gapTime = document.getElementById("gmtGapTime").value;
    return (new Date(stime).getTime() + (3600000 * (gapTime * 1)));
}


function convert2data(t) {
    var date = new Date(t);
    return date;
}



function addChartItem(i, item) {
		item.lat = (item.lat * 1).toFixed(5);
		item.lng = (item.lng * 1).toFixed(5);
		item.alt = (item.alt * 1).toFixed(5);		
		item.dsec = (item.dsec * 1).toFixed(2);
    g_array_flight_rec.push(item);
    g_array_altitude_data_for_chart.push({ x: Math.round(item.dsec), y: item.alt });
}

function setSlider(i) {
		if ($("#slider").length <= 0) return;

    $("#slider").on("slidestop", function (event, ui) {
        let locdata = g_array_flight_rec[ui.value];
        setMoveActionFromSliderOnStop(ui.value, locdata);
    });

    $('#slider').slider({
        min: 0,
        max: i - 1,
        value: 0,
        step: 1,
        slide: function (event, ui) {
            let locdata = g_array_flight_rec[ui.value];
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


function drawLineGraph() {
    let ctx2 = document.getElementById('lineGraph').getContext('2d');
    let linedataSet = {
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

        let activePoints = window.myLine.getElementsAtEvent(evt);

        if (activePoints.length > 0) {
            let clickedDatasetIndex = activePoints[0]._index;

            let locdata = g_array_flight_rec[clickedDatasetIndex];
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
                        let locdata = g_array_flight_rec[tooltipItem.index];
                        return locdata.alt.toFixed(2) + "m / " + locdata.dsec.toFixed(1) + "sec(s)";
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


function addPosIconsTo2DMap(posIcons) {
    if (posIcons.length <= 0) return;

    g_cur_2D_mainmap.on('click', function (evt) {
        GATAGM('small_map_click', 'CONTENT');

        let feature = g_cur_2D_mainmap.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                return feature;
            });

        let locdata = null;
        if (feature) {
            let ii = feature.get('mindex');
            locdata = g_array_flight_rec[ii];

            setMoveActionFromMap(ii, locdata);
        }

        let lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        if (locdata)
            showCurrentInfo([lonlat[0], lonlat[1]], locdata.alt);
        else
            showCurrentInfo([lonlat[0], lonlat[1]], '0');

    });

    let pSource = new ol.source.Vector({
        features: posIcons
    });

    g_layer_2D_map_for_icon = new ol.layer.Vector({
        source: pSource
    });

    g_cur_2D_mainmap.addLayer(g_layer_2D_map_for_icon);

}


function drawLineTo2DMap(map, lineData) {
    let lines = new ol.geom.LineString(lineData);
    let lineSource = new ol.source.Vector({
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

function addFlightRecordDataToView(cdata, bfilter) {

    if (isSet(cdata) == false || cdata.length <= 0 || cdata == "" || cdata == "-") {
        if (bfilter == true) {
            cdata = g_array_flight_rec;
        }
        else {
        		//\uC704\uCE58 \uB370\uC774\uD130\uAC00 \uC5C6\uC74C.
            return false;
        }
    }

    let arrayMapPosIcons = [];
    let lineData = [];

		let rlng, rlat;
    cdata.forEach(function (item, i, arr) {

        if (bfilter && i > 4 && isNeedSkip(item.lat, item.lng, item.alt) == true) {
        	return true;
				}
				
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

    //if (isSet(g_layer_2D_map_for_line))
    //    g_cur_2D_mainmap.removeLayer(g_layer_2D_map_for_line);

    //if (isSet(g_layer_2D_map_for_icon))
    //    g_cur_2D_mainmap.removeLayer(g_layer_2D_map_for_icon);		

    setSlider(cdata.length - 1);
    
    setItemToRecTableList();

    drawLineTo2DMap(g_cur_2D_mainmap, lineData);

    addPosIconsTo2DMap(arrayMapPosIcons);

    drawLineGraph();

    draw3DMap();

    return true;
}

let scrollableRecTable;

function setItemToRecTableList() {
	if ($("#rawRecordTable").length <= 0) return;
	
	if (!isSet(scrollableRecTable)) {
		scrollableRecTable = new scrollableTable(/* unique id */ 'scrollableRecTable', /* HTML wrapper id */ 'rawRecordTable', /* enable logging*/ false);
		scrollableRecTable.setTableHeader(["dsec", "lat", "lng", "alt"]);
	}
	
	let tableData = [];
	g_array_flight_rec.forEach(function(item, index, arr) {
		tableData.push( {"id": index,  "dsec": item.dsec, "lat" : item.lat, "lng" : item.lng, "alt" : item.alt} )
	});
	
	scrollableRecTable.setTableContent(tableData, "rawTableDataEventType", ["id"], /* optional parameter for TreeTable */ "subtree")
	scrollableRecTable.setTableHeight(400);
  scrollableRecTable.setCompareFunctionForSorting( function(a,b) {
      return a.localeCompare(b, undefined, {usage: 'sort', numeric: true, sensitivity: 'base'})
  })
  scrollableRecTable.sortByColumnName("dsec")
  
  $( document ).on("rawTableDataEventType", function(event, data) {
      let index = data.data.id;
      let item = g_array_flight_rec[index];
      
      setMoveActionFromTable(index, item);
  });
}


function showCurrentInfo(dlatlng, alt) {
    if ($("#position_info").length <= 0) return;

    let latlng = ol.proj.fromLonLat(dlatlng);
    let hdms = ol.coordinate.toStringHDMS(latlng);
    let itext = hdms + " [ Lat: " + dlatlng[1] + " / Lng: " + dlatlng[0] + " / Alt: " + alt + " ]";
    $("#position_info").text(itext);
}

function openLineTip(oChart, datasetIndex, pointIndex) {
    if (!isSet(oChart)) return false;

    if (oldLinedatasetIndex >= 0)
        closeTip(oChart, oldLinedatasetIndex, oldLinepointIndex);

    if (oChart.tooltip._active == undefined)
        oChart.tooltip._active = []
    let activeElements = oChart.tooltip._active;
    let requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];

    oldLinedatasetIndex = datasetIndex;
    oldLinepointIndex = pointIndex;

    for (let i = 0; i < activeElements.length; i++) {
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
    let activeElements = oChart.tooltip._active;
    let requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];

    oldScatterdatasetIndex = datasetIndex;
    oldScatterpointIndex = pointIndex;

    for (let i = 0; i < activeElements.length; i++) {
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
    let activeElements = oChart.tooltip._active;
    if (!isSet(activeElements) || activeElements.length == 0)
        return;

    let requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];
    for (let i = 0; i < activeElements.length; i++) {
        if (requestedElem._index == activeElements[i]._index) {
            activeElements.splice(i, 1);
            break;
        }
    }
    oChart.tooltip._active = activeElements;
    oChart.tooltip.update(true);
    oChart.draw();
}

function setMoveActionFromTable(index, item) {
    openScatterTip(window.myScatter, 0, index);
    openLineTip(window.myLine, 0, index);

    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    setSliderPos(index);

    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    moveToPositionOnMap(g_str_current_target, 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
    
    if ("dsec" in item) {
        movieSeekTo(item.dsec * 1);
    }
}

function setMoveActionFromMovie(index, item) {
    openScatterTip(window.myScatter, 0, index);
    openLineTip(window.myLine, 0, index);

    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    setSliderPos(index);

    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    moveToPositionOnMap(g_str_current_target, 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
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
    moveToPositionOnMap(g_str_current_target, 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
}

function setMoveActionFromSliderOnMove(index, item) {
    $('#sliderText').html(index);

    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    moveToPositionOnMap(g_str_current_target, 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
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

function setYawStatus(yaw) {
    if ($('#yawStatus').length <= 0) return;
    let yawStatus = document.getElementById('yawStatus');
    if (!isSet(yawStatus)) return;
    if (!isSet(yaw)) return;

    yaw = yaw * 1;
    let degree = yaw < 0 ? (360 + yaw) : yaw;
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
    let pitchStatus = document.getElementById('pitchStatus');
    if (!isSet(pitchStatus)) return;
    if (!isSet(pitch)) return;

    pitch = pitch * 1; //
    let degree = pitch * -1;
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
    let canvas = document.getElementById('rollCanvas');
    if (!isSet(canvas)) return;
    if (!isSet(roll)) return;

    roll = roll * 1;
    let degrees = 180 + roll;
    let degrees2 = degrees + 180;

    if (degrees2 > 360) degrees2 = degrees2 - 360;

    let radians1 = (Math.PI / 180) * degrees;
    let radians2 = (Math.PI / 180) * degrees2;

    let context = canvas.getContext('2d');
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


function getColorPerAlt3d(alt) {
		if(alt < 0) alt = 0;

    var icon_color = Math.floor(alt * 1.2);

    var g = 40 + icon_color;
    if (g > 255) g = 255;

    return Cesium.Color.fromBytes(4, g, 4, 230);
}

function getColorPerAlt(alt) {
		if(alt < 0) alt = 0;

    var icon_color = Math.floor(alt * 1.2);

    var g = 40 + icon_color;
    if (g > 255) g = 255;

    var pos_icon_color = "#04" + g.toString(16) + "04";
    return pos_icon_color;
}

function getYoutubeQueryVariable(query) {
  var varfirst = query.split('?');
  var vars = varfirst[1].split('&');
  for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == "v") {
          return decodeURIComponent(pair[1]);
      }
  }
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

function makeDateTimeFormat(d, isGMT) {
		if(isGMT == false)
			d.setHours(d.getHours() + 9);

  	var curr_day = d.getDate();
		curr_day = curr_day < 10 ? "0" + curr_day : curr_day;
		var curr_month = d.getMonth();
		curr_month++;

		curr_month = curr_month < 10 ? "0" + curr_month : curr_month;

		var curr_year = d.getFullYear();


		var curr_hour = d.getHours();
		curr_hour = curr_hour < 10 ? "0" + curr_hour : curr_hour;

		var curr_min = d.getMinutes();
		curr_min = curr_min < 10 ? "0" + curr_min : curr_min;

		var curr_sec = d.getSeconds();
		curr_sec = curr_sec < 10 ? "0" + curr_sec : curr_sec;

		return curr_year + "-" + curr_month + "-" + curr_day + " " + curr_hour + ":" + curr_min + ":" + curr_sec;
}

function GET_STRING_CONTENT(table_index_str) {
		return LANG_JSON_DATA[g_str_cur_lang][table_index_str];
}

function GATAGM(event_name, category, label) {
		var userid = getCookie('dev_user_id');
		if (!isSet(userid) || userid == "") {
			userid = "anonymous";
		}

		if (!isSet(g_str_page_action) || g_str_page_action == "") {
			g_str_page_action = "index"
		}

		var c_label = event_name;
		if (isSet(label) && label != "") {
			c_label = label;
		}

    gtag(
        'event', event_name, {
        'event_category': g_str_page_action,
        'language' : g_str_cur_lang,
        'event_label': c_label,
        'userid' : userid,
        'event_position' : category,
        'location': window.location.href
    	}
    );

    mixpanel.track(
        label + "_" + g_str_cur_lang,
        { "event_category": category, "event_label": label }
    );
}

function setKalmanFilter() {
    addFlightRecordDataToView(null, true);
    $('#btnForFilter').prop('disabled', true);
}


function addObjectTo3DMap(index, owner, kind) {
    addObjectTo3DMapWithGPS(index, owner, kind, 33.3834381, 126.5610038, 3000);
}


function computeCirclularFlight(start) {
    let property = new Cesium.SampledPositionProperty();

    if (!isSet(v3DMapViewer)) return null;

    v3DMapViewer.entities.removeAll();

    let i = 0;
    g_array_flight_rec.forEach(function (item) {
        let time = Cesium.JulianDate.addSeconds(
            start,
            i,
            new Cesium.JulianDate()
        );
        let position = Cesium.Cartesian3.fromDegrees(
            item.lng,
            item.lat,
            item.alt
        );
        property.addSample(time, position);

        let icon_color = getColorPerAlt3d(item.alt);

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
        scene3DOnly: true,
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
    
    let helper = new Cesium.EventHelper();
		helper.add(v3DMapViewer.scene.globe.tileLoadProgressEvent, function (event) {			
			if (event == 0) {				
				$("#loaderFor3DMap").hide();
			}
		});

    v3DMapCate = new Cesium.Cartesian3();
    planePrimitives = {};
    
    if($("#loaderFor3DMap").length) {
    	$("#loaderFor3DMap").show();
    }
}

function move3DmapIcon(owner, index, lat, lng, alt, pitch, yaw, roll) {
    if (typeof Cesium !== "undefined") {
        if (!isSet(planePrimitives)) return;

        let position = Cesium.Cartesian3.fromDegrees(
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

        let hpRoll = new Cesium.HeadingPitchRoll();
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

function addObjectTo2DMapWithGPS(index, owner, kind, lat, lng) {
    if (!isSet(g_vector_2D_mainmap_for_object)) return;

    if (!isSet(g_array_point_cur_2D_mainmap_for_object)) {
        g_array_point_cur_2D_mainmap_for_object = [];
        g_array_icon_cur_2D_mainmap_for_object = [];
    }

    if (!(owner in g_array_point_cur_2D_mainmap_for_object)) {
        g_array_point_cur_2D_mainmap_for_object[owner] = [];
        g_array_icon_cur_2D_mainmap_for_object[owner] = [];
    }

    let current_pos = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat]))
    });

    let dsrc = './imgs/position.png';
    if (kind == "drone") {
        dsrc = './imgs/position2.png';
    }

    let current_pos_image = new ol.style.Icon(({
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


function addObjectTo2DMap(index, owner, kind) {    
    addObjectTo2DMapWithGPS(index, owner, kind, 33.3834381, 126.5610038);
}

function map2DInit() {

    let styles = [
				'Road (Detailed)',
        'Road',
        'Aerial',
        'AerialWithLabels'
    ];
    let maplayers = [];

    maplayers.push(
				new ol.layer.Tile({
		      source: new ol.source.OSM(),
		    })
		);

		let style_len = styles.length;
    for (let i = 1; i <= style_len; i++) {
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

    let dokdo = ol.proj.fromLonLat([126.5610038, 33.3834381]);
    let scaleLineControl = new ol.control.ScaleLine();

    g_vector_2D_mainmap_for_design_icon = new ol.source.Vector();

    g_view_cur_2D_mainmap = new ol.View({
        center: dokdo,
        zoom: 17
    });

    let geolocation = new ol.Geolocation({
        trackingOptions: {
            enableHighAccuracy: true
        },
        projection: g_view_cur_2D_mainmap.getProjection()
    });

    g_vector_2D_mainmap_for_cada = new ol.source.Vector({});
    g_vector_2D_mainmap_for_cada.on('tileloaderror', function () {
        showAlert(GET_STRING_CONTENT('msg_failed_to_load_map_sorry'));
    });

    let pointLayer = new ol.layer.Vector({
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

    let vectorLayer = new ol.layer.Vector({
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
        let pos = geolocation.getPosition();
        let lonLat = ol.proj.toLonLat(pos);
        moveToPositionOnMap("private", 0, lonLat[1], lonLat[0], 0, geolocation.getHeading(), 0, 0);
    });

    // handle geolocation error.
    geolocation.on('error', function (error) {
        let info = $('#monitor');
        if (info)
        	info.text(error.message);
    });

    if ($('#track').length) {
        $('#track').change(function () {
            geolocation.setTracking($("#track").is(":checked"));
        });
    }

    let select = document.getElementById('layer-select');
    if (isSet(select)) {
        select.addEventListener('change', function () {
            let select = document.getElementById('layer-select');
            let style = select.value;
            for (let i = 0; i < style_len; ++i) {
                maplayers[i].setVisible(styles[i] === style);
            }
        });
    }

    maplayers[3].setVisible(true); //AerialWithLabels
    maplayers[4].setVisible(true); //pointLayer
    maplayers[5].setVisible(true); //vectorLayer


  	let overviewMapControl = new ol.control.OverviewMap({
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


    let curCoodinate;
    let finalPlanGenPositionLonLat = [0,0];

    let modify = new ol.interaction.Modify({
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

		let overlaySource = modify.getOverlay().getSource();
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
    let location = ol.proj.fromLonLat([lng * 1, lat * 1]);

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


function getColor(colorName, alpha) {
    let color = Cesium.Color[colorName.toUpperCase()];
    return Cesium.Color.fromAlpha(color, parseFloat(alpha));
}

function draw3DMap() {
    let start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));

    let position = computeCirclularFlight(start);
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

    let camera = v3DMapViewer.camera;

    let position = Cesium.Cartesian3.fromDegrees(
        lng, lat, alt
    );

    let glbUrl = window.location.origin + "/center/imgs/drone.glb",
    		gColor, sColor;

    if (kind == "drone") {
        gColor = "YELLOW";
        sColor = "RED";
    }
    else {
    		gColor = "GREEN";
    		sColor = "CYAN";
    }

    let hpRoll = new Cesium.HeadingPitchRoll();
    let planePrimitive = s3DMapScene.primitives.add(
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
    
    planePrimitives[owner].push(planePrimitive);        
		moveToStartPoint3D(lat, lng, alt);
}



function createNewIconFor2DMap(i, item) {

		var hasYoutube = false;
		if (isSet(item.hasYoutube)) {
    	hasYoutube = item.hasYoutube;
    }

    var pos_icon = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
        name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
        mindex: i,
        mhasYoutube : hasYoutube,
        mname: item.name,
        maddress : item.address
    });

    return pos_icon;
}

function addNewIconMarkerFor2DMap(npos, vsource) {
		var iconStyle = new ol.style.Style({
		  image: new ol.style.Icon({
		    src: '/images/pin.png',
		    anchor: [0.5, 46],
		    anchorXUnits: 'fraction',
		    anchorYUnits: 'pixels',
		    scale: 0.2
		  }),
		});

		var pos_icon = new ol.Feature({
	          geometry: new ol.geom.Point(npos)
	  });

	  pos_icon.setStyle(iconStyle);

	  vsource.addFeature(pos_icon);
}


function setAddressAndCada(address_id, address, cada, wsource) {

		if (!isSet(cada)) return;

    if (isSet(c3ddataSource)) {
        Cesium.GeoJsonDataSource.crsNames['customProj'] = function (coords) {
            var lonlat = ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
            return Cesium.Cartesian3.fromDegrees(lonlat[0], lonlat[1], 200);
        }


        cada[0]['crs'] = {
            type: 'name',
            properties: {
                'name': 'customProj'
            }
        };

        // Load
        c3ddataSource.load(cada[0], {
            stroke: Cesium.Color.RED,
            strokeWidth: 2,
            clampToGround: true
        });
    }

    if ($(address_id).length)
        $(address_id).text(address);

    if (isSet(wsource) == false) return;

		var _features = new Array();

    for (var idx = 0; idx < cada.length; idx++) {
        try {
            var geojson_Feature = cada[idx];
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

    wsource.addFeatures(_features);
}


function flightRecords2DMapInit() {
    var dpoint = ol.proj.fromLonLat([126.5203904, 33.3616837]);

		g_container_2D_map_for_popup = document.getElementById('popup');
		g_content_2D_map_for_popup = document.getElementById('popup-content');
		g_closer_2D_map_for_popup = document.getElementById('popup-closer');

		g_container_2D_map_for_popup.style.visibility = "visible";
  	let overlay = new ol.Overlay({
		  element: g_container_2D_map_for_popup,
		  autoPan: true,
		  autoPanAnimation: {
		    duration: 250,
		  },
		});

		g_closer_2D_map_for_popup.onclick = function () {
		  overlay.setPosition(undefined);
		  g_closer_2D_map_for_popup.blur();
		  return false;
		};

    g_view_2D_map_for_flight_rec = new ol.View({
        center: dpoint,
        zoom: 7
    });

    g_vector_2D_map_for_company = new ol.source.Vector();
		let clusterCompanySource = new ol.source.Cluster({
			  distance: 40,
			  source: g_vector_2D_map_for_company,
			  geometryFunction: function(feature) {
	        var geom = feature.getGeometry();
	    		return geom.getType() == 'Point' ? geom : null;
	    	},
			});

		let styleCacheForCompany = {};
	  g_layer_2D_map_for_company = new ol.layer.Vector({
	      source: clusterCompanySource,
	      zIndex: 20,
	      style:  function (feature) {
	        	if (!feature) return;

				    let size = feature.get('features').length;
				    let radius;
				    size == 1 ? radius = 8 : radius = 10 + (size * 0.1);
				    let style = styleCacheForCompany[size];
				    if (!style) {
				    		if (size == 1) {
				    			style = [new ol.style.Style({
		                image: new ol.style.Icon({
										    src: '/images/company_pos.png',
										    scale: 0.3,
										    opacity : 0.8,
										    fill: new ol.style.Fill({ color: '#FFF' }),
										    stroke: new ol.style.Stroke({ color: '#45cdba', width: 2 }),
										  })
		              })];
				    		}
				    		else {
					    		style = [new ol.style.Style({
		                image: new ol.style.Circle({
					            radius: radius,
					            opacity : 0.7,
					            fill: new ol.style.Fill({ color: '#FFF' }),
					            stroke: new ol.style.Stroke({ color: '#45cdba', width: 2 })
			                }),
			            	text: new ol.style.Text({
			            						font: radius + 'px Roboto',
						                  text: size.toString(),
						                  fill: new ol.style.Fill({ color: '#000' })
											})
		              })];
		            }

	          		styleCacheForCompany[size] = style
				    }
				    return style;
				  },
	    });


    g_vector_2D_map_for_flight_rec = new ol.source.Vector();
		let clusterSource = new ol.source.Cluster({
		  distance: 40,
		  source: g_vector_2D_map_for_flight_rec,
		  geometryFunction: function(feature) {
        var geom = feature.getGeometry();
    		return geom.getType() == 'Point' ? geom : null;
    	},
		});

		let styleCache = {};
    g_layer_2D_map_for_flight_rec = new ol.layer.Vector({
        source: clusterSource,
        zIndex: 21,
        style: function (feature) {
        	if (!feature) return;

			    let size = feature.get('features').length;
			    let radius;
			    size == 1 ? radius = 8 : radius = 10 + (size * 0.1);
			    let style = styleCache[size];
			    if (!style) {
			       	if (size == 1) {
			       		style = [new ol.style.Style({
	                image: new ol.style.Icon({
									    src: '/images/f_record_pos.png',
									    scale: 0.3,
									    opacity : 0.8,
									    fill: new ol.style.Fill({ color: '#FFF' }),
									    stroke: new ol.style.Stroke({ color: '#FB5B58', width: 2 }),
									  })
	              })];
			    		}
			    		else {
				    		style = [new ol.style.Style({
	                image: new ol.style.Circle({
				            radius: radius,
				            fill: new ol.style.Fill({ color: '#FFF' }),
				            stroke: new ol.style.Stroke({ color: '#FB5B58', width: 2 }),
				            opacity : 0.7,
		                }),
		            	text: new ol.style.Text({
					                  text: size.toString(),
					                  font: radius + 'px Roboto',
					                  fill: new ol.style.Fill({ color: '#000' })
										})
	              })];
	            }

          		styleCache[size] = style
			    }
			    return style;
			  },
    });

    let bingLayer = new ol.layer.Tile({
        visible: true,
        preload: Infinity,
        source: new ol.source.OSM()
    });

    let overviewMapControl = new ol.control.OverviewMap({
		  layers: [
		    new ol.layer.Tile({
		      source: new ol.source.OSM(),
		    }) ],
		  collapsed : true
		});

		g_vector_2D_map_for_cada = new ol.source.Vector({});
		let cadaLayer = new ol.layer.Vector({
        source: g_vector_2D_map_for_cada,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ff0000',
                width: 2
            })
        })
    });
    
		let areaInfoLayer = new ol.layer.Vector({
        source: new ol.source.Vector({}),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#0000dd',
                width: 3
            })
        })
    });
    
		let pointLayer = new ol.layer.Vector({
        source: new ol.source.Vector({})
    });

    let vMap = new ol.Map({
    		controls: ol.control.defaults().extend([
            overviewMapControl
        ]),
        target: 'historyMap',
        layers: [
            bingLayer, g_layer_2D_map_for_flight_rec, g_layer_2D_map_for_company, cadaLayer, areaInfoLayer, pointLayer
        ],
        overlays: [ overlay ],
        loadTilesWhileAnimating: true,
        view: g_view_2D_map_for_flight_rec
    });

		vMap.on('click', function(evt) {
	        	var feature = vMap.forEachFeatureAtPixel(evt.pixel, function (feature) { return feature; });
	        	processMapClick(vMap, evt, feature, overlay);
		});
}

function isCluster(feature) {
	  if (!feature || !feature.get('features')) {
	        return false;
	  }

	  return feature.get('features').length >= 1;
}

function showCompanyList(bshow) {
		g_layer_2D_map_for_company.setVisible(bshow);
}

function showFlightRecordsList(bshow) {
		g_layer_2D_map_for_flight_rec.setVisible(bshow);
}

function processMapClick(map, evt, feature, overlay) {
		if (!isCluster(feature)) {
			map.getView().animate({
			  zoom: map.getView().getZoom() + 1,
			  duration: 250
			})
			return;
		}

  	var features = feature.get('features');
  	var count = features.length;
		if (count <= 0 || (count > 1 && (map.getView().getZoom() < 18)) ) {
				map.getView().animate({
				  zoom: map.getView().getZoom() + 1,
				  duration: 250
				})
				return;
		}

		let coord = evt.coordinate;

		if (count > 1) {
			g_content_2D_map_for_popup.innerHTML = "";
			features.forEach(function(f, index, arr) {
				displayListFeature(f, index, coord, overlay);
			});
		}
		else {
			g_content_2D_map_for_popup.innerHTML = "";
			displayMapFeature(features[0], coord, overlay);
		}
}


function displayListFeature(f, index, coordinate, overlay) {
	var ii = f.get('mindex');

  if (!isSet(ii)) {
  	ii = f.get('cindex');
  	if (!isSet(ii)) return;

  	GATAGM("duni_map_company_list_click", "CONTENT", ii);

  	overlay.setPosition(coordinate);

		let title = '<div class="row"><div class="col-md-12 text-left"><a id="temp_feature_item_' + ii + '" style="cursor: pointer"><font size="2" color="#3acbbc">' + (index + 1) + " : " + f.get('cname') + '</font></a></div></div>';
	  $("#popup-content").append(title);

  	//
  	$('#temp_feature_item_' + ii).click(function(e) {
  		getCompanyInfo(title, ii);
  	});
  	return;
  }

  GATAGM("duni_map_video_list_click", "CONTENT", ii);

  var hasYoutube = f.get('mhasYoutube');

	if (hasYoutube) {
		var name = f.get('mname');

		overlay.setPosition(coordinate);

		let title = '<div class="row"><div class="col-md-12 text-left"><a id="temp_youtube_item_' + ii + '" style="cursor: pointer"><font size="2" color="#3acbbc">' + (index + 1) + " : " + name + '</font></a></div></div>';
	  $("#popup-content").append(title);
  	//
  	$('#temp_youtube_item_' + ii).click(function(e) {
  		getFlightRecordInfo(name);
  	});
	}
}

function displayMapFeature(f, coordinate, overlay) {
	var ii = f.get('mindex');
  if (!isSet(ii)) {
  	ii = f.get('cindex');
  	if (!isSet(ii)) return;

  	GATAGM("duni_map_company_click", "CONTENT", ii);

  	var title = f.get('cname');

		title = '<p>' + title + '</p>';
	  overlay.setPosition(coordinate);
  	getCompanyInfo(title, ii);
  	return;
  }

  GATAGM("duni_map_video_click", "CONTENT", ii);

  var hasYoutube = f.get('mhasYoutube');

	if (hasYoutube) {
		var name = f.get('mname');
		getFlightRecordInfo(name);
	}
}

var isVideoPopupInit = false;
function getFlightRecordInfo(name) {
		var jdata = {"action": "public_record_detail", "name" : encodeURI(name)};

		showLoader();

  	ajaxRequest(jdata, function (r) {
  		hideLoader();

	    if(r.result == "success") {
	      if (r.data == null) {
	      	showAlert(GET_STRING_CONTENT('msg_no_data'));
	        return;
	      }

		  	var vid = getYoutubeQueryVariable(r.data.youtube_data_id);
				$("#video-pop-view").attr("video-lang", g_str_cur_lang);

				if (r.data.prod_url) {
					$("#video-pop-view").attr("video-prod-url", r.data.prod_url);
				}
				else {
					$("#video-pop-view").attr("video-prod-url", "");
				}

				$("#video-pop-view").attr("video-name", name);

				if (r.data.owner_email) {
					$("#video-pop-view").attr("video-owner", r.data.owner_email);
				}
				else {
					$("#video-pop-view").attr("video-owner", "");
				}

				if (r.data.outer) {
					$("#video-pop-view").attr("video-outer", r.data.outer);
				}
				else {
					$("#video-pop-view").attr("video-outer", "");
				}

				$("#video-pop-view").attr("video-ispublic", g_str_current_target);
				$("#video-pop-view").attr("video-address", r.data.address);
				$("#video-pop-view").attr("video-url", "https://www.youtube.com/watch?v=" + vid);
				if (isVideoPopupInit == false) {
						$("#video-pop-view").videoPopup();
						isVideoPopupInit = true;
				}

				$("#video-pop-view").click();
	    }
	  },
	  function(request,status,error) {
	  		showAlert(GET_STRING_CONTENT('msg_error_sorry'));
	  		hideLoader();
	  });
}

function moveFlightHistoryMap(lat, lng) {
    var npos = ol.proj.fromLonLat([lng, lat]);
    g_view_2D_map_for_flight_rec.setCenter(npos);
}

function getCompanyInfo(title, cid) {
	  var jdata = {"action": "public_company_detail", "cid" : cid};

		g_content_2D_map_for_popup.innerHTML = title + '<p><img src="/images/loader.gif" border="0" width="20px" height="20px"></p>';

  	ajaxRequest(jdata, function (r) {
	    if(r.result == "success") {
	      if (r.data == null) {
	      	g_content_2D_map_for_popup.innerHTML = title + "<p>Failed to get more info.</p>";
	        return;
	      }

	     	if (r.data.is_playground == true) {
	     			title = "<드론비행/체험장> " + title;
	     	}

				if (cid == 1004) {
					title = "<table border=0 cellpadding=0 cellspacing=2><tr><td width=52 align='left'><img src='/images/logo_aply.png' border='0' width='43px'></td><td><b>" + title + "</b></td></tr></table>";
				}
				else {
		      if (r.data.partner == true) {
		      		title = "<b>" + title + "</b>" + "<table border=0 cellpadding=0 cellspacing=2><tr><td width=52><img src='/duni_logo.png' border='0' width='50' height='14'></td><td><b>Official Partner Company</b></td></tr></table>";
		      }
		      else {
		      		title = "<b>" + title + "</b>";
		      }
		    }

	      title = title + ('<p size=2 face=돋움>' + r.data.address + '</p>' + '<p>' + r.data.phone_num_1);

	      if (isSet(r.data.phone_num_2) && r.data.phone_num_2 != "-")
	      	title = title + ('<br>' + r.data.phone_num_2);

	      title = title + '</p>';
	      title = title + "<table border=0 cellpadding=0 cellspacing=2 width=99% align=center><tr>";

	      if (r.data.spe_edu == true) {
	      		title = title + "<td align=left><i class='ti-id-badge'></i> <b>전문교육기관</b></td>";
				}

	      if (isSet(r.data.homeaddress) && r.data.homeaddress != "-") {
	      		title = title + "<td width=50% align=right><a href='" + r.data.homeaddress + "' target=_new onClick='GATAGM(\"duni_map_company_home_click\", \"CONTENT\", " + cid + ");'>홈페이지</a></td>";
	      }

	      title = title + "</tr></table>";

	      g_content_2D_map_for_popup.innerHTML = title;
	    }
	  },
	  	function(request,status,error) {
	  		g_content_2D_map_for_popup.innerHTML = title + "<p>Failed to get more info.</p>";
	  });
}

function createNewCompanyIconFor2DMap(i, item) {
		var pos_icon = new ol.Feature({
	          geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
	          cname: item.name,
	          cindex : item.cid
	      });

	  return pos_icon;
}

function getFullFlightRecords(target) {
		var jdata;
		if (target == "public") {
			jdata = {"action": "public_record_list", "list" : true};
		}
		else {
			var userid = getCookie("dev_user_id");
	  	jdata = {"action": "position", "daction" : "download", "clientid": userid, "public" : false};
		}

	  showLoader();
	  ajaxRequest(jdata, function (r) {
	    hideLoader();
	    if(r.result == "success") {
	      if (r.data == null || r.data.length == 0) {
	        showAlert(GET_STRING_CONTENT('msg_no_data'));
					hideLoader();
	        return;
	      }

				g_array_full_flight_rec = r.data;
	      setFlightlistFullHistory();
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
	  }, function(request,status,error) {
	    hideLoader();
	  });
}

function setFlightlistFullHistory() {
	var isFirst = true;

	g_array_full_flight_rec.forEach(function(item, index, arra) {
		if (isSet(item.flat) == false || item.flat == -999) return;

		if (isFirst && item.flat != -999) {
	      moveFlightHistoryMap(item.flat, item.flng);
	      isFirst = false;
	  }

		let hasYoutube = isSet(item.youtube_data_id) == true ? true : false;
    var icon = createNewIconFor2DMap(index, {lat:item.flat, lng:item.flng, name: item.name, alt:0, address: item.address, hasYoutube : hasYoutube });
    if (isSet(g_vector_2D_map_for_flight_rec)) {
        g_vector_2D_map_for_flight_rec.addFeature(icon);
    }
  });
}

function getCompanyList() {
		g_vector_2D_map_for_company.clear();

	  var jdata = {"action": "public_company_list"};

		showLoader();
  	ajaxRequest(jdata, function (r) {
	    hideLoader();
	    if(r.result == "success") {
	      if (r.data == null || r.data.length == 0) {
					hideLoader();
	        return;
	      }

	      g_array_full_company_list = r.data;
	      g_array_full_company_list.forEach(function(item, index, arr) {
	      	var icon = createNewCompanyIconFor2DMap(index, item);
					g_vector_2D_map_for_company.addFeature(icon);
	  		});

				hideLoader();
	    }
	    else {
				hideLoader();
	    }
	  }, function(request,status,error) {
	    hideLoader();
	  });
}
