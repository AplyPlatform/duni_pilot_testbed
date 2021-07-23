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

var g_str_pilot_controller_for_viewmode;
var g_str_dev_controller_for_viewmode;

var oldLat = 0, oldLng = 0, oldAlt = 0;

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

function getFileExtension(filename) {	
	return filename.split('.').pop();
}

function compareIgnoreCase(str1, str2) {
	return str1.toUpperCase() === str2.toUpperCase();	
}


function runNextSequence(nextfunc) {
	setTimeout(nextfunc, 500);
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

function GATAGM(label, category) {
    gtag(
        'event', label + "_" + g_str_cur_lang, {
        'event_category': category,
        'event_label': label
    }
    );

    mixpanel.track(
        label + "_" + g_str_cur_lang,
        { "event_category": category, "event_label": label }
    );
}
