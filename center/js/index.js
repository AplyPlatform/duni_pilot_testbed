
function showLoader() {
  $("#loading").show();
}

function hideLoader() {
  $("#loading").fadeOut(800);
}

function setCookie(cName, cValue, cDay){
    var expire = new Date();
    expire.setDate(expire.getDate() + cDay);
    cookies = cName + '=' + escape(cValue) + '; path=/ '; // 한글 깨짐을 막기위해 escape(cValue)를 합니다.
    if(typeof cDay != 'undefined') cookies += ';expires=' + expire.toGMTString() + ';';
    document.cookie = cookies;
}


function getCookie(cName) {
    cName = cName + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(cName);
    var cValue = '';
    if(start != -1){
        start += cName.length;
        var end = cookieData.indexOf(';', start);
        if(end == -1)end = cookieData.length;
        cValue = cookieData.substring(start, end);
    }
    return unescape(cValue);
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
}

checkLoginStatus();


function isSet(value) {
  if (value == "" || value == null || value == "undefined") return false;

  return true;
}
