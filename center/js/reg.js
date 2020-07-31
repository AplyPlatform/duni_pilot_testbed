$(function() {
      showLoader();
      $("#show_1").show();
      $("#show_2").hide();
      hideLoader();

});

function onAgree() {
      showLoader();
      $("#show_1").hide();
      $("#show_2").show();
      hideLoader();
}

function goHome() {
      location.href="index.html?fromapp=" + getCookie("isFromApp");
}

function ajaxRequest(data, callback, errorcallback) {
    $.ajax({url : "https://api.droneplay.io/v1/",
           dataType : "json",
           crossDomain: true,
           cache : false,
           data : JSON.stringify(data),
           type : "POST",
           contentType: "application/json; charset=utf-8",
           async: false,
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

function requestRegister() {
    showLoader();

    grecaptcha.ready(function() {
      grecaptcha.execute('6LehUpwUAAAAAKTVpbrZ2ciN3_opkJaKOKK11qY6', {action: 'action_name'})
      .then(function(token) {
              var droneplay_name = $('#droneplay_name').val();
              var droneplay_email = $('#droneplay_email').val();
              var emailid = getCookie("temp_user_id");
              var droneplay_phonenumber = $('#droneplay_phonenumber').val();                            

              if (droneplay_name == null || droneplay_name == ""
                  || droneplay_email == null || droneplay_email == ""
                  || emailid == null || emailid == ""
                  || droneplay_phonenumber == null || droneplay_phonenumber == "") {
                alert("Please, input valid information.");
                return;
              }

              var data = {
                  "action": "member",
                  "daction" : "register",
                  "name": droneplay_name,
                  "socialid" : droneplay_email,
                  "phone_number" : droneplay_phonenumber,
                  "captcha_token": token,
                  "emailid" : emailid
              };

              ajaxRequest(data, function(r) {
                      hideLoader();
                      if(r.result == "success") {
                          alert("Congratulation !! Successfully, registered.");
                          window.location.href = "./index.html?fromapp=" + getCookie("isFromApp");
                      }
                      else {
                          alert("Something wrong. Please, input valid information.");
                          $("#show_2").show();
                      }
                  },
                  function(request,status,error){

                     alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
                     //
                     hideLoader();
                  });
      });
    });
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


function showLoader() {
  $("#loading").show();
}

function hideLoader() {
  $("#loading").fadeOut(800);
}
