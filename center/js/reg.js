$(function() {
      showLoader();
      $("#show_1").show();
      $("#show_2").hide();
      hideLoader();

});

function onAgree() {
      showLoader();      
      $("#show_2").show();
      $("#show_1").hide();
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
              var sns_token = getCookie("temp_sns_token");              
              var sns_kind = getCookie("dev_kind");
              var droneplay_phonenumber = $('#droneplay_phonenumber').val();                            

              if (droneplay_name == null || droneplay_name == "") {
                showAlert("이름을 입력해 주세요");
                return;
              }              
              
              if (droneplay_email == null || droneplay_email == "") {
                showAlert("이메일 주소를 입력해 주세요");
                return;
              }
              
              if (droneplay_phonenumber == null || droneplay_phonenumber == "") {
                showAlert("전화번호를 입력해 주세요");
                return;
              }
              

              var data = {
                  "action": "member",
                  "daction" : "register",
                  "name": droneplay_name,
                  "socialid" : droneplay_email,
                  "phone_number" : droneplay_phonenumber,
                  "sns_kind" : sns_kind,
                  "sns_token": sns_token                  
              };

              ajaxRequest(data, function(r) {
                      hideLoader();
                      if(r.result == "success") {
                          alert("가입이 완료 되었습니다. 가입시 선택한 SNS로 로그인해 주세요.");
                          window.location.href = "./index.html?fromapp=" + getCookie("isFromApp");
                      }
                      else {
                      		if(r.reason.indexOf("socialid is already exists") >= 0) {
                      			showAlert("이미 등록된 이메일 입니다.");
                      			$("#show_2").show();
                      			return;
                      		}
                      		                          
                          showAlert("잘못된 정보가 입력되었습니다. 입력한 정보를 다시 확인해 주세요");
                          $("#show_2").show();
                      }
                  },
                  function(request,status,error){

                     showAlert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
                     //
                     hideLoader();
                  });
      });
    });
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

function showAlert(msg) {	  
	$('#errorModalLabel').text(msg);
	$('#errorModal').modal('show');  	
}


function showLoader() {
  $("#loading").show();
}

function hideLoader() {
  $("#loading").fadeOut(800);
}
