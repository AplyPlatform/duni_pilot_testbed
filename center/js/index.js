/* Copyright 2021 APLY Inc. All rights reserved. */


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
                        showAlert(GET_STRING_CONTENT('msg_error_sorry'));
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
		if (document.getElementById('naverLoginBtn1')) {
	  	document.getElementById('naverLoginBtn1').addEventListener('click', function() {
	  			GATAGM('index_naver_login_1_btn_click', 'CONTENT');
	  			location.href = url;
			});
		}
    
    if (document.getElementById('naverLoginBtn2')) {
	  	document.getElementById('naverLoginBtn2').addEventListener('click', function() {
	  			GATAGM('index_naver_login_2_btn_click', 'MENU');
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
	          showAlert(GET_STRING_CONTENT('msg_error_sorry'));
	        },
	      })
	    },
	    fail: function(err) {
	      showAlert(GET_STRING_CONTENT('msg_error_sorry'));
	    },
	  });
}

function kakaoinit() {
	Kakao.init('2117cedaa3150d4eecd95cc8560f8e21');
	
	if (document.getElementById('kakaoLoginBtn1')) {	
		document.getElementById('kakaoLoginBtn1').addEventListener('click', function() {
					GATAGM('index_kakao_login_1_btn_click', 'CONTENT');
		 			kakaoLogin();
		});
	}
		
	if (document.getElementById('kakaoLoginBtn2')) {
		document.getElementById('kakaoLoginBtn2').addEventListener('click', function() {
					GATAGM('index_kakao_login_2_btn_click', 'MENU');
	  			kakaoLogin();
		});
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
	  document.getElementById('appleLoginBtn1').addEventListener('click', function() {
	  		GATAGM('index_apple_login_1_btn_click', 'CONTENT');
	      AppleID.auth.signIn();
	  });
	}
			
	if (document.getElementById('appleLoginBtn2')) {
	  document.getElementById('appleLoginBtn2').addEventListener('click', function() {
	  		GATAGM('index_apple_login_2_btn_click', 'MENU');
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
	     showAlert(GET_STRING_CONTENT('msg_error_sorry'));
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
            		GATAGM('index_google_login_1_btn_click', 'CONTENT');
            		
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
            		GATAGM('index_google_login_2_btn_click', 'MENU');
            		
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
    var device_kind = getCookie("device_kind");
    var device_id = getCookie("device_id");

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
            setCookie("temp_phone", r.phonenumber, 1);
            setCookie("temp_name", r.name, 1);

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
            	showAlert(GET_STRING_CONTENT('msg_error_sorry'));
            else
            	showConfirmDialog();
        }
    }, function (request, status, error) {
        showAlert(GET_STRING_CONTENT('msg_error_sorry'));
        hideLoader();
    });

}


function showConfirmDialog() {
    $('#askModalLabel').text(GET_STRING_CONTENT('modal_title'));
    $('#askModalContent').text(GET_STRING_CONTENT('msg_you_are_not_member'));
    $('#askModalOKButton').text(GET_STRING_CONTENT('modal_confirm_btn'));
    $('#askModalCancelButton').hide();

    $('#askModalOKButton').off('click');
    $('#askModalOKButton').click(function (e) {
    		e.preventDefault();
        $('#askModal').modal('hide');
        location.href = "/center/register.html";
    });

    $('#askModal').modal('show');
}

$(function () {
		g_str_page_action = "index";
		
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
