/* Copyright 2021 APLY Inc. All rights reserved. */

"use strict";

$(function () {
	document.title = GET_STRING_CONTENT('page_user_info_title');
  $("#head_title").text(document.title);
  $('#page_about_title').text(GET_STRING_CONTENT('page_user_info_title'));  
  $('#label_connected_sns').text(GET_STRING_CONTENT('label_connected_sns'));
  $('#user_token_label').text(GET_STRING_CONTENT('top_menu_token'));
  
  $('#user_token_field').val(getCookie('dev_token'));
  
  let sns_kind = getCookie('dev_kind');
    
  $('#connected_sns_image').attr("src","/images/logo_" + sns_kind +  ".png");
  $('#label_connected_sns_val').text(sns_kind);
  
	$("#btn_leave").click(function(e) {
		e.preventDefault();
		
		GATAGM('userinfo_leave_btn_click', 'CONTENT');
		
		showAskDialog(
          GET_STRING_CONTENT('modal_title'),
          GET_STRING_CONTENT('msg_ask_leave'),
          GET_STRING_CONTENT('modal_confirm_btn'),
          false,
          function () { 
          	setTimeout(function () { 
					        		leaveNow();
					        	}, 300);	
          },
          null
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
          if(r.result_code === 0){
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