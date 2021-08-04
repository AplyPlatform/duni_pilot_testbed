/* Copyright 2021 APLY Inc. All rights reserved. */

"use strict";

$(function () {
	document.title = GET_STRING_CONTENT('page_user_info_title');
  $("#head_title").text(document.title);
  $('#page_about_title').text(GET_STRING_CONTENT('page_user_info_title'));  
  $('#label_connected_sns').text(GET_STRING_CONTENT('label_connected_sns'));
  $('#user_token_label').text(GET_STRING_CONTENT('top_menu_token'));
  $('#user_info_label').text(GET_STRING_CONTENT('user_info_label'));
  $("#btn_leave").text(GET_STRING_CONTENT('label_leave');
  
  $('#user_token_field').val(getCookie('dev_token'));
  
  let sns_kind = getCookie('dev_kind');    
  $('#connected_sns_image').attr("src","/images/logo_" + sns_kind +  ".png");
  $('#label_connected_sns_val').text(sns_kind);
  
  $('#user_info_label').text(getCookie('user_info_label'));
  $('#user_email_value').text(getCookie('user_email'));
  $('#user_name_value').text(getCookie('temp_name'));
  $("#partner_register_area").hide();
  $("#duni_parnter_logo").hide();  
  
  let user_kind = getCookie('user_kind');
  if (user_kind != "partner" && g_str_cur_lang == "KR") {    	
  	$("#partner_register_area").show();
  	$("#patner_register_btn").click(function() {
  		location.href = "main.html?page_action=partner_register";
  	});  	
  }
  
  if (user_kind == "partner") {
  	$("#duni_parnter_logo").show();
  }
  
  var image_url = getCookie("image_url");
  if (image_url == "") $('#user_profile_image').hide();
  else $('#user_profile_image').attr("src", image_url);
  
	$("#btn_leave").click(function(e) {
		e.preventDefault();
		
		GATAGM('userinfo_leave_btn_click', 'CONTENT');
		
		showAskDialog(
					GET_STRING_CONTENT('modal_title'),
          GET_STRING_CONTENT('msg_ask_leave'),          
          GET_STRING_CONTENT('modal_confirm_btn'),
          true,
          function (inputdata) {          	
          	if (inputdata == GET_STRING_CONTENT('msg_to_leave')) {
	          	setTimeout(function () { 
						        		leaveNow();
						        	}, 300);	
						}
          },
          function () {
          	
          }
      );
	});
  
});

function leaveNow() {
	var userid = getCookie("dev_user_id");
	var jdata = {
      "action": "member",
      "daction": "leave",
      "clientid": userid
  };
  ajaxRequest(jdata, function(r){
          if(r.result_code == 0){          		           		
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
			        setCookie("dev_kind", "", -1);
			        setCookie("user_google_auth_token", "", -1);
			        GATAGM('userinfo_leave_success', 'CONTENT');
          		showAlert(GET_STRING_CONTENT('msg_success'));
           		goIndex("logout");
              return;
          }
          
          GATAGM('userinfo_leave_failed', 'CONTENT', r.reason);
          showAlert(GET_STRING_CONTENT("msg_error_sorry") + " : " + r.reason);
          return;
      },
      function (request, status, error) {
      		GATAGM('userinfo_leave_failed', 'CONTENT', error);
          showAlert(GET_STRING_CONTENT("msg_error_sorry") + " : " + error);          
      }  
  );
}

//# sourceURL=user_info.js