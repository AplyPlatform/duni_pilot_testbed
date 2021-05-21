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
        grecaptcha.execute('6LehUpwUAAAAAKTVpbrZ2ciN3_opkJaKOKK11qY6', { action: 'action_name' })
            .then(function (token) {
 								jdata['captcha_token'] = token;
						  	ajaxRequest(jdata, successHandler, failHandler);
                
            });
  });

}


function requestAddress() {
    GATAGM("public_address_by_gps", "service", langset);
    var jdata = {"action" : "public_address_by_gps", "daction" : "public_address_by_gps"};
  	jdata["lat"] = $("#lat").val();
  	jdata["lng"] = $("#lng").val();
    
    if (isSet(jdata["lat"]) == false || isSet(jdata["lng"]) == false) {
	    	showAlert("좌표를 " + LANG_JSON_DATA[langset]['msg_wrong_input']);
	    	return;
    }

		showLoader();
		setCaptcha(jdata, function (r) {
		    hideLoader();
		    if(r.result == "success") {
					$("#address").val(r.address);
					showAlert(LANG_JSON_DATA[langset]['msg_address_checked']);
		    }
		    else {
		    	showAlert("좌표를 " + LANG_JSON_DATA[langset]['msg_wrong_input']);
		    }
		  }, 
		  function(request,status,error) {
		    hideLoader();
		  }
		);
		
}


function requestGPS(address) {
		GATAGM("public_gps_by_address", "service", langset);
		var jdata = {"action" : "public_gps_by_address", "daction" : "public_gps_by_address"};
  	jdata["address"] = $("#address").val();
    
    if (isSet(jdata["address"]) == false) {
	    	showAlert("주소를 " + LANG_JSON_DATA[langset]['msg_wrong_input']);
	    	return;
    }
    
    showLoader();
		setCaptcha(jdata, function (r) {
	    	if(r.result == "success") {
			      if (r.data == null) {
			      	showAlert("주소를 " + LANG_JSON_DATA[langset]['msg_wrong_input']);
			        return;
			      }
		
						$("#lat").val(r.data.lat);
	  				$("#lng").val(r.data.lng);
			     	
			     	showAlert(LANG_JSON_DATA[langset]['msg_address_checked']);
	    	}
	    	else {
		  			showAlert("주소를 " + LANG_JSON_DATA[langset]['msg_wrong_input']);
	    	}
	  	},
	  	function(request,status,error) {
	  			showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
	  	}
	  );
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
