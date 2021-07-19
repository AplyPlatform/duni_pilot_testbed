/*
Copyright 2021 APLY Inc. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var g_str_cur_lang = "KR";
// 인증여부 혜지프로
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

function ajaxRequest(data, callback, errorcallback) {
    $.ajax({
        url: "https://api.duni.io/v1/",
        dataType: "json",
        crossDomain: true,
        cache: false,
        data: JSON.stringify(data),
        type: "POST",
        contentType: "application/json; charset=utf-8",
        success: function (r) {
            console.log(JSON.stringify(r));
            callback(r);
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            errorcallback(request, status, error);
        }
    });
}



// 이메일 인증 혜지프로
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
        console.log("here!");
        showAlert(GET_STRING_CONTENT('msg_email_invalid'));
        return;
    }
    grecaptcha.ready(function() {
        grecaptcha.execute('6LfPn_UUAAAAAN-EHnm2kRY9dUT8aTvIcfrvxGy7', {action: 'action_name'}).then(function(token) {
            var jdata = {
                "action" : "member", 
                "daction" : "validate_email", 
                "email" : encodeURI($('#droneplay_email').val()),
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
                    "socialid": encodeURI(droneplay_email),
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

function validateNumber(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode === 8 || event.keyCode === 46) {
        return true;
    } else if ( key < 48 || key > 57 ) {
        return false;
    } else {
        return true;
    }
}

function showConfirmDialog() {
    $('#askModalLabel').text(GET_STRING_CONTENT('modal_title'));
    $('#askModalContent').text(GET_STRING_CONTENT('msg_register_success'));
    $('#askModalOKButton').text(GET_STRING_CONTENT('modal_confirm_btn'));
    $('#askModalCancelButton').hide();

    $('#askModalOKButton').off('click');
    $('#askModalOKButton').click(function () {
        $('#askModal').modal('hide');
        goHome();
    });

    $('#askModal').modal('show');
}

function delCoockie(cName) {
    document.cookie = name + "= " + "; expires=" + date.toUTCString() + "; path=/";
}

function setCookie(cName, cValue, cDay) {
    var date = new Date();
    date.setTime(date.getTime() + cDay * 60 * 60 * 24 * 1000);
    document.cookie = cName + '=' + cValue + ';expires=' + date.toUTCString() + ';path=/';
}

function getCookie(cName) {
    var value = document.cookie.match('(^|;) ?' + cName + '=([^;]*)(;|$)');
    return value ? value[2] : null;
}

function showAlert(msg) {
    $('#modal-title').text(GET_STRING_CONTENT('modal_title'));
    $('#modal-confirm-btn').text(GET_STRING_CONTENT('modal_confirm_btn'));

    $('#errorModalLabel').html(msg);
    $('#errorModal').modal('show');
    if(msg == GET_STRING_CONTENT('msg_phone_verification_timeout')){
        $('#modal-confirm-btn').off('click');
        $('#modal-confirm-btn').click(function () {
            location.href=location.href;
        });
    }
}


function showLoader() {
    $("#loading").show();
}

function hideLoader() {
    $("#loading").fadeOut(800);
}

function GATAGM(label, category) {
    gtag(
        'event', label + "_" + g_str_cur_lang, {
        'event_category': category,
        'event_label': label
    }
    );

    mixpanel.track(
        label + "_" + g_str_cur_lang,
        { "event_category": category, "event_label": label }
    );
}

function GET_STRING_CONTENT(table_index_str) {	
		return LANG_JSON_DATA[g_str_cur_lang][table_index_str];
}