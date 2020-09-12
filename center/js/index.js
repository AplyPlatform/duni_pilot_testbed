
var langset = "KR";

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

function showLoader() {
  $("#loading").show();
}

function hideLoader() {
  $("#loading").fadeOut(800);
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

function facebookSignInCallback() {    
    FB.getLoginStatus(function(response) {      
      if (response.status == "connected") {      	
        var token = response.authResponse.accessToken;
        FB.api('/me', { locale: 'en_US', fields: 'name, email' },
				  function(lresponse) {
				    if (token != null && token != "") {
				    	setCookie("dev_kind", "facebook", 1);
		          formSubmit(token, lresponse.name, "http://graph.facebook.com/" + lresponse.id + "/picture?type=normal", lresponse.email);
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
        callbackUrl: "https://pilot.duni.io/center/navercallback.html",
        isPopup: false        
      }
    );  

  if (naverLogin == null) {    
    return;
  }

  naverLogin.init();
  
  $("#naverLoginBtn").attr("href", naverLogin.generateAuthorizeUrl());
}

function googleinit() {
  if ((typeof gapi) === "undefined" || gapi == null || gapi == "") {    
    return;
  }

  gapi.load('auth2', function() { // Ready.  	
				var gauth = gapi.auth2.init();    
				
				var options = new gapi.auth2.SigninOptionsBuilder();
				options.setPrompt('select_account');
				//gauth.signIn(options);
								
				gauth.attachClickHandler(document.getElementById('googleLoginBtn'), options,
		        function(googleUser) {		          
		          setCookie("dev_kind", "google", 1);
												
							var profile = googleUser.getBasicProfile();	
							var token = googleUser.getAuthResponse().id_token;
							
							var name = profile.getName();
							var image = profile.getImageUrl();
							var email = profile.getEmail();
							formSubmit(token, name, image, email);  			              
		              
		        }, function(error) {
		          //alert(JSON.stringify(error, undefined, 2));
		        });
  	});    
}

function formSubmit(token, temp_name, temp_image, temp_email) {
	showLoader();
	
  var skind = getCookie("dev_kind");
  var jdata = {
    action: "member",
    daction: "login",
    sns_token : token,
    sns_kind : skind
  };

  ajaxRequest(jdata, function (r) {
    if(r.result == "success") {
      setCookie("dev_user_id", r.emailid, 1);
      setCookie("user_token", r.token, 1);
      setCookie("user_email", r.socialid, 1);      
      setCookie("image_url", temp_image, 1);      

      if (getCookie("isFromApp") == "yes") {
        Android.setToken(r.token, r.emailid);
        return;
      }

      location.href="center.html";     
    }else {    	            
      setCookie("temp_sns_token", r.sns_token, 1);
      setCookie("temp_image_url", temp_image, 1);
      setCookie("temp_email", temp_email, 1);
      setCookie("temp_name", temp_name, 1);
      hideLoader();
      showConfirmDialog();       
    }
  }, function(request, status, error) {
    hideLoader();
  });

}


function showConfirmDialog() {				
		$('#askModalLabel').text(LANG_JSON_DATA[langset]['modal_title'],);
		$('#askModalContent').text(LANG_JSON_DATA[langset]['msg_you_are_not_member']);
		$('#askModalOKButton').text(LANG_JSON_DATA[langset]['modal_confirm_btn']);
		$('#askModalCancelButton').hide();

		$('#askModalOKButton').off('click');
		$('#askModalOKButton').click(function(){
			$('#askModal').modal('hide');									
      location.href="register.html";
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
  if (value == "" || value == null || value == "undefined") return false;

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

$(function() {
	checkLang();
	var page = window.location.href;
	
	if (page.indexOf("navercallback.html") >= 0) {
		
	}
	else {
		naverinit();
		hideLoader();
	}
});
