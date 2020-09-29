var langset = "KR";

$(function () {
    showLoader();
    $("#show_1").show();

    langset = getCookie("language");

    $("#droneplay_name").val(getCookie("temp_name"));
    $("#droneplay_email").val(getCookie("temp_email"));

    $("#droneplay_name").attr("placeholder", LANG_JSON_DATA[langset]['name_label']);
    $("#droneplay_email").attr("placeholder", LANG_JSON_DATA[langset]['email_label']);
    $("#droneplay_phonenumber").attr("placeholder", LANG_JSON_DATA[langset]['phone_label']);

    $("#privacy_link_label").attr("href", LANG_JSON_DATA[langset]['privacy_link']);

    $("#register_label").text(LANG_JSON_DATA[langset]['register_label']);
    $("#privacy_link_label").text(LANG_JSON_DATA[langset]['privacy_link_label']);
    $("#fill_info_label").text(LANG_JSON_DATA[langset]['fill_info_label']);
    $("#register_explain_label").text(LANG_JSON_DATA[langset]['register_explain_label']);
    $("#btnAgree").text(LANG_JSON_DATA[langset]['msg_agree']);
    $("#btnRegisterToMember").text(LANG_JSON_DATA[langset]['msg_register']);
    $("#btnBack1").text(LANG_JSON_DATA[langset]['msg_back']);
    $("#btnBack2").text(LANG_JSON_DATA[langset]['msg_back']);


    $("#show_2").hide();
    hideLoader();

});

function onAgree() {
    GATAGM('AgreeBtnClickOnRegister', 'CONTENT', langset);
    showLoader();
    $("#show_2").show();
    $("#show_1").hide();
    hideLoader();
}

function showPrivacyButton() {
	  GATAGM('privacy_link_label', 'CONTENT', langset);
	  	  
	  $.get("/privacy.html", function(html_string){
      showAlert(html_string);
   	});	  	      
}

function goHomeButton() {
    GATAGM('BackBtnClickOnRegister', 'CONTENT', langset);
    goHome();
}

function goHome() {
    if (langset == "KR")
        location.href = "/index.html?fromapp=" + getCookie("isFromApp");
    else
        location.href = "/index_en.html?fromapp=" + getCookie("isFromApp");
}

function ajaxRequest(data, callback, errorcallback) {
    $.ajax({
        url: "https://api.droneplay.io/v1/",
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

function requestRegister() {
    GATAGM('RegisterBtnClickOnRegister', 'CONTENT', langset);

    showLoader();

    grecaptcha.ready(function () {
        grecaptcha.execute('6LehUpwUAAAAAKTVpbrZ2ciN3_opkJaKOKK11qY6', { action: 'action_name' })
            .then(function (token) {
                var droneplay_name = $('#droneplay_name').val();
                var droneplay_email = $('#droneplay_email').val();
                var sns_token = getCookie("temp_sns_token");
                var sns_kind = getCookie("dev_kind");
                var droneplay_phonenumber = $('#droneplay_phonenumber').val();

                if (droneplay_name == null || droneplay_name == "") {
                    GATAGM('NameIsEmptyOnRegister', 'CONTENT', langset);
                    showAlert(LANG_JSON_DATA[langset]['msg_input_name']);
                    hideLoader();
                    return;
                }

                if (droneplay_email == null || droneplay_email == "") {
                    GATAGM('EmailIsEmptyOnRegister', 'CONTENT', langset);
                    showAlert(LANG_JSON_DATA[langset]['msg_input_email']);
                    hideLoader();
                    return;
                }

                if (droneplay_phonenumber == null || droneplay_phonenumber == "") {
                    GATAGM('PhoneIsEmptyOnRegister', 'CONTENT', langset);
                    showAlert(LANG_JSON_DATA[langset]['msg_input_phone']);
                    hideLoader();
                    return;
                }


                var data = {
                    "action": "member",
                    "daction": "register",
                    "name": droneplay_name,
                    "socialid": droneplay_email,
                    "phone_number": droneplay_phonenumber,
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
                        if (r.reason.indexOf("socialid is already exists") >= 0) {
                            showAlert(LANG_JSON_DATA[langset]['msg_email_is_already_exist']);
                            $("#show_2").show();
                            GATAGM('EmailIsExistOnRegister', 'CONTENT', langset);
                            hideLoader();
                            return;
                        }

                        showAlert(LANG_JSON_DATA[langset]['msg_wrong_input']);
                        $("#show_2").show();
                        hideLoader();
                    }
                },
                    function (request, status, error) {

                        GATAGM('ErroOnRegister_' + error, 'CONTENT', langset);
                        showAlert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                        //
                        hideLoader();
                    });
            });
    });
}

function showConfirmDialog() {
    $('#askModalLabel').text(LANG_JSON_DATA[langset]['modal_title']);
    $('#askModalContent').text(LANG_JSON_DATA[langset]['msg_register_success']);
    $('#askModalOKButton').text(LANG_JSON_DATA[langset]['modal_confirm_btn']);
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
    $('#modal-title').text(LANG_JSON_DATA[langset]['modal_title']);
    $('#modal-confirm-btn').text(LANG_JSON_DATA[langset]['modal_confirm_btn']);

    $('#errorModalLabel').html(msg);
    $('#errorModal').modal('show');
}


function showLoader() {
    $("#loading").show();
}

function hideLoader() {
    $("#loading").fadeOut(800);
}

function GATAGM(label, category, language) {
    gtag(
        'event', label + "_" + language, {
        'event_category': category,
        'event_label': label
    }
    );

    mixpanel.track(
        label + "_" + language,
        { "event_category": category, "event_label": label }
    );
}