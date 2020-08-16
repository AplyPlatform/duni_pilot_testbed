
var bMonStarted;

var current_view;
var current_pos;
var current_pos_image;

var map;

var posSource;
var pointSource;

var lineSource;

var flightRecArray;
var flightRecDataArray;

var flightHistorySource;
var flightHistoryView;

var lineLayerForDesign;
var posLayerForDesign;

var hasMore;

var pos_icon_image = './imgs/position3.png';


var arrayData = new Array();
var posIcons = new Array();
var chartTData = new Array();
var chartHData = new Array();
var chartLabelData = new Array();
var chartLocData = new Array();
var lineGraphData = Array();

var bMoved = false;
var tableCount = 0;
var dromiDataArray = new Array();
var flightDataArrayForDromi = new Array();

var youTubePlayer = null;
var youtube_data_id;

var googlePhotoPlayer = null;
var googlePhotoPlayerAr = null;

var cur_flightrecord_name = "";

var moviePlayerVisible = false;

$(function() {

  centerInit();

});


function centerInit() {
	bMonStarted = false;
	flightRecArray = [];
	flightRecDataArray = [];
  mapInit();

  if (askToken() == false) {
    location.href="index.html";
    return;
  }

  var page_data = document.getElementById("page_data");
	var page_action = page_data.getAttribute("page_action");

  if (page_action == "center") {
		hideLoader();
  }
  if (page_action == "qa") {
		hideLoader();
  }
  else if (page_action == "design") {
  	showLoader();
    designInit();
  }
  else if (page_action == "list") {
		showLoader();
		missionListInit();
  }
  else if (page_action == "monitor") {
  	hideLoader();
    monitorInit();
  }
  else if (page_action == "flightlist") {
  	showLoader();
    flightListInit();
  }
  else if (page_action == "flight_view") {
  	showLoader();
  	FlightHistoryMapInit();
    flightViewInit();    
  }
  else if (page_action == "dromi") {
  	showLoader();
    dromiInit();
  }
  else if (page_action == "dromi_list") {
  	showLoader();
    dromiListInit();
  }
}


function showAlert(msg) {	  
	$('#modal-title').text("알림");
	$('#modal-confirm-btn').text("확인");
	
	$('#errorModalLabel').text(msg);
	$('#errorModal').modal('show');  	
}

function missionListInit() {
		
	$('#btnForGetMissionList').click(function() {    	
		GATAGM('btnForGetMissionList', 'CONTENT', 'KR');    	
		getMissionList();
	});
	
	hideLoader();	
}

function flightViewInit() {
    $('#historyPanel').hide();
    $('#historyList').show();
    $('#historyMap').hide();
    
    $('#btnForSetYoutubeID').click(function() {    	
    	GATAGM('btnForSetYoutubeID', 'CONTENT', 'KR');    	
    	setYoutubeID();
    });
    
    $('#btnForLoadFlightList').click(function() {    	
    	GATAGM('btnForLoadFlightList', 'CONTENT', 'KR');    	
    	getFlightList();
    });
    
    var record_name = location.search.split('record_name=')[1];
    if (record_name != null && record_name != "") {
      showDataWithName(decodeURI(record_name));
    }
    else hideLoader();
}

function FlightHistoryMapInit() {
	var dpoint = ol.proj.fromLonLat([0, 0]);

  flightHistoryView = new ol.View({
      center: dpoint,
      zoom: 8
    });

  flightHistorySource = new ol.source.Vector();

  var vVectorLayer = new ol.layer.Vector({
      source: flightHistorySource,
      zIndex: 10000,
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
      target: 'historyMap',
      layers: [
          bingLayer, vVectorLayer
      ],
      // Improve user experience by loading tiles while animating. Will make
      // animations stutter on mobile or slow devices.
      loadTilesWhileAnimating: true,
      view: flightHistoryView
    });
}

function monitorInit() {
  var url_string = window.location.href;
	var page_id = location.search.split('mission_name=')[1];
	if (isSet(page_id))
		page_id = page_id.split('&')[0];			

  getMissionToMonitor(page_id);
	
	$("#startMonBtn").click(function() {
		GATAGM('startMonBtn', 'CONTENT', 'KR');
		startMon();
	});	

  hideLoader();
}


function designInit() {
	initSliderForDesign(1);

 	map.on('click', function (evt) {
 			GATAGM('DESIGN_MAP', 'CONTENT', 'KR');
 			
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function (feature) {
              return feature;
          });

      if (feature) {
          var ii = feature.get('mindex');
          if (!isSet(ii)) return;

          setDataToDesignTableWithFlightRecord(ii);

          var item = flightRecDataArray[ii];
          setMoveActionFromMap(ii,item);
          return;
      }

			var lonLat = ol.proj.toLonLat(evt.coordinate);
			appendNewRecord(lonLat);
  });

	var record_name = "";//location.search.split('record_name=')[1];
  var mission_name = location.search.split('mission_name=')[1];
    
  mission_name = decodeURIComponent(mission_name);

	if (isSet(record_name) && record_name != "") {
		record_name = record_name.split('&')[0];
    setDesignTableByFlightRecord(record_name);
  }
	else if (isSet(mission_name) && mission_name != "") {
		mission_name = mission_name.split('&')[0];
    setDesignTableByMission(mission_name);
  }
  else {

  	var posLayer = new ol.layer.Vector({
      source: posSource
  	});

  	map.addLayer(posLayer);

  	hideLoader();
  }


	$('#saveItemBtn').off('click');
	$('#saveItemBtn').click(function(){
		GATAGM('saveItemBtn', 'CONTENT', 'KR');
		saveFlightData(0);
	});
	
	$('#btnForRegistMission').off('click');
	$('#btnForRegistMission').click(function(){
		GATAGM('btnForRegistMission', 'CONTENT', 'KR');
		registMission();
	});		
	
	$('#btnForClearMission').off('click');
	$('#btnForClearMission').click(function(){
		GATAGM('btnForClearMission', 'CONTENT', 'KR');
		clearCurrentDesign();
	});				
	
	$('#btnForSearchAddress').off('click');
	$('#btnForSearchAddress').click(function(){
		GATAGM('btnForSearchAddress', 'CONTENT', 'KR');
		searchCurrentBrowserAddress();
	});				
}


function drawLineGraph() {
	var ctx2 = document.getElementById('lineGraph').getContext('2d');
   		var linedataSet = {
   			datasets: [
          {
              label: '고도',
              borderColor: '#f00',
              backgroundColor: '#f66',
              data: lineGraphData
         }
      	]};

  document.getElementById("lineGraph").onclick = function(evt){
  	
  	GATAGM('LINEGRAPH', 'CONTENT', 'KR');
  	
    var activePoints = window.myLine.getElementsAtEvent(evt);

    if (activePoints.length > 0) {
       var clickedDatasetIndex = activePoints[0]._index;

       var locdata = chartLocData[clickedDatasetIndex];
	     if("lng" in locdata && "lat" in locdata) {
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
                    label: function(tooltipItem, data) {
                        var locdata = chartLocData[tooltipItem.index];
                        return JSON.stringify(locdata);
                    }
                  },
                scales: {
                    xAxes: [{
                      ticks: {
                        userCallback: function(label, index, labels) {
                          return chartLabelData[label];
                        }
                      }
                    }]
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


var isMoved = true;

function setSlider(i) {
	$("#slider").on("slidestop", function(event, ui) {
        var locdata = chartLocData[ui.value];                        
				setMoveActionFromSliderOnStop(ui.value, locdata);
  });
  
	$('#slider').slider({
					min : 0,
					max : i - 1,
					value : 0,
					step : 1,
					slide : function( event, ui ){						
            var locdata = chartLocData[ui.value];                        
						setMoveActionFromSliderOnMove(ui.value, locdata);
					}
	});
}


function setSliderPos(i) {
		if (!isSet($("#slider"))) return;

		if (i < 0) {
			$('#sliderText').html( "-" );
			return;
		}

		$("#slider").slider('value',i);
		$('#sliderText').html( i );
}

function setYawStatus(degrees) {
		if (!isSet(degrees)) return;
		if (!isSet($('#yawStatus'))) return;
		var yawStatus = document.getElementById('yawStatus');
		if (!isSet(yawStatus)) return;

		degrees *= 1;
		degrees = degrees < 0 ? (360 + degrees) : degrees;

		$("#yawStatus").attr("src", $("#yawStatus").attr("src"));

    $('#yawStatus').css({
      'transform': 'rotate(' + degrees + 'deg)',
      '-ms-transform': 'rotate(' + degrees + 'deg)',
      '-moz-transform': 'rotate(' + degrees + 'deg)',
      '-webkit-transform': 'rotate(' + degrees + 'deg)',
      '-o-transform': 'rotate(' + degrees + 'deg)'
    });

    $('#yawText').text(degrees);
}


function setPitchStatus(pitch) {
		if (!isSet(pitch)) return;
		if (!isSet($('#pitchStatus'))) return;
		var pitchStatus = document.getElementById('pitchStatus');
		if (!isSet(pitchStatus)) return;

		var degrees = (pitch * -1);
		degrees = degrees < 0 ? (360 + degrees) : degrees;

		$("#pitchStatus").attr("src", $("#pitchStatus").attr("src"));

    $('#pitchStatus').css({
      'transform': 'rotate(' + degrees + 'deg)',
      '-ms-transform': 'rotate(' + degrees + 'deg)',
      '-moz-transform': 'rotate(' + degrees + 'deg)',
      '-webkit-transform': 'rotate(' + degrees + 'deg)',
      '-o-transform': 'rotate(' + degrees + 'deg)'
    });

    $('#pitchText').text(pitch);
}

function setRollStatus(roll) {
		if (!isSet(roll)) return;
		if (!isSet($('#rollCanvas'))) return;
		var canvas = document.getElementById('rollCanvas');
		if (!isSet(canvas)) return;

		var degrees = roll * 1;

		degrees = 180 + degrees;
		var degrees2 = degrees + 180;

		if (degrees2 > 360) degrees2 = degrees2 - 360;

		var radians1 = (Math.PI/180)*degrees;
		var radians2 = (Math.PI/180)*degrees2;

    var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.arc(30, 30, 20, radians1, radians2, true);
    context.closePath();
    context.lineWidth = 1;
    context.fillStyle = 'blue';
    context.fill();
    context.strokeStyle = '#0000aa';
    context.stroke();

    $('#rollText').text(roll);
}

function initSliderForDesign(i) {
	
	$('#slider').slider({
					min : 0,
					max : i - 1,
					value : 0,
					step : 1,
					slide : function( event, ui ){
						
						GATAGM('slider', 'CONTENT', 'KR');
						
            if (flightRecDataArray.length <= 0) {
							return;
						}
		
						var d = flightRecDataArray[ui.value];
		
						setDataToDesignTableWithFlightRecord(ui.value);
						
						setMoveActionFromSliderOnMove(ui.value, d);
					}			
	});

	$('#goItemBtn').click(function() {
		
			GATAGM('goItemBtn', 'CONTENT', 'KR');
			
			var index = $('#goItemIndex').val();
			if (!isSet(index) || $.isNumeric( index ) == false) {
				showAlert("Please input valid value !");
				return;
			}

			index = parseInt(index);

			if (index < 0 || index >= flightRecDataArray.length) {
				showAlert("Please input valid value !");
				return;
			}

			var d = flightRecDataArray[index];
			$("#slider").slider('value', index);
			setDataToDesignTableWithFlightRecord(index);

			setMoveActionFromSliderOnStop(index, d);
	});
}

function setDesignTableByMission(name) {
	var userid = getCookie("dev_user_id");
  var jdata = {"action" : "mission", "daction" : "get_spec", "mname" : name, "clientid" : userid};

  showLoader();
  ajaxRequest(jdata, function (r) {
    if(r.result == "success") {
      hideLoader();

      if (!isSet(r.data.mission) || r.data.mission.length == 0) return;
		  flightRecDataArray = r.data.mission;

      setDesignTableWithFlightRecord();
    }
    else {
      showAlert("There is no mission record or something wrong.");
      hideLoader();
    }
  }, function(request,status,error) {

    monitor("Sorry, something wrong.");
    hideLoader();
  });
}


function setDesignTableByFlightRecord(name) {
  var userid = getCookie("dev_user_id");
  var jdata = {"action" : "position", "daction" : "download_spe", "name" : name, "clientid" : userid};

  showLoader();
  ajaxRequest(jdata, function (r) {
    if(r.result == "success") {
      hideLoader();

      if (!isSet(r.data.data) || r.data.data.length == 0) return;
		  flightRecDataArray = r.data.data;

      setDesignTableWithFlightRecord();
    }
    else {
      showAlert("There is no flight record or something wrong.");
      hideLoader();
    }
  }, function(request,status,error) {

    monitor("Sorry, something wrong.");
    hideLoader();
  });
}



function createNewIcon(i, item) {
	var pos_icon = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
          name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
          mindex : i
      });

  pos_icon.setStyle(styleFunction(i + ""));

  return pos_icon;
}

function addIconToMap(i, item) {
	var nIcon = createNewIcon(i, item);
	posSource.addFeature(nIcon);
}

function removeIconOnMap(index) {
	var features = posSource.getFeatures();
	var i;
	for(i = 0; i < features.length; i++) {
      //if (features[i].get("mindex") == index) {
      	posSource.removeFeature(features[i]);
      //	return;
      //}
	}
	
  map.removeLayer(lineLayerForDesign);
  map.removeLayer(posLayerForDesign);
	
	setDesignTableWithFlightRecord();
}

function setDesignTableWithFlightRecord() {
  var i = 0;
	var coordinates = [];

  flightRecDataArray.forEach(function (item) {
      addIconToMap(i, item);
  		coordinates.push(ol.proj.fromLonLat([item.lng * 1, item.lat * 1]));
      i++;
  });

  setDataToDesignTableWithFlightRecord(0);

  $("#slider").slider('option',{min: 0, max: i-1});
  setSliderPos(i);

  var lines = new ol.geom.LineString(coordinates);

  lineSource = new ol.source.Vector({
          features: [new ol.Feature({
              geometry: lines,
              name: 'Line'
          })]
  });

	lineLayerForDesign = new ol.layer.Vector({
      source: lineSource,
      style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#00ff00',
                width: 2
            })
        })
  });


  posLayerForDesign = new ol.layer.Vector({
      source: posSource
  });

  map.addLayer(lineLayerForDesign);
  map.addLayer(posLayerForDesign);


  moveToPositionOnMap(flightRecDataArray[0].lat, flightRecDataArray[0].lng, flightRecDataArray[0].yaw, flightRecDataArray[0].roll, flightRecDataArray[0].pitch);
}


function appendNewRecord(lonLat) {

	var index = flightRecDataArray.length;

	if (index <= 0) {
		$("#slider").show();
		$("#dataTable-points").show();
	}

	var data = [];
	data['alt'] = 0;
	data['speed'] = 0;
	data['yaw'] = 0;
	data['pitch'] = 0;
	data['roll'] = 0;
	data['act'] = 0;
	data['actparam'] = 0;
	data['lng'] = lonLat[0];
	data['lat'] = lonLat[1];

	flightRecDataArray.push(data);

	$("#slider").slider('option',{min: 0, max: index });
	$("#slider").slider('value', index);

	setDataToDesignTableWithFlightRecord(index);
	addIconToMap(index, data);
}


function flightListInit() {
	
	
	$('#btnForUploadFlightList').click(function() {    	
    	GATAGM('btnForUploadFlightList', 'CONTENT', 'KR');    	
    	uploadFlightList();
  });
	
	hideLoader();
}

function startMon() {
  if (bMonStarted == true) {
    bMonStarted = false;
    $('#startMonBtn').text("Start monitoring");
    $("#startMonBtn").removeClass("btn-warning").addClass("btn-primary");
    $("#loader").hide();
  }
  else {
    nextMon();
  }
}

function nextMon() {
  var userid = getCookie("dev_user_id");
  var jdata = {"action" : "position", "daction" : "get", "clientid" : userid};

  ajaxRequest(jdata, function (r) {
    if(r.result == "success") {
      bMonStarted = true;
      $("#loader").show();
      $('#startMonBtn').text("Stop monitoring");
      $("#startMonBtn").removeClass("btn-primary").addClass("btn-warning");
      nexttour(r.data[0]);
    }
    else {
      showAlert("Sorry, Failed to get object position.");
    }
  }, function(request,status,error) {
    showAlert("Something wrong.");
  });
}

function askToken() {
  var useremail = getCookie("user_email");
  var usertoken = getCookie("user_token");
  var userid = getCookie("dev_user_id");
  if (isSet(useremail) == false || isSet(userid) == false || isSet(usertoken) == false)
    return false;

  $("#email_field").text(useremail);
  $('#droneplaytoken_view').val(usertoken);

  return true;
}


function isSet(value) {
  if (value == "" || value == null || value == "undefined") return false;

  return true;
}


function getMissionList() {
    var userid = getCookie("dev_user_id");
    var jdata = {"action" : "mission", "daction" : "get", "clientid" : userid};
		
		if (hasMore) {
			jdata["morekey"] = hasMore;
		}
		
    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        appendMissionList(r.data);
        
        if (r.morekey) {
        	$('#btnForGetMissionList').text("더 불러오기");
        	hasMore = r.morekey;
        }
        else {
        	$('#btnForGetMissionList').hide(1500);
        	hasMore = null;
        }
      }
      else {
				if (r.reason == "no data") {
					showAlert("존재하는 데이터가 없습니다.");
				}
				else {
				  showAlert("Error !");
				}
      }
    }, function(request,status,error) {
      monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
    });
}

function getMissionToMonitor(id) {
    if (id == null || id == "") return;

    var userid = getCookie("dev_user_id");
    var jdata = {"action" : "mission", "daction" : "get", "clientid": userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        var missionList = r.data;
        if (missionList == null) return;
        if (missionList.length == 0) return;
        missionList.forEach(function (item, index, array) {
          if(item['name'] == id) {
            appendMissionsToMonitor(item['mission']);
          }
        });

       	hideLoader();
      }
      else {

				if (r.reason == "no data") {
					showAlert("존재하는 데이터가 없습니다.");
				}
				else {
				 	showAlert("Error !");
				}

      	hideLoader();
      }
    }, function(request,status,error) {
      monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      hideLoader();
    });
}

var missionActionString = ["STAY", "START_TAKE_PHOTO", "START_RECORD", "STOP_RECORD", "ROTATE_AIRCRAFT", "GIMBAL_PITCH", "NONE", "CAMERA_ZOOM", "CAMERA_FOCUS"];

function appendMissionsToMonitor(mission) {
    if (mission == null) return;
    if (mission.length == 0) return;
    mission.forEach(function (item, index, array) {
      tableCount++;

      var missionid = item['id'];

      if(missionid == null) {
        missionid = "mission-" + tableCount;
      }

      var act = item['act'];

      if (act >= missionActionString.length) {
        act = 0;
      }

      var appendRow = "<tr class='odd gradeX' id='" + missionid + "'><td>" + tableCount + "</td><td>"
          + "<table border=0 width='100%'><tr><td width='50%' class='center' bgcolor='#eee'>" + item['lat'] + "</td><td width='50%' class='center' bgcolor='#fff'> " + item['lng'] + "</td></tr>"
          + "<tr><td class='center' bgcolor='#eee'>" + item['alt'] + "/" + item['speed']+ "</td><td class='center'>"
          + missionActionString[act] + "/" + item['actparam']
          + "</td></tr></table>"
      + "</td></tr>"
      $('#monitorTable-points > tbody:last').append(appendRow);
    });
}

function moveToPositionOnMap(lat, lng, yaw, roll, pitch, bDirect) {
  var npos = ol.proj.fromLonLat([lng * 1, lat * 1]);

  setRollStatus(roll);
  setYawStatus(yaw);
  setPitchStatus(pitch);

  if (bDirect == true)
  	flyDirectTo(npos, yaw);
  else
  	flyTo(npos, yaw, function() {});
}

function clearDataToDesignTableWithFlightRecord() {

}

function setDataToDesignTableWithFlightRecord(index) {
	if ( flightRecDataArray.length <= 0) return;

	var lat = flightRecDataArray[index].lat;
	var lng = flightRecDataArray[index].lng;
	var alt = flightRecDataArray[index].alt;
	var yaw = flightRecDataArray[index].yaw;
	var roll = flightRecDataArray[index].roll;
	var pitch = flightRecDataArray[index].pitch;
	var speed = flightRecDataArray[index].speed;
	var act = flightRecDataArray[index].act;
	var actparam = flightRecDataArray[index].actparam;

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
	$('#removeItemBtn').click(function(){		
		GATAGM('removeItemBtn', 'CONTENT', 'KR');
		removeFlightData(index);		
		removeIconOnMap(index);
	});

	$('#saveItemBtn').off('click');
	$('#saveItemBtn').click(function(){
		GATAGM('saveItemBtn', 'CONTENT', 'KR');
		saveFlightData(index);
	});
}

function saveFlightData(index) {
	if (flightRecDataArray.length <= 0) {
		var lng = $('#lngdata_index').val();
		var lat = $('#latdata_index').val();
		appendNewRecord([lng * 1, lat * 1]);
		var npos = ol.proj.fromLonLat([lng * 1, lat * 1]);
		flyDirectTo(npos, $('#yawdata_index').val());
	}

	flightRecDataArray[index].lat = $('#latdata_index').val();
	flightRecDataArray[index].lng = $('#lngdata_index').val();
	flightRecDataArray[index].alt = $('#altdata_index').val();
	flightRecDataArray[index].yaw = $('#yawdata_index').val();
	flightRecDataArray[index].roll = $('#rolldata_index').val();
	flightRecDataArray[index].pitch = $('#pitchdata_index').val();
	flightRecDataArray[index].speed = $('#speeddata_index').val();
	flightRecDataArray[index].act = $('#actiondata_index').val();
	flightRecDataArray[index].actparam = $('#actionparam_index').val();
}

function removeSelectedFeature(selectedFeatureID) {
	var features = pointSource.getFeatures();

	if (features != null && features.length > 0) {
   for (x in features) {
      var properties = features[x].getProperties();

      var id = properties.id;
      if (id == selectedFeatureID) {
        pointSource.removeFeature(features[x]);
        break;
      }
    }
  }
}

function removeFlightData(index) {
	flightRecDataArray.splice(index, 1);

	removeSelectedFeature(index);

	if (flightRecDataArray.length <= 0) {
		$("#slider").hide();
		$("#dataTable-points").hide();
		return;
	}

	var newIndex = flightRecDataArray.length-1;

	setDataToDesignTableWithFlightRecord(newIndex);
	$("#slider").slider('value', newIndex);
	$("#slider").slider('option',{min: 0, max: newIndex});

	moveToPositionOnMap(flightRecDataArray[newIndex].lat, flightRecDataArray[newIndex].lng, flightRecDataArray[newIndex].yaw, flightRecDataArray[newIndex].roll, flightRecDataArray[newIndex].pitch, false);
}

function appendMissionList(data) {
    if (data == null) return;
    if (data.length == 0) return;
    data.forEach(function (item, index, array) {
        var appendRow = "<tr class='odd gradeX' id='mission_row_" + index + "'><td class='center'>"
        + "<a href='./monitor.html?mission_name=" + item['name'] + "'>"
        + item['name']
        + "</a></td><td class='center'> - </td><td class='center'>"
        + item['regtime']
        + "</td><td class='center'>"
        + "<a class='btn btn-warning' href='design.html?mission_name=" + item['name'] + "' role='button'>수정</a>&nbsp;"        
        + "<button class='btn btn-primary' type='button' id='missionListBtnForRemove_" + index + "'>"
        + "삭제</button></td></tr>";
        $('#dataTable-missions > tbody:last').append(appendRow);
        
        $('#missionListBtnForRemove_' + index).click(function() {
        	GATAGM('missionListBtnForRemove_' + index, 'CONTENT', 'KR');
        	removeMissionItem(item['name'], "mission_row_" + index);
        });
    });
}


function ajaxRequestAddress(address, callback, errorcallback) {
    $.ajax({url : "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyANkdJYJ3zKXAjOdPFrhEEeq4M8WETn0-4",
           crossDomain: true,
           cache : false,
           type : "GET",
           success : function(r) {
             callback(r);
           },
           error:function(request,status,error){
               monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
               errorcallback(request,status,error);
           }
    });
}

function searchCurrentBrowserAddress() {
    var query = $('#queryData').val();
    searchAddressToCoordinate(query);
}

// result by latlng coordinate
function searchAddressToCoordinate(address) {
    ajaxRequestAddress(address, function (r) {
      //if(r.result == "success") {
        var latLng = ol.proj.fromLonLat([r['results'][0].geometry.location.lng, r['results'][0].geometry.location.lat]);
        flyTo(latLng, 0, function() {});
      //}
    }, function(request,status,error) {
      showAlert("잘못된 주소이거나 요청을 처리하는데 일시적인 오류가 발생했습니다.");
    });
}

var tableCount = 0;

function clearCurrentDesign() {
    var r = confirm("Are you sure ?");
    if (r == false) {
        return;
    }

		if(isSet(lineSource))
    	lineSource.clear();

    pointSource.clear();
    posSource.clear();
    flightRecDataArray = Array();
    $("#dataTable-points").hide();
}



function getFlightList() {
  var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "download", "clientid" : userid};
  
  if (isSet(hasMore)) {
  	jdata["morekey"] = hasMore;
  }

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result == "success") {
      if (r.data == null || r.data.length == 0) {
        showAlert("no data");
        return;
      }
      
      if (r.morekey) {
      	hasMore = r.morekey;
      	$('#btnForLoadFlightList').text("더 불러오기");
      }
      else {
      	hasMore = null;
      	$('#btnForLoadFlightList').hide(1500);
      }
			
			$('#historyMap').show();
			
      setFlightlistHistory(r.data);
    }
    else {
    	if (r.reason == "no data") {
    		showAlert("존재하는 데이터가 없습니다.");
    	}
    	else {    		
	    	showAlert("Error ! - 2");
	    }
    }
  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}



function setFlightlistHistory(data) {
  if (data == null || data.length == 0)
    return;

  data.forEach(function(item) {
    appendFlightListTable(item);
    flightRecArray.push(item);
  });
}

function getRecordTitle() {
	if (!isSet($("#record_name_field"))) return "";

	return $("#record_name_field").text();
}

function setRecordTitle(msg) {
	if (!isSet($("#record_name_field"))) return;

	$("#record_name_field").text(msg);
}

function showDataWithName(name) {

  setRecordTitle(name);
  cur_flightrecord_name = name;
  
  $("#movieTitle").val(name);
  $("#movieDescription").val(name);

  var userid = getCookie("dev_user_id");
  var jdata = {"action" : "position", "daction" : "download_spe", "name" : name, "clientid" : userid};

  showLoader();

	ajaxRequest(jdata, function (r) {
    if(r.result != "success") {
      showAlert("Failed to load data!");
    }
    else {

    	var fdata = r.data;

    	moviePlayerVisible = false;
    	
    	if ("memo" in fdata) {
    		 $("#memoTextarea").val(fdata.memo);
    	}
    	
    	$("#flightMemoBtn").click(function() {
    			GATAGM('flightMemoBtn', 'CONTENT', 'KR');
    			updateFlightMemoWithValue(name, $("#memoTextarea").val());
    	});    		

    	if ("youtube_data_id" in fdata) {
		  	if (fdata.youtube_data_id.indexOf("youtube") >=0) {
					setYoutubePlayer(fdata.youtube_data_id);					
				}
				else {
					setYoutubePlayer("");					
				}

				hideMovieDataSet();
		  }
		  else {
		    $("#youTubePlayer").hide();
		    $("#googlePhotoPlayer").hide();
		  }

		   if (moviePlayerVisible == true) {
					hideMovieDataSet();
				}
				else {
					showMovieDataSet();
				}

  		$('#historyList').hide(1500);
  		$('#historyPanel').show();

      setChartData(fdata.data);

      if (!isSet(fdata.cada) && fdata.cada == null) {
      	if (isSet(fdata.flat)) {
					var dpoint = ol.proj.fromLonLat([fdata.flng, fdata.flat]);
    			drawCadastral("#map_address", name, dpoint[0], dpoint[1], pointSource);
    		}
    	}
    	else {
    		setAddressAndCada("#map_address", fdata.address, fdata.cada, pointSource);
    	}

    	hideLoader();
    }
  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function showData(index) {
  if (flightRecArray.length == 0) return;

  var item = flightRecArray[index];

	moviePlayerVisible = false;

  if ("youtube_data_id" in item) {
  	if (item.youtube_data_id.indexOf("youtube") >=0) {
			setYoutubePlayer(item.youtube_data_id);			
		}
		else {
			setYoutubePlayer("");			
		}
  }
  else {
    $("#youTubePlayer").hide();
    $("#googlePhotoPlayer").hide();
  }

  if (moviePlayerVisible == true) {
		hideMovieDataSet();
	}
	else {
		showMovieDataSet();
	}

	if (!("data" in item) || !isSet(item.data) || item.data === "-") {
    var userid = getCookie("dev_user_id");
    var jdata = {"action" : "position", "daction" : "download_spe", "name" : item.name, "clientid" : userid};
    setRecordTitle(item.name);
    cur_flightrecord_name = item.name;        
	  showLoader();
	  
	  $("#movieTitle").val(item.name);
  	$("#movieDescription").val(item.name);
	  
		ajaxRequest(jdata, function (r) {
	    if(r.result != "success") {
	      showAlert("Failed to load data!");
	    }
	    else {

	    	$('#historyList').hide(1500);
  			$('#historyPanel').show();
  			
  			
  			if ("memo" in r.data) {
    		 $("#memoTextarea").val(r.data.memo);
	    	}
	    	
	    	$("#flightMemoBtn").click(function() {
	    			GATAGM('flightMemoBtn', 'CONTENT', 'KR');
	    			updateFlightMemoWithValue(r.data.name, $("#memoTextarea").val());
	    	});

	      setChartData(r.data.data);

				if (!isSet(r.data.cada) || r.data.cada == "") {
					if (isSet(r.data.flat)) {
						var dpoint = ol.proj.fromLonLat([r.data.flng, r.data.flat]);
		    		drawCadastral("#map_address", item.name, dpoint[0], dpoint[1], pointSource);
		    	}	
				}
	      else {
	      	setAddressAndCada("#map_address", r.data.address, r.data.cada, pointSource);
	      }
	    		    		    	
	    	hideLoader();
		    }
	  }, function(request,status,error) {
	    hideLoader();
	    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
	  });
	}
	else {
		$('#historyList').hide(1500);
    $('#historyPanel').show();

		showLoader();
  	setChartData(item.data);
  	hideLoader();
  }

}


function makeForFlightListMap(index, flat, flng) {
	var dpoint = ol.proj.fromLonLat([flng, flat]);

  var c_view = new ol.View({
      center: dpoint,
      zoom: 12
    });

  var vSource = new ol.source.Vector();

  var vVectorLayer = new ol.layer.Vector({
      source: vSource,
      zIndex: 10000,
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

  var vMap = new ol.Map({
      target: 'map_' + index,
      layers: [
          new ol.layer.Tile({
              preload: 4,
              source: new ol.source.OSM()
          }), vVectorLayer
      ],
      // Improve user experience by loading tiles while animating. Will make
      // animations stutter on mobile or slow devices.
      loadTilesWhileAnimating: true,
      view: c_view
    });

  var icon = createNewIcon(index, {lat:flat, lng:flng, alt:0});  
  vSource.addFeature(icon);
  
  if (isSet(flightHistorySource)) {
  	flightHistorySource.addFeature(icon);
  }
  
  return vSource;
}

function updateCadaData(record_name, address, cada_data) {
	var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "set_cada", "clientid" : userid, "cada" : cada_data, "address": address, "name" : record_name};

	ajaxRequest(jdata, function (r) {
	 		 		 		 	
	}, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function drawCadastral(disp_id, name, x, y, vSource){
	 var userid = getCookie("dev_user_id");
   var jdata = {"action": "position", "daction": "cada", "clientid" : userid, "x" : x, "y": y};

	 ajaxRequest(jdata, function (r) {
	    		hideLoader();
	    		if (r.response.status !== "OK") return;

	    		var _features = new Array();
	    		var _addressText = "";

          for(var idx=0; idx< r.response.result.featureCollection.features.length; idx++) {
            try{
              var geojson_Feature = r.response.result.featureCollection.features[idx];
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

          setAddressAndCada(disp_id, _addressText, _features, vSource);
          if (flightHistorySource)  {
          	setAddressAndCada(disp_id, _addressText, _features, flightHistorySource);
          }          
          
          updateCadaData(name, _addressText, r.response.result.featureCollection.features);

  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });

}

function setAddressAndCada(address_id, address, cada, wsource) {
	 //var curText = getRecordTitle();         	
	var _features = new Array();
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
	var flat = item.flat;
	var flng = item.flng;
	var address = item.address;
	var cada = item.cada;
	var memo = item.memo;

  var appendRow = "<tr class='odd gradeX' id='flight-list-" + tableCount + "'><td width='10%'>" + (tableCount + 1) + "</td>";
  appendRow = appendRow + "<td class='center' bgcolor='#eee'><a href='javascript:showData(" + tableCount + ");'>" + name + "</a>";

  if (isSet(flat)) {
  		appendRow = appendRow + "<br><div id='map_" + tableCount + "' style='height:100px;' class='panel panel-primary'></div><br><a href='#' class='badge badge-primary text-wrap' id='map_address_" + tableCount + "'></a>";
  }
    
  appendRow = appendRow + "<br><form><div class='form-group'><textarea class='form-control' id='memoTextarea_" + tableCount + "' rows='3'>";
  
  if (isSet(memo)) {
  	 appendRow = appendRow + memo;
  }
  
  appendRow = appendRow + "</textarea>";  
  appendRow = appendRow + "<button class='btn btn-primary' type='button' id='btnForUpdateMemo_" + tableCount + "'>메모수정</button></div></form></td>";
  appendRow = appendRow + "<td width='30%' class='center'> " + dtimestamp + "</td>"
      + "<td width='20%' bgcolor='#fff'>"
      // + "<a href='design.html?record_name=" + name + "'>수정</a> "
      + "<button class='btn btn-primary' type='button' id='btnForRemoveFlightData_" + tableCount + "'>삭제</button></td>"
      + "</tr>";

  $('#dataTable-Flight_list > tbody:last').append(appendRow);
  
  $('#map_address_' + tableCount).click(function () {
  	GATAGM('map_address_' + tableCount, 'CONTENT', 'KR');
  	moveFlightHistoryMap(flat,flng);
  });
  
  $('#btnForRemoveFlightData_' + tableCount).click(function () {
  	GATAGM('btnForRemoveFlightData_' + tableCount, 'CONTENT', 'KR');
  	deleteFlightData(tableCount);
  });
  
  $('#btnForUpdateMemo_' + tableCount).click(function () {
  	GATAGM('btnForUpdateMemo_' + tableCount, 'CONTENT', 'KR');
  	updateFlightMemo(tableCount);
  });

	var retSource;
	if (isSet(flat)) {
  	retSource = makeForFlightListMap(tableCount, flat, flng);
  }  		  		

  if (isSet(address) && address != "") {  	
  	setAddressAndCada("#map_address_" + tableCount, address, cada, retSource);
  	setAddressAndCada("#map_address_" + tableCount, address, cada, flightHistorySource);
  }
  else {
  	if (isSet(flat)) {
			var dpoint = ol.proj.fromLonLat([flng, flat]);
    	drawCadastral("#map_address_" + tableCount, name, dpoint[0], dpoint[1], retSource);    	
    }
  }
  
  if (isSet(flat)) {
  	moveFlightHistoryMap(flat, flng);
	}
    
  tableCount++;
}

function moveFlightHistoryMap(lat, lng) {
	var npos = ol.proj.fromLonLat([lng * 1, lat * 1]);
	flightHistoryView.setCenter(npos);
}


function updateFlightMemoWithValue(name, memo) {		
	var userid = getCookie("dev_user_id");			
	
	if (!isSet(memo)) {
		showAlert("메모 내용을 입력해 주세요.");
		return;
	}
  var jdata = {"action": "position", "daction": "set_memo", "clientid" : userid, "name" : name, "memo" : memo};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result != "success") {
      showAlert("메모의 업데이트가 실패하였습니다. 잠시 후 다시 시도해 주세요.");
    }
    else {
      showAlert("메모를 업데이트 하였습니다.");
    }
  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function updateFlightMemo(index) {
	var item = flightRecArray[index];
	
	var userid = getCookie("dev_user_id");
		
	var memo = $("#memoTextarea_" + index).val();
	
	if (!isSet(memo)) {
		showAlert("메모 내용을 입력해 주세요.");
		return;
	}
  var jdata = {"action": "position", "daction": "set_memo", "clientid" : userid, "name" : item.name, "memo" : memo};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result != "success") {
      showAlert("메모의 업데이트가 실패하였습니다. 잠시 후 다시 시도해 주세요.");
    }
    else {
      showAlert("메모를 업데이트 하였습니다.");
    }
  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}


function deleteFlightData(index) {

  var item = flightRecArray[index];

  if (confirm('정말로 ' + item.name + ' 비행기록을 삭제하시겠습니까?')) {
  } else {
    return;
  }

  var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "delete", "clientid" : userid, "name" : item.name};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result != "success") {
      showAlert("삭제 실패!");
    }
    else {
      removeTableRow("flight-list-" + index);
    }
  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}


function removeTableRow(rowname) {
  $("#" + rowname).remove();
}

function removeMissionItem(name, trname) {
    var r = confirm("정말로 '" + name + "' 비행계획을 삭제하시겠습니까?");
    if (r == false) {
        return;
    }

    var userid = getCookie("dev_user_id");
    var jdata = {"action": "mission","mname" : name, "daction" : "delete", "clientid" : userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        $("#" + trname).remove();
      }
      else {
      	monitor("Error ! - 4");
      }
    }, function(request,status,error) {});
}

function monitor(msg) {
  var info = $('#monitor').html("<font color=red><b>" + msg + "</b></font>");
}

function registMission() {
    var mname = prompt("비행계획의 이름을 입력해 주세요.", "");

    if (mname == null) {
        showAlert("비행계획의 이름을 잘못 입력하셨습니다.");
        return;
    }

    var mspeed = prompt("비행계획 수행시 비행속도를 입력해 주세요.", "");

    if (mspeed == null || parseFloat(mspeed) <= 0.0) {
        showAlert("비행속도를 잘못 입력하셨습니다.");
        return;
    }


    if (flightRecDataArray.length <= 0) {
      showAlert("입력된 Waypoint가 1도 없습니다! 집중~ 집중~!");
      return;
    }

    var nPositions = [];
    var bError = 0;
    for (var index=0;index<flightRecDataArray.length;index++) {
    	var item = flightRecDataArray[index];

      if (item.act == undefined || item.act === ""
        || item.lat == undefined || item.lat === ""
        || item.lng == undefined || item.lng === ""
        || item.alt == undefined || item.alt === ""
        //|| item.speed == undefined || item.speed === ""
        //|| item.pitch == undefined || item.pitch === ""
        //|| item.roll == undefined || item.roll === ""
        //|| item.yaw == undefined || item.yaw === ""
        || item.actparam == undefined || item.actparam === "") {
          monitor("오류 : 인덱스 - " + (index) + " / 비어있는 파라메터가 존재합니다.");
          bError++;
          return;
        }

			var mid = "mid-" + index;
      nPositions.push({id:mid, lat:item.lat, lng:item.lng, alt:item.alt, act:item.act, actparam:item.actparam, speed:item.speed, roll:item.roll, pitch:item.pitch, yaw:item.yaw});
    }

    if (bError > 0) {
      showAlert("오류를 확인해 주세요!");
      return;
    }

    var userid = getCookie("dev_user_id");
    var jdata = {"action": "mission","mname" : mname, "daction" : "set", "missionspeed": mspeed, "missiondata" : nPositions, "clientid" : userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        showAlert("비행계획이 등록되었습니다.");
      }
      else {
      	showAlert("Error ! - 7");
      }
    }, function(request,status,error) {});
}


function setUploadData() {
      $("#uploadBtn").click(function() {
      		GATAGM('uploadBtn', 'CONTENT', 'KR');
      		
          if (cur_flightrecord_name == "") {
            var mname = prompt("데이터셋의 이름을 입력해 주세요.", "");

            if (mname == null) {
                showAlert("데이터셋의 이름을 잘못 입력하셨습니다.");
                return;
            }

            uploadData("", mname);
          }
          else {
            uploadData(cur_flightrecord_name, "");
          }
      });

      setDateBox();

      var handleFileSelect = function(evt) {
        var files = evt.target.files;
        var file = files[0];

        if (files && file) {
            var reader = new FileReader();

            reader.onload = function(readerEvt) {
                var binaryString = readerEvt.target.result;
                arrayData = analyzeData(binaryString);
            };

            reader.readAsText(file);
        }
    };

    if (window.File && window.FileReader && window.FileList && window.Blob) {
        document.getElementById('filePicker').addEventListener('change', handleFileSelect, false);
    } else {
        monitor('The File APIs are not fully supported in this browser.');
    }
}



function drawLineToMap() {
	var lines = new ol.geom.LineString(lineData);
  var lineSource = new ol.source.Vector({
          features: [new ol.Feature({
              geometry: lines,
              name: 'Line'
          })]
  });
	var lineLayer = new ol.layer.Vector({
      source: lineSource,
      style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ff0000',
                width: 3
            })
        })
  });

	map.addLayer(lineLayer);
}

function drawPosIcons() {
	if (posIcons.length <= 0) return;

  map.on('click', function (evt) {
  		GATAGM('map', 'CONTENT', 'KR');
  		
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function (feature) {
              return feature;
          });

			var locdata = null;
      if (feature) {          
          var ii = feature.get('mindex');     
          locdata = chartLocData[ii];
               
          setMoveActionFromMap(ii, locdata);
      }

  		var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
			if (locdata)
				showCurrentInfo([lonlat[0], lonlat[1]], locdata.alt);
			else
				showCurrentInfo([lonlat[0], lonlat[1]], '-');

  });

  var posSource = new ol.source.Vector({
      features: posIcons
  });
  var posLayer = new ol.layer.Vector({
      source: posSource
  });

  map.addLayer(posLayer);

}

function drawScatterGraph() {
	if (chartTData.length == 0) {
    $("#chartView").hide();
    return;
  }

  $("#chartView").show();
      

  var dataSet = {datasets: [
      {
          label: '온도',
          borderColor: '#f00',
          backgroundColor: '#f66',
          data: chartTData
     },
     {
         label: '습도',
         borderColor: '#00f',
         backgroundColor: '#66f',
         data: chartHData
     }
  ]};
  
  document.getElementById("chartArea").onclick = function(evt){
  	GATAGM('chartArea', 'CONTENT', 'KR');
  	
    var activePoints = window.myScatter.getElementsAtEvent(evt);
        
    if (activePoints.length > 0) {
       var clickedDatasetIndex = activePoints[0]._index;
              
       var locdata = chartLocData[clickedDatasetIndex];
	     if("lng" in locdata && "lat" in locdata) {
	        setMoveActionFromScatterChart(clickedDatasetIndex, locdata);
	     }
     }
	};
  

  var ctx = document.getElementById('chartArea').getContext('2d');
  window.myScatter = new Chart(ctx, {
  	type: 'scatter',
  	tooltipEvents: ["click"],
    data: dataSet,
    options: {
      title: {
        display: false,
        text: 'Temperature : RED / Humidity : BLUE'
      },
      events: ['click'],
      tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                		var locdata = chartLocData[tooltipItem.index];
                    return JSON.stringify(locdata);

                }
              },
            scales: {
                xAxes: [{
                  ticks: {
                    userCallback: function(label, index, labels) {
                      return chartLabelData[label];
                    }
                  }
                }]
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

function setChartData(cdata) {
	
			if(isSet(cdata) == false || cdata == "" || cdata == "-") return;
			
      posIcons = new Array();
      chartTData = new Array();
      chartHData = new Array();
      chartLabelData = new Array();
      chartLocData = new Array();
      lineGraphData = new Array();

      var i = 0;
      cdata.forEach(function (item) {
        addChartItem(i, item);
        i++;
      });

      setSlider(i);

			drawLineToMap();

      drawPosIcons();

			drawLineGraph();

      drawScatterGraph();
}

var oldScatterdatasetIndex = -1;
var oldScatterpointIndex = -1;

var oldLinedatasetIndex = -1;
var oldLinepointIndex = -1;


function setDateBox() {
  var toDay = new Date();
  var dd = toDay.getDate();
  var mm = toDay.getMonth() + 1;
  var yyyy = toDay.getFullYear();
  var dh = toDay.getHours();

  var opt = '<option>';
  for(var i=2010;i<=yyyy;i++) {
      $('#selYear').append($(opt, {
          value: i,
          text: '' + i
      }));

      $('#selYear2').append($(opt, {
          value: i,
          text: '' + i
      }));
  }

  $('#selYear').val(yyyy).prop("selected", true);
  $('#selYear2').val(yyyy).prop("selected", true);

  for(var i=1;i<=12;i++) {
      var opt = '<option>';

      var valD = String(i).padStart(2, '0');;
      $('#selMon').append($(opt, {
          value: valD,
          text: valD
      }));

      $('#selMon2').append($(opt, {
          value: valD,
          text: valD
      }));
  }

  var valM = String(mm).padStart(2, '0');;
  $('#selMon').val(valM).prop("selected", true);
  $('#selMon2').val(valM).prop("selected", true);

  for(var i=1;i<=31;i++) {
      var valD = String(i).padStart(2, '0');;
      $('#selDay').append($(opt, {
          value: valD,
          text: valD
      }));

      $('#selDay2').append($(opt, {
          value: valD,
          text: valD
      }));
  }

  valM = String(dd).padStart(2, '0');;
  $('#selDay').val(valM).prop("selected", true);
  $('#selDay2').val(valM).prop("selected", true);

  for(var i=0;i<=24;i++) {
      var valD = String(i).padStart(2, '0');;
      $('#selHour').append($(opt, {
          value: valD,
          text: valD
      }));

      $('#selHour2').append($(opt, {
          value: valD,
          text: valD
      }));
  }

  valM = String(dh).padStart(2, '0');
  $('#selHour').val(valM).prop("selected", true);
  $('#selHour2').val(valM).prop("selected", true);
}

function analyzeData(datas) {
    var eachdata = datas.split("\n");
    if (eachdata.length == 0) return;

    var forChartData = new Array();
    eachdata.forEach(function (item) {
        var DData= item.split(",");
        var dTimeStamp = convert2time(DData[0]);
        forChartData.push({dtime:dTimeStamp, t: DData[2], h: DData[1]});
    });

    var startD = eachdata[0].split(",");
    var dStart = new Date(startD[0]);

    var endD = eachdata[eachdata.length - 2].split(",");
    var dEnd = new Date(endD[0]);

    $('#selYear').val(dStart.getFullYear()).prop("selected", true);
    $('#selYear2').val(dEnd.getFullYear()).prop("selected", true);

    var valM = String(dStart.getMonth() + 1).padStart(2, '0');
    $('#selMon').val(valM).prop("selected", true);
    valM = String(dEnd.getMonth() + 1).padStart(2, '0');
    $('#selMon2').val(valM).prop("selected", true);

    valM = String(dStart.getDate()).padStart(2, '0');
    $('#selDay').val(valM).prop("selected", true);
    valM = String(dEnd.getDate()).padStart(2, '0');
    $('#selDay2').val(valM).prop("selected", true);

    valM = String(dStart.getHours()).padStart(2, '0');
    $('#selHour').val(valM).prop("selected", true);
    valM = String(dEnd.getHours()).padStart(2, '0');
    $('#selHour2').val(valM).prop("selected", true);

    return forChartData;
}




function ajaxRequest(data, callback, errorcallback) {
    $.ajax({url : "https://api.droneplay.io/v1/",
           dataType : "json",
           crossDomain: true,
           cache : false,
           data : JSON.stringify(data),
           type : "POST",
           contentType: "application/json; charset=utf-8",
           beforeSend: function(request) {
              request.setRequestHeader("droneplay-token", getCookie('user_token'));
            },
           success : function(r) {
             callback(r);
           },
           error:function(request,status,error){
               monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
               errorcallback(request,status,error);
           }
    });
}

function logOut() {
  setCookie("dev_user_id", "", -1);
  setCookie("user_token", "", -1);
  location.href="index.html";
}


function styleFunction(textMsg) {
  return [
    new ol.style.Style(
    	{        
	      image: new ol.style.Icon(({
	      	opacity: 0.75,
	        crossOrigin: 'anonymous',
	        scale: 2,
	        src: pos_icon_image
	      	}))
	      ,
	      text: new ol.style.Text({
	        font: '12px Calibri,sans-serif',
	        fill: new ol.style.Fill({ color: '#000' }),
	        stroke: new ol.style.Stroke({
	          color: '#fff', width: 2
	        }),
	        // get the text from the feature - `this` is ol.Feature
	        // and show only under certain resolution
	        text: map.getView().getZoom() > 12 ? textMsg : ''
	      	})
    	})
  ];
}


function mapInit() {

	var styles = [
        'Road',
        'Aerial',
        'AerialWithLabels'
      ];
  var maplayers = [];
  var i, ii;
  for (i = 0, ii = styles.length; i < ii; ++i) {
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

  var dokdo = ol.proj.fromLonLat([126.5610038, 33.3834381]);
  var scaleLineControl = new ol.control.ScaleLine();  

  posSource = new ol.source.Vector();

  current_view = new ol.View({
      center: dokdo,
      zoom: 17
    });

  var geolocation = new ol.Geolocation({
          // enableHighAccuracy must be set to true to have the heading value.
          trackingOptions: {
            enableHighAccuracy: true
          },
          projection: current_view.getProjection()
  });

  var accuracyFeature = new ol.Feature();
  geolocation.on('change:accuracyGeometry', function() {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });

  var positionFeature = new ol.Feature();
  positionFeature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: '#3399CC'
      }),
      stroke: new ol.style.Stroke({
        color: '#fff',
        width: 2
      })
    })
  }));

  current_pos = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([126.5610038, 33.3834381]))
  });

  current_pos_image = new ol.style.Icon(({
        //color: '#8959A8',
        crossOrigin: 'anonymous',
        src: './imgs/position2.png'
      }));

  current_pos.setStyle(new ol.style.Style({
      image: current_pos_image
    }));

  var vectorSource = new ol.source.Vector({
      features: [current_pos, accuracyFeature, positionFeature]
    });

  var vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      zIndex: 10000
    });


  pointSource = new ol.source.Vector({});
  var pointLayer = new ol.layer.Vector({
      source: pointSource,
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

 	maplayers.push(vectorLayer);
 	maplayers.push(pointLayer);

  map = new ol.Map({
      target: 'map',
      controls: ol.control.defaults().extend([
            scaleLineControl
          ]),
      layers: maplayers,
      // Improve user experience by loading tiles while animating. Will make
      // animations stutter on mobile or slow devices.
      loadTilesWhileAnimating: true,
      view: current_view
    });

  // update the HTML page when the position changes.
  geolocation.on('change', function() {
    $('#accuracy').text(geolocation.getAccuracy() + ' [m]');
    $('#altitude').text(geolocation.getAltitude() + ' [m]');
    $('#altitudeAccuracy').text(geolocation.getAltitudeAccuracy() + ' [m]');
    $('#heading').text(geolocation.getHeading() + ' [rad]');
    $('#speed').text(geolocation.getSpeed() + ' [m/s]');
    showLoader();
    flyTo(geolocation.getPosition(), 0, function(){hideLoader();});
  });

  // handle geolocation error.
  geolocation.on('error', function(error) {
    var info = $('#monitor');
    info.text(error.message);
  });


  geolocation.on('change:position', function() {
    var coordinates = geolocation.getPosition();
    positionFeature.setGeometry(coordinates ?
      new ol.geom.Point(coordinates) : null);
  });

  if (isSet($('#track'))) {
  	$('#track').change(function() {
    	geolocation.setTracking($("#track").is(":checked"));
  	});
  }

  var select = document.getElementById('layer-select');
  if (isSet(select)) {
	  select.addEventListener('change', function() {
	  	var select = document.getElementById('layer-select');
		  var style = select.value;
		  for (var i = 0; i < ii; ++i) {
		    maplayers[i].setVisible(styles[i] === style);
		  }
	  });
	}

  maplayers[1].setVisible(true);
  maplayers[3].setVisible(true);
  maplayers[4].setVisible(true);
}


// A bounce easing method (from https://github.com/DmitryBaranovskiy/raphael).
function bounce(t) {
    var s = 7.5625, p = 2.75, l;
    if (t < (1 / p)) {
        l = s * t * t;
    } else {
        if (t < (2 / p)) {
        t -= (1.5 / p);
            l = s * t * t + 0.75;
        } else {
            if (t < (2.5 / p)) {
                t -= (2.25 / p);
                l = s * t * t + 0.9375;
            } else {
                t -= (2.625 / p);
                l = s * t * t + 0.984375;
            }
        }
    }
    return l;
}

// An elastic easing method (from https://github.com/DmitryBaranovskiy/raphael).
function elastic(t) {
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
}


function showLoader() {
  $("#loading").show();
}

function hideLoader() {
  $("#loading").fadeOut(800);
}

function flyDirectTo(location, yaw) {
		var duration = 1;
    var called = false;

		yaw *= 1;
		yaw = yaw < 0 ? (360 + yaw) : yaw;

		yaw = Math.PI/180 * yaw;

    current_pos.setGeometry(new ol.geom.Point(location));
    current_pos_image.setRotation(yaw);
    current_view.setCenter(location);
}


function flyTo(location, yaw, done) {
    var duration = 1500;
    var zoom = current_view.getZoom();
    var parts = 2;
    var called = false;

    yaw *= 1;
		yaw = yaw < 0 ? (360 + yaw) : yaw;
		yaw = Math.PI/180 * yaw;

    current_pos.setGeometry(new ol.geom.Point(location));
    current_pos_image.setRotation(yaw);

    function callback(complete) {
        --parts;
        if (called) {
            return;
        }
        if (parts === 0 || !complete) {
            called = true;
            done(complete);
        }
    }

    current_view.animate({
      center: location,
      duration: duration
    }, callback);
    current_view.animate({
      zoom: zoom - 1,
      duration: duration / 2
    }, {
        zoom: zoom,
        duration: duration / 2
    }, callback);
}

var beforeTime = "";
function nexttour(r) {
  if (r.positiontime == beforeTime) {
    setTimeout(function() {
              if (bMonStarted == false) return;
              nextMon();
    }, 5000);
    return;
  }

  if ("missionid" in r && $('#' + r.missionid).length > 0) {
    $('#' + r.missionid).children('td, th').css('background-color','#ff0');
  }
  else {
    tableCount++;
    var missionid = "mission-" + tableCount;
    var appendRow = "<tr class='odd gradeX' id='" + missionid + "'><td class='center'></td><td class='center'>" + r.lat + " | " + r.lng + "<hr size=1>" + r.alt + " | " + r.positiontime + " </td></tr>";
    $('#monitorTable-points > tbody:last').append(appendRow);
  }

  beforeTime = r.positiontime;
  var npos = ol.proj.fromLonLat([r.lng * 1, r.lat * 1]);
  flyTo(npos, r.yaw, function() {});

  setTimeout(function() {
            if (bMonStarted == false) return;
            nextMon();
  }, 2500);
}


function uploadFlightList() {
	var files = document.getElementById('file').files;
  if (files.length > 0) {
  	var mname = prompt("비행기록의 이름을 입력해 주세요.", "");

	  if (!isSet(mname)) {
	      showAlert("잘못 입력하셨습니다.");
	      return;
	  }	  	  

	  showLoader();
    getBase64(files[0], mname, uploadFlightListCallback);
  }
  else {
  	showAlert("Please, select any file, first !");
  	return;
  }
}

function getBase64(file, mname, callback) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
     callback(mname, reader.result);
   };
   reader.onerror = function (error) {
   	 hideLoader();
     monitor('Error: ', error);
   };
}


function uploadFlightListCallback(mname, base64file) {
		var userid = getCookie("dev_user_id");
    var jdata = {"action" : "position", "daction" : "convert", "clientid" : userid, "name" : mname, "recordfile" : base64file};

    ajaxRequest(jdata, function (r) {
    	hideLoader();

      if(r.result == "success") {
        $('#uploadFlightRecBtn').hide(1500);
        $('#djifileform').hide(1500);
        alert("성공적으로 업로드 하였습니다. '비행기록 불러오기' 버튼을 클릭해 주세요");
        location.href = "https://pilot.duni.io/center/flight_view.html";
      }
      else {
      	showAlert("Error ! : (" + r.reason + ")");
      }
    }, function(request,status,error) {
    	hideLoader();
      monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
    });
}

function delCoockie(cName) {
	document.cookie = name + "= " + "; expires=" + date.toUTCString() + "; path=/";
}

function setCookie(cName, cValue, cDay){
    var date = new Date();
    date.setTime(date.getTime() + cDay * 60 * 60 * 24 * 1000);
    document.cookie = cName + '=' + cValue + ';expires=' + date.toUTCString() + ';path=/';
}

function getCookie(cName) {
    var value = document.cookie.match('(^|;) ?' + cName + '=([^;]*)(;|$)');
    return value? value[2] : null;
}

function showCurrentInfo(dlatlng, alt) {
	if (!isSet($("#position_info"))) return;

	var latlng = ol.proj.fromLonLat(dlatlng);
	var hdms = ol.coordinate.toStringHDMS(latlng);
	var itext = hdms + " [ Lat: " + dlatlng[1] + " / Lng: " + dlatlng[0] + " / Alt: " + alt + " ]";
	$("#position_info").text(itext);
}

function openLineTip(oChart,datasetIndex,pointIndex){
   if(!isSet(oChart)) return false;

   if (oldLinedatasetIndex >= 0)
   	closeTip(oChart,oldLinedatasetIndex,oldLinepointIndex);

   if(oChart.tooltip._active == undefined)
      oChart.tooltip._active = []
   var activeElements = oChart.tooltip._active;
   var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];

   oldLinedatasetIndex = datasetIndex;
   oldLinepointIndex = pointIndex;

   for(var i = 0; i < activeElements.length; i++) {
       if(requestedElem._index == activeElements[i]._index)
          return false;
   }
   activeElements.push(requestedElem);
   oChart.tooltip._active = activeElements;
   oChart.tooltip.update(true);
   oChart.draw();

   return true;
}

function openScatterTip(oChart,datasetIndex,pointIndex){
   if(!isSet(oChart)) return false;

   if (oldScatterdatasetIndex >= 0)
   	closeTip(oChart,oldScatterdatasetIndex,oldScatterpointIndex);

   if(oChart.tooltip._active == undefined)
      oChart.tooltip._active = []
   var activeElements = oChart.tooltip._active;
   var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];

   oldScatterdatasetIndex = datasetIndex;
   oldScatterpointIndex = pointIndex;

   for(var i = 0; i < activeElements.length; i++) {
       if(requestedElem._index == activeElements[i]._index)
          return false;
   }
   activeElements.push(requestedElem);
   oChart.tooltip._active = activeElements;
   oChart.tooltip.update(true);
   oChart.draw();

   return true;
}

function closeTip(oChart,datasetIndex,pointIndex){
   var activeElements = oChart.tooltip._active;
   if(!isSet(activeElements) || activeElements.length == 0)
     return;

   var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];
   for(var i = 0; i < activeElements.length; i++) {
       if(requestedElem._index == activeElements[i]._index)  {
          activeElements.splice(i, 1);
          break;
       }
   }
   oChart.tooltip._active = activeElements;
   oChart.tooltip.update(true);
   oChart.draw();
}


function setMoveActionFromMovie(index, item) {
  openScatterTip(window.myScatter, 0, index);
  openLineTip(window.myLine, 0, index);

  showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
  setSliderPos(index);

  showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
	moveToPositionOnMap(item.lat * 1, item.lng * 1, item.yaw, item.roll, item.pitch, true);
}

function setMoveActionFromScatterChart(index, item) {
	openLineTip(window.myLine, 0, index);

	if ("dsec" in item) {
    movieSeekTo(item.dsec);
  }

  setSliderPos(index);
  showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
  moveToPositionOnMap(item.lat * 1, item.lng * 1, item.yaw, item.roll, item.pitch, true);
}

function setMoveActionFromLineChart(index, item) {
	openScatterTip(window.myScatter, 0, index);

  if ("dsec" in item) {
    movieSeekTo(item.dsec);
  }

  setSliderPos(index);
  showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
  moveToPositionOnMap(item.lat * 1, item.lng * 1, item.yaw, item.roll, item.pitch, true);
}

function setMoveActionFromSliderOnMove(index, item) {	
	$('#sliderText').html( index );
  
	showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
	moveToPositionOnMap(item.lat * 1, item.lng * 1, item.yaw, item.roll, item.pitch, true);
}

function setMoveActionFromSliderOnStop(index, item) {
	openScatterTip(window.myScatter, 0, index);
  openLineTip(window.myLine, 0, index);
	$('#sliderText').html( index );

  if ("dsec" in item) {
    movieSeekTo(item.dsec);
  }

	showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
	moveToPositionOnMap(item.lat * 1, item.lng * 1, item.yaw, item.roll, item.pitch, true);
}

function setMoveActionFromMap(index, item) {
	openScatterTip(window.myScatter, 0, index);
	openLineTip(window.myLine, 0, index);

  setRollStatus(item.roll);
  setYawStatus(item.yaw);
  setPitchStatus(item.pitch);
  showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);

  if ("dsec" in item) {
    movieSeekTo(item.dsec);
  }

  setSliderPos(index);
}



function dromiInit() {
  $("#chartView").hide();
  setUploadData();
  hideLoader();
}

function dromiListInit() {
  $("#chartView").hide();
  $("#googlePhotoPlayer").hide();
  $("#youTubePlayer").hide();
  
  hideMovieDataSet();  
  hideLoader();
}

function setDromilist(data) {
  if (data == null || data.length == 0)
    return;

  data.forEach(function(item) {
    appendFlightRecordListTableForDromi(item.dname, item.dtime, item.data);
    dromiDataArray.push(item);
  });
}

function appendFlightRecordListTableForDromi(name, dtimestamp, data) {
  var appendRow = "<tr class='odd gradeX' id='dromi-list-" + tableCount + "'><td width='10%'>" + (tableCount + 1) + "</td>"
      + "<td class='center' bgcolor='#eee'><a href='javascript:showDataForDromi(" + tableCount + ");'>"
      + name + "</a></td><td width='30%' class='center'> " + dtimestamp + "</td>"
      + "<td width='20%' bgcolor='#fff'>"
      + "<button class='btn btn-primary' type='button' id='btnForDeleteDromiData_" + tableCount + "'>삭제</button></td>"
      + "</tr>";
  $('#dataTable-lists > tbody:last').append(appendRow);
  
  $('#btnForDeleteDromiData_' + tableCount).click(function() {
  	GATAGM('btnForDeleteDromiData_' + tableCount, 'CONTENT', 'KR');
  	deleteDromiData(tableCount);
  });
  
  tableCount++;
}

function deleteDromiData(index) {
  if (dromiDataArray.length == 0) return;
  var item = dromiDataArray[index];

  if (confirm('정말로 ' + item.dname + ' 데이터를 삭제하시겠습니까?')) {
  } else {
    return;
  }

  var userid = getCookie("dev_user_id");
  var jdata = {"action": "dromi", "daction": "delete", "clientid" : userid, "name" : item.dname};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result == "success") {
      removeTableRow("dromi-list-" + index);
    }
  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function saveYoutubeUrl(data_id) {
	
	var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "youtube", "youtube_data_id" : data_id, "clientid" : userid, "name" : cur_flightrecord_name};
  
	showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result == "success") {
      
    }
  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function hideMovieDataSet() {	
	$('#movieDataSet').hide();
	$('#modifyBtnForMovieData').text("영상정보 수정");	
	
	$('#modifyBtnForMovieData').off('click');
	$('#modifyBtnForMovieData').click(function(){
		GATAGM('modifyBtnForMovieData_show', 'CONTENT', 'KR');
		showMovieDataSet();
	});
	
}

function showMovieDataSet() {		
	$('#movieDataSet').show();
	$('#modifyBtnForMovieData').text("영상정보 설정 닫기");	
	
	$('#modifyBtnForMovieData').off('click');
	$('#modifyBtnForMovieData').click(function(){
		GATAGM('modifyBtnForMovieData_hide', 'CONTENT', 'KR');
		hideMovieDataSet();
	});
}

function setYoutubeID() {
	var data_id = $('#movieData').val();
	if (data_id == "") {
		showAlert("Invalid URL");
		return;
	}

	moviePlayerVisible = false;

	if (data_id.indexOf("youtube") >=0) {		
		setYoutubePlayer(data_id);
		
		saveYoutubeUrl(data_id);
	}
	else {		
		setYoutubePlayer("");
	}

	if (moviePlayerVisible == true) {
		hideMovieDataSet();
	}
	else {
		showMovieDataSet();
	}
}

function setYoutubePlayerPureID(data_id) {
	if (!isSet(data_id) || data_id == "-") {
		$("#youTubePlayer").hide();		
		moviePlayerVisible = false;
		return;
	}
	else {		
		$("#youTubePlayer").show();
		moviePlayerVisible = true;
	}


  if (youTubePlayer != null) {
    youTubePlayer.loadVideoById(data_id, 0, "large");
    return;
  }

  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/player_api";
  youtube_data_id = data_id;

  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function setYoutubePlayer(d_id) {
	if (!isSet(d_id) || d_id == "-") {
		$("#youTubePlayer").hide();
	
		moviePlayerVisible = false;
		return;
	}
	else {		
		$("#youTubePlayer").show();
		moviePlayerVisible = true;
	}

	var data_id = d_id;
	var r_id = d_id.split('=');
	if (r_id.length > 1) {
		data_id = r_id[1];
	}

  if (youTubePlayer != null) {
    youTubePlayer.loadVideoById(data_id, 0, "large");
    return;
  }

  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/player_api";
  youtube_data_id = data_id;

  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
    youTubePlayer = new YT.Player('youTubePlayer', {
        width: '1000',
        height: '300',
        videoId: youtube_data_id,
        playerVars: {rel: 0},//추천영상 안보여주게 설정
        events: {
          'onReady': onPlayerReady, //로딩할때 이벤트 실행
          'onStateChange': onPlayerStateChange //플레이어 상태 변화시 이벤트실행
        }
    });//youTubePlayer1셋팅
}

var movieProcess = false;

function onPlayerReady(event) {
    event.target.playVideo();//자동재생

    var lastTime = -1;
    var interval = 1000;

    var checkPlayerTime = function () {
        if (lastTime != -1) {
            if(youTubePlayer.getPlayerState() == YT.PlayerState.PLAYING ) {
                var t = youTubePlayer.getCurrentTime();
                ///expecting 1 second interval , with 500 ms margin
                if (Math.abs(t - lastTime) > 1) {
                    // there was a seek occuring
                    processSeek(t);
                }
            }
        }
        lastTime = youTubePlayer.getCurrentTime();
        setTimeout(checkPlayerTime, interval); /// repeat function call in 1 second
    }
    setTimeout(checkPlayerTime, interval); /// initial call delayed
}

function onPlayerStateChange(event) {

}

function processSeek(curTime) {
    if (movieProcess == true) {
      movieProcess = false;
      return;
    }

    var index = 0;
    chartLocData.some(function(item) {
      if ("dsec" in item) {
        var ds = (item.dsec * 1);
        if((ds + 5) >= curTime && (ds - 5) <= curTime) {
            setMoveActionFromMovie(index, item);
            return true;
        }
      }

      index++;
      return false;
    });
}

function movieSeekTo(where) {
  movieProcess = true;

  if (googlePhotoPlayer != null && googlePhotoPlayerAr.is(":visible") == true) {
  	googlePhotoPlayer.currentTime = where;
  }

  if (youTubePlayer != null && $('#youTubePlayer').is(":visible") == true) {
  	youTubePlayer.seekTo(where, true);
  }
}

function showDataForDromi(index) {
  if (dromiDataArray.length == 0) return;

  var item = dromiDataArray[index];

	moviePlayerVisible = false;

  if ("youtube_data_id" in item) {
  	if (item.youtube_data_id.indexOf("youtube") >=0) {
			setYoutubePlayer(item.youtube_data_id);			
		}
		else {
			setYoutubePlayer("");			
		}
  }
  else {
    $("#youTubePlayer").hide();
    $("#googlePhotoPlayer").hide();
  }

  if (moviePlayerVisible == true) {
		hideMovieDataSet();
	}
	else {
		showMovieDataSet();
	}

	if (!("data" in item) || item.data == null || item.data == "") {
		var userid = getCookie("dev_user_id");
		var jdata = {"action": "dromi", "daction": "get", "clientid" : userid, "name" : item.dname};

    setRecordTitle("- " + item.dname);
        
    cur_flightrecord_name = item.dname;
    
    $("#movieTitle").val(cur_flightrecord_name);
  	$("#movieDescription").val(cur_flightrecord_name);

	  showLoader();

	  setTimeout(function() {

				ajaxRequest(jdata, function (r) {
			    if(r.result != "success") {
			      showAlert("Failed to load data!");
			    }
			    else {			    				    				    	
			      setChartData(r.data);
			      hideLoader();
			    }
			  }, function(request,status,error) {
			    hideLoader();
			    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
			  });

		}, 1000);
	}
	else {
		showLoader();
  	setChartData(item.data);
  	hideLoader();
  }

}

function setFlightlistForDromi(data) {
  if (data == null || data.length == 0)
    return;

  data.forEach(function(item) {
    appendFlightListTableForDromi(item.name, item.dtime, item.data);
    flightDataArrayForDromi.push(item);
  });
}

function appendFlightListTableForDromi(name, dtimestamp, data) {
  var appendRow = "<tr class='odd gradeX' id='flight-list-" + tableCount + "'><td width='10%'>" + (tableCount + 1) + "</td>"
      + "<td class='center' bgcolor='#eee'><a href='javascript:uploadFromSetForDromi(" + tableCount + ");'>"
      + name + "</a></td><td width='30%' class='center'> " + dtimestamp + "</td>"
      + "<td width='20%' bgcolor='#fff'>"
      + "<button class='btn btn-primary' type='button' id='btnForDeleteFlightDataForDromi_" + tableCount + "'>삭제</button></td>"
      + "</tr>";
  $('#dataTable-Flight_list > tbody:last').append(appendRow);
  
  $('#btnForDeleteFlightDataForDromi_' + tableCount).click(function () {
  	GATAGM('btnForDeleteFlightDataForDromi_' + tableCount, 'CONTENT', 'KR');
  	deleteFlightDataForDromis(tableCount);
  });
        
  tableCount++;
}


function deleteFlightDataForDromis(index) {

  var item = flightDataArrayForDromis[index];

  if (confirm('정말로 ' + item.name + ' 비행기록을 삭제하시겠습니까?')) {
  } else {
    return;
  }

  var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "delete", "clientid" : userid, "name" : item.name};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result != "success") {
      showAlert("삭제 실패!");
    }
    else {
      removeTableRow("flight-list-" + index);
    }
  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function uploadFromSetForDromi(index) {
  var item = flightDataArrayForDromi[index];
  $('#FlightDataName').html(item.name);
  cur_flightrecord_name = item.name;
}

function getFlightListForDromi() {
  var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "download", "clientid" : userid};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result == "success") {
      if (r.data == null || r.data.length == 0) {
        showAlert("존재하는 데이터가 없습니다.");
        return;
      }

      setFlightlistForDromi(r.data);
      $('#getFlightListBtn').hide(1500);
    }
  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function getDromiList() {
  var userid = getCookie("dev_user_id");
  var jdata = {"action": "dromi", "daction": "list", "clientid" : userid};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result == "success") {
      if (r.data == null || r.data.length == 0) {
        showAlert("존재하는 데이터가 없습니다.");
        return;
      }

      setDromilist(r.data);
      $('#getListBtn').hide(1500);
    }
  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function convert2time(stime) {
  var gapTime = document.getElementById("gmtGapTime").value;
  return (new Date(stime).getTime() + (3600000 * (gapTime*1)));
}

function uploadData(name, mname) {
    // if (arrayData == null || arrayData.length == 0) {
    //   showAlert("Please select any file !!");
    //   return;
    // }

    var selYear = document.getElementById("selYear");
    var dYear = selYear.options[selYear.selectedIndex].value;

    var selMon = document.getElementById("selMon");
    var dMon = selMon.options[selMon.selectedIndex].value;

    var selDay = document.getElementById("selDay");
    var dDay = selDay.options[selDay.selectedIndex].value;

    var selHour = document.getElementById("selHour");
    var dHour = selHour.options[selHour.selectedIndex].value;

    var dTimeStart = convert2time(dYear + "-" + dMon + "-" + dDay + " " + dHour + ":00:00");

    selYear = document.getElementById("selYear2");
    dYear = selYear.options[selYear.selectedIndex].value;

    selMon = document.getElementById("selMon2");
    dMon = selMon.options[selMon.selectedIndex].value;

    selDay = document.getElementById("selDay2");
    dDay = selDay.options[selDay.selectedIndex].value;

    selHour = document.getElementById("selHour2");
    dHour = selHour.options[selHour.selectedIndex].value;

    var dTimeEnd = convert2time(dYear + "-" + dMon + "-" + dDay + " " + dHour + ":59:59");

    var userid = getCookie("dev_user_id");
    var jdata = "";

    if (name == "")
      jdata = {"action": "dromi", "daction": "set", "mname" :  mname, "data" : arrayData, "start": dTimeStart, "end" : dTimeEnd, "clientid" : userid};
    else
      jdata = {"action": "dromi", "daction": "set", "name" :  name, "data" : arrayData, "clientid" : userid};

    showLoader();
    ajaxRequest(jdata, function (r) {
      cur_flightrecord_name = "";
      hideLoader();
      if(r.result == "success") {
        if (r.data == null || r.data.length == 0) {
          showAlert("존재하는 데이터가 없습니다.");
          return;
        }

        setChartData(r.data);
      }
    }, function(request,status,error) {
      cur_flightrecord_name = "";
      hideLoader();
      monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
    });
}


function convert2data(t) {
    var date = new Date(t);
    return date;
}

var lineData = Array();

function addChartItem(i, item) {
  if ("etc" in item && "t" in item.etc && "h" in item.etc) {
    chartTData.push({x: i, y: item.etc.t});
    chartHData.push({x: i, y: item.etc.h});

    var date = convert2data(item.dtimestamp);
    var valM = String(date.getMonth() + 1).padStart(2, '0');
    var valD = String(date.getDate()).padStart(2, '0');
    var valH = String(date.getHours()).padStart(2, '0');
    var valMin = String(date.getMinutes()).padStart(2, '0');
    var valS = String(date.getSeconds()).padStart(2, '0');
    var dateString = date.getFullYear() + "-" + valM + "-" + valD + " " + valH + ":" + valMin + ":" + valS;
    chartLabelData.push(dateString);
  }

  if ("lat" in item && "lng" in item && "alt" in item) {
    var dsec = (item.dsec * 1);    
    chartLocData.push({lat : item.lat, lng : item.lng, alt: item.alt, yaw : item.yaw, roll: item.roll, pitch: item.pitch, dsec : dsec});

    var pos_icon = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
        name: dateString + " / lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
        mindex : i
    });
    
    var pos_icon_color = '#777777';

    if("etc" in item && "marked" in item.etc) {
      pos_icon_color = '#ff0000';
    }

    pos_icon.setStyle(new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          color: pos_icon_color,
          crossOrigin: 'anonymous',
          src: pos_icon_image
        }))
    }));

    posIcons.push(pos_icon);

    if (bMoved == false)
      flyTo(ol.proj.fromLonLat([item.lng * 1, item.lat * 1]), item.yaw, function() {bMoved=true;});

    lineData.push(ol.proj.fromLonLat([item.lng * 1, item.lat * 1]));

    lineGraphData.push({x: i, y: item.alt});
	}
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