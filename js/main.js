/* Copyright 2021 APLY Inc. All rights reserved. */

'use strict';

var mobileMenuOutsideClick = function () {

	$(document).click(function (e) {
		var container = $("#gtco-offcanvas, .js-gtco-nav-toggle");
		if (!container.is(e.target) && container.has(e.target).length === 0) {
			$('.js-gtco-nav-toggle').addClass('');

			if ($('body').hasClass('offcanvas')) {

				$('body').removeClass('offcanvas');
				$('.js-gtco-nav-toggle').removeClass('active');

			}
		}
	});

};


var offcanvasMenu = function () {

	$('#page').prepend('<div id="gtco-offcanvas" />');
	$('#page').prepend('<a href="#" class="js-gtco-nav-toggle gtco-nav-toggle "><i></i></a>');
	var clone1 = $('.menu-1 > ul').clone();
	$('#gtco-offcanvas').append(clone1);
	var clone2 = $('.menu-2 > ul').clone();
	$('#gtco-offcanvas').append(clone2);

	$('#gtco-offcanvas .has-dropdown').addClass('offcanvas-has-dropdown');
	$('#gtco-offcanvas')
		.find('li')
		.removeClass('has-dropdown');

	// Hover dropdown menu on mobile
	$('.offcanvas-has-dropdown').mouseenter(function () {
		var $this = $(this);

		$this
			.addClass('active')
			.find('ul')
			.slideDown(500, 'easeOutExpo');
	}).mouseleave(function () {

		var $this = $(this);
		$this
			.removeClass('active')
			.find('ul')
			.slideUp(500, 'easeOutExpo');
	});


	$(window).resize(function () {

		if ($('body').hasClass('offcanvas')) {

			$('body').removeClass('offcanvas');
			$('.js-gtco-nav-toggle').removeClass('active');

		}
	});
};


var burgerMenu = function () {

	$('body').on('click', '.js-gtco-nav-toggle', function (event) {
		var $this = $(this);


		if ($('body').hasClass('overflow offcanvas')) {
			$('body').removeClass('overflow offcanvas');
		} else {
			$('body').addClass('overflow offcanvas');
		}
		$this.toggleClass('active');
		event.preventDefault();
	});
};

var dropdown = function () {

	$('.has-dropdown').mouseenter(function () {

		var $this = $(this);
		$this
			.find('.dropdown')
			.css('display', 'block')
			.addClass('animated-fast fadeInUpMenu');

	}).mouseleave(function () {
		var $this = $(this);

		$this
			.find('.dropdown')
			.css('display', 'none')
			.removeClass('animated-fast fadeInUpMenu');
	});

};


var owlCarousel = function () {

	var owl = $('.owl-carousel-carousel');
	owl.owlCarousel({
		items: 3,
		loop: true,
		margin: 40,
		nav: true,
		dots: true,
		navText: [
			"<i class='ti-arrow-left owl-direction'></i>",
			"<i class='ti-arrow-right owl-direction'></i>"
		],
		responsive: {
			0: {
				items: 1
			},
			600: {
				items: 2
			},
			1000: {
				items: 3
			}
		}
	});


	var owl = $('.owl-carousel-fullwidth');
	owl.owlCarousel({
		items: 1,
		loop: true,
		margin: 20,
		nav: true,
		dots: true,
		smartSpeed: 800,
		autoHeight: true,
		navText: [
			"<i class='ti-arrow-left owl-direction'></i>",
			"<i class='ti-arrow-right owl-direction'></i>"
		]
	});




};

var tabs = function () {

	// Auto adjust height
	$('.gtco-tab-content-wrap').css('height', 0);
	var autoHeight = function () {

		setTimeout(function () {

			var tabContentWrap = $('.gtco-tab-content-wrap'),
				tabHeight = $('.gtco-tab-nav').outerHeight(),
				formActiveHeight = $('.tab-content.active').outerHeight(),
				totalHeight = parseInt(tabHeight + formActiveHeight + 90);

			tabContentWrap.css('height', totalHeight);

			$(window).resize(function () {
				var tabContentWrap = $('.gtco-tab-content-wrap'),
					tabHeight = $('.gtco-tab-nav').outerHeight(),
					formActiveHeight = $('.tab-content.active').outerHeight(),
					totalHeight = parseInt(tabHeight + formActiveHeight + 90);

				tabContentWrap.css('height', totalHeight);
			});

		}, 100);

	};

	autoHeight();


	// Click tab menu
	$('.gtco-tab-nav a').on('click', function (event) {

		var $this = $(this),
			tab = $this.data('tab');

		$('.tab-content')
			.addClass('animated-fast fadeOutDown');

		$('.tab-content')
			.removeClass('active');

		$('.gtco-tab-nav li').removeClass('active');

		$this
			.closest('li')
			.addClass('active')

		$this
			.closest('.gtco-tabs')
			.find('.tab-content[data-tab-content="' + tab + '"]')
			.removeClass('animated-fast fadeOutDown')
			.addClass('animated-fast active fadeIn');


		autoHeight();
		event.preventDefault();

	});
};


var goToTop = function () {

	$('.js-gotop').on('click', function (event) {

		event.preventDefault();

		$('html, body').animate({
			scrollTop: $('html').offset().top
		}, 500, 'easeInOutExpo');

		return false;
	});

	$(window).scroll(function () {

		var $win = $(window);
		if ($win.scrollTop() > 200) {
			$('.js-top').addClass('active');
		} else {
			$('.js-top').removeClass('active');
		}

	});

};

// Loading page
var loaderPage = function () {
	$(".gtco-loader").fadeOut("slow");
};

var counter = function () {
	$('.js-counter').countTo({
		formatter: function (value, options) {
			return value.toFixed(options.decimals);
		},
	});
};

var counterWayPoint = function () {
	if ($('#gtco-counter').length > 0) {
		$('#gtco-counter').waypoint(function (direction) {

			if (direction === 'down' && !$(this.element).hasClass('animated')) {
				setTimeout(counter, 400);
				$(this.element).addClass('animated');
			}
		}, { offset: '90%' });
	}
};

var tableCount = 0;
var duni_logo = '/duni_logo.png';

function makeForFlightListMap(index, flat, flng, address, hasYoutube) {
	var dpoint = ol.proj.fromLonLat([flng, flat]);

	var c_view = new ol.View({
		center: dpoint,
		zoom: 10
	});

	var vSource = new ol.source.Vector();

	var vVectorLayer = new ol.layer.Vector({
		source: vSource,
		zIndex: 77,
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#ff0000',
				width: 2
			}),
			image: new ol.style.Circle({
				radius: 7,
				fill: new ol.style.Fill({ color: '#ff333377' }),
				stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
			})
		})
	});

	var bingLayer = new ol.layer.Tile({
		visible: true,
		preload: Infinity,
		source: new ol.source.OSM({})
	});

	var vMap = new ol.Map({
		target: 'map_' + index,
		layers: [
			bingLayer, vVectorLayer			
		],
		// Improve user experience by loading tiles while animating. Will make
		// animations stutter on mobile or slow devices.
		loadTilesWhileAnimating: true,
		view: c_view
	});

	var icon = createNewIconFor2DMap(index, { lat: flat, lng: flng, alt: 0, name: "", address: address, hasYoutube: hasYoutube });
	vSource.addFeature(icon);

	return vSource;
}


var flightRecArray = [];
var searchKeyword = "";

var players = [];
function setEmptyVideo(index, name) {
	//$("#youTubePlayer_" + index).show();
	//$("#youTubePlayerIframe_" + index).attr('src', "https://youtube.com/embed/q2PzFbh6HBE");
	players[index] = new YT.Player(name, {
		height: '200',
		width: '100%',
		videoId: "q2PzFbh6HBE",
		host: 'https://www.youtube.com',
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

function setYoutubeVideo(index, name, youtube_url) {
	var vid = getYoutubeQueryVariable(youtube_url);

	players[index] = new YT.Player(name, {
		height: '200',
		width: '100%',
		videoId: vid,
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerReady(event) {
	event.target.stopVideo();
}

var playingIndex = null;
var stopIndex = null;
var playIndex = null;

function onPlayerStateChange(event) {
	for (var i = 0; i < players.length; i++) { //
		if (typeof players[i].getPlayerState === 'undefined') continue;
		var state = players[i].getPlayerState();

		// 초기 화면에서 재생 된 경우
		if (state === YT.PlayerState.PLAYING && playingIndex === null) {
			playingIndex = i;
			// 다른 플레이어가 재생 중에 그 선수 이외가 재생 된 경우
		} else if ((state === YT.PlayerState.BUFFERING || state === YT.PlayerState.PLAYING) && playingIndex !== i) {
			stopIndex = playingIndex;
			playIndex = i;
		}
	}

	// 재생 중이던 플레이어를 일시 중지
	if (stopIndex !== null) {
		players[stopIndex].pauseVideo();
		stopIndex = null;
	}

	if (playIndex !== null) {
		playingIndex = playIndex;
		playIndex = null;
	}
}

function appendFlightListTable(item) {
	var name = item.name;
	var dtimestamp = item.dtime;
	var data = item.data;
	var address = item.address;
	var cada = item.cada;
	var youtube_url = item.youtube_data_id;
	var curIndex = tableCount;
	var tag_values = item.tag_values;
	var appendRow = "<div class='service' id='flight-list-" + curIndex + "' name='flight-list-" + curIndex + "'><div class='row'>";

	dtimestamp = makeDateTimeFormat(new Date(dtimestamp), true);

	var flat = (isSet(item.flat) && item.flat != "" ? item.flat * 1 : -999);
	var flng = (isSet(item.flng) && item.flng != "" ? item.flng * 1 : -999);

	if (flat != -999) {
		appendRow = appendRow + "<div class='col-md-4'><div id='map_" + curIndex + "' style='height:200px;width:100%;'></div>";
		appendRow = appendRow + "</div><div class='col-md-4'>";//row
	}
	else {
		appendRow = appendRow + "<div class='col-md-8'>";//row
	}

	appendRow = appendRow + "<div id='youTubePlayer_" + video_index + "'></div>";//row
	appendRow = appendRow + "</div><div class='col-md-4'>";//row
	appendRow = appendRow
		+ "<a onclick='GATAGM(\"index_flight_record_title_click\", \"CONTENT\", \"" + name + "\");' href='/center/main.html?page_action=publicrecordlist_detail&record_name="
		+ encodeURIComponent(name) + "'>" + name + "</a><hr size=1 color=#eeeeee>";

	if (flat != -999) {
		appendRow = appendRow + "<small><span class='text-xs' id='map_address_" + curIndex + "'></span></small>";
	}

	if (isSet(tag_values) && tag_values != "") {
		appendRow = appendRow + "<br><br>";
		var tag_array = JSON.parse(tag_values);
		tag_array.forEach(function (tg) {
			appendRow = appendRow + "<a href=/center/main.html?page_action=publicrecordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
		});
	}

	appendRow = appendRow + "<br><small>" + LANG_JSON_DATA[g_str_cur_lang]['registered_datetime_label'] + " " + dtimestamp + "</small>";

	appendRow = appendRow + "</div></div></div>"; //col, row, service,
	$('#dataTable-Flight_list').append(appendRow);

	var retSource = null;
	if (flat != -999) {
		retSource = makeForFlightListMap(curIndex, flat, flng, address, (isSet(youtube_url) ? true : false));
	}

	if (isSet(retSource) && isSet(address) && address != "") {
		setAddressAndCada("#map_address_" + curIndex, address, cada, retSource);
	}

	if (isSet(youtube_url)) {
		setYoutubeVideo(video_index, "youTubePlayer_" + video_index, youtube_url);
	}
	else {
		setEmptyVideo(video_index, "youTubePlayer_" + video_index);
	}

	if (tableCount == 0 && flat != -999) {
		moveFlightHistoryMap(flat, flng);
	}

	tableCount++;
	video_index++;
}


function setFlightlistHistory() {
	flightRecArray.forEach(function (item) {
		appendFlightListTable(item);
	});
}

function getFlightSomeList() {
	var jdata = { "action": "public_record_list" };

	showLoader();
	ajaxRequest(jdata, function (r) {
		hideLoader();
		if (r.result == "success") {
			if (r.data == null || r.data.length == 0) {
				showAlert(LANG_JSON_DATA[g_str_cur_lang]['msg_no_data']);
				hideLoader();
				return;
			}

			flightRecArray = r.data;
			setFlightlistHistory();
			hideLoader();
		}
		else {
			if (r.reason == "no data") {
				showAlert(LANG_JSON_DATA[g_str_cur_lang]['msg_no_data']);
			}
			else {
				showAlert(LANG_JSON_DATA[g_str_cur_lang]['msg_error_sorry']);
			}

			hideLoader();
		}
	}, function (request, status, error) {
		hideLoader();
	});
}

var hasMore = "";
var flightSearhArray;
var tableSearchCount = 0;
var video_index = 0;

function appendFlightSearchTable(item) {
	var name = item.name;
	var dtimestamp = item.dtime;
	var data = item.data;
	var address = item.address;
	var cada = item.cada;
	var youtube_url = item.youtube_data_id;
	var curIndex = tableSearchCount;
	var tag_values = item.tag_values;
	var appendRow = "<div class='service' id='flight-search-" + curIndex + "' name='flight-search-" + curIndex + "'><div class='row'>";

	dtimestamp = makeDateTimeFormat(new Date(dtimestamp), true);

	var flat = (isSet(item.flat) && item.flat != "" ? item.flat * 1 : -999);
	var flng = (isSet(item.flng) && item.flng != "" ? item.flng * 1 : -999);

	var isOuter = isSet(item.outer) ? item.outer : false;

	if (flat != -999) {
		appendRow = appendRow + "<div class='col-md-4'><div id='map_" + curIndex + "' style='height:200px;width:100%;'></div>";
		appendRow = appendRow + "</div><div class='col-md-4'>";//row
	}
	else {
		appendRow = appendRow + "<div class='col-md-8'>";//row
	}

	appendRow = appendRow + "<div id='youTubePlayer_" + video_index + "'></div>";//row
	appendRow = appendRow + "</div><div class='col-md-4'>";//row


	if (isOuter == false) {
		appendRow = appendRow
			+ "<a onclick='GATAGM(\"index_search_flight_record_title_click_\", \"CONTENT\", \"" + name + "\");' href='/center/main.html?page_action=publicrecordlist_detail&record_name=" + encodeURIComponent(name) + "'>";
	}

	appendRow = appendRow + name;

	if (isOuter == false) {
		appendRow = appendRow + "</a>";
	}

	appendRow = appendRow + "<hr size=1 color=#eeeeee>";

	if (flat != -999) {
		appendRow = appendRow + "<small><span class='text-xs' id='map_address_" + curIndex + "'></span></small>";
	}

	if (isSet(tag_values) && tag_values != "") {
		appendRow = appendRow + "<br><br>";
		var tag_array = JSON.parse(tag_values);
		tag_array.forEach(function (tg) {
			appendRow = appendRow + "<a href=/center/main.html?page_action=publicrecordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
		});
	}

	appendRow = appendRow + "<br><small>" + LANG_JSON_DATA[g_str_cur_lang]['registered_datetime_label'] + " " + dtimestamp + "</small>";

	appendRow = appendRow + "</div></div></div>"; //col, row, service,
	$('#dataTable-Search_list').append(appendRow);

	var retSource = null;
	if (flat != -999) {
		retSource = makeForFlightListMap(curIndex, flat, flng, address, (isSet(youtube_url) ? true : false));
	}

	if (isSet(retSource) && isSet(address) && address != "") {
		setAddressAndCada("#map_address_" + curIndex, address, cada, retSource);
	}

	if (isSet(youtube_url)) {
		setYoutubeVideo(video_index, "youTubePlayer_" + video_index, youtube_url);
	}
	else {
		setEmptyVideo(video_index, "youTubePlayer_" + video_index);
	}

	tableSearchCount++;
	video_index++;
}

function setFlightSearchArray() {
	flightSearhArray.forEach(function (item) {
		appendFlightSearchTable(item);
	});
}

function getFlightSearchMore() {
	if ($("#searchKeyword").val() == "") return;

	var jdata = { "action": "public_findrecord_by_address", "keyword": $("#searchKeyword").val() };

	if (isSet(hasMore)) {
		jdata["morekey"] = hasMore;
	}

	showLoader();
	ajaxRequest(jdata, function (r) {
		if (r.result == "success") {
			if (r.data == null || r.data.length == 0) {
				showAlert(LANG_JSON_DATA[g_str_cur_lang]['msg_no_data']);
				hideLoader();
				return;
			}

			if (r.morekey) {
				hasMore = r.morekey;
				$('#btnForLoadSearchList').text(LANG_JSON_DATA[g_str_cur_lang]['msg_load_more']);
				$('#btnForLoadSearchList').show();
			}
			else {
				hasMore = null;
				$('#btnForLoadSearchList').hide(1500);
			}

			flightSearhArray = r.data;
			setFlightSearchArray();
			hideLoader();
		}
		else {
			if (r.reason == "no data") {
				showAlert(LANG_JSON_DATA[g_str_cur_lang]['msg_no_data']);
			}
			else {
				showAlert(LANG_JSON_DATA[g_str_cur_lang]['msg_error_sorry']);
			}

			hideLoader();
		}
	}, function (request, status, error) {
		hideLoader();
		monitor("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
	});
}

function requestSearch() {
	if ($("#searchKeyword").val() == "") return;

	if (searchKeyword == $("#searchKeyword").val()) return;

	searchKeyword = $("#searchKeyword").val();

	var jdata = { "action": "public_findrecord_by_address", "keyword": $("#searchKeyword").val() };

	showLoader();
	ajaxRequest(jdata, function (r) {
		hideLoader();
		if (r.result == "success") {
			if (r.data == null || r.data.length == 0) {
				showAlert(LANG_JSON_DATA[g_str_cur_lang]['msg_no_data']);
				hideLoader();

				$("#searchListView").hide();
				return;
			}


			$("#searchListView").show();

			if (r.morekey) {
				hasMore = r.morekey;
				$('#btnForLoadSearchList').text(LANG_JSON_DATA[g_str_cur_lang]['msg_load_more']);
				$('#btnForLoadSearchList').show();
			}
			else {
				hasMore = null;
				$('#btnForLoadSearchList').hide(1500);
			}

			tableSearchCount = 0;
			flightSearhArray = r.data;
			$('#dataTable-Search_list').empty();
			setFlightSearchArray();
			hideLoader();
		}
		else {
			$("#searchListView").hide();

			if (r.reason == "no data") {
				showAlert(LANG_JSON_DATA[g_str_cur_lang]['msg_no_data']);
			}
			else {
				showAlert(LANG_JSON_DATA[g_str_cur_lang]['msg_error_sorry']);
			}

			hideLoader();
		}
	}, function (request, status, error) {
		hideLoader();
	});
}


function initSearchForm() {
	$("#searchListView").hide();
	$("#searchKeyword").on("keyup paste", function () {
		if ($("#searchKeyword").val() == "") {
			$("#defaultListView").show();
			$("#searchListView").hide();
			searchKeyword = "";
		}
		else {
			$("#defaultListView").hide();
		}
	});

	$("#searchKeyword").keypress(function (e) {
		if (e.which == 13) {
			GATAGM('index_search_input_enter_key', 'CONTENT', $("#searchKeyword").val());
			requestSearch();  //
		}
	});

	$("#btnSearchMovie").click(function (e) {
		e.preventDefault();
		GATAGM('index_search_video_btn_click', 'CONTENT', $("#searchKeyword").val());
		requestSearch();  //
	});

	$('#btnForLoadSearchList').click(function (e) {
		e.preventDefault();
		GATAGM('index_search_load_more_btn_click', 'CONTENT');
		getFlightSearchMore();
	});
}

var curServiceListTimerId = -1;
function getDUNIServiceRequest(page) {
	var jdata = { "action": "public_duni_service_list_request" };

	showLoader();

	ajaxRequest(jdata, function (r) {
		if (r.result == "success") {
			hideLoader();

			if (r.data == null || r.data.length == 0) {
				$("#duni_service_request_list").html("No request");
				return;
			}

			$("#duni_service_request_list").empty();
			$("#duni_service_request_list").append("<table class='table' id='service_request_list_table'><thead><tr><th scope='col' class='text-center'>#</th><th scope='col' class='text-center'>" + GET_STRING_CONTENT('label_service') + "</th><th scope='col' class='text-center'>" + GET_STRING_CONTENT('label_location') + "</th><th scope='col' class='text-center'>" + GET_STRING_CONTENT('label_status') + "</th></tr></thead><tbody></tbody></table>");

			let retData = r.data;

			retData.forEach(function (d, index, arr) {

				let htmlString = "<tr><th scope='row' class='text-center'>" + (index + 1) + "</th><td class='text-center'>" + d.kind + "</td><td class='text-center'>" + d.title + "</td><td class='text-center'><div id='request_duni_" + index + "'>";

				if (d.status == "P") {
					if (d.requested == true) {
						htmlString += GET_STRING_CONTENT('msg_accepted');
						htmlString += ("(" + makeDateTimeFormat(new Date(d.requested_time), true) + ")");
					}
					else {
						htmlString += "<button class='btn btn-info btn-circle btn-sm' style='padding:5px 15px; margin-bottom:0;' type='button' id='partnerServiceRequest_" + index + "'>";
						htmlString += (GET_STRING_CONTENT('btnRequest') + "</button>");
					}
				}
				else if (d.status == "C") {
					htmlString += GET_STRING_CONTENT('msg_closed');
				}
				else if (d.status == "R") {
					htmlString += GET_STRING_CONTENT('msg_on_ready');
				}


				htmlString += "</div></td></tr>";
				$("#service_request_list_table").append(htmlString);

				$("#partnerServiceRequest_" + index).click(function () {
					location.href = "/center/main.html?page_action=center";
				});
			});

			$("#service_list_next").click(function () {
				location.href = "/center/main.html?page_action=center";
			});

			startRequestTableAnimation();
		}
	},
		function (request, status, error) {
			$("#duni_service_request_list").html("No request");
			hideLoader();
		});
}

function startRequestTableAnimation() {
	if (curServiceListTimerId >= 0)
		clearTimeout(curServiceListTimerId);

	$("#service_request_list_table tr").each(function (index) {
		$(this).css("visibility", "hidden");
	});

	$("#service_request_list_table tr").each(function (index) {
		//$(this).delay(index*500).show(1000);
		$(this).css({ "visibility": "visible", "opacity": 0.0 }).delay(index * 500).animate({ opacity: 1.0 }, 500);
	});

	curServiceListTimerId = setTimeout("startRequestTableAnimation()", 15000);
}

function initYoutubeAPI() {
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function animate(obj, initVal, lastVal, duration) {

	let startTime = null;
	let currentTime = Date.now();

	const step = function (currentTime) {
		if (!startTime) {
			startTime = currentTime;
		}

		const progress = Math.min((currentTime - startTime) / duration, 1);

		obj.innerHTML = Math.floor(progress * (lastVal - initVal) + initVal);

		if (progress < 1) {
			window.requestAnimationFrame(step);
		}
		else {
			window.cancelAnimationFrame(window.requestAnimationFrame(step));
		}
	};

	window.requestAnimationFrame(step);
}

function setCounterAni() {
	let once = true;
	$(window).scroll(function () {
		let oTop = $('#video_count').offset().top - window.innerHeight;
		if (once == true && $(window).scrollTop() > oTop) {
			let text1 = document.getElementById('company_count');
			let text2 = document.getElementById('video_count');

			let video_count = g_array_full_flight_rec.length;
			let compay_count = g_array_full_company_list.length;
			if (video_count == 0) video_count = 298;
			if (compay_count == 0) compay_count = 314;
			animate(text1, 0, compay_count, 5000);
			animate(text2, 0, video_count, 5000);

			once = false;
		}
	});
}


$(function () {
	g_str_current_target = "public";
	
	mobileMenuOutsideClick();
	offcanvasMenu();
	burgerMenu();
	dropdown();
	owlCarousel();
	tabs();
	goToTop();
	loaderPage();
	flightRecords2DMapInit();
	getDUNIServiceRequest(1);
	getCompanyList();
	getFullFlightRecords("public");
	initYoutubeAPI();
	
	getFlightSomeList();	
	initSearchForm();
	setCounterAni();

	$("#chkFlightHistory").change(function () {
		showFlightRecordsList($("#chkFlightHistory").is(":checked"));
	});

	$("#chkCompany").change(function () {
		showCompanyList($("#chkCompany").is(":checked"));
	});

	$('[data-youtube]').youtube_background();

	let check = getCookie("user_token");
	if (isSet(check) && check != "") {
		$("#main_login_area").hide();
		$("#main_center_area").show();

		$("#side_login_area").hide();
		$("#side_center_area").show();

		$("#logoutCenterBtn").click(function () {
			GATAGM('index_logout_btn_click', 'MENU');

			showAskDialog(
				GET_STRING_CONTENT('modal_title'),
				GET_STRING_CONTENT('msg_are_you_sure'),
				GET_STRING_CONTENT('top_menu_logout'),
				false,
				function () { setTimeout("logOut()", 100); },
				null
			);
		});

		$("#goCenterBtn1").click(function () {
			location.href = "/center/main.html?page_action=center";
		});

		$("#goCenterBtn2").click(function () {
			location.href = "/center/main.html?page_action=center";
		});
		return;
	}

	$("#main_login_area").show();
	$("#main_center_area").hide();

	$("#side_login_area").show();
	$("#side_center_area").hide();

	if ($('.cookie-banner').length && localStorage.getItem('cookieSeen') != 'shown') {
		$('.cookie-banner').delay(2000).fadeIn();
		localStorage.setItem('cookieSeen', 'shown');
	};

	if ($('#cookie-close').length) {
		$('#cookie-close').click(function () {
			$('.cookie-banner').fadeOut();
		});
	}	
});
