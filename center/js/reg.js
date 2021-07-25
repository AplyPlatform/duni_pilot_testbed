/*
Copyright 2021 APLY Inc. All rights reserved.
*/


var g_b_email_verified = false;

$(function () {
    showLoader();
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


    $("#show_2").hide();
    hideLoader();    
});

function onAgree() {
    GATAGM('AgreeBtnClickOnRegister', 'CONTENT');
    showLoader();
    $("#show_2").show();
    $("#show_1").hide();
    hideLoader();
}

function showPrivacyButton() {
	  GATAGM('privacy_link_label', 'CONTENT');

	  $.get("/privacy_" + g_str_cur_lang + "_raw.html", function(html_string){
      showAlert(html_string);
   	});
}

function showTOSButton() {
	  GATAGM('tos_link_label', 'CONTENT');

	  $.get("/service_" + g_str_cur_lang + "_raw.html", function(html_string){
      showAlert(html_string);
   	});
}

function goHomeButton(btnName) {
    GATAGM(btnName, 'CONTENT');
    goHome();
}

function goHome() {
    if (g_str_cur_lang == "KR")
        location.href = "/index.html?fromapp=" + getCookie("isFromApp");
    else
        location.href = "/index_en.html?fromapp=" + getCookie("isFromApp");
}

function checkEmail(){
    let email = $('#droneplay_email').val();
    if(email == ""){
        showAlert(GET_STRING_CONTENT('msg_email_empty'));
        return;
    }
    if(!isEmail(email) || email.length > 100){
        console.log("here!");
        showAlert(GET_STRING_CONTENT('msg_email_invalid'));
        return;
    }
    grecaptcha.ready(function() {
        grecaptcha.execute('6LfPn_UUAAAAAN-EHnm2kRY9dUT8aTvIcfrvxGy7', {action: 'action_name'}).then(function(token) {
            var jdata = {
                "action" : "member", 
                "daction" : "validate_email", 
                "email" : email,
                "g_token" : token};
            ajaxRequest(jdata,
                function(data){
                    let result = data.result_code;
                    if(result === 0){		
                        g_b_email_verified = true;
                        showAlert(GET_STRING_CONTENT('msg_email_valid'));
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


