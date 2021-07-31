/* Copyright 2021 APLY Inc. All rights reserved. */

  "use strict";

	var mobileMenuOutsideClick = function() {

		$(document).click(function (e) {			
	    var container = $("#gtco-offcanvas, .js-gtco-nav-toggle");
	    if (!container.is(e.target) && container.has(e.target).length === 0) {
	    	$('.js-gtco-nav-toggle').addClass('');

	    	if ( $('body').hasClass('offcanvas') ) {

    			$('body').removeClass('offcanvas');
    			$('.js-gtco-nav-toggle').removeClass('active');

	    	}
	    }
		});

	};


	var offcanvasMenu = function() {

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
		$('.offcanvas-has-dropdown').mouseenter(function(){
			var $this = $(this);

			$this
				.addClass('active')
				.find('ul')
				.slideDown(500, 'easeOutExpo');
		}).mouseleave(function(){

			var $this = $(this);
			$this
				.removeClass('active')
				.find('ul')
				.slideUp(500, 'easeOutExpo');
		});


		$(window).resize(function(){

			if ( $('body').hasClass('offcanvas') ) {

    			$('body').removeClass('offcanvas');
    			$('.js-gtco-nav-toggle').removeClass('active');

	    	}
		});
	};


	var burgerMenu = function() {

		$('body').on('click', '.js-gtco-nav-toggle', function(event){
			var $this = $(this);


			if ( $('body').hasClass('overflow offcanvas') ) {
				$('body').removeClass('overflow offcanvas');
			} else {
				$('body').addClass('overflow offcanvas');
			}
			$this.toggleClass('active');
			event.preventDefault();

		});
	};
	
	var dropdown = function() {

		$('.has-dropdown').mouseenter(function(){

			var $this = $(this);
			$this
				.find('.dropdown')
				.css('display', 'block')
				.addClass('animated-fast fadeInUpMenu');

		}).mouseleave(function(){
			var $this = $(this);

			$this
				.find('.dropdown')
				.css('display', 'none')
				.removeClass('animated-fast fadeInUpMenu');
		});

	};


	var owlCarousel = function(){

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
	     	responsive:{
	        0:{
	            items:1
	        },
	        600:{
	            items:2
	        },
	        1000:{
	            items:3
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

	var tabs = function() {

		// Auto adjust height
		$('.gtco-tab-content-wrap').css('height', 0);
		var autoHeight = function() {

			setTimeout(function(){

				var tabContentWrap = $('.gtco-tab-content-wrap'),
					tabHeight = $('.gtco-tab-nav').outerHeight(),
					formActiveHeight = $('.tab-content.active').outerHeight(),
					totalHeight = parseInt(tabHeight + formActiveHeight + 90);

					tabContentWrap.css('height', totalHeight );

				$(window).resize(function(){
					var tabContentWrap = $('.gtco-tab-content-wrap'),
						tabHeight = $('.gtco-tab-nav').outerHeight(),
						formActiveHeight = $('.tab-content.active').outerHeight(),
						totalHeight = parseInt(tabHeight + formActiveHeight + 90);

						tabContentWrap.css('height', totalHeight );
				});

			}, 100);

		};

		autoHeight();


		// Click tab menu
		$('.gtco-tab-nav a').on('click', function(event){

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
					.find('.tab-content[data-tab-content="'+tab+'"]')
					.removeClass('animated-fast fadeOutDown')
					.addClass('animated-fast active fadeIn');


			autoHeight();
			event.preventDefault();

		});
	};


	var goToTop = function() {

		$('.js-gotop').on('click', function(event){

			event.preventDefault();

			$('html, body').animate({
				scrollTop: $('html').offset().top
			}, 500, 'easeInOutExpo');

			return false;
		});

		$(window).scroll(function(){

			var $win = $(window);
			if ($win.scrollTop() > 200) {
				$('.js-top').addClass('active');
			} else {
				$('.js-top').removeClass('active');
			}

		});

	};


	// Loading page
	var loaderPage = function() {
		$(".gtco-loader").fadeOut("slow");
	};

	var counter = function() {
		$('.js-counter').countTo({
			 formatter: function (value, options) {
	      return value.toFixed(options.decimals);
	    },
		});
	};

	var counterWayPoint = function() {
		if ($('#gtco-counter').length > 0 ) {
			$('#gtco-counter').waypoint( function( direction ) {

				if( direction === 'down' && !$(this.element).hasClass('animated') ) {
					setTimeout( counter , 400);
					$(this.element).addClass('animated');
				}
			} , { offset: '90%' } );
		}
	};
	
	function initContact() {
		g_str_page_action = "contact";
		
		$("#contact_data_send").click(function(e) {
			e.preventDefault();
			
			GATAGM('contact_submit_btn_click', 'CONTENT');
					
			var fd = checkContactUSData();		
			if (fd == null) return;
							
		  sendApplicationData(fd);
		});
	
		$('[name^=form_phone]').keypress(validateNumber);
		
		let check = getCookie("user_token");
  if (isSet(check) && check != "") {
  	$("#main_login_area").hide();	  	
  	$("#main_center_area").show();
  	
  	$("#side_login_area").hide();
  	$("#side_center_area").show();
  	
  	$("#logoutCenterBtn").click(function() {      
      GATAGM('util_logout_btn_click', 'MENU');

      showAskDialog(
          GET_STRING_CONTENT('modal_title'),
          GET_STRING_CONTENT('msg_are_you_sure'),
          GET_STRING_CONTENT('top_menu_logout'),
          false,
          function () { setTimeout("logOut()", 100); },
          null
      );
  	});
  	
  	$("#goCenterBtn1").click(function() {
  		location.href = "/center/main.html?page_action=center";
  	});  	
  	return;
  }
	}
			
	function sendApplicationData(fd)
	{		
		fd.append("form_kind", "문의");
		fd.append("ref", "https://pilot.duni.io");
		
		grecaptcha.ready(function() {
        grecaptcha.execute('6LfPn_UUAAAAAN-EHnm2kRY9dUT8aTvIcfrvxGy7', {action: 'action_name'}).then(function(token) {
					fd.append("form_token", token);
					sendAjaxData(fd);
				});
		});		
	}
	
	function sendAjaxData(fd) {
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
				if (data.result == "success") {								
					
					var from_page = getCookie("from_page");
					showAskDialog(
						        GET_STRING_CONTENT('modal_title'),
						        GET_STRING_CONTENT('msg_request_is_accepted'),
						        GET_STRING_CONTENT('modal_confirm_btn'),
						        false,
						        function () { 					        	
						        	setTimeout(function () { 
						        		location.href = window.location.origin;
						        	}, 800);
						        },
						        null					        
						    );
				}
				else {
					if (data == null || data.message == null) {
						showAlert(GET_STRING_CONTENT('msg_error_sorry'));
					}					
					else if (data.sendstatus == 9) {
						showAlert(data.message);
					}
					else showAlert(GET_STRING_CONTENT('msg_error_sorry') +  " (" + data.message + ")");
				}						
			},
			error: function(jqXHR, text, error){			
				showAlert(GET_STRING_CONTENT('msg_error_sorry'));
			}
		});
	}
	
	function checkContactUSData() {
		var fd = new FormData();
				
		if ($('#form_name').val() == "") {
			showAlert(GET_STRING_CONTENT('msg_input_name'));
			return null;
		}
		fd.append("form_name", $("#form_name").val());
		
		if ($("#form_phone").val() == "") {
			fd.append("form_phone", "-");			
		}
		else {
			fd.append("form_phone", $("#form_phone").val());
		}
		
		if ($("#form_email").val() == "") {
			showAlert(GET_STRING_CONTENT('msg_input_email'));
			return null;
		}
		fd.append("form_email", $("#form_email").val());
						
		if ($("#form_message").val() == "") {
			showAlert(GET_STRING_CONTENT('fill_message_label'));
			return null;
		}	
		fd.append("form_message", $("#form_message").val());		
		return fd;
	}
	
$(function(){
	mobileMenuOutsideClick();
	offcanvasMenu();
	burgerMenu();	
	dropdown();
	owlCarousel();
	tabs();
	goToTop();
	loaderPage();
	initContact();
});