﻿	'use strict';

	var tableCount = 0;	
	var duni_logo = 'https://pilot.duni.io/duni_logo.png';

	function isSet(value) {
			if ( typeof(value) === 'number' )
          return true;
	    if (value == "" || value == null || value == "undefined" || value == undefined)
	        return false;
	    return true;
	}

	function GATAGM(label, category, language) {		
	  gtag(
	      'event', label + "_" + language, {
	        'event_category' : category,
	        'event_label' : label
	      }
	    );

	  mixpanel.track(
	    label + "_" + language,
	    {"event_category": category, "event_label": label}
	  );
	}	

	function createNewIconFor2DMap(i, item) {
		var pos_icon = new ol.Feature({
	          geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
	          name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
	          mindex : i,
						maddress : item.address,
						mhasYoutube : item.hasYoutube,
						mname : item.name
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
	    source: new ol.source.OSM({
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

	  var icon = createNewIconFor2DMap(index, {lat:flat, lng:flng, alt:0, name: "", address: address, hasYoutube : hasYoutube});
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

	var flightHistorySource;
	var flightCompanySource;
	var flightHistoryView;

	var vVectorLayerForCompany;
	var vVectorLayerForHistory;

	var flightRecArray = [];
	
	var flightRecFullArray = [];
	var companyArray = [];
	
	var searchKeyword = "";
	

	var container = document.getElementById('popup');
	var content = document.getElementById('popup-content');
	var closer = document.getElementById('popup-closer');

	$("#chkFlightHistory").change(function(){
		showHistoryList($("#chkFlightHistory").is(":checked"));
  });

  $("#chkCompany").change(function(){
		showCompanyList($("#chkCompany").is(":checked"));
  });

	function showCompanyList(bshow) {
		vVectorLayerForCompany.setVisible(bshow);
	}

	function showHistoryList(bshow) {
		vVectorLayerForHistory.setVisible(bshow);
	}


	function flightHistoryMapInit() {
		var dpoint = ol.proj.fromLonLat([0, 0]);

		container.style.visibility = "visible"; 
		var overlay = new ol.Overlay({
		  element: container,
		  autoPan: true,
		  autoPanAnimation: {
		    duration: 250,
		  },
		});

		closer.onclick = function () {
		  overlay.setPosition(undefined);
		  closer.blur();
		  return false;
		};

	  flightHistoryView = new ol.View({
	      center: dpoint,
	      zoom: 7
	    });

	  flightCompanySource = new ol.source.Vector();
		var clusterCompanySource = new ol.source.Cluster({
			  distance: 40,
			  source: flightCompanySource,
			  geometryFunction: function(feature) {
	        var geom = feature.getGeometry();
	    		return geom.getType() == 'Point' ? geom : null;
	    	},
			});

		var styleCacheForCompany = {};
	  vVectorLayerForCompany = new ol.layer.Vector({
	      source: clusterCompanySource,
	      zIndex: 99,
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
										    opacity : 0.7,										    
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
						                  text: size.toString(),
						                  font: radius + 'px Roboto',
						                  fill: new ol.style.Fill({ color: '#000' })						                  
											})	
		              })];
		            }

	          		styleCacheForCompany[size] = style
				    }
				    
				    return style;
				  },
	    });

	  flightHistorySource = new ol.source.Vector();
	  var clusterSource = new ol.source.Cluster({
			  distance: 40,
			  source: flightHistorySource,
			  geometryFunction: function(feature) {
	        var geom = feature.getGeometry();
	    		return geom.getType() == 'Point' ? geom : null;
	    	},
			});

		var styleCache = {};
	  vVectorLayerForHistory = new ol.layer.Vector({
	      source: clusterSource,
	      zIndex: 100,
	      style:  function (feature) {
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
										    opacity : 0.7,
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
		  collapsed : false
		});

	  var vMap = new ol.Map({
	  		controls: ol.control.defaults().extend([
            overviewMapControl
        ]),
	      target: 'historyMap',
	      layers: [
	          bingLayer, vVectorLayerForHistory, vVectorLayerForCompany
	      ],
				overlays: [overlay],
	      // Improve user experience by loading tiles while animating. Will make
	      // animations stutter on mobile or slow devices.
	      loadTilesWhileAnimating: true,
	      view: flightHistoryView
	    });

	  vMap.on('click', function(evt) {
	        	var feature = vMap.forEachFeatureAtPixel(evt.pixel, function (feature) { return feature; });
	        	processMapClick(vMap, evt, feature, overlay);
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

	function getCompanyList() {
		flightCompanySource.clear();

	  var jdata = {"action": "public_company_list"};

		showLoader();
  	ajaxRequest(jdata, function (r) {
	    hideLoader();
	    if(r.result == "success") {
	      if (r.data == null || r.data.length == 0) {
					hideLoader();
	        return;
	      }

	      companyArray = r.data;

	      companyArray.forEach(function(item, index, arr) {
	      	var icon = createNewCompanyIconFor2DMap(index, item);
					flightCompanySource.addFeature(icon);
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

	function getCompanyInfo(title, cid) {
	  var jdata = {"action": "public_company_detail", "cid" : cid};

		content.innerHTML = title + '<p><img src="/images/loader.gif" border="0" width="20px" height="20px"></p>';

  	ajaxRequest(jdata, function (r) {
	    if(r.result == "success") {
	      if (r.data == null) {
	      	content.innerHTML = title + "<p>Failed to get more info.</p>";
	        return;
	      }

	     	if (r.data.is_playground == true) {
	     			title = "<드론비행/체험장> " + title;
	     	}

	      if (r.data.partner == true) {
	      		title = "<b>" + title + "</b>" + "<table border=0 cellpadding=0 cellspacing=2><tr><td width=52><img src='" + duni_logo + "' border='0' width='50' height='14'></td><td><b>Official Partner Company</b></td></tr></table>";
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
	      		title = title + "<td width=50% align=right><a href='" + r.data.homeaddress + "' target=_new onClick='GATAGM(\"index_page_vMap_cindex_home_click_" + cid + "\", \"CONTENT\", langset);'>홈페이지</a></td>";
	      }

	      title = title + "</tr></table>";

	      content.innerHTML = title;
	    }
	  },
	  	function(request,status,error) {
	  		content.innerHTML = title + "<p>Failed to get more info.</p>";
	  });
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
		if (count <= 0 || count >= 2) {
			map.getView().animate({
			  zoom: map.getView().getZoom() + 1,
			  duration: 250
			})
			return;
		}

    var ii = features[0].get('mindex');
    if (!isSet(ii)) {
    	ii = features[0].get('cindex');
    	if (!isSet(ii)) return;

    	GATAGM("index_page_vMap_cindex_" + ii, "CONTENT", langset);

    	var title = features[0].get('cname');
			var coordinate = evt.coordinate;

			if (count > 1)
				title = '<p>' + title + ' (+' + (count - 1) + ')</p>';
			else
				title = '<p>' + title + '</p>';

		  overlay.setPosition(coordinate);
    	getCompanyInfo(title, ii);
    	return;
    }

    GATAGM("index_page_vMap_" + ii, "CONTENT", langset);

    var hasYoutube = features[0].get('mhasYoutube');
  		
		if (hasYoutube) {
			var name = features[0].get('mname');
			getFlightRecordInfo(name);
		}
	}
	
	function getFlightRecordInfo(name) {
			var jdata = {"action": "public_record_detail", "name" : encodeURI(name)};

			showLoader();
	
	  	ajaxRequest(jdata, function (r) {
		    if(r.result == "success") {
		    	hideLoader();
		    	
		      if (r.data == null) {
		      	showAlert(LANG_JSON_DATA[langset]['msg_no_data']);	
		        return;
		      }
		      
			  	var vid = getYoutubeQueryVariable(r.data.youtube_data_id);			
					$("#video-pop-view").attr("video-lang", langset);
					$("#video-pop-view").attr("video-name", name);
					$("#video-pop-view").attr("video-prod-url", r.data.prod_url);
					$("#video-pop-view").attr("video-url", "https://www.youtube.com/watch?v=" + vid);
					$("#video-pop-view").videoPopup();
					$("#video-pop-view").click();
		    }
		  },
		  	function(request,status,error) {
		  		showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
		  		hideLoader();
		  });
	}

	function isCluster(feature) {
	  if (!feature || !feature.get('features')) {
	  	return false;
	  }

	  return feature.get('features').length >= 1;
	}

	function moveFlightHistoryMap(lat, lng) {
		var npos = ol.proj.fromLonLat([lng, lat]);
		flightHistoryView.setCenter(npos);
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
	function setEmptyVideo(index, name) {
		//$("#youTubePlayer_" + index).show();
		//$("#youTubePlayerIframe_" + index).attr('src', "https://youtube.com/embed/q2PzFbh6HBE");
		players[index] = new YT.Player(name, {
      height: '200',
      width: '100%',
      videoId: "q2PzFbh6HBE",
      host: 'https://www.youtube.com',
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
	}

	function setYoutubeVideo(index, name, youtube_url) {
		var vid = getYoutubeQueryVariable(youtube_url);

		players[index] = new YT.Player(name, {
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
		for ( var i = 0 ; i < players.length ; i ++ ) { //
				if(typeof players[i].getPlayerState === 'undefined') continue;
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
	  
	  dtimestamp = makeDateTimeFormat(new Date(dtimestamp), true);
	  
	  var flat = (isSet(item.flat) && item.flat != "" ? item.flat * 1 : -999);
		var flng = (isSet(item.flng) && item.flng != "" ? item.flng * 1 : -999);	  

	  if (flat != -999) {
	  	appendRow = appendRow + "<div class='col-md-4'><div id='map_" + curIndex + "' style='height:200px;width:100%;'></div>";
	  	appendRow = appendRow + "</div><div class='col-md-4'>";//row
	  }
	  else {
	  	appendRow = appendRow + "<div class='col-md-8'>";//row
	  }

	  appendRow = appendRow + "<div id='youTubePlayer_" + video_index + "'></div>";//row
	  appendRow = appendRow + "</div><div class='col-md-4'>";//row
		appendRow = appendRow
						+ "<a onclick='GATAGM(\"flight_list_public_title_click_"
						+ name + "\", \"CONTENT\", \""
						+ langset + "\");' href='https://pilot.duni.io/center/main.html?page_action=publicrecordlist_detail&record_name="
						+ encodeURIComponent(name) + "'>" + name + "</a><hr size=1 color=#eeeeee>";

	  if (flat != -999) {
	  		appendRow = appendRow + "<small><span class='text-xs' id='map_address_" + curIndex + "'></span></small>";
	  }
	  
	  if (isSet(tag_values) && tag_values != "") {
	  	appendRow = appendRow + "<br><br>";    	
    	var tag_array = JSON.parse(tag_values);
    	tag_array.forEach(function(tg) {
    		appendRow = appendRow + "<a href=https://pilot.duni.io/center/main.html?page_action=publicrecordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
    	});
    }

	  appendRow = appendRow + "<br><small>" + LANG_JSON_DATA[langset]['registered_datetime_label'] + " " + dtimestamp + "</small>";

	  appendRow = appendRow + "</div></div></div>"; //col, row, service,
	  $('#dataTable-Flight_list').append(appendRow);

		var retSource = null;
		if (flat != -999) {
	  	retSource = makeForFlightListMap(curIndex, flat, flng, address, (isSet(youtube_url) ? true : false));
	  }

	  if (isSet(retSource) && isSet(address) && address != "") {
	  	setAddressAndCada("#map_address_" + curIndex, address, cada, retSource);
	  }

	  if (isSet(youtube_url)) {
	  	setYoutubeVideo(video_index, "youTubePlayer_" + video_index, youtube_url);
	  }
	  else {
	  	setEmptyVideo(video_index, "youTubePlayer_" + video_index);
	  }

	  if (tableCount == 0 && flat != -999) {
      moveFlightHistoryMap(flat, flng);
    }

	  tableCount++;
	  video_index++;
	}
	
	
	function setFlightlistFullHistory() {
		flightRecFullArray.forEach(function(item, index, arra) {
			if (isSet(item.flat) == false || item.flat == -999) return;
			let hasYoutube = isSet(item.youtube_data_id) == true ? true : false;
	    var icon = createNewIconFor2DMap(index, {lat:item.flat, lng:item.flng, name: item.name, alt:0, address: item.address, hasYoutube : hasYoutube });
	    if (isSet(flightHistorySource)) {
	        flightHistorySource.addFeature(icon);
	    }
	  });
	}

	function setFlightlistHistory() {
	  flightRecArray.forEach(function(item) {
	    appendFlightListTable(item);
	  });
	}

	function ajaxRequest(data, callback, errorcallback) {
    $.ajax({url : "https://api.duni.io/v1/",
           dataType : "json",
           crossDomain: true,
           cache : false,
           data : JSON.stringify(data),
           type : "POST",
           contentType: "application/json; charset=utf-8",
           success : function(r) {
             callback(r);
           },
           error:function(request,status,error){
               monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
               errorcallback(request,status,error);
           }
    });
	}
	
	function getFlightList() {
	  var jdata = {"action": "public_record_list", "list" : true};

	  showLoader();
	  ajaxRequest(jdata, function (r) {
	    hideLoader();
	    if(r.result == "success") {
	      if (r.data == null || r.data.length == 0) {
	        showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
					hideLoader();
	        return;
	      }

				flightRecFullArray = r.data;
	      setFlightlistFullHistory();
				hideLoader();
	    }
	    else {
	    	if (r.reason == "no data") {
	    		showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
	    	}
	    	else {
		    	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
		    }

				hideLoader();
	    }
	  }, function(request,status,error) {
	    hideLoader();
	  });
	}

	function getFlightSomeList() {
	  var jdata = {"action": "public_record_list"};

	  showLoader();
	  ajaxRequest(jdata, function (r) {
	    hideLoader();
	    if(r.result == "success") {
	      if (r.data == null || r.data.length == 0) {
	        showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
					hideLoader();
	        return;
	      }

				flightRecArray = r.data;
	      setFlightlistHistory();
				hideLoader();
	    }
	    else {
	    	if (r.reason == "no data") {
	    		showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
	    	}
	    	else {
		    	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
		    }

				hideLoader();
	    }
	  }, function(request,status,error) {
	    hideLoader();
	  });
	}
	
	var hasMore = "";
	var flightSearhArray;
	var tableSearchCount = 0;
	var video_index = 0;
	
	function appendFlightSearchTable(item) {
		var name = item.name;
		var dtimestamp = item.dtime;
		var data = item.data;		
		var address = item.address;
		var cada = item.cada;
		var youtube_url = item.youtube_data_id;
		var curIndex = tableSearchCount;
		var tag_values = item.tag_values;
	  var appendRow = "<div class='service' id='flight-search-" + curIndex + "' name='flight-search-" + curIndex + "'><div class='row'>";
	  
	  dtimestamp = makeDateTimeFormat(new Date(dtimestamp), true);
	  
	  var flat = (isSet(item.flat) && item.flat != "" ? item.flat * 1 : -999);
		var flng = (isSet(item.flng) && item.flng != "" ? item.flng * 1 : -999);	  
		
		var isOuter = isSet(item.outer) ? item.outer : false;

	  if (flat != -999) {
	  	appendRow = appendRow + "<div class='col-md-4'><div id='map_" + curIndex + "' style='height:200px;width:100%;'></div>";
	  	appendRow = appendRow + "</div><div class='col-md-4'>";//row
	  }
	  else {
	  	appendRow = appendRow + "<div class='col-md-8'>";//row
	  }
		
	  appendRow = appendRow + "<div id='youTubePlayer_" + video_index + "'></div>";//row	  	  
	  appendRow = appendRow + "</div><div class='col-md-4'>";//row
	  
	  
	  if (isOuter == false) {
			appendRow = appendRow
							+ "<a onclick='GATAGM(\"flight_search_public_title_click_"
							+ name + "\", \"CONTENT\", \""
							+ langset + "\");' href='https://pilot.duni.io/center/main.html?page_action=publicrecordlist_detail&record_name=" + encodeURIComponent(name) + "'>";
		}
						
		appendRow = appendRow	+ name;
		
		if (isOuter == false) {
			appendRow = appendRow + "</a>";
		}

		appendRow = appendRow + "<hr size=1 color=#eeeeee>";
		
	  if (flat != -999) {
	  		appendRow = appendRow + "<small><span class='text-xs' id='map_address_" + curIndex + "'></span></small>";
	  }
	  
	  if (isSet(tag_values) && tag_values != "") {
	  	appendRow = appendRow + "<br><br>";
    	var tag_array = JSON.parse(tag_values);
    	tag_array.forEach(function(tg) {
    		appendRow = appendRow + "<a href=https://pilot.duni.io/center/main.html?page_action=publicrecordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
    	});
    }

	  appendRow = appendRow + "<br><small>" + LANG_JSON_DATA[langset]['registered_datetime_label'] + " " + dtimestamp + "</small>";

	  appendRow = appendRow + "</div></div></div>"; //col, row, service,
	  $('#dataTable-Search_list').append(appendRow);

		var retSource = null;
		if (flat != -999) {
	  	retSource = makeForFlightListMap(curIndex, flat, flng, address, (isSet(youtube_url) ? true : false));
	  }

	  if (isSet(retSource) && isSet(address) && address != "") {
	  	setAddressAndCada("#map_address_" + curIndex, address, cada, retSource);
	  }

	  if (isSet(youtube_url)) {
	  	setYoutubeVideo(video_index, "youTubePlayer_" + video_index, youtube_url);
	  }
	  else {
	  	setEmptyVideo(video_index, "youTubePlayer_" + video_index);
	  }

	  tableSearchCount++;
	  video_index++;
	}
	
	function setFlightSearchArray() {
		flightSearhArray.forEach(function(item) {
	    appendFlightSearchTable(item);
	  });
	}
	
	function getFlightSearchMore() {
    if($("#searchKeyword").val() == "") return;
			
		var jdata = {"action": "public_findrecord_by_address", "keyword" : $("#searchKeyword").val()};
		
		if (isSet(hasMore)) {
      jdata["morekey"] = hasMore;
  	}

    showLoader();
    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            if (r.data == null || r.data.length == 0) {
                showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
                hideLoader();
                return;
            }

            if (r.morekey) {
                hasMore = r.morekey;
                $('#btnForLoadSearchList').text(LANG_JSON_DATA[langset]['msg_load_more']);
                $('#btnForLoadSearchList').show();
            }
            else {
                hasMore = null;
                $('#btnForLoadSearchList').hide(1500);
            }

						flightSearhArray = r.data;
            setFlightSearchArray();
            hideLoader();
        }
        else {
            if (r.reason == "no data") {
                showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
            }
            else {
                showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
            }

            hideLoader();
        }
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
	}
	
	function requestSearch() {
			if($("#searchKeyword").val() == "") return;
			
			if (searchKeyword == $("#searchKeyword").val()) return;
			
			searchKeyword = $("#searchKeyword").val();
			
			var jdata = {"action": "public_findrecord_by_address", "keyword" : $("#searchKeyword").val()};
			
		  showLoader();
		  ajaxRequest(jdata, function (r) {
		    hideLoader();
		    if(r.result == "success") {
		      if (r.data == null || r.data.length == 0) {
		        showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
						hideLoader();
						
						$("#searchListView").hide();
		        return;
		      }
		      
		      
					$("#searchListView").show();
					
		      if (r.morekey) {
              hasMore = r.morekey;
              $('#btnForLoadSearchList').text(LANG_JSON_DATA[langset]['msg_load_more']);
              $('#btnForLoadSearchList').show();
          }
          else {
              hasMore = null;
              $('#btnForLoadSearchList').hide(1500);
          }
	
					tableSearchCount = 0;
					flightSearhArray = r.data;
					$('#dataTable-Search_list').empty();
		      setFlightSearchArray();
					hideLoader();
		    }
		    else {
		    	$("#searchListView").hide();
		    	
		    	if (r.reason == "no data") {
		    		showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
		    	}
		    	else {
			    	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
			    }
	
					hideLoader();
		    }
		  }, function(request,status,error) {
		    hideLoader();
		  });
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

	function initSearchForm() {
		$("#searchListView").hide();
		$("#searchKeyword").on("keyup paste", function() {
				if($("#searchKeyword").val() == "") {
					$("#defaultListView").show();
					$("#searchListView").hide();
					searchKeyword = "";
				}
				else {
					$("#defaultListView").hide();
				}
    });

		$("#searchKeyword").keypress(function(e) {
        if (e.which == 13){
        		GATAGM('btnSearchEnter', 'CONTENT', langset);
        		requestSearch();  //
        }
    });
        
    $("#btnSearchMovie").click(function (e) {
    		e.preventDefault();
    		GATAGM('btnSearchMovie', 'CONTENT', langset);
        requestSearch();  //
    });
    
    $('#btnForLoadSearchList').click(function (e) {
    		e.preventDefault();    		
        GATAGM('btnForLoadSearchList', 'CONTENT', langset);
        getFlightSearchMore();
    });
	}

	function initYoutubeAPI() {
		var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}

	function onYouTubeIframeAPIReady() {
	  	getFlightSomeList();
			getFlightList();
			initSearchForm();
  }