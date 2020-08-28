var dev_kind = "";

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

function formSubmit(kind) {
  setCookie("dev_kind", kind, 1);  
  location.href="login_bts.html";  
}

function onFacebook() {
  formSubmit("facebook");
}

function onGoogle() {
  formSubmit("google");
}

function onNaver() {
  formSubmit("naver");
}

function googleSignOut() {
	if ((typeof gapi) === "undefined" || gapi == null || gapi == "") {      
    return;
  }
  
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
      auth2.disconnect();
  });

}

function facebookSignOut() {
	if ((typeof FB) === "undefined" || FB == null || FB == "") {      
    return;
  }
  
  FB.logout(function(response) {
		// user is now logged out
	});
}

function facebookInit() {
  if ((typeof FB) === "undefined" || FB == null || FB == "") {      
    return;
  }

  FB.getLoginStatus(function(response) {
  	facebookLogoutCheck();
  });
}

function googleinit() {
  if ((typeof gapi) === "undefined" || gapi == null || gapi == "") {
    return;
  }

	if(!gapi.auth2) {
	  gapi.load('auth2', function() { // Ready.  	
	    gapi.auth2.init();
	    
	    googleLogoutCheck();	    	    	    
	  });
	}
}

function facebookLogoutCheck() {	  
  var doAction = location.search.split('action=')[1];
	if (!isSet(doAction) || doAction == "") return;
	
	if (doAction == "logout" && dev_kind == "facebook") {  	  	  	  	
  	facebookSignOut();  	
  }	  
}


function googleLogoutCheck() {  
  var doAction = location.search.split('action=')[1];
	if (!isSet(doAction) || doAction == "") return;
	
	if (doAction == "logout" && dev_kind == "google") {  	  	  	  	
  	googleSignOut();  	
  }	  
}

function checkLoginStatus() {	
  var url_string = window.location.href;
  var isFromApp = location.search.split('fromapp=')[1];
  if (isFromApp != null) {
    isFromApp = isFromApp.split('&')[0];
  }
  else {
    isFromApp = "no";
  }

  setCookie("isFromApp", isFromApp, 1);

  var userid = getCookie("dev_user_id");
  var usertoken = getCookie("user_token");

  if (isSet(userid) == true && isSet(usertoken) == true) {
    if (isFromApp == "yes") {
      Android.setToken(usertoken, userid);
      return true;
    }

    location.href="center.html";
    return true;
  }  

  setCookie("dev_user_id", "", -1);
  setCookie("socialid", "", -1);
  setCookie("user_token", "", -1);
  setCookie("device_table_uuid", "", -1);  
  setCookie("sns_token", "", -1);
  dev_kind = getCookie("dev_kind");
  setCookie("dev_kind", "", -1);
  
  return false;
}


function isSet(value) {
  if (value == "" || value == null || value == "undefined") return false;

  return true;
}


function checkLang() {
	var lang = getCookie("language");	
	
	if (isSet(lang)) {
		
	}
	else {
		setLang("KR");
	}
}

function setLang(lang) {
	setCookie("language", lang, 1);
}

$(function() {
	checkLang();
	checkLoginStatus();	
});
