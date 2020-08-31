
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
var lineGraphData = new Array();

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

var langset = "KR";

$(function() {
	if (askToken() == false) {
		goIndex("");
    return;
  }

	setCommonText();
  initPilotCenter();
  mixpanel.identify(getCookie("dev_user_id"));

});

function goIndex(doAction) {
	if (langset == "KR" || langset == "")
    location.href="index.html?action=" + doAction;
  else
  	location.href="index_en.html?action=" + doAction;
}

function goCenter() {
}

function setCommonText() {
		langset = getCookie("language");
		var image_url = getCookie("image_url");
		
		if (image_url == "") $('#profile_image').hide();
		else $('#profile_image').attr("src", image_url);
			
		$('#side_menu_dashboard').text(LANG_JSON_DATA[langset]['side_menu_dashboard']);
		$('#side_menu_flight_plan').text(LANG_JSON_DATA[langset]['side_menu_flight_plan']);
		$('#side_menu_flight_plan_design').text(LANG_JSON_DATA[langset]['side_menu_flight_plan_design']);
		$('#side_menu_flight_plan_list').text(LANG_JSON_DATA[langset]['side_menu_flight_plan_list']);
		$('#side_menu_flight_plan_mon').text(LANG_JSON_DATA[langset]['side_menu_flight_plan_mon']);
		$('#side_menu_flight_record').text(LANG_JSON_DATA[langset]['side_menu_flight_record']);
		$('#side_menu_flight_record_upload').text(LANG_JSON_DATA[langset]['side_menu_flight_record_upload']);
		$('#side_menu_flight_record_list').text(LANG_JSON_DATA[langset]['side_menu_flight_record_list']);
		$('#side_menu_qa').text(LANG_JSON_DATA[langset]['side_menu_qa']);
		$('#side_menu_links').text(LANG_JSON_DATA[langset]['side_menu_links']);
		$('#side_menu_links_comm').text(LANG_JSON_DATA[langset]['side_menu_links_comm']);
		$('#side_menu_links_blog').text(LANG_JSON_DATA[langset]['side_menu_links_blog']);
		$('#side_menu_links_apis').text(LANG_JSON_DATA[langset]['side_menu_links_apis']);
		$('#side_menu_links_dev').text(LANG_JSON_DATA[langset]['side_menu_links_dev']);

		$('#top_menu_logout').text(LANG_JSON_DATA[langset]['top_menu_logout']);
		$('#top_menu_token').text(LANG_JSON_DATA[langset]['top_menu_token']);

		$('#askModalCancelButton').text(LANG_JSON_DATA[langset]['msg_cancel']);
}

function showAskDialog(atitle, acontent, oktitle, okhandler) {

		$('#askModalLabel').text(atitle);
		$('#askModelContent').text(acontent);
		$('#askModalOKButton').text(oktitle);

		$('#askModalOKButton').off('click');
		$('#askModalOKButton').click(function(){
			$('#askModal').modal('hide');
			okhandler();
		});

		$('#askModal').modal('show');
}

function setLogoutBtn() {
		$('#btnLogout').click(function () {
			GATAGM('btnLogout', 'MEMU', langset);

			showAskDialog(
				LANG_JSON_DATA[langset]['modal_title'],
				LANG_JSON_DATA[langset]['msg_are_you_sure'],
				LANG_JSON_DATA[langset]['top_menu_logout'],
				function() {logOut();}
			);
		});
}

function initPilotCenter() {
	bMonStarted = false;
	flightRecArray = [];
	flightRecDataArray = [];
	setLogoutBtn();

  var page_data = document.getElementById("page_data");
	var page_action = page_data.getAttribute("page_action");

	showLoader();

  if (page_action == "center") {
  	centerInit();
  }
  if (page_action == "qa") {
  	qaInit();
  }
  else if (page_action == "design") {
  	mapInit();
    designInit();
  }
  else if (page_action == "list") {
		missionListInit();
  }
  else if (page_action == "monitor") {
    monitorInit();
  }
  else if (page_action == "flightlist") {
    flightListInit();
  }
  else if (page_action == "flight_view") {
  	mapInit();
  	flightHistoryMapInit();
    flightViewInit();
  }
  else if (page_action == "flight_view_detail") {
  	mapInit();  	
    flightDetailInit();
  }
  else if (page_action == "dromi") {
  	mapInit();
    dromiInit();
  }
  else if (page_action == "dromi_list") {
  	mapInit();
    dromiListInit();
  }
  else if (page_action == "summary") {  	
    summaryInit();
  }
}

function summaryInit() {
	document.title = LANG_JSON_DATA[langset]['page_center_title'];

	getAllRecordCount();
}


function centerInit() {
	document.title = LANG_JSON_DATA[langset]['page_center_title'];
	$("#head_title").text(document.title);

	$('#center_about_title').text(LANG_JSON_DATA[langset]['center_about_title']);
	$('#center_about_content').html(LANG_JSON_DATA[langset]['center_about_content']);
	$('#center_example_title').html(LANG_JSON_DATA[langset]['center_example_title']);
	$('#data_title').text("'" + getCookie("user_email") + "'" + LANG_JSON_DATA[langset]['data_count_msg']);
	
	$("#r_count_label").text(LANG_JSON_DATA[langset]["r_count_label"]);
	$("#f_count_label").text(LANG_JSON_DATA[langset]["f_count_label"]);
	$("#a_time_label").text(LANG_JSON_DATA[langset]["a_time_label"]);
	$("#a_time_min_label").text(LANG_JSON_DATA[langset]["a_time_min_label"]);

	getRecordCount();
}


function designInit() {

	document.title = LANG_JSON_DATA[langset]['page_mission_design_title'];
	$("#head_title").text(document.title);

	$('#msg_tracker').text(LANG_JSON_DATA[langset]['msg_tracker']);
	$('#map_kind_label').text(LANG_JSON_DATA[langset]['map_kind_label']);
	$('#go_index_direct_label').text(LANG_JSON_DATA[langset]['go_index_direct_label']);
	$('#btnForRegistMission').text(LANG_JSON_DATA[langset]['btnForRegistMission']);
	$('#btnForClearMission').text(LANG_JSON_DATA[langset]['btnForClearMission']);
	$('#removeItemBtn').text(LANG_JSON_DATA[langset]['msg_remove']);
	$('#saveItemBtn').text(LANG_JSON_DATA[langset]['msg_apply']);


	initSliderForDesign(1);

 	map.on('click', function (evt) {
 			GATAGM('DESIGN_MAP', 'CONTENT', langset);

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
		GATAGM('saveItemBtn', 'CONTENT', langset);
		saveFlightData(0);
	});

	$('#btnForRegistMission').off('click');
	$('#btnForRegistMission').click(function(){
		GATAGM('btnForRegistMission', 'CONTENT', langset);
		registMission();
	});

	$('#btnForClearMission').off('click');
	$('#btnForClearMission').click(function(){
		GATAGM('btnForClearMission', 'CONTENT', langset);
		askClearCurrentDesign();
	});

	$('#btnForSearchAddress').off('click');
	$('#btnForSearchAddress').click(function(){
		GATAGM('btnForSearchAddress', 'CONTENT', langset);
		searchCurrentBrowserAddress();
	});
}



function flightListInit() {

	document.title = LANG_JSON_DATA[langset]['page_flight_rec_upload_title'];
	$("#head_title").text(document.title);

	$('#msg_dji_file_upload').text(LANG_JSON_DATA[langset]['msg_dji_file_upload']);
	$('#btnForUploadFlightList').text(LANG_JSON_DATA[langset]['msg_upload']);
	$('#msg_dji_file_upload').text(LANG_JSON_DATA[langset]['msg_dji_file_upload']);
	$('#msg_duni_file_upload').text(LANG_JSON_DATA[langset]['msg_duni_file_upload']);
	$('#btnForUploadDUNIFlightList').text(LANG_JSON_DATA[langset]['msg_upload']);
	$('#dji_flight_record_get_label').text(LANG_JSON_DATA[langset]['dji_flight_record_get_label']);
	$('#duni_flight_record_format_label').text(LANG_JSON_DATA[langset]['duni_flight_record_format_label']);
	$('#collapseRecordFileParams').html(LANG_JSON_DATA[langset]['collapseRecordFileParams']);

	$('#btnForUploadFlightList').click(function() {
    	GATAGM('btnForUploadFlightList', 'CONTENT', langset);
    	uploadFlightList();
  });

  $('#btnForUploadDUNIFlightList').click(function() {
    	GATAGM('btnForUploadDUNIFlightList', 'CONTENT', langset);
    	uploadDUNIFlightList();
  });


	hideLoader();
}

function flightDetailInit() {
	document.title = LANG_JSON_DATA[langset]['page_flight_rec_view_title'];
	$("#head_title").text(document.title);

	$("#modifyBtnForMovieData").text(LANG_JSON_DATA[langset]['modifyBtnForMovieData']);
	$("#title_for_moviedata_label").text(LANG_JSON_DATA[langset]['title_for_moviedata_label']);
	$("#desc_for_moviedata_label").text(LANG_JSON_DATA[langset]['desc_for_moviedata_label']);
	$("#privacy_for_moviedata_label").text(LANG_JSON_DATA[langset]['privacy_for_moviedata_label']);
	$("#option_public_label").text(LANG_JSON_DATA[langset]['option_public_label']);
	$("#option_unlisted_label").text(LANG_JSON_DATA[langset]['option_unlisted_label']);
	$("#option_private_label").text(LANG_JSON_DATA[langset]['option_private_label']);
	$("#uploadVideoToYoutubeButton").text(LANG_JSON_DATA[langset]['uploadVideoToYoutubeButton']);
	$("#flightMemoBtn").text(LANG_JSON_DATA[langset]['msg_modify_memo']);
	$("#altitude_label").text(LANG_JSON_DATA[langset]['altitude_label']);
	$("#youtube_url_label").text(LANG_JSON_DATA[langset]['youtube_url_label']);
	$("#btnForSetYoutubeID").text(LANG_JSON_DATA[langset]['msg_apply']);
	$("#map_kind_label").text(LANG_JSON_DATA[langset]['map_kind_label']);
	$("#input_memo_label").text(LANG_JSON_DATA[langset]['input_memo_label']);

  $('#btnForSetYoutubeID').click(function() {
  	GATAGM('btnForSetYoutubeID', 'CONTENT', langset);
  	setYoutubeID();
  });

  var record_name = location.search.split('record_name=')[1];
  if (record_name != null && record_name != "") {
    showDataWithName(decodeURI(record_name));
  }
}

function flightViewInit() { //비행기록 목록

	document.title = LANG_JSON_DATA[langset]['page_flight_rec_view_title'];
	$("#head_title").text(document.title);


	$("#flightMemoBtn").text(LANG_JSON_DATA[langset]['msg_modify_memo']);
	$("#btnForLoadFlightList").text(LANG_JSON_DATA[langset]['btnForLoadFlightList']);

	$("#name_label").text(LANG_JSON_DATA[langset]['name_label']);
	$("#date_label").text(LANG_JSON_DATA[langset]['date_label']);
	$("#manage_label").text(LANG_JSON_DATA[langset]['manage_label']);

	$("#search_key").attr("placeholder", LANG_JSON_DATA[langset]['msg_record_search_key']);

  $("#btnForSearchFlightRecord").click(function() {
		GATAGM('btnForSearchFlightRecord', 'CONTENT', langset);
  	searchFlightRecord($("#search_key").val());
	});

  $('#btnForLoadFlightList').click(function() {
  	GATAGM('btnForLoadFlightList', 'CONTENT', langset);
  	getFlightList();
  });

  hideLoader();
}


function qaInit() {

	document.title = LANG_JSON_DATA[langset]['page_qa_title'];
	$("#head_title").text(document.title);

	$("#qa_label").text(LANG_JSON_DATA[langset]['qa_label']);

	hideLoader
}

function missionListInit() {

	document.title = LANG_JSON_DATA[langset]['page_list_title'];
	$("#head_title").text(LANG_JSON_DATA[langset]['page_center_title']);
	$("#name_label").text(LANG_JSON_DATA[langset]['name_label']);
	$("#status_label").text(LANG_JSON_DATA[langset]['status_label']);
	$("#date_label").text(LANG_JSON_DATA[langset]['date_label']);
	$("#manage_label").text(LANG_JSON_DATA[langset]['manage_label']);
	$("#btnForGetMissionList").text(LANG_JSON_DATA[langset]['btnForGetMissionList']);
	$("#search_key").attr("placeholder", LANG_JSON_DATA[langset]['msg_mission_search_key']);


	$('#btnForSearchMission').click(function() {
		GATAGM('btnForSearchMission', 'CONTENT', langset);
		searchMission($("#search_key").val());
	});

	$('#btnForGetMissionList').click(function() {
		GATAGM('btnForGetMissionList', 'CONTENT', langset);
		getMissionList();
	});

	hideLoader();
}


function monitorInit() {

	document.title = LANG_JSON_DATA[langset]['page_monitor_title'];
	$("#head_title").text(document.title);


	$("#btnStartMon").text(LANG_JSON_DATA[langset]['btnStartMon']);

	var page_id = location.search.split('mission_name=')[1];
	if (isSet(page_id))
		page_id = page_id.split('&')[0];

  getMissionToMonitor(page_id);

	$("#btnStartMon").click(function() {
		GATAGM('btnStartMon', 'CONTENT', langset);
		startMon();
	});

  hideLoader();
}

function dromiInit() {
	document.title = LANG_JSON_DATA[langset]['page_dromi_title'];
	$("#head_title").text(document.title);

  $("#chartView").hide();
  setUploadData();
  hideLoader();
}

function dromiListInit() {
	document.title = LANG_JSON_DATA[langset]['page_dromi_list_title'];
	$("#head_title").text(document.title);

  $("#chartView").hide();
  $("#googlePhotoPlayer").hide();
  $("#youTubePlayer").hide();

  hideMovieDataSet();
  hideLoader();
}


function flightHistoryMapInit() {
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


function showAlert(msg) {

	$('#modal-title').text(LANG_JSON_DATA[langset]['modal_title']);
	$('#modal-confirm-btn').text(LANG_JSON_DATA[langset]['modal_confirm_btn']);

	$('#errorModalLabel').text(msg);
	$('#errorModal').modal('show');
}


function getAllRecordCount() {

	var userid = getCookie("dev_user_id");
	var useremail = getCookie("user_email");
  var jdata = {"action" : "position", "daction" : "summary", "clientid" : userid, "email" : useremail};

  showLoader();
  ajaxRequest(jdata, function (r) {
    if(r.result == "success") {
      hideLoader();

		  setSummaryDashBoard(r.record_count, r.mission_count, r.member_count);
    }
    else {
    	setSummaryDashBoard(0, 0, 0);
      hideLoader();
    }
  }, function(request,status,error) {
    setSummaryDashBoard(0, 0, 0);
    hideLoader();
  });
}

function getRecordCount() {

	var userid = getCookie("dev_user_id");
  var jdata = {"action" : "position", "daction" : "data_count", "clientid" : userid};

  showLoader();
  ajaxRequest(jdata, function (r) {
    if(r.result == "success") {
      hideLoader();

		  setDashBoard(r.record_count, r.mission_count, r.alltime);
    }
    else {
    	setDashBoard(0, 0, 0);
      hideLoader();
    }
  }, function(request,status,error) {
    setDashBoard(0, 0, 0);
    hideLoader();
  });
}

function setSummaryDashBoard(rcount, fcount, mcount) {

		if (rcount == 0 && fcount == 0) {
			$("#r_count_label").text(LANG_JSON_DATA[langset]["r_count_label"] + " : 0");
			$("#f_count_label").text(LANG_JSON_DATA[langset]["f_count_label"] + " : 0");						
			rcount = 1;
			fcount = 1;
		}
		else {
			$("#r_count_label").text(LANG_JSON_DATA[langset]["r_count_label"] + " : " + rcount);
			$("#f_count_label").text(LANG_JSON_DATA[langset]["f_count_label"] + " : " + fcount);
		}
		
		$("#f_member_count_label").text("전체 회원수 : " + mcount);
		
		// Set new default font family and font color to mimic Bootstrap's default styling
		Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
		Chart.defaults.global.defaultFontColor = '#858796';

		// Pie Chart Example
		var ctx = document.getElementById("myPieChart");
		var myPieChart = new Chart(ctx, {
		  type: 'doughnut',
		  data: {
		    labels: [LANG_JSON_DATA[langset]["r_count_label"], LANG_JSON_DATA[langset]["f_count_label"]],
		    datasets: [{
		      data: [rcount, fcount],
		      backgroundColor: ['#4e73df', '#1cc88a'],
		      hoverBackgroundColor: ['#2e59d9', '#17a673'],
		      hoverBorderColor: "rgba(234, 236, 244, 1)",
		    }],
		  },
		  options: {
		    maintainAspectRatio: false,
		    tooltips: {
		      backgroundColor: "rgb(255,255,255)",
		      bodyFontColor: "#858796",
		      borderColor: '#dddfeb',
		      borderWidth: 1,
		      xPadding: 15,
		      yPadding: 15,
		      displayColors: false,
		      caretPadding: 10,
		    },
		    legend: {
		      display: false
		    },
		    cutoutPercentage: 80,
		  },
		});
}

function setDashBoard(rcount, fcount, alltime) {
					
		if (rcount == 0 && fcount == 0) {			
			rcount = 1;
			fcount = 1;
		}
								
		// Set new default font family and font color to mimic Bootstrap's default styling
		Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
		Chart.defaults.global.defaultFontColor = '#858796';

		// Pie Chart Example
		var ctx = document.getElementById("myPieChart");
		var myPieChart = new Chart(ctx, {
		  type: 'doughnut',
		  data: {
		    labels: [LANG_JSON_DATA[langset]["r_count_label"], LANG_JSON_DATA[langset]["f_count_label"]],
		    datasets: [{
		      data: [rcount, fcount],
		      backgroundColor: ['#4e73df', '#1cc88a'],
		      hoverBackgroundColor: ['#2e59d9', '#17a673'],
		      hoverBorderColor: "rgba(234, 236, 244, 1)",
		    }],
		  },
		  options: {
		    maintainAspectRatio: false,
		    tooltips: {
		      backgroundColor: "rgb(255,255,255)",
		      bodyFontColor: "#858796",
		      borderColor: '#dddfeb',
		      borderWidth: 1,
		      xPadding: 15,
		      yPadding: 15,
		      displayColors: false,
		      caretPadding: 10,
		    },
		    legend: {
		      display: false
		    },
		    cutoutPercentage: 80,
		  },
		});
		
		const coptions = {
			duration: 5,
		};
		
		var rlabel = new CountUp('r_count_label_time', rcount, coptions);
		if (!rlabel.error) {
			rlabel.start();
		} else {
			console.error(rlabel.error);
		}
		
		var rlabel = new CountUp('f_count_label_time', fcount, coptions);
		if (!rlabel.error) {
			rlabel.start();
		} else {
			console.error(rlabel.error);
		}
		
		var mmin = (alltime / 1000) / 60;
		
		var alabel = new CountUp('a_time_label_time', mmin, coptions);
		if (!alabel.error) {
			alabel.start();
		} else {
			console.error(alabel.error);
		}
		/*
		$("#r_count_label_time").text(rcount);
		$("#f_count_label_time").text(fcount);
		$("#a_time_label_time").text(alltime);
		*/
}


function drawLineGraph() {
	var ctx2 = document.getElementById('lineGraph').getContext('2d');
   		var linedataSet = {
   			datasets: [
          {
              label: LANG_JSON_DATA[langset]['altitude_msg'],
              borderColor: '#f00',
              backgroundColor: '#f66',
              data: lineGraphData
         }
      	]};

  document.getElementById("lineGraph").onclick = function(evt){

  	GATAGM('LINEGRAPH', 'CONTENT', langset);

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

function setYawStatus(yaw) {
		if (!isSet(yaw)) return;
		if (!isSet($('#yawStatus'))) return;
		var yawStatus = document.getElementById('yawStatus');
		if (!isSet(yawStatus)) return;

		yaw = yaw * 1;
		var degree = yaw < 0 ? (360 + yaw) : yaw;
		yaw = Math.PI/180 * yaw;

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
		if (!isSet(pitch)) return;
		if (!isSet($('#pitchStatus'))) return;
		var pitchStatus = document.getElementById('pitchStatus');
		if (!isSet(pitchStatus)) return;

		pitch = pitch * 1;		
		var degree = pitch < 0 ? (360 + pitch) : pitch;
		degree = Math.PI/180 * degree;

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
		if (!isSet(roll)) return;
		if (!isSet($('#rollCanvas'))) return;
		var canvas = document.getElementById('rollCanvas');
		if (!isSet(canvas)) return;

		roll = roll * 1;
		var degrees = 180 + roll;
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
    
    roll = roll.toFixed(3);
    $('#rollText').text(roll);
}

function initSliderForDesign(i) {

	$('#slider').slider({
					min : 0,
					max : i - 1,
					value : 0,
					step : 1,
					slide : function( event, ui ){

						GATAGM('slider', 'CONTENT', langset);

            if (flightRecDataArray.length <= 0) {
							return;
						}

						var d = flightRecDataArray[ui.value];

						setDataToDesignTableWithFlightRecord(ui.value);

						setMoveActionFromSliderOnMove(ui.value, d);
					}
	});

	$('#goItemBtn').click(function() {

			GATAGM('goItemBtn', 'CONTENT', langset);

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
      showAlert(LANG_JSON_DATA[langset]['msg_no_mission']);
      hideLoader();
    }
  }, function(request,status,error) {

    monitor(LANG_JSON_DATA[langset]['msg_error_sorry']);
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
      showAlert(LANG_JSON_DATA[langset]['msg_no_flight_record']);
      hideLoader();
    }
  }, function(request,status,error) {

    monitor(LANG_JSON_DATA[langset]['msg_error_sorry']);
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


  moveToPositionOnMap(flightRecDataArray[0].lat, flightRecDataArray[0].lng, flightRecDataArray[0].alt, flightRecDataArray[0].yaw, flightRecDataArray[0].roll, flightRecDataArray[0].pitch);
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


function startMon() {
  if (bMonStarted == true) {
    bMonStarted = false;
    $('#btnStartMon').text("Start monitoring");
    $("#btnStartMon").removeClass("btn-warning").addClass("btn-primary");
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
      $('#btnStartMon').text("Stop monitoring");
      $("#btnStartMon").removeClass("btn-primary").addClass("btn-warning");
      nexttour(r.data[0]);
    }
    else {
      showAlert(LANG_JSON_DATA[langset]['msg_failed_to_get_position']);
    }
  }, function(request,status,error) {
    showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
  });
}

function askToken() {
  var useremail = getCookie("user_email");
  var usertoken = getCookie("user_token");
  var userid = getCookie("dev_user_id");
  if (isSet(useremail) == false || isSet(userid) == false || isSet(usertoken) == false)
    return false;

  $("#email_field").text(useremail);
  $("#droneplaytoken_view").val(usertoken);

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
        	$('#btnForGetMissionList').text(LANG_JSON_DATA[langset]['msg_load_more']);
        	hasMore = r.morekey;
        }
        else {
        	$('#btnForGetMissionList').hide(1500);
        	hasMore = null;
        }
      }
      else {
				if (r.reason == "no data") {
					showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
				}
				else {
				  showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
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
					showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
				}
				else {
				 	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
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

function moveToPositionOnMap(lat, lng, alt, yaw, roll, pitch, bDirect) {  
  setRollStatus(roll);
  setYawStatus(yaw);
  setPitchStatus(pitch);
  move3DmapIcon(lat, lng, alt, pitch, yaw, roll);
  
  if (bDirect == true)
  	flyDirectTo(lat, lng, alt, yaw);
  else
  	flyTo(lat, lng, yaw, function() {});
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
		GATAGM('removeItemBtn', 'CONTENT', langset);
		removeFlightData(index);
		removeIconOnMap(index);
	});

	$('#saveItemBtn').off('click');
	$('#saveItemBtn').click(function(){
		GATAGM('saveItemBtn', 'CONTENT', langset);
		saveFlightData(index);
	});
}

function saveFlightData(index) {
	if (flightRecDataArray.length <= 0) {
		var lng = $('#lngdata_index').val();
		var lat = $('#latdata_index').val();
		appendNewRecord([lng * 1, lat * 1]);		
		flyDirectTo(lat * 1, lng * 1, parseFloat($('#altdata_index').val()), $('#yawdata_index').val());
	}

	flightRecDataArray[index].lat = parseFloat($('#latdata_index').val());
	flightRecDataArray[index].lng = parseFloat($('#lngdata_index').val());
	flightRecDataArray[index].alt = parseFloat($('#altdata_index').val());
	flightRecDataArray[index].yaw = parseFloat($('#yawdata_index').val());
	flightRecDataArray[index].roll = parseFloat($('#rolldata_index').val());
	flightRecDataArray[index].pitch = parseFloat($('#pitchdata_index').val());
	flightRecDataArray[index].speed = parseFloat($('#speeddata_index').val());
	flightRecDataArray[index].act = parseInt($('#actiondata_index').val());
	flightRecDataArray[index].actparam = parseFloat($('#actionparam_index').val());
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

	moveToPositionOnMap(flightRecDataArray[newIndex].lat,
						flightRecDataArray[newIndex].lng,
						flightRecDataArray[newIndex].yaw,
						flightRecDataArray[newIndex].alt,
						flightRecDataArray[newIndex].roll,
						flightRecDataArray[newIndex].pitch, false);
}

function appendMissionList(data) {
    if (data == null) return;
    if (data.length == 0) return;
    data.forEach(function (item, index, array) {
        var appendRow = "<tr class='odd gradeX' id='mission_row_" + index + "'><td class='center'>"
        + "<a href='./monitor.html?mission_name=" + item['name'] + "' class='font-weight-bold mb-1'>"
        + item['name']
        + "</a></td><td class='center'> - </td><td class='center text-xs font-weight-bold mb-1'>"
        + item['regtime']
        + "</td><td class='center text-xs font-weight-bold mb-1'>"
        + "<a class='btn btn-warning text-xs' href='design.html?mission_name=" + item['name'] + "' role='button'>" + LANG_JSON_DATA[langset]['msg_modify'] + "</a>&nbsp;"
        + "<button class='btn btn-primary text-xs' type='button' id='missionListBtnForRemove_" + index + "'>"
        + LANG_JSON_DATA[langset]['msg_remove'] + "</button></td></tr>";
        $('#dataTable-missions > tbody:last').append(appendRow);

        $('#missionListBtnForRemove_' + index).click(function() {
        	GATAGM('missionListBtnForRemove_' + index, 'CONTENT', langset);
        	askRemoveMissionItem(item['name'], "mission_row_" + index);
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
        flyTo(r['results'][0].geometry.location.lat,r['results'][0].geometry.location.lng, 0, function() {});
      //}
    }, function(request,status,error) {
      showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
    });
}

var tableCount = 0;

function askClearCurrentDesign() {
	showAskDialog(
				LANG_JSON_DATA[langset]['modal_title'],
				LANG_JSON_DATA[langset]['msg_are_you_sure'],
				LANG_JSON_DATA[langset]['btnForClearMission'],
				function() {clearCurrentDesign();}
			);
}

function clearCurrentDesign() {
		if(isSet(lineSource))
    	lineSource.clear();

    pointSource.clear();
    posSource.clear();
    flightRecDataArray = Array();
    $("#dataTable-points").hide();
}


function searchMission(keyword) {
	if (isSet(keyword) == false) {
		showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
		return;
	}

  var userid = getCookie("dev_user_id");
  var jdata = {"action" : "mission", "daction" : "find_mission", "keyword" : keyword, "clientid" : userid};

	hasMore = "";

  ajaxRequest(jdata, function (r) {
    if(r.result == "success") {

			$('#dataTable-missions tbody').empty();
			tableCount = 0;

      appendMissionList(r.data);

      if (r.morekey) {
      	$('#btnForGetMissionList').text(LANG_JSON_DATA[langset]['msg_load_more']);
      	hasMore = r.morekey;
      }
      else {
      	$('#btnForGetMissionList').hide(1500);
      	hasMore = null;
      }
    }
    else {
			if (r.reason == "no data") {
				showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
			}
			else {
			  showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
			}
    }
  }, function(request,status,error) {
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function searchFlightRecord(keyword) {
	if (isSet(keyword) == false) {
		showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
		return;
	}

	var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "find_record", "keyword" : keyword, "clientid" : userid};

  hasMore = "";

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result == "success") {
      if (r.data == null || r.data.length == 0) {
        showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
        return;
      }

      if (r.morekey) {
      	hasMore = r.morekey;
      	$('#btnForLoadFlightList').text(LANG_JSON_DATA[langset]['msg_load_more']);
      }
      else {
      	hasMore = null;
      	$('#btnForLoadFlightList').hide(1500);
      }

			$('#historyMap').show();

			flightRecArray = [];
			$('#dataTable-Flight_list tbody').empty();
			tableCount = 0;
      setFlightlistHistory(r.data);
    }
    else {
    	if (r.reason == "no data") {
    		showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
    	}
    	else {
	    	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
	    }
    }
  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
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
        showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
        return;
      }

      if (r.morekey) {
      	hasMore = r.morekey;
      	$('#btnForLoadFlightList').text(LANG_JSON_DATA[langset]['msg_load_more']);
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
    		showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
    	}
    	else {
	    	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
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
      showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
    }
    else {

    	var fdata = r.data;

    	moviePlayerVisible = false;

    	if ("memo" in fdata) {
    		 $("#memoTextarea").val(fdata.memo);
    	}

    	$("#flightMemoBtn").click(function() {
    			GATAGM('flightMemoBtn', 'CONTENT', langset);
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

  var appendRow = "<tr class='odd gradeX' id='flight-list-" + tableCount + "'><td width='10%' class='text-xs font-weight-bold mb-1' bgcolor='#fff'>" + (tableCount + 1) + "</td>";
  appendRow = appendRow + "<td class='center' bgcolor='#eee'><a onclick='GATAGM(\"flight_list_title_click_" + name + "\", \"CONTENT\", \"" + langset + "\");' href='flight_view_detail.html?record_name=" + name + "'>" + name + "</a>";

  if (isSet(flat)) {
  		appendRow = appendRow + "<br><div id='map_" + tableCount + "' style='height:100px;' class='panel panel-primary'></div><br><a href='#' class='text-xs' id='map_address_" + tableCount + "'></a>";
  }

  appendRow = appendRow + "<br><div class='form-group'><textarea class='form-control' id='memoTextarea_" + tableCount + "' rows='3'>";

  if (isSet(memo)) {
  	 appendRow = appendRow + memo;
  }

  appendRow = appendRow + "</textarea>";
  appendRow = appendRow + "<br><button class='btn btn-primary text-xs' type='button' id='btnForUpdateMemo_" + tableCount + "'>" + LANG_JSON_DATA[langset]['msg_modify_memo'] + "</button></div></td>";
  appendRow = appendRow + "<td width='30%' class='center text-xs font-weight-bold mb-1' bgcolor='#fff'> " + dtimestamp + "</td>"
      + "<td width='20%' bgcolor='#fff'>"
      + "<button class='btn btn-primary text-xs' type='button' id='btnForRemoveFlightData_" + tableCount + "'>" + LANG_JSON_DATA[langset]['msg_remove'] +  "</button></td>"
      + "</tr>";

  $('#dataTable-Flight_list > tbody:last').append(appendRow);

  var curIndex = tableCount;

  $('#map_address_' + curIndex).click(function () {
  	GATAGM('map_address_' + curIndex, 'CONTENT', langset);
  	moveFlightHistoryMap(flat,flng);
  });

  $('#btnForRemoveFlightData_' + curIndex).click(function () {
  	GATAGM('btnForRemoveFlightData_' + curIndex, 'CONTENT', langset);
  	askDeleteFlightData(name, curIndex);
  });

  $('#btnForUpdateMemo_' + curIndex).click(function () {
  	GATAGM('btnForUpdateMemo_' + curIndex, 'CONTENT', langset);
  	updateFlightMemo(curIndex);
  });

	var retSource;
	if (isSet(flat)) {
  	retSource = makeForFlightListMap(curIndex, flat, flng);
  }

  if (isSet(address) && address != "") {
  	setAddressAndCada("#map_address_" + curIndex, address, cada, retSource);
  	setAddressAndCada("#map_address_" + curIndex, address, cada, flightHistorySource);
  }
  else {
  	if (isSet(flat)) {
			var dpoint = ol.proj.fromLonLat([flng, flat]);
    	drawCadastral("#map_address_" + curIndex, name, dpoint[0], dpoint[1], retSource);
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
		showAlert(LANG_JSON_DATA[langset]['msg_fill_memo']);
		return;
	}
  var jdata = {"action": "position", "daction": "set_memo", "clientid" : userid, "name" : name, "memo" : memo};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result != "success") {
      showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
    }
    else {
      showAlert(LANG_JSON_DATA[langset]['msg_success']);
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
		showAlert(LANG_JSON_DATA[langset]['msg_fill_memo']);
		return;
	}
  var jdata = {"action": "position", "daction": "set_memo", "clientid" : userid, "name" : item.name, "memo" : memo};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result != "success") {
      showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
    }
    else {
      showAlert(LANG_JSON_DATA[langset]['msg_success']);
    }
  }, function(request,status,error) {
    hideLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function askDeleteFlightData(name, index) {
	showAskDialog(
				LANG_JSON_DATA[langset]['modal_title'],
				name + " : " + LANG_JSON_DATA[langset]['msg_are_you_sure'],
				LANG_JSON_DATA[langset]['msg_remove'],
				function() {deleteFlightData(name, index);}
			);
}

function deleteFlightData(name, index) {

  var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "delete", "clientid" : userid, "name" : name};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result != "success") {
      showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
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

function askRemoveMissionItem(name, trname) {
	showAskDialog(
				LANG_JSON_DATA[langset]['modal_title'],
				name + " : " + LANG_JSON_DATA[langset]['msg_are_you_sure'],
				LANG_JSON_DATA[langset]['msg_remove'],
				function() {removeMissionItem(name, trname);}
			);
}
function removeMissionItem(name, trname) {
    var userid = getCookie("dev_user_id");
    var jdata = {"action": "mission","mname" : name, "daction" : "delete", "clientid" : userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        $("#" + trname).remove();
      }
      else {
      	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
      }
    }, function(request,status,error) {});
}

function monitor(msg) {
  var info = $('#monitor').html("<font color=red><b>" + msg + "</b></font>");
}

function registMission() {
    var mname = prompt(LANG_JSON_DATA[langset]['msg_input_mission_name'], "");

    if (!isSet(mname)) {
        showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
        return;
    }

    var mspeed = prompt(LANG_JSON_DATA[langset]['msg_input_speed'], "");

    if (!isSet(mspeed) || parseFloat(mspeed) <= 0.0) {
        showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
        return;
    }


    if (flightRecDataArray.length <= 0) {
      showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
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
          monitor(LANG_JSON_DATA[langset]['msg_error_index_pre'] + (index) + LANG_JSON_DATA[langset]['msg_error_index_post']);
          bError++;
          return;
        }

			var mid = "mid-" + index;
      nPositions.push({id:mid, lat:item.lat, lng:item.lng, alt:item.alt, act:item.act, actparam:item.actparam, speed:item.speed, roll:item.roll, pitch:item.pitch, yaw:item.yaw});
    }

    if (bError > 0) {
      showAlert(LANG_JSON_DATA[langset]['msg_error_check']);
      return;
    }

    var userid = getCookie("dev_user_id");
    var jdata = {"action": "mission","mname" : mname, "daction" : "set", "missionspeed": mspeed, "missiondata" : nPositions, "clientid" : userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        showAlert(LANG_JSON_DATA[langset]['msg_success']);
      }
      else {
      	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
      }
    }, function(request,status,error) {});
}


function setUploadData() {
      $("#uploadBtn").click(function() {
      		GATAGM('uploadBtn', 'CONTENT', langset);

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
  		GATAGM('map', 'CONTENT', langset);

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
				showCurrentInfo([lonlat[0], lonlat[1]], '0');

  });

  posSource = new ol.source.Vector({
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
  	GATAGM('chartArea', 'CONTENT', langset);

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
      
      draw3dMap();
      
      var item = chartLocData[0];
      flyDirectTo(item.lat * 1, item.lng * 1, item.alt, item.yaw);      
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
  goIndex("logout");
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


function computeCirclularFlight(start) {
  var property = new Cesium.SampledPositionProperty();  
            
  var i = 0;
  chartLocData.forEach(function (item) {      	      	      	
    var time = Cesium.JulianDate.addSeconds(
      start,
      i,
      new Cesium.JulianDate()
    );
    var position = Cesium.Cartesian3.fromDegrees(
      item.lng,
      item.lat,
      item.alt
    );
    property.addSample(time, position);

		//Also create a point for each sample we generate.
    viewer.entities.add({
      position: position,
      point: {
        pixelSize: 2,
        color: Cesium.Color.TRANSPARENT,
        outlineColor: Cesium.Color.RED,
        outlineWidth: 1,
      },
    });
    
    i++;
  });                

  return property;
}

var hpRoll = new Cesium.HeadingPitchRoll();
var hpRange = new Cesium.HeadingPitchRange();
var fixedFrameTransform;
var planePrimitive;
var viewer;
var c_center = new Cesium.Cartesian3();

function getColor(colorName, alpha) {
  var color = Cesium.Color[colorName.toUpperCase()];
  return Cesium.Color.fromAlpha(color, parseFloat(alpha));
}

function draw3dMap() {	
	Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMjRmOWRiNy1hMTgzLTQzNTItOWNlOS1lYjdmZDYxZWFkYmQiLCJpZCI6MzM1MTUsImlhdCI6MTU5ODg0NDIxMH0.EiuUUUoakHeGjRsUoLkAyNfQw0zXCk6Wlij2z9qh7m0';  
  viewer = new Cesium.Viewer("main3dMap", {
	  infoBox: false, //Disable InfoBox widget
	  selectionIndicator: false, //Disable selection indicator
	  shouldAnimate: false, // Enable animations
	  baseLayerPicker : false,
	  timeline : false,
	  animation : false,
	  clock : false,
	  fullscreenButton : false,
	  geocoder : false,
	  homeButton : false,	  
	  navigationHelpButton : false,
	  navigationInstructionsInitiallyVisible : false,
	  automaticallyTrackDataSourceClocks : false,
	  orderIndependentTranslucency : false,
	  terrainProvider: Cesium.createWorldTerrain(),
	});
					
	viewer.scene.globe.enableLighting = false;	
	viewer.scene.globe.depthTestAgainstTerrain = true;	
	Cesium.Math.setRandomNumberSeed(3);
	
	var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
	var stop = Cesium.JulianDate.addSeconds(
	  start,
	  360,
	  new Cesium.JulianDate()
	);
		
	var position = computeCirclularFlight(start);

	//Actually create the entity
	var entity = viewer.entities.add({		  
		  //Use our computed positions
		  position: position,		
		  //Automatically compute orientation based on position movement.
		  orientation: new Cesium.VelocityOrientationProperty(position),				  		
		  //Show the path as a pink line sampled in 1 second increments.
		  path: {
		    resolution: 1,
		    material: new Cesium.PolylineGlowMaterialProperty({
		      glowPower: 0.1,
		      color: Cesium.Color.RED,
		    }),
		    width: 10,
		  }
	});
	
	var position = Cesium.Cartesian3.fromDegrees(
	  chartLocData[0].lng, chartLocData[0].lat, chartLocData[0].alt
	);
	var speedVector = new Cesium.Cartesian3();
	fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator(
	  "north",
	  "west"
	);
	var camera = viewer.camera;
	var scene = viewer.scene;
	var controller = scene.screenSpaceCameraController;
			
	planePrimitive = scene.primitives.add(
	  Cesium.Model.fromGltf({
	    url: "https://pilot.duni.io/center/imgs/Cesium_Air.glb",
	    color: getColor("GREEN", 0.9),
	    modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
	      position,
	      hpRoll,
	      Cesium.Ellipsoid.WGS84,
	      fixedFrameTransform	      	      
	    ),
	    scale: 0.3,
	    minimumPixelSize: 64,
	  })
	);
		
	viewer.trackedEntity = undefined;
	  viewer.zoomTo(
	    viewer.entities,
	    new Cesium.HeadingPitchRange(
	      Cesium.Math.toRadians(-90),
	      Cesium.Math.toRadians(-15),
	      1000
	    )
	  );	
	  
	 planePrimitive.readyPromise.then(function (model) {
	  // Play and loop all animations at half-speed
	  model.activeAnimations.addAll({
	    multiplier: 0.5,
	    loop: Cesium.ModelAnimationLoop.REPEAT,
	  });
	
	  // Zoom to model
	  var r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
	  controller.minimumZoomDistance = r * 0.5;
	  Cesium.Matrix4.multiplyByPoint(
	    model.modelMatrix,
	    model.boundingSphere.center,
	    c_center
	  );
	  var heading = Cesium.Math.toRadians(230.0);
	  var pitch = Cesium.Math.toRadians(-20.0);
	  hpRange.heading = heading;
	  hpRange.pitch = pitch;
	  hpRange.range = r * 50.0;
	  camera.lookAt(c_center, hpRange);
	});
	  
}

function move3DmapIcon(lat, lng, alt, pitch, yaw, roll) {
	 var position = Cesium.Cartesian3.fromDegrees(
      lng,
      lat,
      alt
    );
  
  
  yaw = yaw * 1;
	yaw = yaw < 0 ? (360 + yaw) : yaw;
	yaw = Math.PI/180 * yaw;
	
	pitch = pitch * 1;
	pitch = pitch < 0 ? (360 + pitch) : pitch;
	pitch = Math.PI/180 * pitch;
	
	roll = roll * 1;
	roll = roll < 0 ? (360 + roll) : roll;
	roll = Math.PI/180 * roll;
  
  hpRoll.pitch = pitch;
  hpRoll.heading = yaw;
  hpRoll.roll = roll;
    
	Cesium.Transforms.headingPitchRollToFixedFrame(
    position,
    hpRoll,
    Cesium.Ellipsoid.WGS84,
    fixedFrameTransform,
    planePrimitive.modelMatrix
  );
  
  //viewer.camera.flyTo({
      //destination: position
    //});
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

  pointSource.on('tileloadend', function () {

	});

	pointSource.on('tileloaderror', function () {
	  showAlert(LANG_JSON_DATA[langset]['msg_failed_to_load_map_sorry']);
	});

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

  map = new ol.Map({
      target: 'mainMap',
      controls: ol.control.defaults().extend([
            scaleLineControl
          ]),
      layers: maplayers,
      // Improve user experience by loading tiles while animating. Will make
      // animations stutter on mobile or slow devices.
      loadTilesWhileAnimating: true,
      view: current_view
    });
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

function flyDirectTo(lat, lng, alt, yaw) {
		var location = ol.proj.fromLonLat([lng * 1, lat * 1]);
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

function flyTo(lat, lng, yaw, done) {
	  var location = ol.proj.fromLonLat([lng * 1, lat * 1]);	  
    flyTo(location, yaw, done);
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
  flyTo(r.lat * 1, r.lng * 1, r.yaw, function() {});

  setTimeout(function() {
            if (bMonStarted == false) return;
            nextMon();
  }, 2500);
}

function uploadDUNIFlightList() {
	var files = document.getElementById('dunufile').files;
  if (files.length > 0) {
  	var mname = prompt(LANG_JSON_DATA[langset]['msg_input_record_name'], "");

	  if (!isSet(mname)) {
	      showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
	      return;
	  }

	  showLoader();
    getBase64(files[0], mname, uploadDUNIFlightListCallback);
  }
  else {
  	showAlert(LANG_JSON_DATA[langset]['msg_select_file']);
  	return;
  }
}


function uploadFlightList() {
	var files = document.getElementById('file').files;
  if (files.length > 0) {
  	var mname = prompt(LANG_JSON_DATA[langset]['msg_input_record_name'], "");

	  if (!isSet(mname)) {
	      showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
	      return;
	  }

	  showLoader();
    getBase64(files[0], mname, uploadFlightListCallback);
  }
  else {
  	showAlert(LANG_JSON_DATA[langset]['msg_select_file']);
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

function uploadDUNIFlightListCallback(mname, base64file) {
		var userid = getCookie("dev_user_id");
    var jdata = {"action" : "position", "daction" : "duni_file_upload", "clientid" : userid, "name" : mname, "recordfile" : base64file};

    ajaxRequest(jdata, function (r) {
    	hideLoader();

      if(r.result == "success") {
        $('#btnForUploadDUNIFlightList').hide(1500);
        $('#dunifileform').hide(1500);
        alert(LANG_JSON_DATA[langset]['msg_success']);
        location.href = "flight_view.html";
      }
      else {
      	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry'] + " (" + r.reason + ")");
      }
    }, function(request,status,error) {
    	hideLoader();
      monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
    });
}

function uploadFlightListCallback(mname, base64file) {
		var userid = getCookie("dev_user_id");
    var jdata = {"action" : "position", "daction" : "convert", "clientid" : userid, "name" : mname, "recordfile" : base64file};

    ajaxRequest(jdata, function (r) {
    	hideLoader();

      if(r.result == "success") {
        $('#btnForUploadFlightList').hide(1500);
        $('#djifileform').hide(1500);
        alert(LANG_JSON_DATA[langset]['msg_success']);
        location.href = "flight_view.html";
      }
      else {
      	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry'] + " (" + r.reason + ")");
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
	moveToPositionOnMap(item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch, true);
}

function setMoveActionFromScatterChart(index, item) {
	openLineTip(window.myLine, 0, index);

	if ("dsec" in item) {
    movieSeekTo(item.dsec);
  }

  setSliderPos(index);
  showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
  moveToPositionOnMap(item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch, true);
}

function setMoveActionFromLineChart(index, item) {
	openScatterTip(window.myScatter, 0, index);

  if ("dsec" in item) {
    movieSeekTo(item.dsec);
  }

  setSliderPos(index);
  showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
  moveToPositionOnMap(item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch, true);
}

function setMoveActionFromSliderOnMove(index, item) {
	$('#sliderText').html( index );

	showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
	moveToPositionOnMap(item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch, true);
}

function setMoveActionFromSliderOnStop(index, item) {
	openScatterTip(window.myScatter, 0, index);
  openLineTip(window.myLine, 0, index);
	$('#sliderText').html( index );

  if ("dsec" in item) {
    movieSeekTo(item.dsec);
  }

	showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
	moveToPositionOnMap(item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch, true);
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


function setDromilist(data) {
  if (data == null || data.length == 0)
    return;

  data.forEach(function(item) {
    appendFlightRecordListTableForDromi(item.dname, item.dtime, item.data);
    dromiDataArray.push(item);
  });
}

function appendFlightRecordListTableForDromi(name, dtimestamp, data) {
  var appendRow = "<tr class='odd gradeX' id='dromi-list-" + tableCount + "'><td width='10%' class='text-xs font-weight-bold mb-1'>" + (tableCount + 1) + "</td>"
      + "<td class='center' bgcolor='#eee'><a href='javascript:showDataForDromi(" + tableCount + ");'>"
      + name + "</a></td><td width='30%' class='center'> " + dtimestamp + "</td>"
      + "<td width='20%' bgcolor='#fff'>"
      + "<button class='btn btn-primary' type='button' id='btnForDeleteDromiData_" + tableCount + "'>" + LANG_JSON_DATA[langset]['msg_remove'] + "</button></td>"
      + "</tr>";
  $('#dataTable-lists > tbody:last').append(appendRow);

  var curIndex = tableCount;

  $('#btnForDeleteDromiData_' + curIndex).click(function() {
  	GATAGM('btnForDeleteDromiData_' + curIndex, 'CONTENT', langset);
  	askDeleteDromiData(name, curIndex);
  });

  tableCount++;
}

function askDeleteDromiData(name, index) {
		showAskDialog(
				LANG_JSON_DATA[langset]['modal_title'],
				name + " : " + LANG_JSON_DATA[langset]['msg_are_you_sure'],
				LANG_JSON_DATA[langset]['btnForClearMission'],
				function() {deleteDromiData(name, index);}
			);
}

function deleteDromiData(name, index) {
  var userid = getCookie("dev_user_id");
  var jdata = {"action": "dromi", "daction": "delete", "clientid" : userid, "name" : name};

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
	$('#modifyBtnForMovieData').text(LANG_JSON_DATA[langset]['msg_modify_youtube_data']);

	$('#modifyBtnForMovieData').off('click');
	$('#modifyBtnForMovieData').click(function(){
		GATAGM('modifyBtnForMovieData_show', 'CONTENT', langset);
		showMovieDataSet();
	});

}

function showMovieDataSet() {
	$('#movieDataSet').show();
	$('#modifyBtnForMovieData').text(LANG_JSON_DATA[langset]['msg_close_youtube_data']);

	$('#modifyBtnForMovieData').off('click');
	$('#modifyBtnForMovieData').click(function(){
		GATAGM('modifyBtnForMovieData_hide', 'CONTENT', langset);
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
		$("#movieData").val("https://youtube.com/watch?v=" + data_id);
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

	$("#movieData").val(d_id);
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
        height: '400',
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
			      showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
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
      + "<button class='btn btn-primary' type='button' id='btnForDeleteFlightDataForDromi_" + tableCount + "'>" + LANG_JSON_DATA[langset]['msg_remove'] + "</button></td>"
      + "</tr>";
  $('#dataTable-Flight_list > tbody:last').append(appendRow);

  var curIndex = tableCount;

  $('#btnForDeleteFlightDataForDromi_' + curIndex).click(function () {
  	GATAGM('btnForDeleteFlightDataForDromi_' + curIndex, 'CONTENT', langset);
  	askDeleteFlightDataForDromis(name, curIndex);
  });

  tableCount++;
}

function askDeleteFlightDataForDromis(name, index) {
	showAskDialog(
				LANG_JSON_DATA[langset]['modal_title'],
				name + " : " + LANG_JSON_DATA[langset]['msg_are_you_sure'],
				LANG_JSON_DATA[langset]['msg_remove'],
				function() {deleteFlightDataForDromis(name, index);}
			);
}

function deleteFlightDataForDromis(index) {
  var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "delete", "clientid" : userid, "name" : name};

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
        name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
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
