/* Copyright 2021 APLY Inc. All rights reserved. */

"use strict";

function checkPartnerApplicationData() {
	var fd = new FormData();

	var min_type = "";
	if( $("#min_type_1").is(":checked")) {
		min_type = "방제";
	}

	if( $("#min_type_2").is(":checked")) {
		if (min_type == "") min_type = "촬영";
		else min_type = min_type + ",촬영";
	}

	if( $("#min_type_3").is(":checked")) {
		if (min_type == "") min_type = "교육";
		else min_type = min_type + ",교육";
	}

	if( $("#min_type_4").is(":checked")) {
		if (min_type == "") min_type = "데이터가공분석";
		else min_type = min_type + ",데이터가공분석";
	}

	if( $("#min_type_5").is(":checked")) {
		if (min_type == "") min_type = "기타";
		else min_type = min_type + ",기타";
	}

	if (min_type == "") {
		showAlert("분야를 선택하세요.");
		return null;
	}
	fd.append("min_type", min_type);
	
	if ($("input:radio[name='p_rescue_alim']:checked").attr('id') === undefined) {
		showAlert("지역 재난재해, 실종자 수색요구 발생시 알림 수신여부를 선택해 주세요.");
		return null;
	}
	fd.append("p_rescue_alim", $("input:radio[name='p_rescue_alim']:checked").val());

	// -----------------------------------------

	// ---[ 사업자 ]
	if ($("input:radio[name='p_type']:checked").attr('id') === undefined) {
		showAlert("사업자 상태를 선택하세요. (개인사업자, 법인사업자 또는 개인)");
		return null;
	}
	if ($("input:radio[name='p_type']:checked").val() != "solo") {
		if ($('input[name="fileupload5"]').val() == "") {
			showAlert("사업자 등록증 사본을 첨부해 주세요.");
			return null;
		}
	}
	fd.append("p_type", $("input:radio[name='p_type']:checked").val());	
	// --]

	// ---[ 초경랑비행장치 사용사업 등록 ]
	if ($("input:radio[name='p_reg_biz']:checked").attr('id') === undefined) {
		showAlert("초경량비행장치 사용사업 등록 여부를 선택하세요.");
		return null;
	}
	if ($("input:radio[name='p_reg_biz']:checked").val() == "등록") {
		if ($('input[name="fileupload1"]').val() == "") {
			showAlert("초경량비행장치 사용사업 등록증 사본을 첨부해 주세요.");
			return null;
		}
	}
	fd.append("p_reg_biz", $("input:radio[name='p_reg_biz']:checked").val());
	// --]

	// ---[ 초경량비행장치 신고 ]
	if ($("input:radio[name='p_reg_mac']:checked").attr('id') === undefined) {
		showAlert("초경량비행장치 신고 여부를 선택하세요.");
		return null;
	}
	if ($("input:radio[name='p_reg_mac']:checked").val() == "신고") {
		if ($('input[name="fileupload2"]').val() == "") {
			showAlert("초경량비행장치 신고서 사본을 첨부해 주세요.");
			return null;
		}
	}
	fd.append("p_reg_mac", $("input:radio[name='p_reg_mac']:checked").val());
	// --]

	// ---[ 초경량비행장치 안정성인증서 여부 ]
	if ($("input:radio[name='p_reg_safe']:checked").attr('id') === undefined) {
		showAlert("초경량비행장치 안정성인증서 여부를 선택하세요.");
		return null;
	}
	if ($("input:radio[name='p_reg_safe']:checked").val() == "있음") {
		if ($('input[name="fileupload7"]').val() == "") {
			showAlert("초경량비행장치 안정성인증서  사본을 첨부해 주세요.");
			return null;
		}
	}
	fd.append("p_reg_safe", $("input:radio[name='p_reg_safe']:checked").val());
	// --]


	// ---[ 조종자 자격증명서 여부 ]
	if ($("input:radio[name='p_reg_cert']:checked").attr('id') === undefined) {
		showAlert("조종자 자격 증명서 여부를 선택하세요.");
		return null;
	}
	
	if ($("input:radio[name='p_reg_cert']:checked").val() == "있음") {
		if ($('input[name="fileupload4"]').val() == "") {
			showAlert("조종자자격 증명서 사본을 첨부해 주세요.");
			return null;
		}
	}

	fd.append("p_reg_cert", $("input:radio[name='p_reg_cert']:checked").val());
	// --]

	// ---[ 보험가입 여부 ]
	if ($("input:radio[name='p_reg_ins']:checked").attr('id') === undefined) {
		showAlert("보험 가입 여부를 선택하세요.");
		return null
	}

	if ($("input:radio[name='p_reg_ins']:checked").val() == "가입") {
		if ($('input[name="fileupload3"]').val() == "") {
			showAlert("보험 가입증서 사본을 첨부해 주세요.");
			return null;
		}				
	}
	fd.append("p_reg_ins", $("input:radio[name='p_reg_ins']:checked").val());
	// --]

	if ($("input[name='form_name']").val() == "") {
		showAlert("이름 또는 업체명을 입력하세요.");
		return null;
	}
	fd.append("form_name", $("input[name='form_name']").val());

	if ($('input[name="postcode"]').val() == "") {
		showAlert("우편번호를 입력해 주세요.");
		return null;
	}
	fd.append("postcode", $("input[name='postcode']").val());

	if ($('input[name="detail_address"]').val() == "") {
		showAlert("상세주소를 입력해 주세요.");
		return null;
	}

	fd.append("detail_address", $("input[name='detail_address']").val());

	if ($('input[name="address"]').val() == "") {
		showAlert("주소를 입력해 주세요.");
		return null;
	}
	fd.append("address", $("input[name='address']").val());

	fd.append("form_sns_token", getCookie("dev_sns_token"));
	fd.append("form_sns_kind", getCookie("dev_kind"));

	if ($('input[name="user_phonenumber"]').val() == "") {
		showAlert("전화번호를 입력하세요.");
		return null;
	}

	fd.append("form_phone", $("input[name='user_phonenumber']").val());

	fd.append("form_message", $("#form_message").val());

	fd.append("form_homepage", $("#form_homepage").val());

	if (g_b_phonenumber_verified == false) {
		showAlert("전화번호 인증을 완료해 주세요.");
		return null;
	}

	if ($("#agree_1").length > 0 && $("#agree_1").is(":checked") == false) {
		showAlert("이용약관 및 개인정보 처리방침에 동의해주세요.");
		return null;
	}

	if ($("#agree_2").length > 0 && $("#agree_2").is(":checked") == false) {
		showAlert("서비스 매칭을 위한 '개인정보 제3자 제공' 항목에 동의해주세요.");
		return null;
	}

	if ($("#agree_3").length > 0 && $("#agree_3").is(":checked") == false) {
		showAlert("이용약관 및 개인정보 처리방침에 동의해주세요.");
		return null;
	}

	if ($("#agree_4").length > 0 && $("#agree_4").is(":checked") == false) {
		showAlert("서비스 매칭을 위한 '개인정보 제3자 제공' 항목에 동의해주세요.");
		return null;
	}

	return fd;
}


function sendAjaxData(fd) {
	showLoader();

	$.ajax({
		type: "POST",
		dataType : "json",
		url: 'https://duni.io/handler/handler.php',
		data: fd,
		enctype: 'multipart/form-data', // 필수
		processData: false,
    contentType: false,
    cache: false,
		success: function (data) {
			hideLoader();
			if (data.result == "success") {
				GATAGM('RegisterPartnerBtnClickAndSuccess', 'CONTENT');

				var from_page = getCookie("from_page");
				showAskDialog(
					        GET_STRING_CONTENT('modal_title'),
					        "신청이 완료되었습니다. DUNI가 검토 후에 연락드리겠습니다!",
					        GET_STRING_CONTENT('modal_confirm_btn'),
					        false,
					        function () {
					        	setTimeout(function () {
					        		location.href = g_array_cur_controller_for_viewmode["pilot"] + "?page_action=center";
					        	}, 800);
					        },
					        null
					    );
			}
			else {
				if (data == null || data.message == null) {
					showAlert("죄송합니다, 오류가 발생하였습니다. 다시 시도 부탁드립니다.");
				}
				else if (isSet(data.desc)) {
					if (isSet(data.desc.reason) && data.desc.reason.indexOf("email already exists") >= 0) {
						showAlert("이미 등록된 이메일 입니다. 다른 이메일 주소를 입력해 주세요.");
					}
					else if (isSet(data.desc.reason) && data.desc.reason.indexOf("auth_code") >= 0) {
						showAlert("전화번호 인증을 해주세요.");
					}
				}
				else if (data.sendstatus == 9) {
					showAlert(data.message);
				}
				else showAlert("죄송합니다, 일시적인 오류가 발생하였습니다. 다시 시도 부탁드립니다. (" + data.message + ")");
			}
		},
		error: function(jqXHR, text, error){
			hideLoader();
			showAlert("죄송합니다, 일시적인 오류가 발생하였습니다. 다시 시도 부탁드립니다.");
		}
	});
}

function sendApplicationData(fd)
{
	fd.append("form_kind", "파트너");
	fd.append("ref", "https://pilot.duni.io");
	fd.append("clientid", getCookie("dev_user_id"));
	fd.append("form_email", getCookie("user_email"));
	fd.append( 'auth_code', $('#auth_code').val() );
	fd.append( 'fileupload1', $('input[name=fileupload1]')[0].files[0] );
	fd.append( 'fileupload2', $('input[name=fileupload2]')[0].files[0] );
	fd.append( 'fileupload3', $('input[name=fileupload3]')[0].files[0] );
	fd.append( 'fileupload4', $('input[name=fileupload4]')[0].files[0] );
	fd.append( 'fileupload5', $('input[name=fileupload5]')[0].files[0] );
	fd.append( 'fileupload6', $('input[name=fileupload6]')[0].files[0] );
	fd.append( 'fileupload7', $('input[name=fileupload7]')[0].files[0] );

	grecaptcha.ready(function() {
        grecaptcha.execute('6LfPn_UUAAAAAN-EHnm2kRY9dUT8aTvIcfrvxGy7', {action: 'action_name'}).then(function(token) {
					fd.append("form_token", token);
					sendAjaxData(fd);
				});
	});
}

$(function () {
	$("#partner_send").click(function(e) {
		e.preventDefault();

		GATAGM('partner_submit_btn_click', 'CONTENT');

		var fd = checkPartnerApplicationData();
		if (fd == null) return;

	  sendApplicationData(fd);
	});

	$("#findAddressBtn").click(function(e){
			e.preventDefault();

			GATAGM('partner_find_address_btn_click', 'CONTENT');
			execDaumPostcode(null);
	});

	$('#privacy_policy_view').click(function (e) {
			e.preventDefault();

	    GATAGM('partner_private_link_click', 'CONTENT');

	    $.get("/privacy_KR_raw.html", function(html_string){
      	showAlert(html_string);
   		});
	});

	$('#tos_view').click(function (e) {
			e.preventDefault();

	    GATAGM('partner_tos_link_click', 'CONTENT');

	    $.get("/service_KR_raw.html", function(html_string){
      	showAlert(html_string);
   		});
	});

	$('[name^=user_phonenumber]').keypress(validateNumber);

	let user_phone = getCookie("temp_phone");
	if (user_phone && user_phone != "" && user_phone != "-") {
		if ($("#user_phonenumber").length) {
			$("#user_phonenumber").val(user_phone);
		}
	}

	$('#btn_check_code').click(function (e) {
			e.preventDefault();

	    GATAGM('partner_check_code_btn_click', 'CONTENT');
	    verifyCode($('#verification_code').val(), verifyPhoneCodeCommonSuccessCallback);
	});

	$('#btn_verify_code').click(function (e) {
			e.preventDefault();

	    GATAGM('partner_verify_code_btn_click', 'CONTENT');
	    verifyPhoneNo($('#user_phonenumber').val());
	});

	hideLoader();
});

//# sourceURL=register_partner.js
