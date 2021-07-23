﻿/* Copyright 2021 APLY Inc. All rights reserved. */

var langset = "KR";

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

function showLoader() {
    $("#loading").show();
}

function hideLoader() {
    $("#loading").fadeOut(800);
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
            callback(r);
        },
        error: function (request, status, error) {
            monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            errorcallback(request, status, error);
        }
    });
}

function facebookSignInCallback() {
    FB.getLoginStatus(function (response) {
        if (response.status == "connected") {
            var token = response.authResponse.accessToken;
            FB.api('/me', { locale: 'en_US', fields: 'name, email' },
                function (lresponse) {
                    if (token != null && token != "") {
                        setCookie("dev_kind", "facebook", 1);
                        formSubmit(token, lresponse.name, "https://graph.facebook.com/" + lresponse.id + "/picture?type=normal", lresponse.email);
                    }
                    else {
                        alert(LANG_JSON_DATA[langset]['msg_error_sorry']);
                    }
                }
            );
        }
        else {
        }
    });
}

function naverSignInCallback() {
    setCookie("dev_kind", "naver", 1);

    var token = naver_id_login.oauthParams.access_token;
    var email = naver_id_login.getProfileData('email');
    var name = naver_id_login.getProfileData('name');
    var image = naver_id_login.getProfileData('profile_image');

    formSubmit(token, name, image, email);
}

function naverinit() {
    var naverLogin = new naver.LoginWithNaverId(
        {
            clientId: "wSvRwDA6qt1OWrvVY542",
            callbackUrl: window.location.origin + "/center/navercallback.html",
            isPopup: false
        }
    );

    if (naverLogin == null) {
        return;
    }

    naverLogin.init();

		var url = naverLogin.generateAuthorizeUrl();
		if ($("#naverLoginBtn1").length) {
    	$("#naverLoginBtn1").click(function(e) {
    		e.preventDefault();
    		location.href = url;
    	});
    	
    }
    
    if ($("#naverLoginBtn2").length) {
    	$("#naverLoginBtn2").click(function(e) {
    		e.preventDefault();
    		location.href = url;
    	});
    }
}

function kakaoLogin() {
	Kakao.Auth.login({
	    success: function(authObj) {
	      Kakao.API.request({
	        url: '/v2/user/me',
	        success: function(res) {
            setCookie("dev_kind", "kakao", 1);

						var name = "";
						var image = "";
						var email = "";
						var token = authObj.access_token;

						if ("properties" in res) {
							if ("nickname" in res.properties) {
								name = res.properties['nickname'];
							}

							if ("profile_image" in res.properties) {
								image = res.properties['profile_image'];
							}
						}

						if ("kakao_account" in res) {
							if ("email" in res.kakao_account) {
								email = res.kakao_account['email'];
							}
						}

    				formSubmit(token, name, image, email);
	        },
	        fail: function(error) {
	          alert(LANG_JSON_DATA[langset]['msg_error_sorry']);
	        },
	      })
	    },
	    fail: function(err) {
	      alert(LANG_JSON_DATA[langset]['msg_error_sorry']);
	    },
	  });
}

function kakaoinit() {
	Kakao.init('2117cedaa3150d4eecd95cc8560f8e21');

	if (document.getElementById('kakaoLoginBtn1')) {
		document.getElementById('kakaoLoginBtn1').addEventListener('click', function() {
	  			kakaoLogin();
		}, false);
	}
	
	if (document.getElementById('kakaoLoginBtn2')) {
		document.getElementById('kakaoLoginBtn2').addEventListener('click', function() {
	  			kakaoLogin();
		}, false);
	}
}

function appleinit() {
	AppleID.auth.init({
            clientId : 'biz.aply.dunipilot.signin',
            scope : 'name email',
            redirectURI: window.location.origin,
            nonce : '123423',
            usePopup : true
        });
  if (document.getElementById('appleLoginBtn1')) {
  			const buttonElement = document.getElementById('appleLoginBtn1');
        buttonElement.addEventListener('click', function() {
            AppleID.auth.signIn();
        });
	}
	
	if (document.getElementById('appleLoginBtn2')) {
  			const buttonElement = document.getElementById('appleLoginBtn2');
        buttonElement.addEventListener('click', function() {
            AppleID.auth.signIn();
        });
	}

	document.addEventListener('AppleIDSignInOnSuccess', function (data) {
			setCookie("dev_kind", "apple", 1);
			var token = data.detail.authorization.id_token;

		  var name = "";
      var image = "";
      var email = "";
      formSubmit(token, name, image, email);
	});
	//Listen for authorization failures
	document.addEventListener('AppleIDSignInOnFailure', function (error) {
	     //handle error.
	     alert(LANG_JSON_DATA[langset]['msg_error_sorry']);
	});
}

function googleinit() {
    if ((typeof gapi) === "undefined" || gapi == null || gapi == "") {
        return;
    }

    gapi.load('auth2', function () { // Ready.
        var gauth = gapi.auth2.init();

        var options = new gapi.auth2.SigninOptionsBuilder();
        options.setPrompt('select_account consent');
        //gauth.signIn(options);

        gauth.attachClickHandler(document.getElementById('googleLoginBtn1'), options,
            function (googleUser) {
                setCookie("dev_kind", "google", 1);

                var profile = googleUser.getBasicProfile();
                var token = googleUser.getAuthResponse().id_token;

                var name = profile.getName();
                var image = profile.getImageUrl();
                var email = profile.getEmail();
                formSubmit(token, name, image, email);

            }, function (error) {
                //alert(JSON.stringify(error, undefined, 2));
            });
            
        gauth.attachClickHandler(document.getElementById('googleLoginBtn2'), options,
            function (googleUser) {
                setCookie("dev_kind", "google", 1);

                var profile = googleUser.getBasicProfile();
                var token = googleUser.getAuthResponse().id_token;

                var name = profile.getName();
                var image = profile.getImageUrl();
                var email = profile.getEmail();
                formSubmit(token, name, image, email);

            }, function (error) {
                //alert(JSON.stringify(error, undefined, 2));
            });
    });
}

function formSubmit(token, temp_name, temp_image, temp_email) {
    showLoader();

    if (isSet(temp_name) == false) {
        temp_name = "";
    }

    if (isSet(temp_email) == false) {
        temp_email = "";
    }

    if (isSet(temp_image) == false) {
        temp_image = "";
    }

    var skind = getCookie("dev_kind");
    var device_kind = getCookie("device_kind"); //������ ���⿡�� �α��� ����
    var device_id = getCookie("device_id"); //Ǫ�� ��ū

    var jdata = {
        action: "member",
        daction: "login",
        sns_token: token,
        sns_kind: skind,
        device_kind: device_kind,
        device_id: device_id
    };

    ajaxRequest(jdata, function (r) {
        if (r.result == "success") {
            setCookie("dev_user_id", r.emailid, 1);
            setCookie("dev_sns_token", token, 1);
            setCookie("user_token", r.token, 1);
            setCookie("user_email", r.socialid, 1);
            setCookie("dev_token", r.dev_token, 1);
            setCookie("user_kind", r.user_kind, 1);
            setCookie("image_url", temp_image, 1);

            let page_action = getCookie("last_action");
    				if (!isSet(page_action)) page_action = "center";
            else setCookie("last_action", "", -1);

            location.href = "/center/main.html?page_action=" + page_action;
        } else {
            setCookie("temp_sns_token", token, 1);
            setCookie("temp_image_url", temp_image, 1);
            setCookie("temp_email", temp_email, 1);
            setCookie("temp_name", temp_name, 1);
            hideLoader();

            if (r.reason.indexOf("Error:") >= 0)
            	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
            else
            	showConfirmDialog();
        }
    }, function (request, status, error) {
        showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        hideLoader();
    });

}


function showConfirmDialog() {
    $('#askModalLabel').text(LANG_JSON_DATA[langset]['modal_title']);
    $('#askModalContent').text(LANG_JSON_DATA[langset]['msg_you_are_not_member']);
    $('#askModalOKButton').text(LANG_JSON_DATA[langset]['modal_confirm_btn']);
    $('#askModalCancelButton').hide();

    $('#askModalOKButton').off('click');
    $('#askModalOKButton').click(function (e) {
    		e.preventDefault();
        $('#askModal').modal('hide');
        location.href = "/center/register.html";
    });

    $('#askModal').modal('show');
}


function showAlert(msg) {
    $('#modal-title').text(LANG_JSON_DATA[langset]['modal_title']);
    $('#modal-confirm-btn').text(LANG_JSON_DATA[langset]['modal_confirm_btn']);

    $('#errorModalLabel').text(msg);
    $('#errorModal').modal('show');
}


function isSet(value) {
		if ( typeof(value) === 'number' )
        return true;
    if (value == "" || value == null || value == "undefined" || value == undefined || value == "null")
        return false;
    return true;
}

function checkLang() {
    var lang = getCookie("language");

    if (isSet(lang)) {
        langset = lang;
    }
    else {
        setLang("KR");
    }
}

function setLang(lang) {
    setCookie("language", lang, 1);
    langset = lang;
}

$(function () {
    checkLang();
    var page = window.location.href;

    if (page.indexOf("navercallback.html") >= 0) {

    }
    else {
        naverinit();
        kakaoinit();
        appleinit();
        hideLoader();
    }
});
