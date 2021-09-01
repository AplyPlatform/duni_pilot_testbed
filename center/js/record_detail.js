/* Copyright 2021 APLY Inc. All rights reserved. */

"use strict";
$(function () {
	
	flightDetailInit(g_str_current_target);
	
	function flightDetailInit(target) {
			map2DInit();
	    selectMonitorIndex("private", 0);            
	    map3DInit();
	
	    if (target == "public") {
	        document.title = GET_STRING_CONTENT('page_flight_rec_public_view_title');
	    }
	    else {
	        document.title = GET_STRING_CONTENT('page_flight_rec_view_title');
	    }
	
	    $("#head_title").text(document.title);
	    $("#modifyBtnForMovieData").text(GET_STRING_CONTENT('modifyBtnForMovieData'));
	    $("#desc_for_moviedata_label").text(GET_STRING_CONTENT('input_memo_label'));
	    $("#privacy_for_moviedata_label").text(GET_STRING_CONTENT('privacy_for_moviedata_label'));
	    $("#option_public_label").text(GET_STRING_CONTENT('option_public_label'));
	    $("#option_unlisted_label").text(GET_STRING_CONTENT('option_unlisted_label'));
	    $("#option_private_label").text(GET_STRING_CONTENT('option_private_label'));
	    $("#uploadVideoToYoutubeButton").text(GET_STRING_CONTENT('uploadVideoToYoutubeButton'));
	    $("#flightMemoBtn").text(GET_STRING_CONTENT('msg_modify_memo'));
	    $("#flightTagBtn").text(GET_STRING_CONTENT('msg_modify_tag'));
	
	    $("#input_tag_label").text(GET_STRING_CONTENT('input_tag_label'));
	
	    $("#altitude_label_top").text(GET_STRING_CONTENT('altitude_label'));
	    $("#youtube_url_label").text(GET_STRING_CONTENT('youtube_url_label'));
	    $("#btnForSetYoutubeID").text(GET_STRING_CONTENT('msg_apply'));
	    $("#map_kind_label").text(GET_STRING_CONTENT('map_kind_label'));
	    $("#input_memo_label").text(GET_STRING_CONTENT('input_memo_label'));
	    //$("#btnForFilter").text(GET_STRING_CONTENT('btnForFilter'));
	    $("#btnForSharing").text(GET_STRING_CONTENT('btnForSharing'));
	    $("#btnForPublic").text(GET_STRING_CONTENT('btnForOpening'));
	    $("#btnForLink").text(GET_STRING_CONTENT('btnForLink'));
	    $("#btnForDelete").text(GET_STRING_CONTENT('msg_remove'));
	    $("#btnForUpdateTitle").text(GET_STRING_CONTENT('msg_modify'));
	
	    $("#dji_radio_label").text(GET_STRING_CONTENT('msg_dji_file_upload'));
	    $("#duni_radio_label").text(GET_STRING_CONTENT('msg_duni_file_upload'));
	    $('#btnForUploadFlightList').text(GET_STRING_CONTENT('msg_upload'));
	    $('#uploadBtnForFlightRecord').text(GET_STRING_CONTENT('page_flight_rec_upload_title'));
	
	    $('#Aerial_label').text(GET_STRING_CONTENT('Aerial_label'));
	    $('#Aerial_label_label').text(GET_STRING_CONTENT('Aerial_label_label'));
	    $('#Road_label').text(GET_STRING_CONTENT('Road_label'));
			$('#Road_detail').text(GET_STRING_CONTENT('Road_detail_label'));
	
	    $('#roll_label').text(GET_STRING_CONTENT('roll_label'));
	    $('#pitch_label').text(GET_STRING_CONTENT('pitch_label'));
	    $('#yaw_label').text(GET_STRING_CONTENT('yaw_label'));
	
	    $("#tab_menu_set_youtube_address").text(GET_STRING_CONTENT('label_set_youtube_url'));
	    $("#tab_menu_set_youtube_upload").text(GET_STRING_CONTENT('label_upload_movie'));
	
	    $('#btnSelectMovieFiles').text(GET_STRING_CONTENT('label_select_files'));
	
	    $('#sync_slider_label').text(GET_STRING_CONTENT('sync_slider_label') + " (" + GET_STRING_CONTENT('label_second') + ")");
	
	    $('#flightRecDsecApplyBtn').text(GET_STRING_CONTENT('apply_flight_rec_sync_btn'));
	    $('#flightRecDsecSaveBtn').text(GET_STRING_CONTENT('save_flight_rec_sync_btn'));
	
	    $('#sync_explain_label').html(GET_STRING_CONTENT('sync_explain_label'));
	
	    $('#no_record_data_view_label').text(GET_STRING_CONTENT('no_record_data_view_label'));
	
	    $('#record_search_field_label').text(GET_STRING_CONTENT('record_search_field_label'));
	    $("#btnForLoadFlightList").text(GET_STRING_CONTENT('btnForLoadFlightList'));
	    $('#modal-search-confirm-btn').text(GET_STRING_CONTENT('msg_closed'));
	
	
	    $("#disclaimer").html(GET_STRING_CONTENT('youtubeTOS'));
	
	    $("#btnForLink").hide();
	    $("#btnForSharing").hide();
	
	    $("#set_youtube_address_view").hide();
			$("#set_youtube_upload_view").show();
	
			$("input[name='media_upload_kind']:radio").change(function () {
	        let cVal = this.value;
	
	        if (cVal == "tab_menu_set_youtube_address") {
	        	$("#set_youtube_address_view").show();
	        	$("#set_youtube_upload_view").hide();
	        }
	        else if (cVal == "tab_menu_set_youtube_upload") {
	        	$("#set_youtube_address_view").hide();
	        	$("#set_youtube_upload_view").show();
	        }
	        else {
	        	$("#set_youtube_address_view").hide();
	        	$("#set_youtube_upload_view").hide();
	        }
			});
	
			/*
	    $('#btnForFilter').click(function (e) {
	    		e.preventDefault();
	
	        GATAGM('btnForFilter', 'CONTENT');
	        setKalmanFilter();
	    });
	    */
	
	    $('#merge_record_view_btn').click(function () {
	        GATAGM('detail_merge_record_view_btn_click', 'CONTENT');
	        $('#dataTable-Flight_area').modal('show');
	    });
	
	    $("#record_search_field").attr("placeholder", GET_STRING_CONTENT('msg_record_search_key'));
			$("#record_search_field").keypress(function(e) {
	        if (e.which == 13){
	        		GATAGM('detail_record_search_field_enter_key', 'CONTENT', $("#record_search_field").val());
	        		searchFlightRecordForMerge(target, $("#record_search_field").val());
	        }
	    });
	
	    $('#loadMoreArea').hide();
	
	    $('#btnForLoadFlightList').click(function () {
	    		GATAGM('detail_record_load_more_btn_click', 'CONTENT');
	        getFlightRecords(target, $("#record_search_field").val());
	    });
	
	    $('#btnForSetYoutubeID').click(function (e) {
	    		e.preventDefault();
	
	        GATAGM('detail_set_youtube_btn_click', 'CONTENT');
	        setYoutubeID();
	    });
	
	    $('#btnForUploadFlightList').click(function (e) {
	    		e.preventDefault();
					GATAGM('detail_record_upload_btn_click', 'CONTENT');
	        uploadFlightList(true);
	    });
	
			$("#recordDataSet").hide();
	
	    g_component_upload_youtube_video = new UploadVideo();
	    g_component_upload_youtube_video.onUploadCompleteCallback = function (vid) {
	    	GATAGM('detail_youtube_upload_completed', 'CONTENT');
	
	    	$('#youtube_url_data').val("https://youtube.com/watch?v=" + vid);
	      setYoutubePlayerForDetaileViewPureID(vid);
				setYoutubeID();
				$("#videoRecordModifyArea").hide();
	    };
	
			g_component_upload_youtube_video.ready();
	    $('#uploadVideoToYoutubeButton').click(function (e) {
	    	e.preventDefault();
	    	g_component_upload_youtube_video.handleUploadClicked(videoFileForUploadFile);
	    });
	
	    let record_name = getQueryVariable("record_name");
	    let target_key = getQueryVariable("target_key");
	
	    $("#movieFile").bind('change', function() {
	    	GATAGM('detail_movie_file_select_btn_click', 'CONTENT');
				videoFileForUploadFile = this.files[0];
				previewForRecordFile(this.files[0])
			});
	
			$("#movieFile").click(function() {
				$(this).attr("value", "");
				$("#movieFile").val("");
			});
	
	    if (record_name != null && record_name != "") {
	    		let rname = decodeURIComponent(unescape(record_name));
	        showDataWithName(target, target_key, rname);
	
	        $('#flightRecDsecApplyBtn').click(function (e) {
	        		e.preventDefault();
	
			        GATAGM('detail_sec_aply_btn_click', 'CONTENT');
	
							let curVal = $('#goFlightRecItemIndex').val();
			        if (!isSet(curVal) || $.isNumeric(curVal) == false) {
			            showAlert(GET_STRING_CONTENT("msg_wrong_input"));
			            return;
			        }
	
			        curVal = parseFloat(curVal);
			        updateFlightRecordDsec(curVal);
	
			        showAlert(GET_STRING_CONTENT("msg_sync_adjusted") + " : " + curVal + GET_STRING_CONTENT("label_second"));
			    });
	
			    $('#flightRecDsecSaveBtn').click(function (e) {
			    		e.preventDefault();
			    		GATAGM('detail_sec_save_btn_click', 'CONTENT');
			        updateFlightRecordDetail(rname);
			    });
	    }
	}	
});


//# sourceURL=record_detail.js