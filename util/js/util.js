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

$(function () {
		checkLang();
		utilInit();
});

var goToTop = function() {

		$('.js-gotop').on('click', function(event){

			event.preventDefault();

			$('html, body').animate({
				scrollTop: $('html').offset().top
			}, 500, 'easeInOutExpo');

			return false;
		});

		$(window).scroll(function(){

			var $win = $(window);
			if ($win.scrollTop() > 200) {
				$('.js-top').addClass('active');
			} else {
				$('.js-top').removeClass('active');
			}

		});

	};

function utilInit() {

		showLoader();
		
		g_str_page_action = "util";
		
		$("#address").keypress(function (e) {
			if (e.which == 13){
					GATAGM("util_address_input_key_enter", "CONTENT");
					requestGPS();  //
			}
		});

		$("#lng").keypress(function (e) {
        if (e.which == 13){
        		GATAGM("util_lat_lng_input_key_enter", "CONTENT");
        		requestAddress();  //
        }
    });

		goToTop();		
		flightRecords2DMapInit();
		$("#historyMapArea").hide();
		getCompanyList();
		getFullFlightRecords("public");
    initYoutubeAPI();
    $("#historyMapArea").hide();
		hideLoader();
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

function moveFlightHistoryMapAndCada(lat, lng, cada) {
	$("#historyMapArea").show();
	var npos = ol.proj.fromLonLat([lng, lat]);
	
	var latlng = lat + "_" + lng;
	
	$('#dataTable-Flight_list').empty();
	$('#dataTable-Flight_list').append("<div class='text-center'><h4>이 지역을 드론으로 촬영한 영상이 보고 싶지 않으세요?</h4><a class='btn btn-primary btn-sm' role='button' href='https://duni.io/index.php?page=rental' target='_new' onClick='GATAGM(\"util_request_duni_btn\",\"SERVICE\",\"" + latlng + "\");'>드론촬영 요청</a></div>");
	
	g_view_2D_map_for_flight_rec.setCenter(npos);
	addNewIconMarkerFor2DMap(npos, g_vector_2D_map_for_point_mark);
	if (isSet(cada))
		setAddressAndCada(null, null, cada.response.result.featureCollection.features, g_vector_2D_map_for_cada);
}

var tableCount = 0;
var duni_logo = '/duni_logo.png';

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
	    source: new ol.source.OSM()
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
						+ name + "\");' href='/center/main.html?page_action=publicrecordlist_detail&record_name="
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
			appendRow = appendRow + "<a id='video-pop-" + curIndex +  "' video-lang='" + g_str_cur_lang + "' video-name='" + name + "' video-url='https://www.youtube.com/watch?v=" + vid + "'></a>";
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

function setFlightlistHistory(latlng) {
		$("#historyMapArea").hide();
		$('#dataTable-Flight_list').empty();

		$('#dataTable-Flight_list').append("<div class='text-center'><h4>인근 지역을 드론으로 촬영한 영상들의 목록입니다 - <a href='https://duni.io' target='_new' onClick='GATAGM(\"util_request_duni_btn_2\",\"SERVICE\",\"" + latlng + "\");'>드론촬영 요청하기</a></h4></div>");
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
  	jdata["lat"] = $("#lat").val() * 1;
  	jdata["lng"] = $("#lng").val() * 1;


    if (isSet(jdata["lat"]) == false || isSet(jdata["lng"]) == false) {
    		hideLoader();
	    	showAlert("좌표를 " + GET_STRING_CONTENT('msg_wrong_input'));
	    	return;
    }

		//같은 값으로 조회 시도
		if (oldLatVal == jdata["lat"] && oldLngVal == jdata["lng"]) {
			hideLoader();
			return;
		}

		oldLatVal = jdata["lat"];
		oldLngVal = jdata["lng"];

		GATAGM("util_address_by_gps_btn_click", "SERVICE", oldLatVal + "," + oldLngVal);

		showLoader();
		setCaptcha(jdata, function (r) {
		    if(r.result == "success") {
					$("#address").val(r.data.address);
					
					setAreaInfo(r.data.area_info);

					oldAddressVal = r.data.address;

					if (isSet(r.data.data)) {
						
						flightRecArray = r.data.data;
	      		setFlightlistHistory(oldLatVal + "," + oldLngVal);
					}
					else {
						
						moveFlightHistoryMapAndCada(oldLatVal, oldLngVal, r.data.cada);
						showAlert(GET_STRING_CONTENT('msg_address_checked'));
					}
					
		    	hideLoader();
		    }
		    else {
		    	showAlert("좌표를 " + GET_STRING_CONTENT('msg_wrong_input'));
		    	hideLoader();
		    }
		  },
		  function(request,status,error) {
		    hideLoader();
		    showAlert(GET_STRING_CONTENT('msg_error_sorry'));
		  }
		);

}


function setAreaInfo(ainfo) {
	let needApprove = ainfo.needApprove;
	let area_infos = ainfo.area_infos;
	let desc = ainfo.desc;
	
	var areaString = "";	
	area_infos.forEach(function(ai) {
		areaString = areaString + ai.name + " / ";
		var areaVec = ai.arrayvec;
		var _area_polyline = new ol.Feature({ geometry : new ol.geom.LineString(areaVec) });
    g_vector_2D_map_for_flight_area.addFeature(_area_polyline);		
	});
			
	$("#area_info_text").html("<H4>이 지역은 " + desc + "<br></H4><H5><font color='#f00'>" + areaString + "</font></H5>");			
  
}

function requestGPS(address) {
		var jdata = {"action" : "public_gps_by_address", "daction" : "public_gps_by_address"};
  	jdata["address"] = encodeURI($("#address").val());

    if (isSet(jdata["address"]) == false) {
	    	showAlert("주소를 " + GET_STRING_CONTENT('msg_wrong_input'));
	    	return;
    }

    //같은 값으로 조회 시도
		if (oldAddressVal == jdata["address"]) return;

		oldAddressVal = jdata["address"];

		GATAGM("util_gps_by_address_btn_click", "SERVICE", oldAddressVal);

    showLoader();
		setCaptcha(jdata, function (r) {
	    	if(r.result == "success") {
			      if (r.data == null) {
			      	showAlert("주소를 " + GET_STRING_CONTENT('msg_wrong_input'));
			        return;
			      }
									     	
	     			$("#lat").val(r.data.lat);
						$("#lng").val(r.data.lng);
				
						$("#address").val(r.data.address);
						
						setAreaInfo(r.data.area_info);
	
						oldAddressVal = r.data.address;
	
						if (isSet(r.data.data)) {									
							flightRecArray = r.data.data;
		      		setFlightlistHistory(r.data.lat + "," + r.data.lng);
						}
						else {									
							moveFlightHistoryMapAndCada(r.data.lat, r.data.lng, r.data.cada);
							showAlert(GET_STRING_CONTENT('msg_address_checked'));
						}
						
			    	hideLoader();					    					    					  
	    	}
	    	else {
	    			hideLoader();
		  			showAlert("주소를 " + GET_STRING_CONTENT('msg_wrong_input'));
	    	}
	  	},
	  	function(request,status,error) {
					hideLoader();
	  			showAlert(GET_STRING_CONTENT('msg_error_sorry'));
	  	}
	  );
}

function initYoutubeAPI() {
		var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
