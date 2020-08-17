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
      return;
    }

    location.href="center.html";
    return;
  }

  setCookie("dev_user_id", "", -1);
  setCookie("socialid", "", -1);
  setCookie("user_token", "", -1);
  setCookie("device_table_uuid", "", -1);
  setCookie("dev_kind", "", -1);
  setCookie("sns_token", "", -1);
}


function isSet(value) {
  if (value == "" || value == null || value == "undefined") return false;

  return true;
}


function checkLang() {
	var lang = getCookie("language");	
	var url_string = window.location.href;
	
	if (isSet(lang)) {
		if (lang == "KR") {
			if(url_string.indexOf("index.html") < 0) {
				location.href = "/index.html";
			}  		
		}
		else {
			if(url_string.indexOf("index_en.html") < 0) {
				location.href = "/index_en.html";
			}
		}
	}
	else {
		setLang("KR");
	}
}

function setLang(lang) {
	setCookie("language", lang, 1);
}

checkLang();
checkLoginStatus();
