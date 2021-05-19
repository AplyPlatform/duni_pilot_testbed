/*
Copyright 2020 APLY Inc. All rights reserved.
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

var page_action = "center";
var current_target = "private";

var bMonStarted;

var currentMainMap2DView;
var arrayCurrentMainMap2DObjectPos;
var arrayCurrentMainMap2DObjectPosImage;

var main2dMap;

var mainMap2DposSource;
var mainMap2DpointSource;
var mainMap2DVectorSource;
var mainMap2DlineSource;

var flightRecArray;
var designDataArray;

var flightRecords2DMapView;
var vVectorForHistory;
var vVectorLayerForHistory;

var flightCompanySource;
var vVectorLayerForCompany;

var lineLayerForGlobal;
var posLayerForGlobal;

var hasMore;

var bFilterOn;

var chartAltitudeLineData = [];
var arrayFlightRecordData = [];

var nAppendListCount = 0;

var youTubePlayer = null;
var youtube_data_id;

var cur_flightrecord_name = "";

var moviePlayerVisible = false;

var langset = "KR";

var viewmode = "pilot"; // or "developer"
var cur_controller;

var use3DMap = true;

var address_flat = -999, address_flng = -999;
var bDJIFileUpload = true; //dji file or input address

var popup2DMapContainer;
var popup2DMapContent;
var popup2DMapCloser;

var kf_lat;
var kf_lng;
var kf_alt;
var kf_yaw;
var kf_pitch;
var kf_roll;

var isFirst = true;

var currentMonitorObjects;
var currentMonitorIndex = 0;
var currentMonitorOwner = "private";


// 유튜브 약관 준수 - 동시에 2개 이상의 영상이 재생되면 안된다!
var players = [];
var playingIndex = null;
var stopIndex = null;
var playIndex = null;

$(function () {
		var lang = getCookie("language");
    if (isSet(lang))
        langset = lang;


		if (askToken() == false) {
      showAskDialog(
          LANG_JSON_DATA[langset]['modal_title'],
          LANG_JSON_DATA[langset]['msg_do_login'],
          LANG_JSON_DATA[langset]['modal_confirm_btn'],
          false,
          function () { goIndex(""); },
          null
      );
      return;
  	}

    mixpanel.identify(getCookie("dev_user_id"));

    var image_url = getCookie("image_url");
    if (image_url == "") $('#profile_image').hide();
    else $('#profile_image').attr("src", image_url);

    setViewMode();
    setCommonText();
    initPilotCenter();
});

function goIndex(doAction) {
  if (langset == "KR" || langset == "")
    location.href="index.html?action=" + doAction;
  else
  	location.href="index_en.html?action=" + doAction;
}

function setCurrentViewMode() {
	var segments = window.location.pathname.split('/');
	var toDelete = [];
	for (var i = 0; i < segments.length; i++) {
	    if (segments[i].length < 1) {
	        toDelete.push(i);
	    }
	}
	for (var i = 0; i < toDelete.length; i++) {
	    segments.splice(i, 1);
	}
	var filename = segments[segments.length - 1];

	if (isSet(filename) && filename.indexOf("main_dev.html") >= 0) {
		viewmode = "developer";
	}
	else {
		viewmode = "pilot";
	}
}

function setViewMode() {
	setCurrentViewMode();

	$('#view_mode_selector').off('click');

	if(viewmode == "") viewmode = "pilot";
	
	if(viewmode == "pilot") {
		cur_controller = "/center/main.html";		
		$('#view_mode_selector').click(function(){
			setCookie("viewmode", "developer", 1);
			GATAGM('view_mode_selector_developer', 'MEMU', langset);
			location.href = "/center/main_dev.html?page_action=center";
		});
	}
	else {
		cur_controller = "/center/main_dev.html";
		$('#view_mode_selector').click(function(){
			setCookie("viewmode", "pilot", 1);
			GATAGM('view_mode_selector_pilot', 'MEMU', langset);
			location.href = "/center/main.html?page_action=center";
		});
	}
}

function setCommonText() {
    if (viewmode == "developer") {
    	$('#side_menu_dev').text(LANG_JSON_DATA[langset]['side_menu_dev']);
    	$('#side_menu_lab').text(LANG_JSON_DATA[langset]['side_menu_lab']);
    	$('#side_menu_links_apis').text(LANG_JSON_DATA[langset]['side_menu_links_apis']);
    	$('#side_menu_links_dev').text(LANG_JSON_DATA[langset]['side_menu_links_dev']);
    	$('#side_menu_links_samples').text(LANG_JSON_DATA[langset]['side_menu_links_samples']);
    	$('#side_menu_links_codes').text(LANG_JSON_DATA[langset]['side_menu_links_codes']);
    	$('#side_menu_flight_plan').text(LANG_JSON_DATA[langset]['side_menu_flight_plan']);
    	$('#side_menu_flight_plan_design').text(LANG_JSON_DATA[langset]['side_menu_flight_plan_design']);
    	$('#side_menu_flight_plan_list').text(LANG_JSON_DATA[langset]['side_menu_flight_plan_list']);
    	$('#side_menu_flight_plan_mon').text(LANG_JSON_DATA[langset]['side_menu_flight_plan_mon']);
    	$('#top_menu_token').text(LANG_JSON_DATA[langset]['top_menu_token']);
			$("#view_mode_selector").text(LANG_JSON_DATA[langset]['mode_pilot_label']);
			$("#droneplaytoken_view").val(getCookie("dev_token"));
    }
    else {
    	$("#view_mode_selector").text(LANG_JSON_DATA[langset]['mode_developer_label']);
    }

    $('#menu_left_top_title_label').text(LANG_JSON_DATA[langset]['menu_left_top_title_label']);

    $('#side_menu_dashboard').text(LANG_JSON_DATA[langset]['side_menu_dashboard']);
    $('#side_menu_flight_record').text(LANG_JSON_DATA[langset]['side_menu_flight_record']);
    $('#side_menu_flight_record_upload').text(LANG_JSON_DATA[langset]['side_menu_flight_record_upload']);
    $('#side_menu_flight_record_list').text(LANG_JSON_DATA[langset]['side_menu_flight_record_list']);
    $('#side_menu_flight_record_public_list').text(LANG_JSON_DATA[langset]['side_menu_flight_record_public_list']);

    $('#side_menu_qa').text(LANG_JSON_DATA[langset]['side_menu_qa']);
    $('#side_menu_links').text(LANG_JSON_DATA[langset]['side_menu_links']);
    $('#side_menu_links_comm').text(LANG_JSON_DATA[langset]['side_menu_links_comm']);
    $('#side_menu_links_blog').text(LANG_JSON_DATA[langset]['side_menu_links_blog']);

    $('#top_menu_logout').text(LANG_JSON_DATA[langset]['top_menu_logout']);

    $('#askModalCancelButton').text(LANG_JSON_DATA[langset]['msg_cancel']);
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

function setLogoutBtn() {
    $('#btnLogout').click(function () {
        GATAGM('btnLogout', 'MEMU', langset);

        showAskDialog(
            LANG_JSON_DATA[langset]['modal_title'],
            LANG_JSON_DATA[langset]['msg_are_you_sure'],
            LANG_JSON_DATA[langset]['top_menu_logout'],
            false,
            function () { logOut(); },
            null
        );
    });
}

function centerPageInit() {
	var loadPage = "center.html";

	if (viewmode == "developer") {
			loadPage = "center_dev.html";
	}

  $("#main_contents").load(loadPage, function () {      
      flightRecords2dMapInit();
      centerInit();
  });

  $("#dashboard_menu").addClass("active");
}

function initPilotCenter() {
    flightRecArray = [];
    setLogoutBtn();
    showLoader();

    page_action = getQueryVariable("page_action");

    if (!isSet(page_action)) {
    		page_action = "center";
    }

    if (page_action == "center") {
    		centerPageInit();
    }
    else if (page_action == "missiondesign") {
        $("#main_contents").load("mission_design.html", function () {
            map2dInit();
            selectMonitorIndex("private", 0);
            addObjectTo2dMap(0, "private", "drone");
            designInit();
        });
        $("#mission_menu").addClass("active");
    }
    else if (page_action == "missionlist") {
        $("#main_contents").load("mission_list.html", function () {
            missionListInit();
        });
        $("#mission_menu").addClass("active");
    }
    else if (page_action == "monitor") {
        $("#main_contents").load("monitor.html", function () {
            map2dInit();
            map3dInit();
            monitorInit();
        });
        $("#monitor_menu").addClass("active");
    }
    else if (page_action == "recordupload") {
        $("#main_contents").load("record_upload.html", function () {
            flightrecordUploadInit();
        });
        $("#record_menu").addClass("active");
    }
    else if (page_action == "recordlist") {
        $("#main_contents").load("record_list.html", function () {            
            flightRecords2dMapInit();
            flightrecordListInit("private");
        });
        $("#record_menu").addClass("active");
    }
    else if (page_action == "publicrecordlist") {
        $("#main_contents").load("record_list.html", function () {            
            selectMonitorIndex("private", 0);
            addObjectTo2dMap(0, "private", "drone");
            flightRecords2dMapInit();
            flightrecordListInit("public");
        });
        $("#record_menu").addClass("active");
    }
    else if (page_action == "publicrecordlist_detail") {
        $("#main_contents").load("record_detail.html", function () {
            map2dInit();
            selectMonitorIndex("private", 0);
            addObjectTo2dMap(0, "private", "drone");
            map3dInit();
            addObjectTo3DMap(0, "private", "drone");
            flightDetailInit("public");
        });
        $("#record_menu").addClass("active");
    }
    else if (page_action == "recordlist_detail") {
        $("#main_contents").load("record_detail.html", function () {
            map2dInit();
            selectMonitorIndex("private", 0);
            addObjectTo2dMap(0, "private", "drone");
            map3dInit();
            addObjectTo3DMap(0, "private", "drone");
            flightDetailInit("private");
        });
        $("#record_menu").addClass("active");
    }    
    else if (page_action == "summary") {
        $("#main_contents").load("summary.html", function () {
            summaryInit();
        });
        $("#record_menu").addClass("active");
    }
    else if (page_action == "util") {
        $("#main_contents").load("util.html", function () {
            utilInit();
        });
        $("#record_menu").addClass("active");
    }
    else {
    		showAlert(LANG_JSON_DATA[langset]['msg_error']);
    		centerPageInit();
    }
}


function utilInit() {
	
	
		$("#latxlng").keypress(function (e) {
        if (e.which == 13){
                   requestAddress();  // 실행할 이벤트
        }
    });
    
		hideLoader();
}

function summaryInit() {
    document.title = LANG_JSON_DATA[langset]['page_center_title'];

    getAllRecordCount();
}

var isShowToken = false;

function centerInit() {
    document.title = LANG_JSON_DATA[langset]['page_center_title'];

    if (viewmode == "developer") {
        $('#head_title').html(LANG_JSON_DATA[langset]['head_developer_title']);
        $('#page_about_title').html(LANG_JSON_DATA[langset]['center_about_developer_title']);
        $('#page_about_content').html(LANG_JSON_DATA[langset]['center_about_developer_content']);
        $('#dev_token_title').text(LANG_JSON_DATA[langset]['top_menu_token']);
        $("#show_token").text(LANG_JSON_DATA[langset]['msg_show_token']);
        $("#droneplaytoken_view_section").val(getCookie("dev_token"));
        $("#droneplaytoken_view_section").hide();
        $("#show_token").click(function(){
        	if (isShowToken) {
        		GATAGM('show_token', 'CONTENT', langset);

        		$("#droneplaytoken_view_section").hide();
        		$("#show_token").text(LANG_JSON_DATA[langset]['msg_show_token']);
        	}
        	else {
        		GATAGM('hide_token', 'CONTENT', langset);
        		$("#droneplaytoken_view_section").show();
        		$("#show_token").text(LANG_JSON_DATA[langset]['msg_hide_token']);
        	}

        	isShowToken = !isShowToken;
        });
    }
    else {
        $('#head_title').html(LANG_JSON_DATA[langset]['head_pilot_title']);
        $('#page_about_title').html(LANG_JSON_DATA[langset]['center_about_pilot_title']);
        $('#page_about_content').html(LANG_JSON_DATA[langset]['center_about_pilot_content']);
    }

    $('#msg_notice').text(LANG_JSON_DATA[langset]['msg_notice']);
    $('#center_example_title').html(LANG_JSON_DATA[langset]['center_example_title']);
    $('#data_title').text("'" + getCookie("user_email") + "'" + LANG_JSON_DATA[langset]['data_count_msg']);

    $("#r_count_label").text(LANG_JSON_DATA[langset]["r_count_label"]);
    $("#f_count_label").text(LANG_JSON_DATA[langset]["f_count_label"]);
    $("#a_time_label").text(LANG_JSON_DATA[langset]["a_time_label"]);
    $("#a_time_min_label").text(LANG_JSON_DATA[langset]["a_time_min_label"]);

    $("#badge_nickname").attr("placeholder", LANG_JSON_DATA[langset]['badge_nickname_label']);
    $("#badge_code_label").text(LANG_JSON_DATA[langset]["badge_code_label"]);
    $("#help_label").text(LANG_JSON_DATA[langset]["help_label"]);
    $("#badgeHelpContent").text(LANG_JSON_DATA[langset]["badgeHelpContent"]);

    $("#open_record_label").text(LANG_JSON_DATA[langset]["open_record_label"]);
    $("#more_label").text(LANG_JSON_DATA[langset]["more_label"]);

    $("#dev_token_title").text(LANG_JSON_DATA[langset]["dev_token_title"]);


    $("#open_company_label").text(LANG_JSON_DATA[langset]["title_for_company_flightlist"]);
    $("#title_history_chkbox").text(LANG_JSON_DATA[langset]["title_history_chkbox"]);
    $("#title_company_chkbox").text(LANG_JSON_DATA[langset]["title_company_chkbox"]);

    getRecordCount();
    current_target = "public";
    initYoutubeAPIForFlightList();

		$("#chkFlightHistory").change(function(){
			showFlightRecordsList($("#chkFlightHistory").is(":checked"));
	  });

	  $("#chkCompany").change(function(){
			showCompanyList($("#chkCompany").is(":checked"));
	  });

    getCompanyList();
}


function designInit() {
    designDataArray = [];

    document.title = LANG_JSON_DATA[langset]['page_mission_design_title'];
    $("#head_title").text(document.title);

    $('#page_about_title').text(LANG_JSON_DATA[langset]['page_mission_design_title']);
    $('#page_about_content').text(LANG_JSON_DATA[langset]['design_about_content']);
    $('#msg_tracker').text(LANG_JSON_DATA[langset]['msg_tracker']);
    $('#map_kind_label').text(LANG_JSON_DATA[langset]['map_kind_label']);
    $('#go_index_direct_label').text(LANG_JSON_DATA[langset]['go_index_direct_label']);
    $('#btnForRegistMission').text(LANG_JSON_DATA[langset]['btnForRegistMission']);
    $('#btnForClearMission').text(LANG_JSON_DATA[langset]['btnForClearMission']);
    $('#removeItemBtn').text(LANG_JSON_DATA[langset]['msg_remove']);
    $('#saveItemBtn').text(LANG_JSON_DATA[langset]['msg_apply']);
    $('#help_label').text(LANG_JSON_DATA[langset]['help_label']);
    $('#Aerial_label').text(LANG_JSON_DATA[langset]['Aerial_label']);
    $('#Aerial_label_label').text(LANG_JSON_DATA[langset]['Aerial_label_label']);
    $('#Road_label').text(LANG_JSON_DATA[langset]['Road_label']);

    $('#roll_label').text(LANG_JSON_DATA[langset]['roll_label']);
    $('#pitch_label').text(LANG_JSON_DATA[langset]['pitch_label']);
    $('#yaw_label').text(LANG_JSON_DATA[langset]['yaw_label']);

    $('#latitude_label').text(LANG_JSON_DATA[langset]['latitude_label']);
    $('#longitude_label').text(LANG_JSON_DATA[langset]['longitude_label']);
    $('#altitude_label').text(LANG_JSON_DATA[langset]['altitude_label']);
    $('#action_label').text(LANG_JSON_DATA[langset]['action_label']);
    $('#speed_label').text(LANG_JSON_DATA[langset]['speed_label']);


    initSliderForDesign(1);

    main2dMap.on('click', function (evt) {
        GATAGM('DESIGN_MAP', 'CONTENT', langset);

        var feature = main2dMap.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                return feature;
            });

        if (feature) {
            var ii = feature.get('mindex');
            if (!isSet(ii)) return;

            setDataToDesignView(ii);

            var item = designDataArray[ii];
            setMoveActionFromMap(ii, item);
            return;
        }

        var lonLat = ol.proj.toLonLat(evt.coordinate);
        appendDataToDesignTable(lonLat);
    });

    var mission_name = decodeURIComponent(getQueryVariable("mission_name"));

    if (isSet(mission_name) && mission_name != "") {
        mission_name = mission_name.split('&')[0];
        setMissionDataToDesignView(mission_name);
    }
    else {

        var posLayer = new ol.layer.Vector({
            source: mainMap2DposSource
        });

        main2dMap.addLayer(posLayer);

        hideLoader();
    }


    $('#saveItemBtn').off('click');
    $('#saveItemBtn').click(function () {
        GATAGM('saveItemBtn', 'CONTENT', langset);
        saveDesignData(0);
    });

    $('#btnForRegistMission').off('click');
    $('#btnForRegistMission').click(function () {
        GATAGM('btnForRegistMission', 'CONTENT', langset);
        askMissionNameForDesignRegister();
    });

    $('#btnForClearMission').off('click');
    $('#btnForClearMission').click(function () {
        GATAGM('btnForClearMission', 'CONTENT', langset);
        askClearCurrentDesign();
    });

    $('#btnForSearchAddress').off('click');
    $('#btnForSearchAddress').click(function () {
        GATAGM('btnForSearchAddress', 'CONTENT', langset);
        searchCurrentBrowserAddress();
    });
}

var oldAddressVal = "";

function flightrecordUploadInit() {

    document.title = LANG_JSON_DATA[langset]['page_flight_rec_upload_title'];
    $("#head_title").text(document.title);

    $('#page_about_title').text(LANG_JSON_DATA[langset]['page_flight_rec_upload_title']);
    $('#page_about_content').text(LANG_JSON_DATA[langset]['upload_about_content']);

    $('#btnForUploadFlightList').text(LANG_JSON_DATA[langset]['msg_upload']);

    $('#dji_flight_record_get_label').text(LANG_JSON_DATA[langset]['dji_flight_record_get_label']);
    $('#duni_flight_record_format_label').text(LANG_JSON_DATA[langset]['duni_flight_record_format_label']);
    $('#collapseRecordFileParams').html(LANG_JSON_DATA[langset]['collapseRecordFileParams']);

    $("#youtube_url_label").text(LANG_JSON_DATA[langset]['youtube_url_label']);
    $("#record_name_field").attr("placeholder", LANG_JSON_DATA[langset]['msg_input_record_name']);
    $("#name_label").text(LANG_JSON_DATA[langset]['name_label']);
    $("#youtube_url_label").text(LANG_JSON_DATA[langset]['youtube_url_label']);
    $("#input_memo_label").text(LANG_JSON_DATA[langset]['input_memo_label']);
    
    $("#input_tag_label").text(LANG_JSON_DATA[langset]['input_tag_label']);

    $("#dji_radio_label").text(LANG_JSON_DATA[langset]['msg_dji_file_upload']);    
    $("#btnForAddressCheck").text(LANG_JSON_DATA[langset]['btnForAddressCheck']);    
    $("#address_input_data_label").text(LANG_JSON_DATA[langset]['address_input_data_label']);
    
    $("#tab_menu_upload_selector_dji").text(LANG_JSON_DATA[langset]['tab_menu_upload_selector_dji']);
    $("#tab_menu_upload_selector_address").text(LANG_JSON_DATA[langset]['tab_menu_upload_selector_address']);            
    
    $( "#upload_tabs" ).tabs();

    $('#btnForUploadFlightList').click(function () {
        GATAGM('btnForUploadFlightList', 'CONTENT', langset);
        
        uploadFlightList(false);        
    });
        
    $('#btnForAddressCheck').click(function () {
        GATAGM('btnForAddressCheck', 'CONTENT', langset);
        checkAddress($("#address_input_data").val());
    });
    
    //판매국가는 우선 한국만!
    $("#priceinputarea").hide();
    
    if (langset != "KR") {
    	$("#sale_select").hide();
    }
    
    $("#salecheck").click(function(){
			var checked = $("#salecheck").is(":checked");
			
			if(checked)
				$("#priceinputarea").show();
			else
				$("#priceinputarea").hide();
		});
    
    var input = document.querySelector('input[name=tagTextarea]');
		new Tagify(input);
    
    $("#address_input_data").on("change keyup paste", function() {
		    var currentVal = $(this).val();
		    if(currentVal == oldAddressVal) {
		        return;
		    }
		 
		    oldAddressVal = currentVal;
		    address_flat = -999;
		    address_flng = -999;
		});
		
  	
    hideLoader();
}

function setUpload(bWhich) {
		if (bWhich == true) {
			bDJIFileUpload = true;
			return;
		}
		
		bDJIFileUpload = false;
}

function checkAddress(address) {		
    if (isSet(address) == false) {
    		showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
    		address_flat = -999;	
	     	address_flng = -999;
        return;
    }
    
    var userid = getCookie("dev_user_id");    
    var jdata = {"clientid" : userid, "action" : "util", "daction": "gps_by_address", "address" : address};
		
		ajaxRequest(jdata, function (r) {
	    	if(r.result == "success") {
		      if (r.data == null) {
		      	address_flat = -999;	
		     		address_flng = -999;
		      	showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
		        return;
		      }
	
		     	address_flat = r.data.lat;	
		     	address_flng = r.data.lng;
		     	
		     	$("#address_result").text(r.data.address);
		     	showAlert(LANG_JSON_DATA[langset]['msg_address_checked']);
	    	}
	    	else {
	    		address_flat = -999;	
		     	address_flng = -999;
		  		showAlert(LANG_JSON_DATA[langset]['msg_input_corrent_address']);
	    	}
	  	},
	  	function(request,status,error) {
	  		address_flat = -999;	
	     	address_flng = -999;
	  		showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
	  });			
}

function setMonFilter() {
    if (bFilterOn == false) {
        bFilterOn = true;
        $("#btnForFilter").text(LANG_JSON_DATA[langset]['btnForFilter_rel']);
    }
    else {
        bFilterOn = false;
        $("#btnForFilter").text(LANG_JSON_DATA[langset]['btnForFilter']);
    }
}

function monitorInit() {

    bMonStarted = false;
    bFilterOn = false;

    document.title = LANG_JSON_DATA[langset]['page_monitor_title'];
    $("#head_title").text(document.title);

    $('#page_about_title').text(LANG_JSON_DATA[langset]['page_monitor_title']);
    $('#page_about_content').text(LANG_JSON_DATA[langset]['monitor_about_content']);
    $('#map_kind_label').text(LANG_JSON_DATA[langset]['map_kind_label']);
    $("#altitude_label").text(LANG_JSON_DATA[langset]['altitude_label']);

    $('#roll_label').text(LANG_JSON_DATA[langset]['roll_label']);
    $('#pitch_label').text(LANG_JSON_DATA[langset]['pitch_label']);
    $('#yaw_label').text(LANG_JSON_DATA[langset]['yaw_label']);

    $("#youtube_url_label").text(LANG_JSON_DATA[langset]['youtube_url_label']);
    $("#btnForSetYoutubeID").text(LANG_JSON_DATA[langset]['msg_apply']);
    $("#monitor_target_label").text(LANG_JSON_DATA[langset]['monitor_target_label']);

    $("#modifyBtnForMovieData").text(LANG_JSON_DATA[langset]['modifyBtnForMovieData']);

    $('#Aerial_label').text(LANG_JSON_DATA[langset]['Aerial_label']);
    $('#Aerial_label_label').text(LANG_JSON_DATA[langset]['Aerial_label_label']);
    $('#Road_label').text(LANG_JSON_DATA[langset]['Road_label']);

    $("#btnForFilter").hide();
    $("#btnForFilter").text(LANG_JSON_DATA[langset]['btnForFilter']);
    $("#btnForFilter").click(function () {
        GATAGM('btnForFilter', 'CONTENT', langset);
        setMonFilter();
    });

    $("#btnStartMon").text(LANG_JSON_DATA[langset]['btnStartMon']);
    $("#btnStartMon").click(function () {
        GATAGM('btnStartMon', 'CONTENT', langset);
        startMon();
    });

    $('#btnForSetYoutubeID').click(function () {
        GATAGM('btnForSetYoutubeID', 'CONTENT', langset);
        setYoutubeID();
    });

    moviePlayerVisible = true;
    showMovieDataSet();

    drawLineGraph();
    hideLoader();
}

var uploadVideo;

function flightDetailInit(target) {

    if (target == "public") {
        document.title = LANG_JSON_DATA[langset]['page_flight_rec_public_view_title'];
    }
    else {
        document.title = LANG_JSON_DATA[langset]['page_flight_rec_view_title'];
    }

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
    $("#flightTagBtn").text(LANG_JSON_DATA[langset]['msg_modify_tag']);
    
    $("#input_tag_label").text(LANG_JSON_DATA[langset]['input_tag_label']);
    
    $("#altitude_label_top").text(LANG_JSON_DATA[langset]['altitude_label']);
    $("#youtube_url_label").text(LANG_JSON_DATA[langset]['youtube_url_label']);
    $("#btnForSetYoutubeID").text(LANG_JSON_DATA[langset]['msg_apply']);
    $("#map_kind_label").text(LANG_JSON_DATA[langset]['map_kind_label']);
    $("#input_memo_label").text(LANG_JSON_DATA[langset]['input_memo_label']);
    $("#btnForFilter").text(LANG_JSON_DATA[langset]['btnForFilter']);
    $("#btnForSharing").text(LANG_JSON_DATA[langset]['btnForSharing']);
    $("#btnForPublic").text(LANG_JSON_DATA[langset]['btnForOpening']);
    $("#btnForLink").text(LANG_JSON_DATA[langset]['btnForLink']);
    $("#btnForDelete").text(LANG_JSON_DATA[langset]['msg_remove']);
    $("#btnForUpdateTitle").text(LANG_JSON_DATA[langset]['msg_modify']);

    $("#dji_radio_label").text(LANG_JSON_DATA[langset]['msg_dji_file_upload']);
    $("#duni_radio_label").text(LANG_JSON_DATA[langset]['msg_duni_file_upload']);
    $('#btnForUploadFlightList').text(LANG_JSON_DATA[langset]['msg_upload']);
    $('#uploadBtnForFlightRecord').text(LANG_JSON_DATA[langset]['page_flight_rec_upload_title']);

    $('#Aerial_label').text(LANG_JSON_DATA[langset]['Aerial_label']);
    $('#Aerial_label_label').text(LANG_JSON_DATA[langset]['Aerial_label_label']);
    $('#Road_label').text(LANG_JSON_DATA[langset]['Road_label']);

    $('#roll_label').text(LANG_JSON_DATA[langset]['roll_label']);
    $('#pitch_label').text(LANG_JSON_DATA[langset]['pitch_label']);
    $('#yaw_label').text(LANG_JSON_DATA[langset]['yaw_label']);

    $("#btnForLink").hide();
    $("#btnForSharing").hide();		

    $('#btnForFilter').click(function () {
        GATAGM('btnForFilter', 'CONTENT', langset);
        setFilter();
    });

    $('#btnForSetYoutubeID').click(function () {
        GATAGM('btnForSetYoutubeID', 'CONTENT', langset);
        setYoutubeID();
    });

    $('#btnForUploadFlightList').click(function () {
        GATAGM('btnForUploadFlightList', 'CONTENT', langset);
        uploadFlightList(true);
    });
		
		$("#recordDataSet").hide();
								
    uploadVideo = new UploadVideo();
    if (authSucceed == true) {    	
			uploadVideo.ready(gapi.auth.getToken().access_token);                        
		}
		
    var record_name = getQueryVariable("record_name");
    if (record_name != null && record_name != "") {
        showDataWithName(target, decodeURIComponent(unescape(record_name)));
    }            
}

function flightrecordListInit(target) {

    if (target == "public") {
        document.title = LANG_JSON_DATA[langset]['page_flight_rec_public_view_title'];
        $('#page_about_title').text(LANG_JSON_DATA[langset]['page_flight_rec_public_view_title']);
        $('#page_about_content').text(LANG_JSON_DATA[langset]['record_public_list_about_content']);
    }
    else {
        document.title = LANG_JSON_DATA[langset]['page_flight_rec_view_title'];
        $('#page_about_title').text(LANG_JSON_DATA[langset]['page_flight_rec_view_title']);
        $('#page_about_content').text(LANG_JSON_DATA[langset]['record_list_about_content']);
    }

    $("#head_title").text(document.title);

    $("#btnForLoadFlightList").text(LANG_JSON_DATA[langset]['btnForLoadFlightList']);

    $("#name_label").text(LANG_JSON_DATA[langset]['name_label']);
    $("#date_label").text(LANG_JSON_DATA[langset]['date_label']);
    $("#manage_label").text(LANG_JSON_DATA[langset]['manage_label']);

    $("#search_key").attr("placeholder", LANG_JSON_DATA[langset]['msg_record_search_key']);

    $("#btnForSearchFlightRecord").click(function () {
        GATAGM('btnForSearchFlightRecord', 'CONTENT', langset);
        searchFlightRecord(target, $("#search_key").val());
    });

    $('#btnForLoadFlightList').click(function () {
        GATAGM('btnForLoadFlightList', 'CONTENT', langset);
        getFlightRecords(target);
    });

    $('#btnForLoadFlightList').hide();

    current_target = target;
    initYoutubeAPIForFlightList();
}

function initYoutubeAPIForFlightList() {
		var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function missionListInit() {

    document.title = LANG_JSON_DATA[langset]['page_list_title'];
    $("#head_title").text(document.title);

    $("#page_about_title").text(LANG_JSON_DATA[langset]['page_list_title']);
    $("#page_about_content").text(LANG_JSON_DATA[langset]['mission_about_content']);
    $("#name_label").text(LANG_JSON_DATA[langset]['name_label']);
    $("#status_label").text(LANG_JSON_DATA[langset]['status_label']);
    $("#date_label").text(LANG_JSON_DATA[langset]['date_label']);
    $("#manage_label").text(LANG_JSON_DATA[langset]['manage_label']);
    $("#btnForGetMissionList").text(LANG_JSON_DATA[langset]['btnForGetMissionList']);
    $("#search_key").attr("placeholder", LANG_JSON_DATA[langset]['msg_mission_search_key']);

    $('#btnForSearchMission').click(function () {
        GATAGM('btnForSearchMission', 'CONTENT', langset);
        searchMission($("#search_key").val());
    });

    $('#btnForGetMissionList').click(function () {
        GATAGM('btnForGetMissionList', 'CONTENT', langset);
        getMissionList();
    });

    $('#btnForGetMissionList').hide();
    getMissionList(); 
}

function flightRecords2dMapInit() {
    var dpoint = ol.proj.fromLonLat([126.5203904, 33.3616837]);
		
		popup2DMapContainer = document.getElementById('popup');
		popup2DMapContent = document.getElementById('popup-content');
		popup2DMapCloser = document.getElementById('popup-closer');
		
		popup2DMapContainer.style.visibility = "visible"; 
  	var overlay = new ol.Overlay({
		  element: popup2DMapContainer,
		  autoPan: true,
		  autoPanAnimation: {
		    duration: 250,
		  },
		});

		popup2DMapCloser.onclick = function () {
		  overlay.setPosition(undefined);
		  popup2DMapCloser.blur();
		  return false;
		};

    flightRecords2DMapView = new ol.View({
        center: dpoint,
        zoom: 9
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
				    		style = [new ol.style.Style({
	                image: new ol.style.Circle({
				            radius: radius,
				            fill: new ol.style.Fill({ color: '#779977dd' }),
				            stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
		                }),
		              text: new ol.style.Text({
					                  text: size.toString(),
					                  fill: new ol.style.Fill({ color: '#fff' }),
					                  scale: 1.5
										})
		                
	              })];
								
	          		styleCacheForCompany[size] = style
				    }
				    return style;
				  },
	    });


    vVectorForHistory = new ol.source.Vector();

		var clusterSource = new ol.source.Cluster({
		  distance: 40,
		  source: vVectorForHistory,
		  geometryFunction: function(feature) {
        var geom = feature.getGeometry();
    		return geom.getType() == 'Point' ? geom : null;
    	},
		});

		var styleCache = {};
    vVectorLayerForHistory = new ol.layer.Vector({
        source: clusterSource,
        zIndex: 1000,
        style: function (feature) {
        	if (!feature) return;

			    var size = feature.get('features').length;
			    var radius;
			    size == 1 ? radius = 8 : radius = 10 + (size * 0.1);
			    var style = styleCache[size];
			    if (!style) {
			       style = [new ol.style.Style({
                image: new ol.style.Circle({
			            radius: radius,
			            fill: new ol.style.Fill({ color: '#a03e8bd2' }),
			            stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
	                }),
	              text: new ol.style.Text({
				                  text: size.toString(),
				                  fill: new ol.style.Fill({ color: '#fff' }),
				                  scale: 1.5
								})
              })];							

							styleCache[size] = style
			    }
			    return style;
			  },
    });

    var bingLayer = new ol.layer.Tile({
        visible: true,
        preload: Infinity,
        source: new ol.source.BingMaps({
            // We need a key to get the layer from the provider.
            // Sign in with Bing Maps and you will get your key (for free)
            key: 'AgMfldbj_9tx3cd298eKeRqusvvGxw1EWq6eOgaVbDsoi7Uj9kvdkuuid-bbb6CK',
            imagerySet: 'Road', // or 'Road', 'AerialWithLabels', etc.
            // use maxZoom 19 to see stretched tiles instead of the Bing Maps
            // "no photos at this zoom level" tiles
            maxZoom: 19
        })
    });

    var vMap = new ol.Map({
        target: 'historyMap',
        layers: [
            bingLayer, vVectorLayerForHistory, vVectorLayerForCompany
        ],
        overlays: [ overlay ],
        // Improve user experience by loading tiles while animating. Will make
        // animations stutter on mobile or slow devices.
        loadTilesWhileAnimating: true,
        view: flightRecords2DMapView
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

    	GATAGM("vMap_cindex_" + ii, "CONTENT", langset);

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

    GATAGM("vMap_" + ii, "CONTENT", langset);

    var hasYoutube = features[0].get('mhasYoutube');

  	if (hasYoutube) {
  		$("#video-pop-" + ii).click();
  	}
  	else {
  		var scrollTarget = "flight-list-" + ii;
			location.href = "#" + scrollTarget;
  	}
}

function getCompanyInfo(title, cid) {
	  var jdata = {"action": "public_company_detail", "cid" : cid};

		popup2DMapContent.innerHTML = title + '<p><img src="/images/loader.gif" border="0" width="20px" height="20px"></p>';

  	ajaxRequest(jdata, function (r) {
	    if(r.result == "success") {
	      if (r.data == null) {
	      	popup2DMapContent.innerHTML = title + "<p>Failed to get more info.</p>";
	        return;
	      }

	     	if (r.data.is_playground == true) {
	     			title = "<\uB4DC\uB860\uBE44\uD589/\uCCB4\uD5D8\uC7A5> " + title;
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
	      		title = title + "<td align=left><i class='ti-id-badge'></i> <b>\uC804\uBB38\uAD50\uC721\uAE30\uAD00</b></td>";
				}

	      if (isSet(r.data.homeaddress) && r.data.homeaddress != "-") {
	      		title = title + "<td width=50% align=right><a href='" + r.data.homeaddress + "' target=_new onClick='GATAGM(\"index_page_vMap_cindex_home_click_" + cid + "\", \"CONTENT\", langset);'>\uD648\uD398\uC774\uC9C0</a></td>";
	      }

	      title = title + "</tr></table>";

	      popup2DMapContent.innerHTML = title;
	    }
	  },
	  	function(request,status,error) {
	  		popup2DMapContent.innerHTML = title + "<p>Failed to get more info.</p>";
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
    var jdata = { "action": "position", "daction": "summary", "clientid": userid, "email": useremail };

    showLoader();
    ajaxRequest(jdata, function (r) {
    		hideLoader();

        if (r.result == "success") {
            setSummaryDashBoard(r.b_count, r.record_count, r.mission_count, r.member_count);
        }
        else {
            setSummaryDashBoard(0, 0, 0, 0);
        }
    }, function (request, status, error) {
        setSummaryDashBoard(0, 0, 0, 0);
        hideLoader();
    });
}

function setBadgeView(fdata) {
    if (isSet(fdata) && isSet(fdata.pluginid) && fdata.pluginid != "-") {
        var pluginid = fdata.pluginid;
        var callsign = fdata.callsign;
        $("#btnForBadge").text(LANG_JSON_DATA[langset]['btnForBadge_del']);
        $("#badge_view").show();

        $("#badge_nickname").val(callsign);
        $('#badge_code_iframe').attr('src', "https://pilot.duni.io/plugin/code.html?code=" + pluginid + "&lang=" + langset + "&parent_url=" + encodeURIComponent(window.location.href));
        $('#badge_code').text("<iframe id=\"badge_frame\" src=\"javascript:void(0)\" scrolling=\"no\" frameborder=\"0\" style=\"border:0;\" allowfullscreen=\"\"  aria-hidden=\"false\" tabindex=\"0\" width=\"100%\" height=\"500\"></iframe><script type=\"text/javascript\">document.getElementById(\"badge_frame\").src = \"https://pilot.duni.io/plugin/code.html?code=" + pluginid + "&parent_url=\" + encodeURIComponent(window.location.href) + \"&lang=" + langset + "\";</script>");

        $('#btnForBadge').off('click');
        $("#btnForBadge").click(function () {
            GATAGM('btnForBadge_delete', 'CONTENT', langset);
            showAskDialog(
                LANG_JSON_DATA[langset]['modal_title'],
                LANG_JSON_DATA[langset]['msg_are_you_sure'],
                LANG_JSON_DATA[langset]['btnForBadge_del'],
                false,
                function () { removePlugin(); },
                function () {}
            );
        });
    }
    else {
        $("#btnForBadge").text(LANG_JSON_DATA[langset]['btnForBadge_make']);
        $("#badge_view").hide();

        $('#btnForBadge').off('click');
        $("#btnForBadge").click(function () {
            GATAGM('btnForBadge_make', 'CONTENT', langset);

            var callsign = $("#badge_nickname").val();

            if (!isSet(callsign)) {
                showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
                $("#badge_nickname").focus();
                return;
            }

            generatePlugin(callsign);
        });
    }
}


function removePlugin() {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "remove_plugin", "clientid": userid };

    showLoader();
    ajaxRequest(jdata, function (r) {
    		hideLoader();

        if (r.result == "success") {
            setBadgeView(null);
        }
        else {
            showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        }
    }, function (request, status, error) {
        showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        hideLoader();
    });
}

function generatePlugin(callsign) {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "make_plugin", "clientid": userid, "callsign": callsign };

    showLoader();
    ajaxRequest(jdata, function (r) {
    		hideLoader();
        if (r.result == "success") {
            setBadgeView(r);
        }
        else {
            showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        }
    }, function (request, status, error) {
        showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        hideLoader();
    });
}

function getPublicRecordCount(rcount, mcount, alltime) {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "public_count", "clientid": userid };

    showLoader();
    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            setDashBoard(rcount, mcount, alltime, r.ercount, r.ealltime);
        }
        else {
            setDashBoard(0, 0, 0, 0, 0, 0);
            setBadgeView(null);
        }

        hideLoader();
    }, function (request, status, error) {
        setDashBoard(0, 0, 0, 0, 0, 0);
        hideLoader();
    });
}

function getRecordCount() {

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "data_count", "clientid": userid };

    showLoader();
    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            setBadgeView(r);
            getPublicRecordCount(r.record_count, r.mission_count, r.alltime);
        }
        else {
            setDashBoard(0, 0, 0, 0, 0, 0);
            setBadgeView(null);
            hideLoader();
        }
    }, function (request, status, error) {
        setDashBoard(0, 0, 0, 0, 0, 0);
        hideLoader();
    });
}

function setSummaryDashBoard(bcount, rcount, fcount, mcount) {

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

    $("#f_member_count_label").text(mcount);
    $("#b_count_label").text("\uC0DD\uC131\uD55C \uBC30\uC9C0\uC218 : " + bcount);

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

function setDashBoard(rcount, fcount, alltime, efcount, ealltime) {
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

    var mmin = Math.round(alltime / 60);
    var emin = Math.round(ealltime / 60);

    var alabel = new CountUp('a_time_label_time', mmin, coptions);
    if (!alabel.error) {
        alabel.start();
    } else {
        console.error(alabel.error);
    }

    var ctx = document.getElementById("myBarChart1");
    var myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [LANG_JSON_DATA[langset]["a_time_label"], LANG_JSON_DATA[langset]["average_alltime_label"]],
            datasets: [
                {
                    label: "",
                    hoverBackgroundColor: "#2e59d9",
                    borderColor: "#4e73df",
                    data: [mmin, emin],
                    backgroundColor: ["#8c96bd", "#586ebc"]
                }
            ],
        },
        options: {
            responsive: true,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    display: false, //this will remove all the x-axis grid lines,
                    ticks: {
                        display: false //this will remove only the label
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

    var ctx = document.getElementById("myBarChart2");
    var myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [LANG_JSON_DATA[langset]["r_count_label"], LANG_JSON_DATA[langset]["average_rcount_label"]],
            datasets: [
                {
                    label: "",
                    hoverBackgroundColor: "#2e59d9",
                    borderColor: "#4e73df",
                    data: [rcount, Math.round(efcount)],
                    backgroundColor: ["#7ea8b9", "#529ab8"]
                }
            ],
        },
        options: {
            responsive: true,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    display: false, //this will remove all the x-axis grid lines,
                    ticks: {
                        display: false //this will remove only the label
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}


function drawLineGraph() {
    var ctx2 = document.getElementById('lineGraph').getContext('2d');
    var linedataSet = {
        datasets: [
            {
                label: LANG_JSON_DATA[langset]['altitude_msg'],
                borderColor: '#4bc6ff',
                backgroundColor: '#9bdfff',
                data: chartAltitudeLineData
            }
        ]
    };

    document.getElementById("lineGraph").onclick = function (evt) {

        GATAGM('LINEGRAPH', 'CONTENT', langset);

        var activePoints = window.myLine.getElementsAtEvent(evt);

        if (activePoints.length > 0) {
            var clickedDatasetIndex = activePoints[0]._index;

            var locdata = arrayFlightRecordData[clickedDatasetIndex];
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
                        var locdata = arrayFlightRecordData[tooltipItem.index];
                        return JSON.stringify(locdata);
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

function setSlider(i) {
    $("#slider").on("slidestop", function (event, ui) {
        var locdata = arrayFlightRecordData[ui.value];
        setMoveActionFromSliderOnStop(ui.value, locdata);
    });

    $('#slider').slider({
        min: 0,
        max: i - 1,
        value: 0,
        step: 1,
        slide: function (event, ui) {
            var locdata = arrayFlightRecordData[ui.value];
            setMoveActionFromSliderOnMove(ui.value, locdata);
        }
    });
}


function setSliderPos(i) {
    if (!isSet($("#slider"))) return;

    if (i < 0) {
        $('#sliderText').html("-");
        return;
    }

    $("#slider").slider('value', i);
    $('#sliderText').html(i);
}

function setYawStatus(yaw) {
    if (!isSet($('#yawStatus'))) return;
    var yawStatus = document.getElementById('yawStatus');
    if (!isSet(yawStatus)) return;
    if (!isSet(yaw)) return;

    yaw = yaw * 1;
    var degree = yaw < 0 ? (360 + yaw) : yaw;
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
    if (!isSet($('#pitchStatus'))) return;
    var pitchStatus = document.getElementById('pitchStatus');
    if (!isSet(pitchStatus)) return;
    if (!isSet(pitch)) return;

    pitch = pitch * 1; //
    var degree = pitch * -1;
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
    if (!isSet($('#rollCanvas'))) return;
    var canvas = document.getElementById('rollCanvas');
    if (!isSet(canvas)) return;
    if (!isSet(roll)) return;

    roll = roll * 1;
    var degrees = 180 + roll;
    var degrees2 = degrees + 180;

    if (degrees2 > 360) degrees2 = degrees2 - 360;

    var radians1 = (Math.PI / 180) * degrees;
    var radians2 = (Math.PI / 180) * degrees2;

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
        min: 0,
        max: i - 1,
        value: 0,
        step: 1,
        slide: function (event, ui) {

            GATAGM('slider', 'CONTENT', langset);

            if (designDataArray.length <= 0) {
                return;
            }

            var d = designDataArray[ui.value];

            setDataToDesignView(ui.value);

            setMoveActionFromSliderOnMove(ui.value, d);
        }
    });

    $('#goItemBtn').click(function () {

        GATAGM('goItemBtn', 'CONTENT', langset);

        var index = $('#goItemIndex').val();
        if (!isSet(index) || $.isNumeric(index) == false) {
            showAlert("Please input valid value !");
            return;
        }

        index = parseInt(index);

        if (index < 0 || index >= designDataArray.length) {
            showAlert("Please input valid value !");
            return;
        }

        var d = designDataArray[index];
        $("#slider").slider('value', index);
        setDataToDesignView(index);

        setMoveActionFromSliderOnStop(index, d);
    });
}

function setMissionDataToDesignView(name) {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "mission", "daction": "get_spec", "mname": name, "clientid": userid };

    showLoader();

    $("#mission_name_field").text(name);

    ajaxRequest(jdata, function (r) {
    		hideLoader();
        if (r.result == "success") {

            if (!isSet(r.data.mission) || r.data.mission.length == 0) return;
            designDataArray = r.data.mission;
            setDesignTable();
        }
        else {
            showAlert(LANG_JSON_DATA[langset]['msg_no_mission']);
        }
    }, function (request, status, error) {

        monitor(LANG_JSON_DATA[langset]['msg_error_sorry']);
        hideLoader();
    });
}


function createNewIconFor2DMap(i, color, item) {

		var hasYoutube = false;
		if (isSet(item.hasYoutube)) {
    	hasYoutube = item.hasYoutube;
    }

    var pos_icon = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
        name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
        mindex: i,
        mhasYoutube : hasYoutube
    });

    return pos_icon;
}

function addNewIconToDesignMap(i, color, item) {
    var nIcon = createNewIconFor2DMap(i, color, item);
    mainMap2DposSource.addFeature(nIcon);
}

function removeIconOn2DMap(index) {
    main2dMap.removeLayer(lineLayerForGlobal);
    main2dMap.removeLayer(posLayerForDesign);

    setDesignTable();
}

function setDesignTable() {
    var i = 0;
    var coordinates = [];

    designDataArray.forEach(function (item) {
        addNewIconToDesignMap(i, "#0000ff", item);
        coordinates.push(ol.proj.fromLonLat([item.lng * 1, item.lat * 1]));
        i++;
    });

    setDataToDesignView(0);

    $("#slider").slider('option', { min: 0, max: i - 1 });
    setSliderPos(i);

    var lines = new ol.geom.LineString(coordinates);

    mainMap2DlineSource = new ol.source.Vector({
        features: [new ol.Feature({
            geometry: lines,
            name: 'Line'
        })]
    });

    lineLayerForGlobal = new ol.layer.Vector({
        source: mainMap2DlineSource,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#00ff00',
                width: 2
            })
        })
    });


    posLayerForGlobal = new ol.layer.Vector({
        source: mainMap2DposSource
    });

    main2dMap.addLayer(lineLayerForGlobal);
    main2dMap.addLayer(posLayerForGlobal);


    moveToPositionOnMap("private", 0, designDataArray[0].lat, designDataArray[0].lng, designDataArray[0].alt, designDataArray[0].yaw, designDataArray[0].roll, designDataArray[0].pitch);
}


function appendDataToDesignTable(lonLat) {

    var index = designDataArray.length;

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
    data['actparam'] = "0";
    data['lng'] = lonLat[0];
    data['lat'] = lonLat[1];

    designDataArray.push(data);

    $("#slider").slider('option', { min: 0, max: index });
    $("#slider").slider('value', index);

    setDataToDesignView(index);
    addNewIconToDesignMap(index, "#0000ff", data);
}


function startMon() {
    if (bMonStarted == true) {
        bMonStarted = false;
        isFirst = true;
        currentMonitorObjects = null;

        arrayCurrentMainMap2DObjectPos = null;
        arrayCurrentMainMap2DObjectPosImage = null;

        remove2dObjects();
        remove3dObjects();

        $("#btnForFilter").hide();
        $("#monitor_target_label").hide();
        $('#btnStartMon').text(LANG_JSON_DATA[langset]['btnStartMon']);
        $("#btnStartMon").removeClass("btn-warning").addClass("btn-primary");
        $("#loader").hide();
    }
    else {
        $("#btnForFilter").show();
        $("#monitor_target_label").show();
        $("#target_objects").empty();
        nextMon();
    }
}


function first3DcameraMove(owner, fobject) {
    if (!isSet(v3DMapViewer)) return;

    var camera = v3DMapViewer.camera;

    var item = fobject[0];

    camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            item.lng * 1,
            item.lat * 1,
            item.alt + 100
        ),
        complete: function () {
            setTimeout(function () {
                camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(
                        item.lng * 1,
                        item.lat * 1,
                        item.alt + 100
                    ),
                    orientation: {
                        heading: Cesium.Math.toRadians(200.0),
                        pitch: Cesium.Math.toRadians(-50.0),
                    },
                    easingFunction: Cesium.EasingFunction.LINEAR_NONE,
                });
            }, 2500);
        },
    });

    fobject.forEach(function (d, index) {
        moveToPositionOnMap(owner, index, d.lat * 1, d.lng * 1, d.alt, d.yaw, d.roll, d.pitch);
    });

    setTimeout(function () {
        if (bMonStarted == false) return;
        nextMon();
    }, 1000);
}

function processMon(owner, output) {
    if (!isSet(currentMonitorObjects)) {
        currentMonitorObjects = {};

        kf_lat = {};
        kf_lng = {};
        kf_alt = {};
        kf_yaw = {};
        kf_pitch = {};
        kf_roll = {};
    }

    if (!(owner in currentMonitorObjects)) {
        currentMonitorObjects[owner] = 0;

        kf_lat[owner] = [];
        kf_lng[owner] = [];
        kf_alt[owner] = [];
        kf_yaw[owner] = [];
        kf_pitch[owner] = [];
        kf_roll[owner] = [];

        kf_lat[owner].push(new KalmanFilter());
        kf_lng[owner].push(new KalmanFilter());
        kf_alt[owner].push(new KalmanFilter());
        kf_yaw[owner].push(new KalmanFilter());
        kf_pitch[owner].push(new KalmanFilter());
        kf_roll[owner].push(new KalmanFilter());
    }

    var fobject;
    if ("objects" in output) {
        fobject = output.objects;

        while (kf_lat[owner].length < fobject.length) {
            kf_lat[owner].push(new KalmanFilter());
            kf_lng[owner].push(new KalmanFilter());
            kf_alt[owner].push(new KalmanFilter());
            kf_yaw[owner].push(new KalmanFilter());
            kf_pitch[owner].push(new KalmanFilter());
            kf_roll[owner].push(new KalmanFilter());
        }

        fobject.forEach(function (item, index) {
            if (bFilterOn) {
                item.lat = kf_lat[owner][index].filter(item.lat * 1);
                item.lng = kf_lng[owner][index].filter(item.lng * 1);
                item.alt = kf_alt[owner][index].filter(item.alt * 1);
                item.yaw = kf_yaw[owner][index].filter(item.yaw * 1);
                item.pitch = kf_pitch[owner][index].filter(item.pitch * 1);
                item.roll = kf_roll[owner][index].filter(item.roll * 1);
            }
            else {
                kf_lat[owner][index].filter(item.lat * 1);
                kf_lng[owner][index].filter(item.lng * 1);
                kf_alt[owner][index].filter(item.alt * 1);
                kf_yaw[owner][index].filter(item.yaw * 1);
                kf_pitch[owner][index].filter(item.pitch * 1);
                kf_roll[owner][index].filter(item.roll * 1);
            }
        });
    }
    else {
        if (bFilterOn) {
            output.lat = kf_lat[owner][0].filter(output.lat * 1);
            output.lng = kf_lng[owner][0].filter(output.lng * 1);
            output.alt = kf_alt[owner][0].filter(output.alt * 1);
            output.yaw = kf_yaw[owner][0].filter(output.yaw * 1);
            output.pitch = kf_pitch[owner][0].filter(output.pitch * 1);
            output.roll = kf_roll[owner][0].filter(output.roll * 1);
        }
        else {
            kf_lat[owner][0].filter(output.lat * 1);
            kf_lng[owner][0].filter(output.lng * 1);
            kf_alt[owner][0].filter(output.alt * 1);
            kf_yaw[owner][0].filter(output.yaw * 1);
            kf_pitch[owner][0].filter(output.pitch * 1);
            kf_roll[owner][0].filter(output.roll * 1);
        }

        fobject = [output];
    }

    if (currentMonitorObjects[owner] == 0) {
        currentMonitorObjects[owner] = fobject.length;

        var replaced_str = owner.replace(/@/g, '_at_');
        replaced_str = replaced_str.replace(/\./g, '_dot_');
        var selectorId = "object_sel_" + replaced_str;
        var selHtml = "<select class='form-control bg-light border-0 small' id='" + selectorId + "' name='" + selectorId + "'></select>";
        $("#target_objects").append(selHtml);

        fobject.forEach(function (item, index) {
            var kind = "drone";
            if ("kind" in item) {
                kind = item.kind;
            }

            $("#" + selectorId).append($("<option>", {
                value: index,
                text: (index + 1) + " : " + kind + " / " + owner
            }));

            if (index == 0) {
                $("#" + selectorId).val(0);
            }

            addObjectTo3DMap((index + 1), owner, kind);
            addObjectTo2dMap((index + 1), owner, kind);
        });


        $("#" + selectorId).on('change', function () {
            selectMonitorIndex(owner, this.value);
        });


        $("#" + selectorId).on("click", function () {
            var sval = $("#" + selectorId + " option:selected").val();
            selectMonitorIndex(owner, sval);
        })
    }

    if (isFirst) {
        isFirst = false;
        selectMonitorIndex(owner, 0);

        if (!isSet(v3DMapViewer))
            nexttour(owner, fobject);
        else
            first3DcameraMove(owner, fobject);
    }
    else nexttour(owner, fobject);

}

function selectMonitorIndex(owner, index) {
    currentMonitorIndex = index;
    currentMonitorOwner = owner;
}

function nextMon() {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "get", "clientid": userid };

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            bMonStarted = true;
            $("#loader").show();
            $('#btnStartMon').text(LANG_JSON_DATA[langset]['btnStopMon']);
            $("#btnStartMon").removeClass("btn-primary").addClass("btn-warning");

            var output = r.data;
            processMon(r.owner, output);
        }
        else {
            showAlert(LANG_JSON_DATA[langset]['msg_failed_to_get_position']);
            hideLoader();
        }
    }, function (request, status, error) {
        showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        hideLoader();
    });
}

function askToken() {
    var useremail = getCookie("user_email");
    var usertoken = getCookie("user_token");
    var userid = getCookie("dev_user_id");
    if (isSet(useremail) == false || isSet(userid) == false || isSet(usertoken) == false)
        return false;

    $("#email_field").text(useremail);

    return true;
}


function isSet(value) {
		if ( typeof(value) === 'number' )
        return true;
    if (value == "" || value == null || value == "undefined" || value == undefined)
        return false;
    return true;
}



function getMissionList() {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "mission", "daction": "get", "clientid": userid };

    if (hasMore) {
        jdata["morekey"] = hasMore;
    }

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            appendMissionList(r.data);

            if (r.morekey) {
                $('#btnForGetMissionList').text(LANG_JSON_DATA[langset]['msg_load_more']);
                hasMore = r.morekey;
                $('#btnForGetMissionList').show();
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

        hideLoader();
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}


var missionActionString = ["STAY", "START_TAKE_PHOTO", "START_RECORD", "STOP_RECORD", "ROTATE_AIRCRAFT", "GIMBAL_PITCH", "NONE", "CAMERA_ZOOM", "CAMERA_FOCUS"];

function appendMissionsToMonitor(mission) {
    if (mission == null) return;
    if (mission.length == 0) return;
    mission.forEach(function (item, index, array) {
        nAppendListCount++;

        var missionid = item['id'];

        if (missionid == null) {
            missionid = "mission-" + nAppendListCount;
        }

        var act = item['act'];

        if (act >= missionActionString.length) {
            act = 0;
        }

        var appendRow = "<tr class='odd gradeX' id='" + missionid + "'><td>" + nAppendListCount + "</td><td>"
            + "<table border=0 width='100%'><tr><td width='50%' class='center' bgcolor='#eee'>" + item['lat'] + "</td><td width='50%' class='center' bgcolor='#fff'> " + item['lng'] + "</td></tr>"
            + "<tr><td class='center' bgcolor='#eee'>" + item['alt'] + "/" + item['speed'] + "</td><td class='center'>"
            + missionActionString[act] + "/" + item['actparam']
            + "</td></tr></table>"
            + "</td></tr>"
        $('#monitorTable-points > tbody:last').append(appendRow);
    });
}

function moveToPositionOnMap(owner, index, lat, lng, alt, yaw, roll, pitch) {
    if (currentMonitorIndex == index && currentMonitorOwner == owner) {
        setRollStatus(roll);
        setYawStatus(yaw);
        setPitchStatus(pitch);
    }

    move3DmapIcon(owner, index, lat, lng, alt, pitch, yaw, roll);
    move2DMapIcon(owner, index, lat, lng, alt, yaw);
}

function clearDataToDesignTableWithFlightRecord() {

}

function setDataToDesignView(index) {
    if (designDataArray.length <= 0) return;

    var lat = designDataArray[index].lat;
    var lng = designDataArray[index].lng;
    var alt = designDataArray[index].alt;
    var yaw = designDataArray[index].yaw;
    var roll = designDataArray[index].roll;
    var pitch = designDataArray[index].pitch;
    var speed = designDataArray[index].speed;
    var act = designDataArray[index].act;
    var actparam = designDataArray[index].actparam;

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
    $('#removeItemBtn').click(function () {
        GATAGM('removeItemBtn', 'CONTENT', langset);
        removeMissionData(index);
        removeIconOn2DMap(index);
    });

    $('#saveItemBtn').off('click');
    $('#saveItemBtn').click(function () {
        GATAGM('saveItemBtn', 'CONTENT', langset);
        saveDesignData(index);
    });
}

function saveDesignData(index) {
    if (designDataArray.length <= 0) {
        var lng = $('#lngdata_index').val();
        var lat = $('#latdata_index').val();
        appendDataToDesignTable([lng * 1, lat * 1]);
        moveToPositionOnMap("private", 0, lat * 1,
            lng * 1,
            parseFloat($('#altdata_index').val()),
            parseFloat($('#yawdata_index').val()),
            parseFloat($('#rolldata_index').val()),
            parseFloat($('#pitchdata_index').val())
        );
    }

    designDataArray[index].lat = parseFloat($('#latdata_index').val());
    designDataArray[index].lng = parseFloat($('#lngdata_index').val());
    designDataArray[index].alt = parseFloat($('#altdata_index').val());
    designDataArray[index].yaw = parseFloat($('#yawdata_index').val());
    designDataArray[index].roll = parseFloat($('#rolldata_index').val());
    designDataArray[index].pitch = parseFloat($('#pitchdata_index').val());
    designDataArray[index].speed = parseFloat($('#speeddata_index').val());
    designDataArray[index].act = parseInt($('#actiondata_index').val());
    designDataArray[index].actparam = $('#actionparam_index').val() + "";
}

function removeSelectedFeature(selectedFeatureID) {
    var features = mainMap2DpointSource.getFeatures();

    if (features != null && features.length > 0) {
        for (x in features) {
            var properties = features[x].getProperties();

            var id = properties.id;
            if (id == selectedFeatureID) {
                mainMap2DpointSource.removeFeature(features[x]);
                break;
            }
        }
    }
}

function removeMissionData(index) {
    designDataArray.splice(index, 1);

    removeSelectedFeature(index);

    if (designDataArray.length <= 0) {
        $("#slider").hide();
        $("#dataTable-points").hide();
        return;
    }

    var newIndex = designDataArray.length - 1;

    setDataToDesignView(newIndex);
    $("#slider").slider('value', newIndex);
    $("#slider").slider('option', { min: 0, max: newIndex });

    moveToPositionOnMap("private", 0, designDataArray[newIndex].lat,
        designDataArray[newIndex].lng,
        designDataArray[newIndex].alt,
        designDataArray[newIndex].yaw,
        designDataArray[newIndex].roll,
        designDataArray[newIndex].pitch);
}

function appendMissionList(data) {
    if (data == null) return;
    if (data.length == 0) return;

		data.sort(function(a, b) { // \uB0B4\uB9BC\uCC28\uC21C
			var regtime_a = convert2data(a.regtime);
			var regtime_b = convert2data(b.regtime);
    	return regtime_b.getTime() - regtime_a.getTime();
		});


    data.forEach(function (item, index, array) {
        var appendRow = "<div class='card shadow mb-4' id='mission_row_" + index + "'><div class='card-body'><div class='row'><div class='col-sm'>"
            + "<a href='" + cur_controller + "?page_action=missiondesign&mission_name=" + encodeURIComponent(item['name']) + "' class='font-weight-bold mb-1'>"
            + item['name']
            + "</a></div></div><div class='row'><div class='col-sm text-xs font-weight-bold mb-1'>"
            + item['regtime']
            + "</div><div class='col-sm text-xs font-weight-bold mb-1'>"
            + "<a class='btn btn-warning text-xs' href='" + cur_controller + "?page_action=missiondesign&mission_name=" + encodeURIComponent(item['name']) + "' role='button'>" + LANG_JSON_DATA[langset]['msg_modify'] + "</a>&nbsp;"
            + "<button class='btn btn-primary text-xs' type='button' id='missionListBtnForRemove_" + index + "'>"
            + LANG_JSON_DATA[langset]['msg_remove'] + "</button></div></div></div></div>";
        $('#dataTable-missions').append(appendRow);

        $('#missionListBtnForRemove_' + index).click(function () {
            GATAGM('missionListBtnForRemove_' + index, 'CONTENT', langset);
            askRemoveMissionItem(item['name'], "mission_row_" + index);
        });
    });
}


function ajaxRequestAddress(address, callback, errorcallback) {
    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyANkdJYJ3zKXAjOdPFrhEEeq4M8WETn0-4",
        crossDomain: true,
        cache: false,
        type: "GET",
        success: function (r) {
            callback(r);
        },
        error: function (request, status, error) {
            monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            errorcallback(request, status, error);
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

        moveToPositionOnMap("private", 0, r['results'][0].geometry.location.lat, r['results'][0].geometry.location.lng, 0, 0, 0, 0);

    }, function (request, status, error) {
        showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
    });
}

var nAppendListCount = 0;

function askClearCurrentDesign() {
    showAskDialog(
        LANG_JSON_DATA[langset]['modal_title'],
        LANG_JSON_DATA[langset]['msg_are_you_sure'],
        LANG_JSON_DATA[langset]['btnForClearMission'],
        false,
        function () { clearCurrentDesign(); },
        function () {}
    );
}

function clearCurrentDesign() {
    if (isSet(mainMap2DlineSource))
        mainMap2DlineSource.clear();

    mainMap2DpointSource.clear();
    mainMap2DposSource.clear();
    designDataArray = Array();
    $("#dataTable-points").hide();
}


function searchMission(keyword) {
    if (isSet(keyword) == false) {
        showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
        return;
    }

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "mission", "daction": "find_mission", "keyword": keyword, "clientid": userid };

    hasMore = "";

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {

            $('#dataTable-missions').empty();
            nAppendListCount = 0;

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

            hideLoader();
        }
    }, function (request, status, error) {
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function searchFlightRecord(target, keyword) {
    if (isSet(keyword) == false) {
        showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
        return;
    }

    var userid = getCookie("dev_user_id");
    var isPublic = (target == "public") ? true : false;
    var jdata = { "action": "position", "daction": "find_record", "keyword": keyword, "clientid": userid, "public": isPublic };

    hasMore = "";

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
                $('#btnForLoadFlightList').text(LANG_JSON_DATA[langset]['msg_load_more']);
            }
            else {
                hasMore = null;
                $('#btnForLoadFlightList').hide(1500);
            }

            $('#historyMap').show();

            flightRecArray = [];
            $('#dataTable-Flight_list').empty();
            nAppendListCount = 0;
            makeFlightRecordsToTable(target, r.data);
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



function getFlightRecords(target) {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "download", "clientid": userid };

    if (target == "public") {
        jdata['public'] = true;
        var targetId = decodeURIComponent(getQueryVariable("user_email"));
        if (isSet(targetId)) {
        	jdata['owner_email'] = targetId;
        	
        	$('#page_about_title').text(targetId + " : " + LANG_JSON_DATA[langset]['open_record_label']);        	
        }                
    }
    
    var keyword = decodeURIComponent(getQueryVariable("keyword"));
    if (isSet(keyword) && keyword != "") {
    		jdata['daction'] = "find_record";
    		jdata['keyword'] = keyword;
    }

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
                $('#btnForLoadFlightList').text(LANG_JSON_DATA[langset]['msg_load_more']);
                $('#btnForLoadFlightList').show();
            }
            else {
                hasMore = null;
                $('#btnForLoadFlightList').hide(1500);
            }

            $('#historyMap').show();

            makeFlightRecordsToTable(target, r.data);
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



function makeFlightRecordsToTable(target, data) {
    if (data == null || data.length == 0)
        return;

    data.sort(function(a, b) { // \uB0B4\uB9BC\uCC28\uC21C
    	return b.dtimestamp - a.dtimestamp;
		});

    data.forEach(function (item) {
        appendFlightRecordTable(target, item);
        flightRecArray.push(item);
    });    
}

function getFlightRecordTitle() {
    if (!isSet($("#record_name_field"))) return "";

    return $("#record_name_field").text();
}

function setFlightRecordTitle(msg) {
    if (!isSet($("#record_name_field"))) return;

    $("#record_name_field").val(msg);
}

function setFilter(target) {
    setFlightRecordDataToView(target, null, true);
    $('#btnForFilter').prop('disabled', true);
}

function stopShareFlightData(index, name, target_id) {

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "stop_share", "name": name, "clientid": userid, "target_id": target_id };

    showLoader();

    ajaxRequest(jdata, function (r) {
        if (r.result != "success") {
            showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        }
        else {
            $("#shareid_" + index).hide();
            if (target_id == "public@duni.io") {
                $("#btnForPublic").show();
            }
        }

        hideLoader();
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });

}


function makeShareFlightData(name, user_email) {

    var userid = getCookie("dev_user_id");

    if (user_email == "public")
        user_email = "public@duni.io";

    var jdata = { "action": "position", "daction": "share", "name": name, "clientid": userid, "target": user_email };

    showLoader();

    ajaxRequest(jdata, function (r) {
        if (r.result != "success") {
            if (r.reason == "no user") {
                showAlert(LANG_JSON_DATA[langset]['msg_no_email']);
            }
            else {
                showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
            }
        }
        else {
            if ("sharedList" in r) {
                var sharedList = r.sharedList;
                var link_text = "";
                var user_text = "";
                sharedList.some(function (item, index, array) {
                    var premail = item.email;
                    if (item.email == "public@duni.io") {
                        premail = LANG_JSON_DATA[langset]['all_member_msg'];
                    }

                    if (item.type == "user") {
                        user_text += ("<div id='shareid_" + index + "'> " + premail + " : <a href='#' id='user_share_" + index + "'>" + LANG_JSON_DATA[langset]['stop_share_label'] + "</a><hr size=1 color=#eeeeee width=100%></div>");
                    }
                });

                $("#shared_user").show();
                $("#shared_user").html(user_text);
                $("#shared_link").html(link_text);

                sharedList.some(function (item, index, array) {
                    var premail = item.email;
                    if (item.email == "public@duni.io") {
                        premail = LANG_JSON_DATA[langset]['all_member_msg'];

                        $("#btnForPublic").hide();
                    }

                    $("#user_share_" + index).click(function () {
                        showAskDialog(
                            LANG_JSON_DATA[langset]['modal_title'],
                            premail + " : " + LANG_JSON_DATA[langset]['msg_are_you_sure'],
                            LANG_JSON_DATA[langset]['stop_share_label'],
                            false,
                            function () { stopShareFlightData(index, name, item.target); },
                            function () {}
                        );
                    });
                });

                showAlert(LANG_JSON_DATA[langset]["msg_success"]);
            }
        }

        hideLoader();
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });

}

function showDataWithName(target, name) {

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "download_spe", "name": name, "clientid": userid };

		if (target == "public") {
        jdata['public'] = true;
    }

    showLoader();

    setFlightRecordTitle(name);
    cur_flightrecord_name = name;

    $("#movieTitle").val(name);
    $("#movieDescription").val(name);
    $("#btnForPublic").hide();
    $("#btnForDelete").hide();
    $("#btnForUpdateTitle").hide();

    ajaxRequest(jdata, function (r) {

    		if (r.result != "success") {
            showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
            hideLoader();
            return;
        }                
        
        var fdata = r.data;

        var n_title = name;
        if ((target == "private") && ("owner" in fdata && userid != fdata.owner)) {
            n_title = name + " : " + LANG_JSON_DATA[langset]['shared_record_data_msg'];
            if ("owner_email" in fdata) {
                n_title = name + " : " + LANG_JSON_DATA[langset]['shared_record_data_msg'] + " / " + fdata.owner_email;
            }
        }
        else {
            if ((target == "public") && "owner_email" in fdata) {
                n_title = name + " / " + fdata.owner_email;
            }
        }

        setFlightRecordTitle(n_title);

        moviePlayerVisible = false;

        if ("memo" in fdata && isSet(fdata.memo)) {
            $("#memoTextarea").val(fdata.memo);            
        }
        
        if ("tag_values" in fdata && isSet(fdata.tag_values)) {
	        if (target == "private") {
	            $("#tagTextarea").val(fdata.tag_values);	            
	        }                
	        else {
	        		$("#tagTextarea").hide();	        								
	        		var targetList = (target == "public" ? "public" : "");	
				    	var tagArray = JSON.parse(fdata.tag_values);
				    	var appendRow = "";
				    	tagArray.forEach(function(tg) {
				    		appendRow = appendRow + "<a href=" + cur_controller + "?page_action=" + targetList + "recordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
				    	});					    
				    	
				    	$("#tagArrayarea").html(appendRow);
	        }
	      }                
	      
	      if (target == "private") {
		      var input = document.querySelector('input[name=tagTextarea]');
					new Tagify(input);
				}

        if ((target == "private") && ("sharedList" in fdata)) {
            $("#btnForPublic").show();

            var sharedList = fdata.sharedList;
            var link_text = "";
            var user_text = "";
            sharedList.some(function (item, index, array) {
                var premail = item.email;
                if (item.email == "public@duni.io") {
                    premail = LANG_JSON_DATA[langset]['all_member_msg'];
                    $("#btnForPublic").hide();
                }

                if (item.type == "user") {
                    user_text += ("<div id='shareid_" + index + "'> " + premail + " : <a href='#' id='user_share_" + index + "'>" + LANG_JSON_DATA[langset]['stop_share_label'] + "</a><hr size=1 color=#eeeeee width=100%></div>");
                }
            });

            $("#shared_user").html(user_text);
            $("#shared_link").html(link_text);

            sharedList.some(function (item, index, array) {
                var premail = item.email;
                if (item.email == "public@duni.io") {
                    premail = LANG_JSON_DATA[langset]['all_member_msg'];
                }

                $("#user_share_" + index).click(function () {
                    showAskDialog(
                        LANG_JSON_DATA[langset]['modal_title'],
                        premail + " : " + LANG_JSON_DATA[langset]['msg_are_you_sure'],
                        LANG_JSON_DATA[langset]['stop_share_label'],
                        false,
                        function () { stopShareFlightData(index, name, item.target); },
                        function () {}
                    );
                });
            });
        }

        $("#btnForUpdateTitle").click(function () {
        		GATAGM('btnForUpdateTitle', 'CONTENT', langset);

        		if ("sharedList" in fdata && isSet(fdata.sharedList) && fdata.sharedList.length > 0) {
                showAlert(LANG_JSON_DATA[langset]['msg_stop_share_before_remove']);
                return;
            }

				    setFlightRecordTitleName();
		    });

        $("#btnForDelete").click(function () {
            GATAGM('btnForPublic', 'CONTENT', langset);

            if ("sharedList" in fdata && isSet(fdata.sharedList) && fdata.sharedList.length > 0) {
                showAlert(LANG_JSON_DATA[langset]['msg_stop_share_before_remove']);
                return;
            }

				    showAskDialog(
				        LANG_JSON_DATA[langset]['modal_title'],
				        fdata.name + " : " + LANG_JSON_DATA[langset]['msg_are_you_sure'],
				        LANG_JSON_DATA[langset]['msg_remove'],
				        false,
				        function () { deleteFlightData(name, -1); },
                function () {}
				    );
        });

        $("#btnForPublic").click(function () {
            GATAGM('btnForPublic', 'CONTENT', langset);
            showAskDialog(
                LANG_JSON_DATA[langset]['modal_title'],
                LANG_JSON_DATA[langset]['msg_sure_for_public'],
                LANG_JSON_DATA[langset]['modal_confirm_btn'],
                false,
                function (email) {
                    makeShareFlightData(fdata.name, "public");
                },
                function () {}
            );
        });

        $("#btnForSharing").click(function () {
            GATAGM('btnForSharing', 'CONTENT', langset);
            showAskDialog(
                LANG_JSON_DATA[langset]['modal_title'],
                LANG_JSON_DATA[langset]['msg_input_member_email'],
                LANG_JSON_DATA[langset]['modal_confirm_btn'],
                true,
                function (email) {
                    makeShareFlightData(fdata.name, email);
                },
                function () {}
            );
        });

        $("#flightMemoBtn").click(function () {
            GATAGM('flightMemoBtn', 'CONTENT', langset);
            updateFlightMemoWithValue(name, $("#memoTextarea").val());
        });
        
        
        
        $("#flightTagBtn").click(function () {
            GATAGM('flightTagBtn', 'CONTENT', langset);
            updateFlightTagWithValue(name, $("#tagTextarea").val());
        });

        if ("youtube_data_id" in fdata) {
            if (fdata.youtube_data_id.indexOf("youtube") >= 0) {
                setYoutubePlayer(fdata.youtube_data_id);
            }
            else {
                setYoutubePlayer("");
            }

            hideMovieDataSet();
        }
        else {
            $("#youTubePlayer").hide();
        }

        if (moviePlayerVisible == true) {
            hideMovieDataSet();
        }
        else {
            showMovieDataSet();
        }

        if (target == "public") {
            $("#modifyBtnForMovieData").hide();
            $("#btnForSharing").hide();
            $("#btnForPublic").hide();
            $("#btnForSetYoutubeID").hide();
            $("#flightMemoBtn").hide();
						$("#btnForUpdateTitle").hide();
						$("#btnForDelete").hide();
						$("#recordDataSet").hide();
						$("#flightTagBtn").hide();
						$("#tagTextarea").prop("disabled",true);						
            $("#memoTextarea").prop("disabled", true);            
            hideMovieDataSet();
        }
        else {
            if (target == "private") {
            	if(("isowner" in fdata && fdata.isowner == true) || !("isowner" in fdata)) {
                $("#btnForSharing").show();
              }

              $("#btnForDelete").show();
              $("#btnForUpdateTitle").show();

              if (!isSet(fdata.flat)) {
                $("#recordDataSet").show();
            	}
            }
        }

        var exist_data = setFlightRecordDataToView(target, fdata.data, false);
				if (exist_data) {
					if (isSet(fdata.cada)) {
							setAddressAndCada("#map_address", fdata.address, fdata.cada, mainMap2DpointSource);              
          }
          else {
              var dpoint = ol.proj.fromLonLat([fdata.flng, fdata.flat]);
            	rawCadastral("#map_address", name, dpoint[0], dpoint[1], mainMap2DpointSource);
          }	            	                            		              
				}
				else {
					$("#altitude_graph_area").hide();
          $("#map_area").hide();
				}            
				
				hideLoader();

    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function moveToStartPoint3D(lng, lat, alt) {
		if (isSet(v3DMapViewer) == false) return;

		var camera = v3DMapViewer.camera;
		camera.flyTo({
      destination : Cesium.Cartesian3.fromDegrees(lng, lat, alt),
      orientation : {
        heading : Cesium.Math.toRadians(0.0),
        pitch : Cesium.Math.toRadians(-70.0),
      }
    });
}

function makeForFlightListMap(index, flat, flng, hasYoutube) {
    var dpoint = ol.proj.fromLonLat([flng * 1, flat * 1]);

    var c_view = new ol.View({
        center: dpoint,
        zoom: 12
    });

    var vSource = new ol.source.Vector();

    var vVectorLayer = new ol.layer.Vector({
        source: vSource,
        zIndex: 10000,
        style: new ol.style.Style({            
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

    var icon = createNewIconFor2DMap(index, "#0000ff", { lat: flat, lng: flng, alt: 0, hasYoutube : hasYoutube });
    vSource.addFeature(icon);

    if (isSet(vVectorForHistory)) {
        vVectorForHistory.addFeature(icon);
    }

    return vSource;
}

function updateCadaData(record_name, address, cada_data) {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "set_cada", "clientid": userid, "cada": cada_data, "address": address, "name": record_name };

    ajaxRequest(jdata, function (r) {

    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function drawCadastral(disp_id, name, x, y, vSource) {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "cada", "clientid": userid, "x": x, "y": y };

    ajaxRequest(jdata, function (r) {
    	  hideLoader();
        if (r == null || r.data == null || r.data.response.status !== "OK") {
        	return;
        }

				var response = r.data.response;
        var _features = new Array();
        var _addressText = "";

        for (var idx = 0; idx < response.result.featureCollection.features.length; idx++) {
            try {
                var geojson_Feature = response.result.featureCollection.features[idx];
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

                                if (_addressText == "" && key == "addr") {
                                    _addressText = value;
                                }

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

        setAddressAndCada(disp_id, _addressText, _features, vSource);
        if (vVectorForHistory) {
            setAddressAndCada(disp_id, _addressText, _features, vVectorForHistory);
        }

        updateCadaData(name, _addressText, response.result.featureCollection.features);

    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });

}



function setAddressAndCada(address_id, address, cada, wsource) {
    //var curText = getFlightRecordTitle();
    var _features = new Array();
    var _addressText = "";


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

                            if (_addressText == "" && key == "addr") {
                                _addressText = value;
                            }

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

    if (isSet($(address_id)))
        $(address_id).text(address);
}

function appendFlightRecordTable(target, item) {
    var name = item.name;
    var dtimestamp = item.dtime;
    var data = item.data;
    
    var address = item.address;
    var cada = item.cada;
    var memo = item.memo;
    var owner_email = item.owner_email;
    var sharedList = item.sharedList;
    var youtube_data_id = item.youtube_data_id;
    var curIndex = nAppendListCount;
    var tag_values = item.tag_values;
    
    var flat = (isSet(item.flat) ? item.flat * 1 : -999);
		var flng = (isSet(item.flng) ? item.flng * 1 : -999);

    var appendRow = "<div class='card shadow mb-4' id='flight-list-" + curIndex + "' name='flight-list-" + curIndex + "'><div class='card-body'><div class='row'><div class='col-sm'>";
    appendRow = appendRow + (curIndex + 1) + " | ";
    if (target == "public") {
        appendRow = appendRow
            + "<a onclick='GATAGM(\"flight_list_public_title_click_"
            + name + "\", \"CONTENT\", \""
            + langset + "\");' href='" + cur_controller + "?page_action=publicrecordlist_detail&record_name="
            + encodeURIComponent(name) + "'>" + name + "</a>";
    }
    else {
        appendRow = appendRow + "<a onclick='GATAGM(\"flight_list_title_click_" + name + "\", \"CONTENT\", \""
            + langset + "\");' href='" + cur_controller + "?page_action=recordlist_detail&record_name="
            + encodeURIComponent(name) + "'>" + name + "</a>";
    }

    appendRow = appendRow + "</div></div><div class='row'>";//row

    if(isSet(youtube_data_id)) {
    		appendRow = appendRow + "<div class='col-sm' id='youTubePlayer_" + curIndex + "'></div>";
    }

    if (flat != -999) {
        appendRow = appendRow + "<div class='col-sm' id='map_" + curIndex + "' style='height:200px;'></div>";
    }

    appendRow = appendRow + "</div><div class='row'><div class='col-sm text-right'><a href='#' class='text-xs' id='map_address_" + curIndex + "'></a><div class='form-group'><textarea class='form-control' id='memoTextarea_" + curIndex + "' rows='3'>";

    if (isSet(memo)) {
        appendRow = appendRow + memo;
    }

    appendRow = appendRow + "</textarea>";
    appendRow = appendRow + "<button class='btn btn-primary text-xs' type='button' id='btnForUpdateMemo_" + curIndex + "'>" + LANG_JSON_DATA[langset]['msg_modify_memo'] + "</button></div></div></div>"; //form-group col-sm
    
    appendRow = appendRow + "<div class='row'><div class='col-sm'>";
    
    if (isSet(tag_values) && tag_values != "") {
    	var targetList = (target == "public" ? "public" : "");
    	var tag_array = JSON.parse(tag_values);
    	tag_array.forEach(function(tg) {     		
    		appendRow = appendRow + "<a href=" + cur_controller + "?page_action=" + targetList + "recordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
    	});
    }
    
    appendRow = appendRow + "</div></div>";
    
    appendRow = appendRow + "<div class='row'><div class='col-sm'><span id='owner_email_" + curIndex + "' class='text-xs font-weight-bold mb-1'></span><span class='text-xs font-weight-bold mb-1'>" + dtimestamp + "</span></div></div>"
        + "<div class='row'><div class='col-sm text-right'>"
        + "<button class='btn btn-secondary text-xs' type='button' id='btnForRemoveFlightData_" + curIndex + "'>" + LANG_JSON_DATA[langset]['msg_remove'] + "</button>"
        + "</div></div></div></div>"; //row, card-body, card

    if (isSet(youtube_data_id)) {
	  	var vid = getYoutubeQueryVariable(youtube_data_id);
			appendRow = appendRow + "<a id='video-pop-" + curIndex +  "' video-ispublic=" + (target == "public" ? "true" : "false") + " video-lang='" + langset + "' video-owner='" + owner_email + "' video-name='" + name + "' video-url='https://www.youtube.com/watch?v=" + vid + "'></a>";
	  }

    $('#dataTable-Flight_list').append(appendRow);

    if (isSet(youtube_data_id)) {
			$("#video-pop-" + curIndex).videoPopup();
	  }

    $("#owner_email_" + curIndex).hide();

    if (target == "public") {
        if (isSet(owner_email)) {
            var oemail = "<a href='" + cur_controller + "?page_action=publicrecordlist&user_email=" + encodeURIComponent(owner_email) + "'>" + owner_email + "</a> | ";
            $("#owner_email_" + curIndex).show();
            $("#owner_email_" + curIndex).html(oemail);
        }

        $("#memoTextarea_" + curIndex).prop('disabled', true);
        $("#btnForUpdateMemo_" + curIndex).hide();
        $("#btnForRemoveFlightData_" + curIndex).hide();
    }
    else {
        $('#btnForRemoveFlightData_' + curIndex).click(function () {
            GATAGM('btnForRemoveFlightData_' + curIndex, 'CONTENT', langset);
            if (isSet(sharedList) && sharedList.length > 0) {
                showAlert(LANG_JSON_DATA[langset]['msg_stop_share_before_remove']);
            }
            else askDeleteFlightData(name, curIndex);
        });

        $('#btnForUpdateMemo_' + curIndex).click(function () {
            GATAGM('btnForUpdateMemo_' + curIndex, 'CONTENT', langset);
            updateFlightMemo(curIndex);
        });
    }

    $('#map_address_' + curIndex).click(function () {
        GATAGM('map_address_' + curIndex, 'CONTENT', langset);
        moveFlightHistoryMap(flat, flng);
    });

    var retSource = null;
    if (flat != -999) {
        retSource = makeForFlightListMap(curIndex, flat, flng, (isSet(youtube_data_id) ? true : false));
    }

    setYoutubeVideo(curIndex, youtube_data_id);

    if (isSet(retSource) && isSet(address) && address != "") {
        setAddressAndCada("#map_address_" + curIndex, address, cada, retSource);
        setAddressAndCada("#map_address_" + curIndex, address, cada, vVectorForHistory);
    }
    else {
        if (flat != -999) {
            var dpoint = ol.proj.fromLonLat([flng, flat]);
            drawCadastral("#map_address_" + curIndex, name, dpoint[0], dpoint[1], retSource);
        }
    }

    if (flat != -999) {
        moveFlightHistoryMap(flat, flng);
    }

    nAppendListCount++;
}

function moveFlightHistoryMap(lat, lng) {
    var npos = ol.proj.fromLonLat([lng, lat]);
    flightRecords2DMapView.setCenter(npos);
}


function setYoutubeVideo(index, youtube_url) {
		if (isSet(youtube_url) == false) {				
				return;
		}

		var vid = getYoutubeQueryVariable(youtube_url);		

		players[index] = new YT.Player("youTubePlayer_" + index, {
      height: '200',
      width: '100%',
      videoId: vid,
      events: {
        'onReady': onPlayerReadyForList,
        'onStateChange': onPlayerStateChange
      }
    });
}

function onPlayerReadyForList(event) {
  	event.target.stopVideo();
}

function updateFlightMemoWithValue(name, memo) {
    var userid = getCookie("dev_user_id");

    if (!isSet(memo)) {
        showAlert(LANG_JSON_DATA[langset]['msg_fill_memo']);
        return;
    }
    var jdata = { "action": "position", "daction": "set_memo", "clientid": userid, "name": name, "memo": memo };

    showLoader();
    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result != "success") {
            showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        }
        else {
            showAlert(LANG_JSON_DATA[langset]['msg_success']);
        }
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function updateFlightTagWithValue(name, tag_value) {
		var userid = getCookie("dev_user_id");

    if (!isSet(tag_value)) {
        showAlert(LANG_JSON_DATA[langset]['msg_fill_tag']);
        return;
    }
    var jdata = { "action": "position", "daction": "set_tag", "clientid": userid, "name": name, "tag_values": tag_value };

    showLoader();
    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result != "success") {
            showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        }
        else {
            showAlert(LANG_JSON_DATA[langset]['msg_success']);
        }
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
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
    var jdata = { "action": "position", "daction": "set_memo", "clientid": userid, "name": item.name, "memo": memo };

    showLoader();
    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result != "success") {
            showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        }
        else {
            showAlert(LANG_JSON_DATA[langset]['msg_success']);
        }
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function askDeleteFlightData(name, index) {
    showAskDialog(
        LANG_JSON_DATA[langset]['modal_title'],
        name + " : " + LANG_JSON_DATA[langset]['msg_are_you_sure'],
        LANG_JSON_DATA[langset]['msg_remove'],
        false,
        function () { deleteFlightData(name, index); },
        function () {}
    );
}

function deleteFlightData(name, index) {

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "delete", "clientid": userid, "name": name };

    showLoader();
    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result != "success") {
            showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        }
        else {
        		if (index >= 0)
            	removeTableRow("flight-list-" + index);
            else {
            	alert(LANG_JSON_DATA[langset]['msg_success']);
            	location.href = cur_controller + "?page_action=recordlist";
            }
        }
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}


function removeTableRow(rowname) {
    $("#" + rowname).hide();
}

function askRemoveMissionItem(name, trname) {
    showAskDialog(
        LANG_JSON_DATA[langset]['modal_title'],
        name + " : " + LANG_JSON_DATA[langset]['msg_are_you_sure'],
        LANG_JSON_DATA[langset]['msg_remove'],
        false,
        function () { removeMissionItem(name, trname); },
        function () {}
    );
}
function removeMissionItem(name, trname) {
    var userid = getCookie("dev_user_id");
    var jdata = { "action": "mission", "mname": name, "daction": "delete", "clientid": userid };

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            $("#" + trname).hide();
        }
        else {
            showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        }
    }, function (request, status, error) { });
}

function monitor(msg) {
    var info = $('#monitor').html("<font color=red><b>" + msg + "</b></font>");
}

function askMissionNameForDesignRegister() {
    showAskDialog(
        LANG_JSON_DATA[langset]['modal_title'],
        LANG_JSON_DATA[langset]['msg_input_mission_name'],
        LANG_JSON_DATA[langset]['modal_confirm_btn'],
        true,
        function (mname) {
            setTimeout(function () { askSpeedForDesignRegister(mname); }, 1000);
        },
        function () {}
    );
}

function askSpeedForDesignRegister(mname) {
    showAskDialog(
        LANG_JSON_DATA[langset]['modal_title'],
        LANG_JSON_DATA[langset]['msg_input_speed'],
        LANG_JSON_DATA[langset]['modal_confirm_btn'],
        true,
        function (mspeed) {
            if (parseFloat(mspeed) <= 0.0) {
                showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
                return;
            }

            registMission(mname, mspeed);
        },
        function () {}
    );
}

function registMission(mname, mspeed) {
    if (designDataArray.length <= 0) {
        showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
        return;
    }

    var nPositions = [];
    var bError = 0;
    for (var index = 0; index < designDataArray.length; index++) {
        var item = designDataArray[index];

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
        nPositions.push({ id: mid, lat: item.lat, lng: item.lng, alt: item.alt, act: item.act, actparam: item.actparam, speed: item.speed, roll: item.roll, pitch: item.pitch, yaw: item.yaw });
    }

    if (bError > 0) {
        showAlert(LANG_JSON_DATA[langset]['msg_error_check']);
        return;
    }

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "mission", "mname": mname, "daction": "set", "missionspeed": mspeed, "missiondata": nPositions, "clientid": userid };

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
				    alert(mname + " (" + mspeed + "m/s) : " + LANG_JSON_DATA[langset]['msg_success']);
				    location.href = cur_controller + "?page_action=list";
        }
        else {
            showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        }
    }, function (request, status, error) { });
}


function drawLineTo2DMap(map, lineData) {
    var lines = new ol.geom.LineString(lineData);
    var lineSource = new ol.source.Vector({
        features: [new ol.Feature({
            geometry: lines,
            name: 'Line'
        })]
    });
    lineLayerForGlobal = new ol.layer.Vector({
        source: lineSource,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#55a6cc',
                width: 2
            })
        })
    });

    map.addLayer(lineLayerForGlobal);
}

function addPosIconsTo2DMap(posIcons) {
    if (posIcons.length <= 0) return;

    main2dMap.on('click', function (evt) {
        GATAGM('map', 'CONTENT', langset);

        var feature = main2dMap.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                return feature;
            });

        var locdata = null;
        if (feature) {
            var ii = feature.get('mindex');
            locdata = arrayFlightRecordData[ii];

            setMoveActionFromMap(ii, locdata);
        }

        var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        if (locdata)
            showCurrentInfo([lonlat[0], lonlat[1]], locdata.alt);
        else
            showCurrentInfo([lonlat[0], lonlat[1]], '0');

    });

    var pSource = new ol.source.Vector({
        features: posIcons
    });

    posLayerForGlobal = new ol.layer.Vector({
        source: pSource
    });

    main2dMap.addLayer(posLayerForGlobal);

}

var oldLat = 0, oldLng = 0, oldAlt = 0;

function isNeedSkip(lat, lng, alt) {
    var ddl1 = Math.abs(lat - oldLat);
    var ddl2 = Math.abs(lng - oldLng);
    var ddl3 = Math.abs(alt - oldAlt);

    if (ddl1 > 0.001 || ddl2 > 0.002 || ddl3 > 3) { //\uC784\uC758 \uD544\uD130
        return true;
    }

    return false;
}

function setFlightRecordDataToView(target, cdata, bfilter) {

    if (isSet(cdata) == false || cdata.length <= 0 || cdata == "" || cdata == "-") {
        if (bfilter == true) {
            cdata = arrayFlightRecordData;
        }
        else {
        		//\uC704\uCE58 \uB370\uC774\uD130\uAC00 \uC5C6\uC74C.
            return false;
        }
    }

    var arrayMapPosIcons = [];    
    arrayFlightRecordData = [];
    chartAltitudeLineData = [];
    var lineData = [];

		var rlng, rlat;
    cdata.forEach(function (item, i, arr) {

        if (bfilter && i > 4 && isNeedSkip(item.lat, item.lng, item.alt) == true) {
        	return true;
				}

        addChartItem(i, item);
        
        var pos_icon = new ol.Feature({
		        geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
		        name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
		        mindex: i
		    });
		
		    var pos_icon_color = getColorPerAlt(item.alt);
		
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

    if (isSet(lineLayerForGlobal))
        main2dMap.removeLayer(lineLayerForGlobal);

    if (isSet(posLayerForGlobal))
        main2dMap.removeLayer(posLayerForGlobal);

		if (isSet(rlng) && isSet(rlat)) {
				moveToStartPoint3D(rlng, rlat, 600);
		}

    setSlider(cdata.length - 1);

    drawLineTo2DMap(main2dMap, lineData);

    addPosIconsTo2DMap(arrayMapPosIcons);

    drawLineGraph();

    draw3dMap();

    var item = arrayFlightRecordData[0];
    moveToPositionOnMap("private", 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
    
    return true;
}

var oldScatterdatasetIndex = -1;
var oldScatterpointIndex = -1;

var oldLinedatasetIndex = -1;
var oldLinepointIndex = -1;


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
		    setCookie("device_kind", "", -1);
		    setCookie("device_id", "", -1);
        setCookie("user_email", "", -1);
        setCookie("image_url", "", -1);
        setCookie("temp_sns_token", "", -1);
        setCookie("temp_image_url", "", -1);
        setCookie("temp_email", "", -1);
        setCookie("temp_name", "", -1);

        goIndex("logout");
    }, function (request, status, error) {
        setCookie("dev_user_id", "", -1);
        setCookie("user_token", "", -1);
        setCookie("dev_token", "", -1);
        setCookie("device_kind", "", -1);
        setCookie("device_id", "", -1);
        setCookie("user_email", "", -1);
        setCookie("image_url", "", -1);
        setCookie("temp_sns_token", "", -1);
        setCookie("temp_image_url", "", -1);
        setCookie("temp_email", "", -1);
        setCookie("temp_name", "", -1);

    		goIndex("logout");
    });
}


function computeCirclularFlight(start) {
    var property = new Cesium.SampledPositionProperty();

    if (!isSet(v3DMapViewer)) return null;

    v3DMapViewer.entities.removeAll();

    var i = 0;
    arrayFlightRecordData.forEach(function (item) {
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

        var icon_color = getColorPerAlt3d(item.alt);

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

var fixedFrameTransform;
var planePrimitives;
var v3DMapViewer;
var v3DMapCate;
var c3ddataSource;
var p3DMapEntity;
var s3DMapScene;

function getColor(colorName, alpha) {
    var color = Cesium.Color[colorName.toUpperCase()];
    return Cesium.Color.fromAlpha(color, parseFloat(alpha));
}

function draw3dMap() {
    var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));

    var position = computeCirclularFlight(start);
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

function addObjectTo3DMap(index, owner, kind) {

    if (!isSet(planePrimitives)) {
        return;
    }

    if (!(owner in planePrimitives)) {
        planePrimitives[owner] = [];
    }

    var camera = v3DMapViewer.camera;

    var position = Cesium.Cartesian3.fromDegrees(
        126.5610038, 33.3834381, 3000
    );

    var glbUrl, gColor, gColor;
    if (kind == "drone") {
        glbUrl = "https://pilot.duni.io/center/imgs/drone.glb";
        gColor = "YELLOW";
        sColor = "RED";
    }
    else {
    		glbUrl = "https://pilot.duni.io/center/imgs/drone.glb";
    		gColor = "GREEN";
    		sColor = "CYAN";
    }

    var hpRoll = new Cesium.HeadingPitchRoll();
    var planePrimitive = s3DMapScene.primitives.add(
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

    planePrimitive.readyPromise.then(function (model) {
        // Play and loop all animations at half-speed
        model.activeAnimations.addAll({
            multiplier: 0.5,
            loop: Cesium.ModelAnimationLoop.REPEAT,
        });
        
        var r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);                        
        Cesium.Matrix4.multiplyByPoint(
            model.modelMatrix,
            model.boundingSphere.center,
            v3DMapCate
        );
        var heading = Cesium.Math.toRadians(230.0);
        var pitch = Cesium.Math.toRadians(-20.0);
        var hpRange = new Cesium.HeadingPitchRange();
        hpRange.heading = heading;
        hpRange.pitch = pitch;
        hpRange.range = r * 50.0;
        camera.lookAt(v3DMapCate, hpRange);
    });

    planePrimitives[owner].push(planePrimitive);

}

function map3dInit() {
  	if(use3DMap == false) {
	    $("#main3dMap").hide();//for the license
	    $("#map3dViewer").text(LANG_JSON_DATA[langset]['msg_sorry_now_on_preparing']);
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
        s3DMapSceneOnly: true,
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

    v3DMapCate = new Cesium.Cartesian3();
    controller = s3DMapScene.screenSpaceCameraController;
    planePrimitives = {};
}

function move3DmapIcon(owner, index, lat, lng, alt, pitch, yaw, roll) {
    if (typeof Cesium !== "undefined") {

        if (!isSet(planePrimitives)) return;

        var position = Cesium.Cartesian3.fromDegrees(
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

        var hpRoll = new Cesium.HeadingPitchRoll();
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


function remove2dObjects() {
    if (arrayCurrentMainMap2DObjectPos != null) {
        arrayCurrentMainMap2DObjectPos.forEach(function (owner) {
            owner.forEach(function (cur_pos) {
                mainMap2DVectorSource.removeFeature(cur_pos);
            });
        });
    }

    arrayCurrentMainMap2DObjectPosImage = null;
}

function addObjectTo2dMap(index, owner, kind) {
    if (!isSet(mainMap2DVectorSource)) return;

    if (!isSet(arrayCurrentMainMap2DObjectPos)) {
        arrayCurrentMainMap2DObjectPos = [];
        arrayCurrentMainMap2DObjectPosImage = [];
    }

    if (!(owner in arrayCurrentMainMap2DObjectPos)) {
        arrayCurrentMainMap2DObjectPos[owner] = [];
        arrayCurrentMainMap2DObjectPosImage[owner] = [];
    }

    var current_pos = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([126.5610038, 33.3834381]))
    });

    var dsrc;
    if (kind == "drone") {
        dsrc = './imgs/position2.png';
    }
    else {
        dsrc = './imgs/position.png';
    }

    var current_pos_image = new ol.style.Icon(({
        //color: '#8959A8',
        scale: 1.4,
        crossOrigin: 'anonymous',
        src: dsrc
    }));

    if (owner == "private" && kind == "drone")
        current_pos.setStyle(style2DObjectFunction(current_pos_image, ""));
    else
        current_pos.setStyle(style2DObjectFunction(current_pos_image, index + " : " + kind + " / " + owner));

    arrayCurrentMainMap2DObjectPos[owner].push(current_pos);
    arrayCurrentMainMap2DObjectPosImage[owner].push(current_pos_image);

    mainMap2DVectorSource.addFeature(current_pos);
}

function map2dInit() {

    var styles = [
        'Road',
        'Aerial',
        'AerialWithLabels'
    ];
    var maplayers = [];
    var i, style_len = styles.length;
    for (i = 0; i < style_len; ++i) {
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

    mainMap2DposSource = new ol.source.Vector();

    currentMainMap2DView = new ol.View({
        center: dokdo,
        zoom: 17
    });

    var geolocation = new ol.Geolocation({
        trackingOptions: {
            enableHighAccuracy: true
        },
        projection: currentMainMap2DView.getProjection()
    });

    mainMap2DpointSource = new ol.source.Vector({});
    mainMap2DpointSource.on('tileloaderror', function () {
        showAlert(LANG_JSON_DATA[langset]['msg_failed_to_load_map_sorry']);
    });

    var pointLayer = new ol.layer.Vector({
        source: mainMap2DpointSource,
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

		mainMap2DVectorSource = new ol.source.Vector();

    var vectorLayer = new ol.layer.Vector({
        source: mainMap2DVectorSource,
        zIndex: 10000
    });

    maplayers.push(pointLayer);
    maplayers.push(vectorLayer);

    // update the HTML page when the position changes.
    geolocation.on('change', function () {
        $('#accuracy').text(geolocation.getAccuracy() + ' [m]');
        $('#altitude').text(geolocation.getAltitude() + ' [m]');
        $('#altitudeAccuracy').text(geolocation.getAltitudeAccuracy() + ' [m]');
        $('#heading').text(geolocation.getHeading() + ' [rad]');
        $('#speed').text(geolocation.getSpeed() + ' [m/s]');
        var pos = geolocation.getPosition();
        var lonLat = ol.proj.toLonLat(pos);
        moveToPositionOnMap("private", 0, lonLat[1], lonLat[0], 0, geolocation.getHeading(), 0, 0);
    });

    // handle geolocation error.
    geolocation.on('error', function (error) {
        var info = $('#monitor');
        info.text(error.message);
    });

    if (isSet($('#track'))) {
        $('#track').change(function () {
            geolocation.setTracking($("#track").is(":checked"));
        });
    }

    var select = document.getElementById('layer-select');
    if (isSet(select)) {
        select.addEventListener('change', function () {
            var select = document.getElementById('layer-select');
            var style = select.value;
            for (var i = 0; i < style_len; ++i) {
                maplayers[i].setVisible(styles[i] === style);
            }
        });
    }

    maplayers[1].setVisible(true); //Aerial
    maplayers[3].setVisible(true); //pointLayer
    maplayers[4].setVisible(true); //vectorLayer

    main2dMap = new ol.Map({
        target: 'mainMap',
        controls: ol.control.defaults().extend([
            scaleLineControl
        ]),
        layers: maplayers,
        // Improve user experience by loading tiles while animating. Will make
        // animations stutter on mobile or slow devices.
        loadTilesWhileAnimating: true,
        view: currentMainMap2DView
    });
}

function showLoader() {
    $("#loading").show();
}

function hideLoader() {
    $("#loading").fadeOut(800);
}

function move2DMapIcon(owner, index, lat, lng, alt, yaw) {
    var location = ol.proj.fromLonLat([lng * 1, lat * 1]);

    if (arrayCurrentMainMap2DObjectPos != null && owner in arrayCurrentMainMap2DObjectPos) {
	    yaw *= 1;
	    yaw = yaw < 0 ? (360 + yaw) : yaw;
	    yaw = Math.PI / 180 * yaw;

    	arrayCurrentMainMap2DObjectPos[owner][index].setGeometry(new ol.geom.Point(location));
    	arrayCurrentMainMap2DObjectPosImage[owner][index].setRotation(yaw);
    }

    if (owner == currentMonitorOwner && currentMonitorIndex == index)
        currentMainMap2DView.setCenter(location);
}

function nexttour(owner, fobject) {

    fobject.forEach(function (item, index) {
        addChartItem(nAppendListCount, item);
        moveToPositionOnMap(owner, index, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
    });

    nAppendListCount++;
    window.myLine.update();

    setTimeout(function () {
        if (bMonStarted == false) return;
        nextMon();
    }, 2500);
}

function askIsSyncData(files, mname, tag_values, youtube_data, isUpdate, uploadDJIFlightListCallback) {
    showAskDialog(
        LANG_JSON_DATA[langset]['modal_title'],
        LANG_JSON_DATA[langset]['msg_is_sync_data'],
        LANG_JSON_DATA[langset]['modal_yes_btn'],
        false,
        function () {
        		showLoader();			    	
			      getBase64(files, mname, tag_values, youtube_data, isUpdate, true, uploadDJIFlightListCallback);
        },
        function () {
        		showLoader();			    	
			      getBase64(files, mname, tag_values, youtube_data, isUpdate, false, uploadDJIFlightListCallback);			      
        }
    );
}

function uploadFlightList(isUpdate) {
		var mname = $("#record_name_field").val();

		if (mname == "") {
			showAlert(LANG_JSON_DATA[langset]['msg_input_record_name']);
			return;
		}				
    
		var tag_values = $("#tagTextarea").val();

		var youtube_data = $("#youtube_url_data").val();
    var files = document.getElementById('flight_record_file').files;
    if (bDJIFileUpload == true) {    	
    	if (files.length <= 0) {
    		showAlert(LANG_JSON_DATA[langset]['msg_select_file']);
    		return;
    	}
    	
    	if (isSet(youtube_data)) {
    		askIsSyncData(files[0], mname, tag_values, youtube_data, isUpdate, uploadDJIFlightListCallback);
    		return;
    	}

    	showLoader();    	
      getBase64(files[0], mname, tag_values, youtube_data, isUpdate, false, uploadDJIFlightListCallback);      
      return;
    }
		
    if (isUpdate == true || youtube_data == "") {
    	showAlert(LANG_JSON_DATA[langset]['msg_select_any_file']);
    }
    else {
    	if (address_flat == -999) {    			
    			showAlert(LANG_JSON_DATA[langset]['msg_input_corrent_address']);
    			return;
    	}
    	
    	youtube_data = massageYotubeUrl(youtube_data);
    	
    	var price = 0;
	   	if (langset == "KR") {
	   		if (youtube_data == "") {
						showAlert("영상의 판매를 원하시면 판매하실 원본영상의 유튜브 URL을 입력해 주세요.");
						hideLoader();
						return;
				}
					
	    	var checked = $("#salecheck").is(":checked");
				if(checked) {
					var t_p = $("#price_input_data").val();
					if (t_p == "") {
						showAlert("영상의 판매를 원하시면 판매 희망 가격을 입력해 주세요.");
						hideLoader();
						return;
					}
					
					price = t_p * 1;
				}
	    }
    	saveYoutubeUrl(mname, tag_values, youtube_data, price, address_flat, address_flng, function(bSuccess) {
        	if (bSuccess == true) {
        		showAlert(LANG_JSON_DATA[langset]['msg_success']);
        		location.href = cur_controller + "?page_action=recordlist";
        	}
        	else {
        		showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        	}
      });
    }
}

function getBase64(file, mname, tag_values, youtube_data, isUpdate, isSyncData, callback) {
    var reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = function () {
        callback(mname, tag_values, youtube_data, isUpdate, isSyncData, reader.result);
    };
    reader.onerror = function (error) {
        hideLoader();
        monitor('Error: ', error);
    };
}


function uploadDJIFlightListCallback(mname, tag_values, youtube_data, isUpdate, isSyncData, base64file) {
    var userid = getCookie("dev_user_id");
   	
   	youtube_data = massageYotubeUrl(youtube_data);
   	
   	var price = 0;
   	if (langset == "KR") {
   		if (youtube_data == "") {
					showAlert("영상의 판매를 원하시면 판매하실 원본영상의 유튜브 URL을 입력해 주세요.");
					hideLoader();
					return;
			}
				
    	var checked = $("#salecheck").is(":checked");
			if(checked) {
				var t_p = $("#price_input_data").val();
				if (t_p == "") {
					showAlert("영상의 판매를 원하시면 판매 희망 가격을 입력해 주세요.");
					hideLoader();
					return;
				}
				
				price = t_p * 1;
			}
    }

    var jdata = { "action": "position", "daction": "convert",
    	"clientid": userid, "name": mname,
    	"youtube_data_id": youtube_data,
    	"update" : isUpdate,
    	"sync" : isSyncData,
    	"price" : price,
    	"tag_values" : tag_values,
    	"recordfile": base64file };

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            $('#btnForUploadFlightList').hide(1500);
            $('#uploadFileform').hide(1500);
            GATAGM('dji_file_upload_success', 'CONTENT', langset);
            alert(LANG_JSON_DATA[langset]['msg_success']);
            location.href = cur_controller + "?page_action=recordlist";
        }
        else {
            if (r.reason == "same data is exist") {
            		GATAGM('dji_file_upload_failed_same_data_exist', 'CONTENT', langset);
                showAlert(LANG_JSON_DATA[langset]['msg_error_same_record_exist']);
            }
            else {
            	GATAGM('dji_file_upload_failed', 'CONTENT', langset);
            	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry'] + " (" + r.reason + ")");
            }

            hideLoader();
        }
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function delCoockie(cName) {
    document.cookie = name + "= " + "; expires=" + date.toUTCString() + "; path=/";
}

function setCookie(cName, cValue, cDay) {
    var date = new Date();
    date.setTime(date.getTime() + cDay * 60 * 60 * 24 * 1000);
    document.cookie = cName + '=' + cValue + ';expires=' + date.toUTCString() + ';path=/';
}

function getCookie(cName) {
    var value = document.cookie.match('(^|;) ?' + cName + '=([^;]*)(;|$)');
    return value ? value[2] : null;
}

function showCurrentInfo(dlatlng, alt) {
    if (!isSet($("#position_info"))) return;

    var latlng = ol.proj.fromLonLat(dlatlng);
    var hdms = ol.coordinate.toStringHDMS(latlng);
    var itext = hdms + " [ Lat: " + dlatlng[1] + " / Lng: " + dlatlng[0] + " / Alt: " + alt + " ]";
    $("#position_info").text(itext);
}

function openLineTip(oChart, datasetIndex, pointIndex) {
    if (!isSet(oChart)) return false;

    if (oldLinedatasetIndex >= 0)
        closeTip(oChart, oldLinedatasetIndex, oldLinepointIndex);

    if (oChart.tooltip._active == undefined)
        oChart.tooltip._active = []
    var activeElements = oChart.tooltip._active;
    var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];

    oldLinedatasetIndex = datasetIndex;
    oldLinepointIndex = pointIndex;

    for (var i = 0; i < activeElements.length; i++) {
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
    var activeElements = oChart.tooltip._active;
    var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];

    oldScatterdatasetIndex = datasetIndex;
    oldScatterpointIndex = pointIndex;

    for (var i = 0; i < activeElements.length; i++) {
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
    var activeElements = oChart.tooltip._active;
    if (!isSet(activeElements) || activeElements.length == 0)
        return;

    var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];
    for (var i = 0; i < activeElements.length; i++) {
        if (requestedElem._index == activeElements[i]._index) {
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
    moveToPositionOnMap("private", 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
}

function setMoveActionFromScatterChart(index, item) {
    openLineTip(window.myLine, 0, index);

    if ("dsec" in item) {
        movieSeekTo(item.dsec);
    }

    setSliderPos(index);
    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    moveToPositionOnMap("private", 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
}

function setMoveActionFromLineChart(index, item) {
    openScatterTip(window.myScatter, 0, index);

    if ("dsec" in item) {
        movieSeekTo(item.dsec);
    }

    setSliderPos(index);
    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    moveToPositionOnMap("private", 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
}

function setMoveActionFromSliderOnMove(index, item) {
    $('#sliderText').html(index);

    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    moveToPositionOnMap("private", 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
}

function setMoveActionFromSliderOnStop(index, item) {
    openScatterTip(window.myScatter, 0, index);
    openLineTip(window.myLine, 0, index);
    $('#sliderText').html(index);

    if ("dsec" in item) {
        movieSeekTo(item.dsec);
    }

    showCurrentInfo([item.lng * 1, item.lat * 1], item.alt);
    moveToPositionOnMap("private", 0, item.lat * 1, item.lng * 1, item.alt, item.yaw, item.roll, item.pitch);
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

function saveYoutubeUrl(rname, tag_values, data_id, price, flat, flng, callback) {

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "youtube", "youtube_data_id": data_id, "clientid": userid, "name": rname, "tag_values" : tag_values };
    
    if (flat != -999) {
    		jdata["flat"] = flat;
    		jdata["flng"] = flng;
    }
    
    if (price > 0) {
    		jdata["price"] = price;
    }

    showLoader();
    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result == "success") {
        	if (callback) callback(true);
        }
        else {
        	if (callback) callback(false);
        }
    }, function (request, status, error) {
        hideLoader();
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        if (callback) callback(false);
    });
}

function hideMovieDataSet() {
    $('#movieDataSet').hide();
    $('#modifyBtnForMovieData').text(LANG_JSON_DATA[langset]['msg_modify_youtube_data']);

    $('#modifyBtnForMovieData').off('click');
    $('#modifyBtnForMovieData').click(function () {
        GATAGM('modifyBtnForMovieData_show', 'CONTENT', langset);
        showMovieDataSet();
    });

}

function showMovieDataSet() {
    $('#movieDataSet').show();
    $('#modifyBtnForMovieData').text(LANG_JSON_DATA[langset]['msg_close_youtube_data']);

    $('#modifyBtnForMovieData').off('click');
    $('#modifyBtnForMovieData').click(function () {
				GATAGM('modifyBtnForMovieData_hide', 'CONTENT', langset);
        hideMovieDataSet();
    });
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

function setFlightRecordTitleName() {
		var target_name = $('#record_name_field').val();
    if (target_name == "") {
        showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
        return;
    }

    var userid = getCookie("dev_user_id");
    var jdata = { "action": "position", "daction": "set_name", "clientid": userid, "target_name": target_name, "name": cur_flightrecord_name };

    showLoader();
    ajaxRequest(jdata, function (r) {
        hideLoader();
        if (r.result == "success") {
					showAlert(LANG_JSON_DATA[langset]['msg_success']);
					cur_flightrecord_name = target_name;
					location.href = cur_controller + "?page_action=recordlist_detail&record_name=" + encodeURIComponent(target_name);
        }
        else {
        	if (r.reason.indexOf("already") >= 0)
        		showAlert(LANG_JSON_DATA[langset]['msg_name_is_already_exist']);
        	else
        		showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        }
    }, function (request, status, error) {
        hideLoader();
        showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    });
}

function setYoutubeID() {
    var data_id = $('#youtube_url_data').val();
    if (data_id == "") {
        showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
        return;
    }

    moviePlayerVisible = false;

    var fi_data_url = massageYotubeUrl(data_id);
    
    var tag_values = $("#tagTextarea").val();

    if (fi_data_url.indexOf("youtube") >= 0) {
        setYoutubePlayer(fi_data_url);
        saveYoutubeUrl(cur_flightrecord_name, tag_values, fi_data_url, -1, -999, -999, function(bSuccess) {
        	if (bSuccess == true) {
        		showAlert(LANG_JSON_DATA[langset]['msg_success']);
        	}
        	else {
        		showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        	}
        });
    }
    else {
        showAlert(LANG_JSON_DATA[langset]['msg_wrong_youtube_url_input']);
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
        $("#youtube_url_data").val("https://youtube.com/watch?v=" + data_id);
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

    $("#youtube_url_data").val(d_id);
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
		if (viewmode != "pilot") return;
		
		if (page_action == "recordlist" || page_action == "publicrecordlist" || page_action == "center") {
    	getFlightRecords(current_target);
    	return;
    }

    youTubePlayer = new YT.Player('youTubePlayer', {
        width: '1000',
        height: '400',
        videoId: youtube_data_id,
        playerVars: { rel: 0 },//\uCD94\uCC9C\uC601\uC0C1 \uC548\uBCF4\uC5EC\uC8FC\uAC8C \uC124\uC815
        events: {
            'onReady': onPlayerReady, //\uB85C\uB529\uD560\uB54C \uC774\uBCA4\uD2B8 \uC2E4\uD589
            'onStateChange': onPlayerStateChange //\uD50C\uB808\uC774\uC5B4 \uC0C1\uD0DC \uBCC0\uD654\uC2DC \uC774\uBCA4\uD2B8\uC2E4\uD589
        }
    });//youTubePlayer1\uC14B\uD305
}

var movieProcess = false;

function onPlayerReady(event) {
    event.target.playVideo();//\uC790\uB3D9\uC7AC\uC0DD

    var lastTime = -1;
    var interval = 1000;

    var checkPlayerTime = function () {
        if (lastTime != -1) {
            if (youTubePlayer.getPlayerState() == YT.PlayerState.PLAYING) {
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

function processSeek(curTime) {
    if (movieProcess == true) {
        movieProcess = false;
        return;
    }

    var index = 0;
    arrayFlightRecordData.some(function (item) {
        if ("dsec" in item) {
            var ds = (item.dsec * 1);
            if ((ds + 5) >= curTime && (ds - 5) <= curTime) {
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

    if (youTubePlayer != null && $('#youTubePlayer').is(":visible") == true) {
        youTubePlayer.seekTo(where, true);
    }
}

function showCompanyList(bshow) {
		vVectorLayerForCompany.setVisible(bshow);
}

function showFlightRecordsList(bshow) {
		vVectorLayerForHistory.setVisible(bshow);
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

	      var companyArray = r.data;
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

function addChartItem(i, item) {    
    var dsec = (item.dsec * 1);
    arrayFlightRecordData.push({ lat: item.lat, lng: item.lng, alt: item.alt, yaw: item.yaw, roll: item.roll, pitch: item.pitch, dsec: dsec });       
    chartAltitudeLineData.push({ x: i, y: item.alt });                    
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


function requestAddress() {
		var userid = getCookie("dev_user_id");    
    var jdata = {"clientid" : userid, "action" : "util", "daction": "address_by_gps"};
    
    var latxlng = $("#latxlng").val();
    var gpsar;
    if (latxlng != "") {
    	gpsar = latxlng.split(",");
    	jdata["lat"] = gpsar[0];
    	jdata["lng"] = gpsar[1];
    }
    else {
    	jdata["lat"] = $("#lat").val();
    	jdata["lng"] = $("#lng").val();
    }
    

		showLoader();
  	ajaxRequest(jdata, function (r) {
	    hideLoader();
	    if(r.result == "success") {
	    	
				$("#address").val(r.address);
				hideLoader();
	    }
	    else {
	    	showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
				hideLoader();
	    }
	  }, function(request,status,error) {
	    hideLoader();
	  });
}

function GATAGM(label, category, language) {
    gtag(
        'event', label + "_" + language, {
        'event_category': category,
        'event_label': label
    }
    );

    mixpanel.track(
        label + "_" + language,
        { "event_category": category, "event_label": label }
    );
}
