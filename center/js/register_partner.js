/* Copyright 2021 APLY Inc. All rights reserved. */

"use strict";

function checkPartnerApplicationData(form_id) {

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

	if (min_type == "") {
		showAlert("분야를 선택하세요.");
		return false;
	}
	
	$(form_id).find('input[name="min_type"]').val(min_type);
	
	
	if ($(form_id).find("input:radio[name='p_reg_biz']:checked").attr('id') === undefined) {
		showAlert("초경량비행장치 사용사업 등록 여부를 선택하세요.");
		return false;
	}
	
	if ($(form_id).find("input:radio[name='p_reg_mac']:checked").attr('id') === undefined) {
		showAlert("초경량비행장치 신고 여부를 선택하세요.");
		return false;
	}
	
	if ($(form_id).find("input:radio[name='p_reg_safe']:checked").attr('id') === undefined) {
		showAlert("초경량비행장치 안정성인증서 여부를 선택하세요.");
		return false;
	}
	
	if ($(form_id).find("input:radio[name='p_reg_cert']:checked").attr('id') === undefined) {
		showAlert("조종자 자격 증명서 여부를 선택하세요.");
		return false;
	}
	
	if ($(form_id).find("input:radio[name='p_reg_ins']:checked").attr('id') === undefined) {
		showAlert("보험 가입 여부를 선택하세요.");
		return false;
	}

	if ($(form_id).find("input:radio[name='p_type']:checked").attr('id') === undefined) {
		showAlert("사업자 상태를 선택하세요. (개인사업자 또는 법인사업자)");
		return false;
	}

	if ($(form_id).find("input[name='form_name']").val() == "") {
		showAlert("이름 또는 업체명을 입력하세요.");
		return false;
	}				
	
	if ($(form_id).find('input[name="postcode"]').val() == "") {
		showAlert("우편번호를 입력해 주세요.");
		return false;
	}
	
	if ($(form_id).find('input[name="detail_address"]').val() == "") {
		showAlert("상세주소를 입력해 주세요.");
		return false;
	}
	
	var sns_token = getCookie("dev_sns_token");
	var sns_kind = getCookie("dev_kind");	

	$(form_id).find('input[name="form_sns_token"]').val(sns_token);
	$(form_id).find('input[name="form_sns_kind"]').val(sns_kind);
		

	if ($(form_id).find('input[name="user_phonenumber"]').val() == "") {
		showAlert("전화번호를 입력하세요.");
		return false;
	}
	
	if ($(form_id).find("#agree_1").length > 0 && $(form_id).find("#agree_1").is(":checked") == false) {
		showAlert("이용약관 및 개인정보 처리방침에 동의해주세요.");
		return false;
	}

	if ($(form_id).find("#agree_2").length > 0 && $(form_id).find("#agree_2").is(":checked") == false) {
		showAlert("서비스 매칭을 위한 '개인정보 제3자 제공' 항목에 동의해주세요.");
		return false;
	}

	if ($(form_id).find("#agree_3").length > 0 && $(form_id).find("#agree_3").is(":checked") == false) {
		showAlert("이용약관 및 개인정보 처리방침에 동의해주세요.");
		return false;
	}

	if ($(form_id).find("#agree_4").length > 0 && $(form_id).find("#agree_4").is(":checked") == false) {
		showAlert("서비스 매칭을 위한 '개인정보 제3자 제공' 항목에 동의해주세요.");
		return false;
	}

	return true;
}

// 상세주소
function execDaumPostcode() {
	new daum.Postcode({
		oncomplete: function(data) {
			// 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

			// 각 주소의 노출 규칙에 따라 주소를 조합한다.
			// 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
			var addr = ''; // 주소 변수
			var extraAddr = ''; // 참고항목 변수

			//사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
			if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
				addr = data.roadAddress;
			} else { // 사용자가 지번 주소를 선택했을 경우(J)
				addr = data.jibunAddress;
			}

			// 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
			// if(data.userSelectedType === 'R'){
			// 	// 법정동명이 있을 경우 추가한다. (법정리는 제외)
			// 	// 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
			// 	if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
			// 		extraAddr += data.bname;
			// 	}
			// 	// 건물명이 있고, 공동주택일 경우 추가한다.
			// 	if(data.buildingName !== '' && data.apartment === 'Y'){
			// 		extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
			// 	}
			// 	// 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
			// 	if(extraAddr !== ''){
			// 		extraAddr = ' (' + extraAddr + ')';
			// 	}
			
			// }

			// 우편번호와 주소 정보를 해당 필드에 넣는다.
			if (document.getElementById('postcode'))
				document.getElementById('postcode').value = data.zonecode;
				
			if (document.getElementById("address"))
				document.getElementById("address").value = addr;
			
			if (document.getElementById("detail_address"))
				document.getElementById("detail_address").focus();
				
			if (document.getElementById('postcode2'))
				document.getElementById('postcode2').value = data.zonecode;
				
			if (document.getElementById("address2"))
				document.getElementById("address2").value = addr;
			
			if (document.getElementById("detail_address2"))
				document.getElementById("detail_address2").focus();
		}
	}).open();
}

function sendApplicationData(form_id)
{	
	var ref = $('<input type="hidden" value="' + referrer_site + '" name="ref">');	
	$(form_id).append(ref);	
	ref = $('<input type="hidden" value="' + getCookie("dev_user_id") + '" name="clientid">');
	$(form_id).append(ref);
	
	let phone_num = $(form_id).find("input[name='user_phonenumber']").val()
	ref = $('<input type="hidden" value="' + phone_num + '" name="form_phone">');
	$(form_id).append(ref);
	
	let email = getCookie("user_email");	
	if (isSet(email)) {
		ref = $('<input type="hidden" value="' + email + '" name="form_email">');
		$(form_id).append(ref);		
	}

	ref = $('<input type="hidden" value="파트너" name="form_kind">');
	$(form_id).append(ref);
	
	var sed = new FormData($(form_id)[0]);
				
	$.ajax({
		type: "POST",
		dataType : "json",
		url: 'https://duni.io/handler/handler.php',
		data:sed,
		enctype: 'multipart/form-data', // 필수
		processData: false,
    contentType: false,
    cache: false,
		success: function (data) {			
			if (data.result == "success") {				
				
				$(form_id)[0].reset();				
				
				var from_page = getCookie("from_page");
				var targetUrl = null;
				if (isSet(from_page) && getQueryVariable("page") != from_page) {
					targetUrl = "/index.php?page=" + from_page;
				}
				
				showAlert("신청이 완료되었습니다. DUNI가 검토 후에 연락드리겠습니다!");
			}
			else {
				if (data == null || data.message == null) {
					showAlert("죄송합니다, 오류가 발생하였습니다. 다시 시도 부탁드립니다.");
				}
				else if (isSet(data.desc) && data.desc.indexOf("email already exists") >= 0) {
					showAlert("이미 등록된 이메일 입니다. 다른 이메일 주소를 입력해 주세요.");
				}
				else if (data.sendstatus == 9) {
					showAlert(data.message);
				}
				else showAlert("죄송합니다, 일시적인 오류가 발생하였습니다. 다시 시도 부탁드립니다. (" + data.message + ")");
			}
			
			$(form_id + " input").last().remove();
		},
		error: function(jqXHR, text, error){			
			showAlert("죄송합니다, 일시적인 오류가 발생하였습니다. 다시 시도 부탁드립니다.");
		}
	});
}

$(function () {
	$("#partner_send").click(function(e) {
		e.preventDefault();
				
		if (checkPartnerApplicationData("partner") == false) return;
						
	  sendApplicationData("partner");
	});

	$('[name^=form_phone]').keypress(validateNumber);
	
	$("#findAddressBtn").click(function(e){
			e.preventDefault();
			
			execDaumPostcode();
	});
	
	$('#btn_check_code').click(function (e) {
			e.preventDefault();
			
	    GATAGM('btn_check_code', 'CONTENT');
	    verifyCode($('#verification_code').val());
	});
	
	$('#btn_verify_code').click(function (e) {
			e.preventDefault();
			
	    GATAGM('btn_verify_code', 'CONTENT');
	            
	    verifyPhoneNo($('#user_phonenumber').val());
	});
	
	$('#privacy_policy_view').click(function (e) {
			e.preventDefault();
			
	    GATAGM('privacy_policy_view', 'CONTENT');
	            
	    $.get("/privacy_KR_raw.html", function(html_string){
      	showAlert(html_string);
   		});
	});
	
	$('#tos_view').click(function (e) {
			e.preventDefault();
			
	    GATAGM('tos_view', 'CONTENT');
	            
	    $.get("/service_KR_raw.html", function(html_string){
      	showAlert(html_string);
   		});
	});
	
	  


});	