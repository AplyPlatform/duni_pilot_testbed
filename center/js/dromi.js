
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

function dromiInit() {
  $("#chartView").hide();
  setUploadData();
  hideDromiLoader();
}

function dromiListInit() {
  $("#chartView").hide();
  $("#googlePhotoPlayer").hide();
  $("#youTubePlayer").hide();
  $("#movieDataSet").hide();
  
  hideDromiLoader();
}

function setDromilist(data) {
  if (data == null || data.length == 0)
    return;

  data.forEach(function(item) {
    appendListTable(item.dname, item.dtime, item.data);
    dromiDataArray.push(item);
  });
}

function appendListTable(name, dtimestamp, data) {
  var appendRow = "<tr class='odd gradeX' id='dromi-list-" + tableCount + "'><td width='10%'>" + (tableCount + 1) + "</td>"
      + "<td class='center' bgcolor='#eee'><a href='javascript:showData(" + tableCount + ");'>"
      + name + "</a></td><td width='30%' class='center'> " + dtimestamp + "</td>"
      + "<td width='20%' bgcolor='#fff'>"
      + "<button class='btn btn-primary' type='button' onClick='deleteData(" + tableCount + ");'>삭제</button></td>"
      + "</tr>";
  $('#dataTable-lists > tbody:last').append(appendRow);
  tableCount++;
}

function deleteData(index) {
  if (dromiDataArray.length == 0) return;
  var item = dromiDataArray[index];

  if (confirm('정말로 ' + item.dname + ' 데이터를 삭제하시겠습니까?')) {
  } else {
    return;
  }

  var userid = getCookie("dev_user_id");
  var jdata = {"action": "dromi", "daction": "delete", "clientid" : userid, "name" : item.dname};

  showDromiLoader();
  ajaxRequest(jdata, function (r) {
    hideDromiLoader();
    if(r.result == "success") {
      removeTableRow("dromi-list-" + index);
    }
  }, function(request,status,error) {
    hideDromiLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function saveYoutubeUrl(data_id) {
	
	var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "youtube", "youtube_data_id" : data_id, "clientid" : userid, "name" : cur_flightrecord_name};
  
	showDromiLoader();
  ajaxRequest(jdata, function (r) {
    hideDromiLoader();
    if(r.result == "success") {
      
    }
  }, function(request,status,error) {
    hideDromiLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function hideMovieDataSet() {
	$('#movieDataSet').hide();
	$('#modifyBtnForMovieData').show();
}

function showMovieDataSet() {	
	$('#movieDataSet').show();
	$('#modifyBtnForMovieData').hide();
}

function btnSetMovie() {
	var data_id = $('#movieData').val();
	if (data_id == "") {
		alert("Invalid URL");
		return;
	}

	moviePlayerVisible = false;

	if (data_id.indexOf("youtube") >=0) {
		setGooglePhotoPlayer("");
		setYoutubePlayer(data_id);
		
		saveYoutubeUrl(data_id);
	}
	else {
		setGooglePhotoPlayer(data_id);
		setYoutubePlayer("");
	}

	if (moviePlayerVisible == true) {
		hideMovieDataSet();
	}
	else {
		showMovieDataSet();
	}
}

function setGooglePhotoPlayer(data_url) {
	googlePhotoPlayer = $("#googlePhotoPlayer")[0];
	googlePhotoPlayerAr = $("#googlePhotoPlayer");

	if (!isSet(data_url) || data_url == "-") {
		googlePhotoPlayerAr.hide();
		return;
	}

	googlePhotoPlayer.setAttribute('src', data_url);
	googlePhotoPlayer.load();
	googlePhotoPlayerAr.show();
	moviePlayerVisible = true;
}

function setYoutubePlayer(d_id) {
	if (!isSet(d_id) || d_id == "-") {
		$("#youTubePlayer").hide();
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
        var ds = item.dsec;
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

function showData(index) {
  if (dromiDataArray.length == 0) return;

  var item = dromiDataArray[index];

	moviePlayerVisible = false;

  if ("youtube_data_id" in item) {
  	if (item.youtube_data_id.indexOf("youtube") >=0) {
			setYoutubePlayer(item.youtube_data_id);
			setGooglePhotoPlayer("");
		}
		else {
			setYoutubePlayer("");
			setGooglePhotoPlayer(item.youtube_data_id);
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

	  showDromiLoader();

	  setTimeout(function() {

				ajaxRequest(jdata, function (r) {
			    if(r.result != "success") {
			      alert("Failed to load data!");
			    }
			    else {			    				    				    	
			      setChartData(r.data);
			      hideDromiLoader();
			    }
			  }, function(request,status,error) {
			    hideDromiLoader();
			    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
			  });

		}, 1000);
	}
	else {
		showDromiLoader();
  	setChartData(item.data);
  	hideDromiLoader();
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
      + "<td class='center' bgcolor='#eee'><a href='javascript:uploadFromSet(" + tableCount + ");'>"
      + name + "</a></td><td width='30%' class='center'> " + dtimestamp + "</td>"
      + "<td width='20%' bgcolor='#fff'>"
      + "<button class='btn btn-primary' type='button' onClick='deleteFlightData(" + tableCount + ");'>삭제</button></td>"
      + "</tr>";
  $('#dataTable-Flight_list > tbody:last').append(appendRow);
  tableCount++;
}


function deleteFlightData(index) {

  var item = flightDataArrayForDromis[index];

  if (confirm('정말로 ' + item.name + ' 비행기록을 삭제하시겠습니까?')) {
  } else {
    return;
  }

  var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "delete", "clientid" : userid, "name" : item.name};

  showDromiLoader();
  ajaxRequest(jdata, function (r) {
    hideDromiLoader();
    if(r.result != "success") {
      alert("삭제 실패!");
    }
    else {
      removeTableRow("flight-list-" + index);
    }
  }, function(request,status,error) {
    hideDromiLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function uploadFromSet(index) {
  var item = flightDataArrayForDromi[index];
  $('#FlightDataName').html(item.name);
  cur_flightrecord_name = item.name;
}

function getFlightListForDromi() {
  var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "download", "clientid" : userid};

  showDromiLoader();
  ajaxRequest(jdata, function (r) {
    hideDromiLoader();
    if(r.result == "success") {
      if (r.data == null || r.data.length == 0) {
        alert("no data");
        return;
      }

      setFlightlistForDromi(r.data);
      $('#getFlightListBtn').hide(1500);
    }
  }, function(request,status,error) {
    hideDromiLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function getDromiList() {
  var userid = getCookie("dev_user_id");
  var jdata = {"action": "dromi", "daction": "list", "clientid" : userid};

  showDromiLoader();
  ajaxRequest(jdata, function (r) {
    hideDromiLoader();
    if(r.result == "success") {
      if (r.data == null || r.data.length == 0) {
        alert("no data");
        return;
      }

      setDromilist(r.data);
      $('#getListBtn').hide(1500);
    }
  }, function(request,status,error) {
    hideDromiLoader();
    monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function convert2time(stime) {
  var gapTime = document.getElementById("gmtGapTime").value;
  return (new Date(stime).getTime() + (3600000 * (gapTime*1)));
}

function uploadData(name, mname) {
    // if (arrayData == null || arrayData.length == 0) {
    //   alert("Please select any file !!");
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

    showDromiLoader();
    ajaxRequest(jdata, function (r) {
      cur_flightrecord_name = "";
      hideDromiLoader();
      if(r.result == "success") {
        if (r.data == null || r.data.length == 0) {
          alert("no data");
          return;
        }

        setChartData(r.data);
      }
    }, function(request,status,error) {
      cur_flightrecord_name = "";
      hideDromiLoader();
      monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
    });
}

function showDromiLoader() {
	$("#position_info").text("Wait please ...");
  $("#loading").show();
}

function hideDromiLoader() {
	$("#position_info").text("...");
  $("#loading").fadeOut(800);
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
    var dsec = item.dsec * 1;
    if (dsec > 3600)
    	dsec = dsec / 1000;

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

var isMoved = true;

function setSlider(i) {
	$('#slider').slider({
					min : 0,
					max : i - 1,
					value : 0,
					step : 1,
					slide : function( event, ui ){						
            var locdata = chartLocData[ui.value];                        
						setMoveActionFromSlider(ui.value, locdata);
					}
	});
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

function drawPosIcon() {
	if (posIcons.length <= 0) return;

  map.on('click', function (evt) {
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

      drawPosIcon();

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


function setUploadData() {
      $("#uploadBtn").click(function() {
          if (cur_flightrecord_name == "") {
            var mname = prompt("데이터셋의 이름을 입력해 주세요.", "");

            if (mname == null) {
                alert("데이터셋의 이름을 잘못 입력하셨습니다.");
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
             console.log(JSON.stringify(r));
             callback(r);
           },
           error:function(request,status,error){
               console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
               errorcallback(request,status,error);
           }
    });
}
