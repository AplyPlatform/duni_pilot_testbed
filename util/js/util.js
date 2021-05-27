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

var langset = "KR";

$(function () {
		var lang = getCookie("language");
    if (isSet(lang))
        langset = lang;

		utilInit();
});


function setCookie(cName, cValue, cDay) {
    var date = new Date();
    date.setTime(date.getTime() + cDay * 60 * 60 * 24 * 1000);
    document.cookie = cName + '=' + cValue + ';expires=' + date.toUTCString() + ';path=/';
}

function getCookie(cName) {
    var value = document.cookie.match('(^|;) ?' + cName + '=([^;]*)(;|$)');
    return value ? value[2] : null;
}


function showLoader() {
    $("#loading").show();
}

function hideLoader() {
    $("#loading").fadeOut(800);
}

function showAlert(msg) {

    $('#modal-title').text(LANG_JSON_DATA[langset]['modal_title']);
    $('#modal-confirm-btn').text(LANG_JSON_DATA[langset]['modal_confirm_btn']);

    $('#errorModalLabel').text(msg);
    $('#errorModal').modal('show');
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
    $('#askModalContent').text(acontent);
    $('#askModalOKButton').text(oktitle);


    if (cancelhandler) {
      $('#askModalCancelButton').show();
      $('#askModalCancelButton').off('click');
      $('#askModalCancelButton').click(function () {
          cancelhandler();
      });
    }
    else {
      $('#askModalCancelButton').hide();
    }

    $('#askModalOKButton').off('click');
    $('#askModalOKButton').click(function () {
        $('#askModal').modal('hide');
        if (needInput == true) {
            var ret = $('#askModalInput').val();

            if (!isSet(ret)) {
                showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
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

function utilInit() {

		$("#address").keypress(function (e) {
        if (e.which == 13){
        		requestGPS();  //
        }
    });

		$("#lng").keypress(function (e) {
        if (e.which == 13){
        		requestAddress();  //
        }
    });
    
    initYoutubeAPI();
		hideLoader();
}


function isSet(value) {
		if ( typeof(value) === 'number' )
        return true;
    if (value == "" || value == null || value == "undefined" || value == undefined)
        return false;
    return true;
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
        		if (r.result != "success" && (("reason" in r) && r.reason.indexOf("invalid token") >= 0)) {
        			alert(LANG_JSON_DATA[langset]['msg_login_another_device_sorry']);
        			logOut();
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


function setCaptcha(jdata, successHandler, failHandler) {

	grecaptcha.ready(function () {
        grecaptcha.execute('6LfPn_UUAAAAAN-EHnm2kRY9dUT8aTvIcfrvxGy7', { action: 'action_name' })
            .then(function (token) {
 								jdata['captcha_token'] = token;
						  	ajaxRequest(jdata, successHandler, failHandler);
                
            });
  });

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

  return "";
}

var players = [];
function setEmptyVideo(index) {
	//$("#youTubePlayer_" + index).show();
	//$("#youTubePlayerIframe_" + index).attr('src', "https://youtube.com/embed/q2PzFbh6HBE");
	players[index] = new YT.Player("youTubePlayer_" + index, {
    height: '200',
    width: '100%',
    videoId: "q2PzFbh6HBE",
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function setYoutubeVideo(index, youtube_url) {
	var vid = getYoutubeQueryVariable(youtube_url);

	players[index] = new YT.Player("youTubePlayer_" + index, {
    height: '200',
    width: '100%',
    videoId: vid,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
	event.target.stopVideo();
}

var playingIndex = null;
var stopIndex = null;
var playIndex = null;

function onPlayerStateChange(event) {
	for ( var i = 0 ; i < players.length ; i ++ ) { // 각 플레이어의 상태를      
      var state = players[i].getPlayerState(); 

      // 초기 화면에서 재생 된 경우
      if ( state === YT.PlayerState.PLAYING && playingIndex === null ) { 
      	playingIndex = i;  
      	// 다른 플레이어가 재생 중에 그 선수 이외가 재생 된 경우
      } else if ( ( state === YT.PlayerState.BUFFERING || state === YT.PlayerState.PLAYING ) && playingIndex !== i ) { 
      	stopIndex = playingIndex;
        playIndex = i;
      } 
  }    
          
  // 재생 중이던 플레이어를 일시 중지
  if ( stopIndex !== null ) { players[stopIndex].pauseVideo();
  	stopIndex = null;
  }  
      
	if ( playIndex !== null ) { playingIndex = playIndex ;
	   playIndex = null;
	}
}

var flightRecArray = [];
var tableCount = 0;

function createNewIconFor2DMap(i, item) {
		var pos_icon = new ol.Feature({
	          geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
	          name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
	          mindex : i,
						maddress : item.address,
						mhasYoutube : item.hasYoutube
	      });

	  return pos_icon;
	}

function makeForFlightListMap(index, flat, flng, address, hasYoutube) {
		var dpoint = ol.proj.fromLonLat([flng, flat]);

	  var c_view = new ol.View({
	      center: dpoint,
	      zoom: 10
	    });

	  var vSource = new ol.source.Vector();

	  var vVectorLayer = new ol.layer.Vector({
	      source: vSource,
	      zIndex: 77,
	      style: new ol.style.Style({	    
	      			stroke: new ol.style.Stroke({
                color: '#ff0000',
                width: 2
            	}),        
	            image: new ol.style.Circle({
					            radius: 7,
					            fill: new ol.style.Fill({ color: '#ff333377' }),
					            stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
		                })
	          })
	    });

    var bingLayer = new ol.layer.Tile({
	    visible: true,
	    preload: Infinity,
	    source: new ol.source.BingMaps({
	        // We need a key to get the layer from the provider.
	        // Sign in with Bing Maps and you will get your key (for free)
	        key: 'AgMfldbj_9tx3cd298eKeRqusvvGxw1EWq6eOgaVbDsoi7Uj9kvdkuuid-bbb6CK',
	        imagerySet: 'AerialWithLabels', // or 'Road', 'AerialWithLabels', etc.
	        // use maxZoom 19 to see stretched tiles instead of the Bing Maps
	        // "no photos at this zoom level" tiles
	        maxZoom: 19
	    })
		});

	  var vMap = new ol.Map({
	      target: 'map_' + index,
	      layers: [
	          bingLayer, vVectorLayer
	          //vVectorLayer
	      ],
	      // Improve user experience by loading tiles while animating. Will make
	      // animations stutter on mobile or slow devices.
	      loadTilesWhileAnimating: true,
	      view: c_view
	    });

	  var icon = createNewIconFor2DMap(index, {lat:flat, lng:flng, alt:0, address: address, hasYoutube : hasYoutube});
	  vSource.addFeature(icon);
	  
	  return vSource;
}

function setAddressAndCada(address_id, address, cada, wsource) {
		var _features = [];
		var _addressText = "";

	  for(var idx=0; idx< cada.length; idx++) {
	    try{
	      var geojson_Feature = cada[idx];
	      var geojsonObject = geojson_Feature.geometry;

	      var features =  (new ol.format.GeoJSON()).readFeatures(geojsonObject);
	      for(var i=0; i< features.length; i++) {
	        try{
	          var feature = features[i];
	          feature["id_"] = geojson_Feature.id;
	          feature["properties"] = {};
	          for (var key in geojson_Feature.properties) {
	            try{
	              var value = geojson_Feature.properties[key];

	              if (_addressText == "" && key == "addr") {
	              	_addressText = value;
	              }

	              feature.values_[key] = value;
	              feature.properties[key] = value;
	            }catch (e){
	            }
	          }
	          _features.push(feature)
	        }catch (e){
	        }
	      }
	    }catch (e){
	    }
	  }

	  wsource.addFeatures(_features);

	  if (isSet($(address_id)))
	  	$(address_id).text(address);
}
	
function appendFlightListTable(item) {
		var name = item.name;
		var dtimestamp = item.dtime;
		var data = item.data;		
		var address = item.address;
		var cada = item.cada;
		var youtube_url = item.youtube_data_id;
		var curIndex = tableCount;
		var tag_values = item.tag_values;
	  var appendRow = "<div class='service' id='flight-list-" + curIndex + "' name='flight-list-" + curIndex + "'><div class='row'>";
	  
	  var flat = (isSet(item.flat) && item.flat != "" ? item.flat * 1 : -999);
		var flng = (isSet(item.flng) && item.flng != "" ? item.flng * 1 : -999);	  

	  if (flat != -999) {
	  	appendRow = appendRow + "<div class='col-md-4'><div id='map_" + curIndex + "' style='height:200px;width:100%;'></div>";
	  	appendRow = appendRow + "</div><div class='col-md-4'>";//row
	  }
	  else {
	  	appendRow = appendRow + "<div class='col-md-8'>";//row
	  }

	  appendRow = appendRow + "<div id='youTubePlayer_" + curIndex + "'></div>";//row
	  appendRow = appendRow + "</div><div class='col-md-4'>";//row
		appendRow = appendRow
						+ "<a onclick='GATAGM(\"util_flight_list_public_title_click\", \"CONTENT\", \"" 
						+ name + "\", \""
						+ langset + "\");' href='/center/main.html?page_action=publicrecordlist_detail&record_name="
						+ encodeURIComponent(name) + "'>" + name + "</a><hr size=1 color=#eeeeee>";

	  if (flat != -999) {
	  		appendRow = appendRow + "<small><span class='text-xs' id='map_address_" + curIndex + "'></span></small>";
	  }
	  
	  if (isSet(tag_values) && tag_values != "") {
	  	appendRow = appendRow + "<br><br>";    	
    	var tag_array = JSON.parse(tag_values);
    	tag_array.forEach(function(tg) {
    		appendRow = appendRow + "<a href=/center/main.html?page_action=publicrecordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
    	});
    }

	  appendRow = appendRow + "<br><small>" + dtimestamp + "</small>";

	  appendRow = appendRow + "</div></div></div>"; //col, row, service,

	  if (isSet(youtube_url)) {
	  	var vid = getYoutubeQueryVariable(youtube_url);			
			appendRow = appendRow + "<a id='video-pop-" + curIndex +  "' video-lang='" + langset + "' video-name='" + name + "' video-url='https://www.youtube.com/watch?v=" + vid + "'></a>";
	  }

	  $('#dataTable-Flight_list').append(appendRow);

		if (isSet(youtube_url)) {
			//$("#video-pop-" + curIndex).videoPopup();
		}

		var retSource = null;
		if (flat != -999) {
	  	retSource = makeForFlightListMap(curIndex, flat, flng, address, (isSet(youtube_url) ? true : false));
	  }

	  if (isSet(retSource) && isSet(address) && address != "") {
	  	setAddressAndCada("#map_address_" + curIndex, address, cada, retSource);
	  }

	  if (isSet(youtube_url)) {
	  	setYoutubeVideo(curIndex, youtube_url);
	  }
	  else {
	  	setEmptyVideo(curIndex);
	  }

	  tableCount++;
	}


function setNoFlightlistHistory(latlng) {
		$('#dataTable-Flight_list').empty();
		//TODO
		let msg = "<div class='service'><h4>이 지역을 드론으로 촬영한 영상이 보고 싶지 않으세요?</h4><a class='btn btn-primary btn-lg' role='button' href='https://duni.io' target='_new' onClick='GATAGM(\"util_request_duni_btn_1\",\"SERVICE\",\"" + latlng + "\",\"" + langset + "\");'>드론촬영 요청</a></div>";
		$('#dataTable-Flight_list').append(msg);
}

function setFlightlistHistory(latlng) {
		$('#dataTable-Flight_list').empty();
		
		$('#dataTable-Flight_list').append("<div class='text-center'><h4>인근 지역을 드론으로 촬영한 영상들의 목록입니다 - <a href='https://duni.io' target='_new' onClick='GATAGM(\"util_request_duni_btn_2\",\"SERVICE\",\"" + latlng + "\",\"" + langset + "\");'>드론촬영 요청하기</a></h4></div>");
		$('#dataTable-Flight_list').append("<hr>");
		
	  flightRecArray.forEach(function(item) {
	    appendFlightListTable(item);
	  });
}

var oldAddressVal = "";
var oldLatVal = -999;
var oldLngVal = -999;

function requestAddress() {
    
    var jdata = {"action" : "public_address_by_gps", "daction" : "public_address_by_gps"};
  	jdata["lat"] = $("#lat").val();
  	jdata["lng"] = $("#lng").val();
    
    if (isSet(jdata["lat"]) == false || isSet(jdata["lng"]) == false) {
	    	showAlert("좌표를 " + LANG_JSON_DATA[langset]['msg_wrong_input']);
	    	return;
    }

		//같은 값으로 조회 시도
		if (oldLatVal == jdata["lat"] && oldLngVal == jdata["lng"]) return;
		
		oldLatVal = jdata["lat"];
		oldLngVal = jdata["lng"];
		
		GATAGM("public_address_by_gps", "SERVICE", oldLatVal + "," + oldLngVal, langset);

		showLoader();
		setCaptcha(jdata, function (r) {
		    hideLoader();
		    if(r.result == "success") {
					$("#address").val(r.data.address);
					
					oldAddressVal = r.data.address;
					
					if (isSet(r.data.data)) {
						flightRecArray = r.data.data;
	      		setFlightlistHistory(oldLatVal + "," + oldLngVal);
					}
					else {
						setNoFlightlistHistory(oldLatVal + "," + oldLngVal);
						showAlert(LANG_JSON_DATA[langset]['msg_address_checked']);
					}
		    }
		    else {
		    	showAlert("좌표를 " + LANG_JSON_DATA[langset]['msg_wrong_input']);
		    }
		  }, 
		  function(request,status,error) {
		    hideLoader();
		    showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
		  }
		);
		
}


function requestGPS(address) {
		
		var jdata = {"action" : "public_gps_by_address", "daction" : "public_gps_by_address"};
  	jdata["address"] = $("#address").val();
    
    if (isSet(jdata["address"]) == false) {
	    	showAlert("주소를 " + LANG_JSON_DATA[langset]['msg_wrong_input']);
	    	return;
    }
    
    //같은 값으로 조회 시도
		if (oldAddressVal == jdata["address"]) return;
		
		oldAddressVal = jdata["address"];
		
		GATAGM("public_gps_by_address", "SERVICE", oldAddressVal, langset);
    
    showLoader();
		setCaptcha(jdata, function (r) {
				hideLoader();
	    	if(r.result == "success") {
			      if (r.data == null) {
			      	showAlert("주소를 " + LANG_JSON_DATA[langset]['msg_wrong_input']);
			        return;
			      }
		
						$("#lat").val(r.data.lat);
	  				$("#lng").val(r.data.lng);
	  				
	  				oldLatVal = r.data.lat;
						oldLngVal = r.data.lng;
			     	
			     	if (isSet(r.data.data)) {
							flightRecArray = r.data.data;
	      			setFlightlistHistory(oldLatVal + "," + oldLngVal);
						}
						else {
							setNoFlightlistHistory(oldLatVal + "," + oldLngVal);
							showAlert(LANG_JSON_DATA[langset]['msg_address_checked']);
						}
	    	}
	    	else {
		  			showAlert("주소를 " + LANG_JSON_DATA[langset]['msg_wrong_input']);
	    	}
	  	},
	  	function(request,status,error) {
					hideLoader();
	  			showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
	  	}
	  );
}

function GATAGM(label, category, value, language) {
    gtag(
        'event', label + "_" + language, {
        'event_category': category,
        'event_label': label,
        'etc' : value
    }
    );

    mixpanel.track(
        label + "_" + language,
        { "event_category": category, "event_label": label, "etc" : value }
    );
}

function initYoutubeAPI() {
		var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}