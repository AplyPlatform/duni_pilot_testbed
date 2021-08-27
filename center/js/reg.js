/*
Copyright 2021 APLY Inc. All rights reserved.
*/


var g_b_email_verified = false;

$(function () {
    showLoader();
    
    g_str_page_action = "register";
    
    $("#show_1").show();

    g_str_cur_lang = getCookie("language");

    $("#droneplay_name").val(getCookie("temp_name"));
    $("#droneplay_email").val(getCookie("temp_email"));

    $("#droneplay_name").attr("placeholder", GET_STRING_CONTENT('name_label'));
    $("#droneplay_email").attr("placeholder", GET_STRING_CONTENT('email_label'));
    
    $("#register_label").text(GET_STRING_CONTENT('register_label'));
    $("#privacy_link_label").text(GET_STRING_CONTENT('privacy_link_label'));
    $("#tos_link_label").text(GET_STRING_CONTENT('tos_link_label'));
    $("#fill_info_label").text(GET_STRING_CONTENT('fill_info_label'));
    $("#register_explain_label").text(GET_STRING_CONTENT('register_explain_label'));
    $("#btnAgree").text(GET_STRING_CONTENT('msg_agree'));
    $("#btnRegisterToMember").text(GET_STRING_CONTENT('msg_register'));
    $("#btnBack1").text(GET_STRING_CONTENT('msg_back'));
    $("#btnBack2").text(GET_STRING_CONTENT('msg_back'));
    
    $("#btn_check_email").text(GET_STRING_CONTENT('label_check_email'));
    
    let sns_kind = getCookie('dev_kind');    
  	$('#connected_sns_image').attr("src","/images/logo_" + sns_kind +  ".png");
  	$('#label_connected_sns_val').text(sns_kind);


    $("#show_2").hide();
    hideLoader();    
});

function onAgree() {
    GATAGM('register_user_agree_btn_click', 'CONTENT');
    showLoader();
    $("#show_2").show();
    $("#show_1").hide();
    hideLoader();
}

function showPrivacyButton() {	  
	  GATAGM('register_privacy_link_click', 'CONTENT');

	  $.get("/privacy_" + g_str_cur_lang + "_raw.html", function(html_string){
      showAlert(html_string);
   	});
}

function showTOSButton() {	  
	  GATAGM('register_tos_link_click', 'CONTENT');

	  $.get("/service_" + g_str_cur_lang + "_raw.html", function(html_string){
      showAlert(html_string);
   	});
}

function goHomeButton(btnName) {
    GATAGM('register_go_home_btn_click', 'CONTENT');
    goHome();
}

function goHome() {
    if (g_str_cur_lang == "KR")
        location.href = "/index.html?fromapp=" + getCookie("isFromApp");
    else
        location.href = "/index_en.html?fromapp=" + getCookie("isFromApp");
}

function isEmail(email) {
    var regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/igm;
    return regex.test(email);
}

function checkEmail(){
    let email = $('#droneplay_email').val();
    if(email == ""){
        showAlert(GET_STRING_CONTENT('msg_email_empty'));
        return;
    }
    if(!isEmail(email) || email.length > 100){
        showAlert(GET_STRING_CONTENT('msg_email_invalid'));
        return;
    }
    grecaptcha.ready(function() {
        grecaptcha.execute('6LfPn_UUAAAAAN-EHnm2kRY9dUT8aTvIcfrvxGy7', {action: 'action_name'}).then(function(token) {
            var jdata = {
                "action" : "member2", 
                "daction" : "validate_email", 
                "email" : email };
                //,"g_token" : token};
            ajaxRequest(jdata,
                function(data){
                    let result = data.result_code;
                    if(result === 0){		
                        g_b_email_verified = false;
                        showAlert(GET_STRING_CONTENT('msg_email_valid'));
                        $("#btn_check_email").val("재전송");
						var duration = 60 * 5;
						var display = $('#email_remaining_time');
						startTimer(duration, display);
						$("#email_verification_input").show();
						return;
                    }
                    if(result === 2){
                        showAlert(GET_STRING_CONTENT('msg_email_invalid'));
                        return;
                    }
                    if(result === 3){
                        showAlert(GET_STRING_CONTENT('msg_email_already_exists'));
                        return;
                    }
                    showAlert(GET_STRING_CONTENT('msg_error_sorry'));
                },
                function (err, stat, error) {
                    showAlert(GET_STRING_CONTENT('msg_error_sorry'));
                }
            );
        });
    });
}

function checkEmailCode(){
    	let verification_code = $('input[name="email_verification_code"]').val();
	if(verification_code == ""){
		showAlert(GET_STRING_CONTENT('msg_code_empty'));
		return;
	}
	grecaptcha.ready(function() {
		grecaptcha.execute('6LfPn_UUAAAAAN-EHnm2kRY9dUT8aTvIcfrvxGy7', {action: 'homepage'}).then(function(token) {
			var jdata = {
				"action" : "member2",
				"daction" : "check_email_verifycode",
				"email" : $('input[name="form_email"]').val(),
				"email_verify_code" : verification_code};
				//,"g_token" : token};
			ajaxRequest(jdata,
				function(data){
					let result = data.result_code;
					if(result === 0){
						$('input[name="email_verification_code"]').val("");
						$("#email_verification_input").hide();
						showAlert(GET_STRING_CONTENT('msg_phone_verified'));
						clearInterval(interval_timer);
						g_b_email_verified = true;
						return;
					}
					if(result === 2){
						showAlert(GET_STRING_CONTENT('msg_wrong_verification_code'));
						return;
					}
					if(result === 4){
						showAlert(GET_STRING_CONTENT('msg_phone_verification_timeout'));
						return;
					}
					showAlert(GET_STRING_CONTENT('msg_error_sorry'));
					return;
				},
				function (err, stat, error) {
					showAlert(GET_STRING_CONTENT('msg_error_sorry'));
				}
			);
		});
	});
}

function requestRegister() {
    GATAGM('RegisterBtnClickOnRegister', 'CONTENT');

    showLoader();

    grecaptcha.ready(function () {
        grecaptcha.execute('6LfPn_UUAAAAAN-EHnm2kRY9dUT8aTvIcfrvxGy7', { action: 'action_name' })
            .then(function (token) {
                var droneplay_name = $('#droneplay_name').val();
                var droneplay_email = $('#droneplay_email').val();
                var sns_token = getCookie("temp_sns_token");
                var sns_kind = getCookie("dev_kind");                

                if (droneplay_name == null || droneplay_name == "") {
                    GATAGM('NameIsEmptyOnRegister', 'CONTENT');
                    showAlert(GET_STRING_CONTENT('msg_input_name'));
                    hideLoader();
                    return;
                }

                if (droneplay_email == null || droneplay_email == "") {
                    GATAGM('EmailIsEmptyOnRegister', 'CONTENT');
                    showAlert(GET_STRING_CONTENT('msg_input_email'));
                    hideLoader();
                    return;
                }


                if(g_b_email_verified === false){
                    GATAGM('EmailNotVerified', 'CONTENT');
                    showAlert(GET_STRING_CONTENT('msg_email_not_verified'));
                    hideLoader();
                    return;
                }
                var data = {
                    "action": "member",
                    "daction": "register",
                    "name": encodeURI(droneplay_name),
                    "socialid": droneplay_email,
                    "sns_kind": sns_kind,
                    "sns_token": sns_token
                };

                ajaxRequest(data, function (r) {
                    hideLoader();
                    if (r.result == "success") {
                        hideLoader();
                        showConfirmDialog();
                    }
                    else {
                    		hideLoader();
                    		$("#show_2").show();
                    		
                        if (r.result_code == 3 && r.reason.indexOf("socialid") >= 0) {
	                            showAlert(GET_STRING_CONTENT('msg_email_is_already_exist'));
	                            GATAGM('EmailIsExistOnRegister', 'CONTENT');  
	                            return;
                        }

                        showAlert(GET_STRING_CONTENT('msg_wrong_input'));
                    }
                },
                    function (request, status, error) {

                        GATAGM('ErroOnRegister_' + error, 'CONTENT');
                        showAlert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                        //
                        hideLoader();
                    });
            });
    });
}


function showConfirmDialog() {
    $('#askModalLabel').text(GET_STRING_CONTENT('modal_title'));
    $('#askModalContent').text(GET_STRING_CONTENT('msg_register_success'));
    $('#askModalOKButton').text(GET_STRING_CONTENT('modal_confirm_btn'));
    $('#askModalCancelButton').hide();

    $('#askModalOKButton').off('click');
    $('#askModalOKButton').click(function (e) {
    		e.preventDefault();
        $('#askModal').modal('hide');
        goHome();
    });

    $('#askModal').modal('show');
}


