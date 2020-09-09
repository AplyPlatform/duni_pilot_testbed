
var current_view;
var current_pos;
var current_pos_image;

var map;

var posSource;
var pointSource;

var lineSource;

var flightHistorySource;
var flightHistoryView;

var lineLayerForGlobal;
var posLayerForGlobal;

var pos_icon_image = '../center/js/imgs/position3.png';


var flightRecDataArray;
var posIcons = new Array();
var chartLocData = new Array();
var lineGraphData = new Array();
var lineData = new Array();

var tableCount = 0;

var langset = "KR";

$(function() {
	setCommonText();
  initPilotPlugin();
  mixpanel.identify("anonymous");
});


function setCommonText() {
	$("#r_count_label").text(LANG_JSON_DATA[langset]["r_count_label"]);	
	$("#a_time_label").text(LANG_JSON_DATA[langset]["a_time_label"]);
	$("#a_time_min_label").text(LANG_JSON_DATA[langset]["a_time_min_label"]);
}


function initPilotPlugin() {
	flightRecDataArray = [];

	showLoader();
    
	flightHistoryMapInit();
  flightViewInit(); 
  
  getProfile();
}


function flightViewInit() {
	document.title = LANG_JSON_DATA[langset]['page_flight_rec_view_title'];
	$("#head_title").text(document.title);	    
}


function flightHistoryMapInit() {
	var dpoint = ol.proj.fromLonLat([0, 0]);

  flightHistoryView = new ol.View({
      center: dpoint,
      zoom: 4
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

function getProfile() {
	
	var pluginid = location.search.split('pluginid=')[1];
  if (pluginid == null || pluginid == "") {
  	hideLoader();
  	//todo showErrorMsg  	
    return;
  }
	
  var jdata = {"action" : "plugin", "pluginid" : pluginid};

  showLoader();
  ajaxRequest(jdata, function (r) {
    if(r.result == "success") {
      hideLoader();
      //setChart(r);
		  setDashBoard(r);
		  setMap(r);
    }
    else {    	
      hideLoader();
      //todo showErrorMsg  	
    }
  }, function(request,status,error) {
    hideLoader();
    //todo showErrorMsg  	
  });
}

function makeForFlightListMap(index, flat, flng) {
	var dpoint = ol.proj.fromLonLat([flng, flat]);
  var icon = createNewIcon(index, {lat:flat, lng:flng, alt:0});    
  flightHistorySource.addFeature(icon);  
}

function setMap(r) {
	r.locations.forEach(function(val, index, array) {
		makeForFlightListMap(index, val.flat, val.flng);
	});
	
	if (r.locations.length > 0) {
		moveFlightHistoryMap(r.locations[0].flat, r.locations[0].flng);
	}
}

function setDashBoard(r) {
	var rcount = r.record_count;
	var mcount = 0;
	var alltime = r.alltime;
				
	const coptions = {
			duration: 5,
	};
	
	var rlabel = new CountUp('r_count_label_time', rcount, coptions);
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
}

function setChart(r) {
	
		var rcount = r.record_count;
		var mcount = 0;
		var alltime = r.alltime;
					
		if (rcount == 0 && mcount == 0) {			
			rcount = 1;
			mcount = 1;
		}
								
		// Set new default font family and font color to mimic Bootstrap's default styling
		Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
		Chart.defaults.global.defaultFontColor = '#858796';

		// Pie Chart Example
		var ctx = document.getElementById("myPieChart");
		var myPieChart = new Chart(ctx, {
		  type: 'doughnut',
		  data: {
		    labels: [LANG_JSON_DATA[langset]["r_count_label"], ""],
		    datasets: [{
		      data: [rcount, mcount],
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

function createNewIcon(i, item) {
	var pos_icon = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
          name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
          mindex : i
      });

  pos_icon.setStyle(styleFunction(i + ""));

  return pos_icon;
}

function isSet(value) {
  if (value == "" || value == null || value == "undefined") return false;

  return true;
}


function moveFlightHistoryMap(lat, lng) {
	var npos = ol.proj.fromLonLat([lng * 1, lat * 1]);
	flightHistoryView.setCenter(npos);
}

function ajaxRequest(data, callback, errorcallback) {
    $.ajax({url : "https://api.droneplay.io/v1/",
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


function styleFunction(textMsg) {
  return [
    new ol.style.Style(
    	{
	      image: new ol.style.Icon(({
	      	opacity: 0.55,
	        crossOrigin: 'anonymous',
	        scale: 2.0,
	        src: pos_icon_image
	      	}))	      	      
    	})
  ];
}

function showLoader() {
  $("#loading").show();
}

function hideLoader() {
  $("#loading").fadeOut(800);
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
