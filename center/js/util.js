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
var g_str_page_action = "center";
var g_str_current_target = "private";
var g_str_cur_lang = "KR";
var g_str_cur_viewmode = "pilot"; // or "developer"

var g_array_full_flight_rec;

var g_vector_2D_map_for_flight_rec;
var g_layer_2D_map_for_flight_rec;
var g_view_2D_map_for_flight_rec;
var g_vector_2D_map_for_cada;

var g_vector_2D_map_for_company;
var g_layer_2D_map_for_company;

var g_str_pilot_controller_for_viewmode;
var g_str_dev_controller_for_viewmode;

var oldLat = 0, oldLng = 0, oldAlt = 0;

var c3ddataSource;

// duni map의 기업정보 팝업
var g_container_2D_map_for_popup;
var g_content_2D_map_for_popup;
var g_closer_2D_map_for_popup;


function isRecordFile(filename) {
	let ext = getFileExtension(filename);
	return compareIgnoreCase(ext, "txt");
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
        $('#askModalInput').show();
        $('#askModalContent').hide();
        $('#askModalInput').val("");
        $("#askModalInput").attr("placeholder", acontent);
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
  	var overlay = new ol.Overlay({
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
		var clusterCompanySource = new ol.source.Cluster({
			  distance: 40,
			  source: g_vector_2D_map_for_company,
			  geometryFunction: function(feature) {
	        var geom = feature.getGeometry();
	    		return geom.getType() == 'Point' ? geom : null;
	    	},
			});

		var styleCacheForCompany = {};
	  g_layer_2D_map_for_company = new ol.layer.Vector({
	      source: clusterCompanySource,
	      zIndex: 20,
	      style:  function (feature) {
	        	if (!feature) return;

				    var size = feature.get('features').length;
				    var radius;
				    size == 1 ? radius = 8 : radius = 10 + (size * 0.1);
				    var style = styleCacheForCompany[size];
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
		var clusterSource = new ol.source.Cluster({
		  distance: 40,
		  source: g_vector_2D_map_for_flight_rec,
		  geometryFunction: function(feature) {
        var geom = feature.getGeometry();
    		return geom.getType() == 'Point' ? geom : null;
    	},
		});

		var styleCache = {};
    g_layer_2D_map_for_flight_rec = new ol.layer.Vector({
        source: clusterSource,
        zIndex: 21,
        style: function (feature) {
        	if (!feature) return;

			    var size = feature.get('features').length;
			    var radius;
			    size == 1 ? radius = 8 : radius = 10 + (size * 0.1);
			    var style = styleCache[size];
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

    var bingLayer = new ol.layer.Tile({
        visible: true,
        preload: Infinity,
        source: new ol.source.OSM()
    });

    var overviewMapControl = new ol.control.OverviewMap({
		  layers: [
		    new ol.layer.Tile({
		      source: new ol.source.OSM(),
		    }) ],
		  collapsed : true
		});

		g_vector_2D_map_for_cada = new ol.source.Vector({});
		var cadaLayer = new ol.layer.Vector({
        source: g_vector_2D_map_for_cada,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ff0000',
                width: 2
            })
        })
    });
    
    g_vector_2D_map_for_flight_area = new ol.source.Vector({});
		var areaInfoLayer = new ol.layer.Vector({
        source: g_vector_2D_map_for_flight_area,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#0000dd',
                width: 3
            })
        })
    });
    
    g_vector_2D_map_for_point_mark = new ol.source.Vector({});

		var pointLayer = new ol.layer.Vector({
        source: g_vector_2D_map_for_point_mark
    });

    var vMap = new ol.Map({
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
	    if(r.result == "success") {
	    	hideLoader();

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

	      if (r.data.partner == true) {
	      		title = "<b>" + title + "</b>" + "<table border=0 cellpadding=0 cellspacing=2><tr><td width=52><img src='/duni_logo.png' border='0' width='50' height='14'></td><td><b>Official Partner Company</b></td></tr></table>";
	      }
	      else {
	      		title = "<b>" + title + "</b>";
	      }

	      title = title + ('<p>' + r.data.address + '</p>' + '<p>' + r.data.phone_num_1);

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

function getFullFlightRecords() {		
	  var jdata = {"action": "public_record_list", "list" : true};

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

	      var companyArray = r.data;
	      companyArray.forEach(function(item, index, arr) {
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