

	'use strict';

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



	var contentWayPoint = function() {
		var i = 0;

		// $('.gtco-section').waypoint( function( direction ) {


			$('.animate-box').waypoint( function( direction ) {

				if( direction === 'down' && !$(this.element).hasClass('animated-fast') ) {

					i++;

					$(this.element).addClass('item-animate');
					setTimeout(function(){

						$('body .animate-box.item-animate').each(function(k){
							var el = $(this);
							setTimeout( function () {
								var effect = el.data('animate-effect');
								if ( effect === 'fadeIn') {
									el.addClass('fadeIn animated-fast');
								} else if ( effect === 'fadeInLeft') {
									el.addClass('fadeInLeft animated-fast');
								} else if ( effect === 'fadeInRight') {
									el.addClass('fadeInRight animated-fast');
								} else {
									el.addClass('fadeInUp animated-fast');
								}

								el.removeClass('item-animate');
							},  k * 50, 'easeInOutExpo' );
						});

					}, 100);

				}

			} , { offset: '85%' } );
		// }, { offset: '90%'} );
	};



	var changeWayPoint = function() {
		var i = 0;

		// $('.gtco-section').waypoint( function( direction ) {


			$('.animate-change').waypoint( function( direction ) {

				if( direction === 'down' && !$(this.element).hasClass('animated-fast') ) {

					i++;

					$(this.element).addClass('item-animate');
					setTimeout(function(){

						$('body .animate-change.item-animate').each(function(k){
							var el = $(this);
							setTimeout( function () {
								el.addClass('changed animated-fast');
								el.removeClass('item-animate');
							},  k * 100, 'easeInOutExpo' );
						});

					}, 100);

				}

			} , { offset: '85%' } );
		// }, { offset: '90%'} );
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




	var tableCount = 0;	
	var duni_logo = '/duni_logo.png';

	function isSet(value) {
			if ( typeof(value) === 'number' )
          return true;
	    if (value == "" || value == null || value == "undefined" || value == undefined)
	        return false;
	    return true;
	}

	function GATAGM(label, category, language) {
	  gtag(
	      'event', label + "_" + language, {
	        'event_category' : category,
	        'event_label' : label
	      }
	    );

	  mixpanel.track(
	    label + "_" + language,
	    {"event_category": category, "event_label": label}
	  );
	}	

	function createNewIconFor2DMap(i, item) {
		var pos_icon = new ol.Feature({
	          geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
	          name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
	          mindex : i,
						maddress : item.address,
						mhasYoutube : item.hasYoutube,
						mname : item.name
	      });

	  return pos_icon;
	}

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
	    source: new ol.source.OSM({
	        // We need a key to get the layer from the provider.
	        // Sign in with Bing Maps and you will get your key (for free)
	        key: 'AgMfldbj_9tx3cd298eKeRqusvvGxw1EWq6eOgaVbDsoi7Uj9kvdkuuid-bbb6CK',
	        imagerySet: 'AerialWithLabels', // or 'Road', 'AerialWithLabels', etc.
	        // use maxZoom 19 to see stretched tiles instead of the Bing Maps
	        // "no photos at this zoom level" tiles
	        maxZoom: 19
	    })
		});

	  var vMap = new ol.Map({
	      target: 'map_' + index,
	      layers: [
	          bingLayer, vVectorLayer
	          //vVectorLayer
	      ],
	      // Improve user experience by loading tiles while animating. Will make
	      // animations stutter on mobile or slow devices.
	      loadTilesWhileAnimating: true,
	      view: c_view
	    });

	  var icon = createNewIconFor2DMap(index, {lat:flat, lng:flng, alt:0, name: "", address: address, hasYoutube : hasYoutube});
	  vSource.addFeature(icon);

	  return vSource;
	}

	function setAddressAndCada(address_id, address, cada, wsource) {
		var _features = [];
		var _addressText = "";

	  for(var idx=0; idx< cada.length; idx++) {
	    try{
	      var geojson_Feature = cada[idx];
	      var geojsonObject = geojson_Feature.geometry;

	      var features =  (new ol.format.GeoJSON()).readFeatures(geojsonObject);
	      for(var i=0; i< features.length; i++) {
	        try{
	          var feature = features[i];
	          feature["id_"] = geojson_Feature.id;
	          feature["properties"] = {};
	          for (var key in geojson_Feature.properties) {
	            try{
	              var value = geojson_Feature.properties[key];

	              if (_addressText == "" && key == "addr") {
	              	_addressText = value;
	              }

	              feature.values_[key] = value;
	              feature.properties[key] = value;
	            }catch (e){
	            }
	          }
	          _features.push(feature)
	        }catch (e){
	        }
	      }
	    }catch (e){
	    }
	  }


	  wsource.addFeatures(_features);

	  if (isSet($(address_id)))
	  	$(address_id).text(address);
	}

	var flightHistorySource;
	var flightCompanySource;
	var flightHistoryView;

	var vVectorLayerForCompany;
	var vVectorLayerForHistory;

	var flightRecArray = [];
	
	var flightRecFullArray = [];
	var companyArray = [];
	

	var container = document.getElementById('popup');
	var content = document.getElementById('popup-content');
	var closer = document.getElementById('popup-closer');

	$("#chkFlightHistory").change(function(){
		showHistoryList($("#chkFlightHistory").is(":checked"));
  });

  $("#chkCompany").change(function(){
		showCompanyList($("#chkCompany").is(":checked"));
  });

	function showCompanyList(bshow) {
		vVectorLayerForCompany.setVisible(bshow);
	}

	function showHistoryList(bshow) {
		vVectorLayerForHistory.setVisible(bshow);
	}


	function flightHistoryMapInit() {
		var dpoint = ol.proj.fromLonLat([0, 0]);

		container.style.visibility = "visible"; 
		var overlay = new ol.Overlay({
		  element: container,
		  autoPan: true,
		  autoPanAnimation: {
		    duration: 250,
		  },
		});

		closer.onclick = function () {
		  overlay.setPosition(undefined);
		  closer.blur();
		  return false;
		};

	  flightHistoryView = new ol.View({
	      center: dpoint,
	      zoom: 7
	    });

	  flightCompanySource = new ol.source.Vector();
		var clusterCompanySource = new ol.source.Cluster({
			  distance: 40,
			  source: flightCompanySource,
			  geometryFunction: function(feature) {
	        var geom = feature.getGeometry();
	    		return geom.getType() == 'Point' ? geom : null;
	    	},
			});

		var styleCacheForCompany = {};
	  vVectorLayerForCompany = new ol.layer.Vector({
	      source: clusterCompanySource,
	      zIndex: 99,
	      style:  function (feature) {
	        	if (!feature) return;

				    var size = feature.get('features').length;
				    var radius;
				    size == 1 ? radius = 8 : radius = 10 + (size * 0.1);
				    var style = styleCacheForCompany[size];
				    if (!style) {
				    		style = [new ol.style.Style({
	                image: new ol.style.Circle({
				            radius: radius,
				            fill: new ol.style.Fill({ color: '#779977dd' }),
				            stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
									})
	              })];

								if (size > 1) {
									style[0].setText(new ol.style.Text({
					                  text: size.toString(),
					                  fill: new ol.style.Fill({ color: '#fff' }),
					                  scale: 1.5
									}));
								}

	          		styleCacheForCompany[size] = style
				    }
				    return style;
				  },
	    });

	  flightHistorySource = new ol.source.Vector();
	  var clusterSource = new ol.source.Cluster({
			  distance: 40,
			  source: flightHistorySource,
			  geometryFunction: function(feature) {
	        var geom = feature.getGeometry();
	    		return geom.getType() == 'Point' ? geom : null;
	    	},
			});

		var styleCache = {};
	  vVectorLayerForHistory = new ol.layer.Vector({
	      source: clusterSource,
	      zIndex: 100,
	      style:  function (feature) {
	        	if (!feature) return;

				    var size = feature.get('features').length;
				    var radius;
				    size == 1 ? radius = 8 : radius = 10 + (size * 0.1);
				    var style = styleCache[size];
				    if (!style) {
				       	style = [new ol.style.Style({
		                image: new ol.style.Circle({
						            radius: radius,
						            fill: new ol.style.Fill({ color: '#964383dd' }),
						            stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
	                		})
	              })];

								if (size > 1) {
									style[0].setText(new ol.style.Text({
					                  text: size.toString(),
					                  fill: new ol.style.Fill({ color: '#fff' }),
					                  scale: 1.5
									}));
								}

	          		styleCache[size] = style
				    }
				    return style;
				  },
	    });

	  var bingLayer = new ol.layer.Tile({
	    visible: true,
	    preload: Infinity,
        source: new ol.source.OSM()
		});
		
		var overviewMapControl = new ol.control.OverviewMap({
		  layers: [
		    new ol.layer.Tile({
		      source: new ol.source.OSM(),
		    }) ],
		  collapsed : false
		});

	  var vMap = new ol.Map({
	  		controls: ol.control.defaults().extend([
            overviewMapControl
        ]),
	      target: 'historyMap',
	      layers: [
	          bingLayer, vVectorLayerForHistory, vVectorLayerForCompany
	      ],
				overlays: [overlay],
	      // Improve user experience by loading tiles while animating. Will make
	      // animations stutter on mobile or slow devices.
	      loadTilesWhileAnimating: true,
	      view: flightHistoryView
	    });

	  vMap.on('click', function(evt) {
	        	var feature = vMap.forEachFeatureAtPixel(evt.pixel, function (feature) { return feature; });
	        	processMapClick(vMap, evt, feature, overlay);
			});

	}

	function createNewCompanyIconFor2DMap(i, item) {
		var pos_icon = new ol.Feature({
	          geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
	          cname: item.name,
	          cindex : item.cid
	      });
	  
	  return pos_icon;
	}

	function getCompanyList() {
		flightCompanySource.clear();

	  var jdata = {"action": "public_company_list"};

		showLoader();
  	ajaxRequest(jdata, function (r) {
	    hideLoader();
	    if(r.result == "success") {
	      if (r.data == null || r.data.length == 0) {
					hideLoader();
	        return;
	      }

	      companyArray = r.data;

	      companyArray.forEach(function(item, index, arr) {
	      	var icon = createNewCompanyIconFor2DMap(index, item);
					flightCompanySource.addFeature(icon);
	  		});

				hideLoader();
	    }
	    else {
				hideLoader();
	    }
	  }, function(request,status,error) {
	    hideLoader();
	  });
	}

	function getCompanyInfo(title, cid) {
	  var jdata = {"action": "public_company_detail", "cid" : cid};

		content.innerHTML = title + '<p><img src="/images/loader.gif" border="0" width="20px" height="20px"></p>';

  	ajaxRequest(jdata, function (r) {
	    if(r.result == "success") {
	      if (r.data == null) {
	      	content.innerHTML = title + "<p>Failed to get more info.</p>";
	        return;
	      }

	     	if (r.data.is_playground == true) {
	     			title = "<드론비행/체험장> " + title;
	     	}

	      if (r.data.partner == true) {
	      		title = "<b>" + title + "</b>" + "<table border=0 cellpadding=0 cellspacing=2><tr><td width=52><img src='" + duni_logo + "' border='0' width='50' height='14'></td><td><b>Official Partner Company</b></td></tr></table>";
	      }
	      else {
	      		title = "<b>" + title + "</b>";
	      }

	      title = title + ('<p>' + r.data.address + '</p>' + '<p>' + r.data.phone_num_1);

	      if (isSet(r.data.phone_num_2) && r.data.phone_num_2 != "-")
	      	title = title + ('<br>' + r.data.phone_num_2);

	      title = title + '</p>';
	      title = title + "<table border=0 cellpadding=0 cellspacing=2 width=99% align=center><tr>";

	      if (r.data.spe_edu == true) {
	      		title = title + "<td align=left><i class='ti-id-badge'></i> <b>전문교육기관</b></td>";
				}

	      if (isSet(r.data.homeaddress) && r.data.homeaddress != "-") {
	      		title = title + "<td width=50% align=right><a href='" + r.data.homeaddress + "' target=_new onClick='GATAGM(\"index_page_vMap_cindex_home_click_" + cid + "\", \"CONTENT\", langset);'>홈페이지</a></td>";
	      }

	      title = title + "</tr></table>";

	      content.innerHTML = title;
	    }
	  },
	  	function(request,status,error) {
	  		content.innerHTML = title + "<p>Failed to get more info.</p>";
	  });
	}

	function processMapClick(map, evt, feature, overlay) {
		if (!isCluster(feature)) {
			map.getView().animate({
			  zoom: map.getView().getZoom() + 1,
			  duration: 250
			})
			return;
		}

  	var features = feature.get('features');
  	var count = features.length;
		if (count <= 0 || count >= 2) {
			map.getView().animate({
			  zoom: map.getView().getZoom() + 1,
			  duration: 250
			})
			return;
		}

    var ii = features[0].get('mindex');
    if (!isSet(ii)) {
    	ii = features[0].get('cindex');
    	if (!isSet(ii)) return;

    	GATAGM("index_page_vMap_cindex_" + ii, "CONTENT", langset);

    	var title = features[0].get('cname');
			var coordinate = evt.coordinate;

			if (count > 1)
				title = '<p>' + title + ' (+' + (count - 1) + ')</p>';
			else
				title = '<p>' + title + '</p>';

		  overlay.setPosition(coordinate);
    	getCompanyInfo(title, ii);
    	return;
    }

    GATAGM("index_page_vMap_" + ii, "CONTENT", langset);

    var hasYoutube = features[0].get('mhasYoutube');
  		
		if (hasYoutube) {
			var name = features[0].get('mname');
			getFlightRecordInfo(name);
		}
	}
	
	function getFlightRecordInfo(name) {
			var jdata = {"action": "public_record_detail", "name" : name};

			showLoader();
	
	  	ajaxRequest(jdata, function (r) {
		    if(r.result == "success") {
		    	hideLoader();
		    	
		      if (r.data == null) {
		      	showAlert(LANG_JSON_DATA[langset]['msg_no_data']);	
		        return;
		      }
		      
			  	var vid = getYoutubeQueryVariable(r.data.youtube_data_id);			
					$("#video-pop-view").attr("video-lang", langset);
					$("#video-pop-view").attr("video-name", name);
					$("#video-pop-view").attr("video-url", "https://www.youtube.com/watch?v=" + vid);
					$("#video-pop-view").videoPopup();
					$("#video-pop-view").click();
		    }
		  },
		  	function(request,status,error) {
		  		showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
		  		hideLoader();
		  });
		
			
	}

	function isCluster(feature) {
	  if (!feature || !feature.get('features')) {
	  	return false;
	  }

	  return feature.get('features').length >= 1;
	}

	function moveFlightHistoryMap(lat, lng) {
		var npos = ol.proj.fromLonLat([lng, lat]);
		flightHistoryView.setCenter(npos);
	}

	function getYoutubeQueryVariable(query) {
    var varfirst = query.split('?');
    var vars = varfirst[1].split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == "v") {
            return decodeURIComponent(pair[1]);
        }
    }

    return "";
	}

	var players = [];
	function setEmptyVideo(index) {
		//$("#youTubePlayer_" + index).show();
		//$("#youTubePlayerIframe_" + index).attr('src', "https://youtube.com/embed/q2PzFbh6HBE");
		players[index] = new YT.Player("youTubePlayer_" + index, {
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

	function setYoutubeVideo(index, youtube_url) {
		var vid = getYoutubeQueryVariable(youtube_url);

		players[index] = new YT.Player("youTubePlayer_" + index, {
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
		for ( var i = 0 ; i < players.length ; i ++ ) { //
				if(typeof players[i].getPlayerState === 'undefined') continue;
        var state = players[i].getPlayerState(); 
 
        // 초기 화면에서 재생 된 경우
        if ( state === YT.PlayerState.PLAYING && playingIndex === null ) { 
        	playingIndex = i;  
        	// 다른 플레이어가 재생 중에 그 선수 이외가 재생 된 경우
        } else if ( ( state === YT.PlayerState.BUFFERING || state === YT.PlayerState.PLAYING ) && playingIndex !== i ) { 
        	stopIndex = playingIndex;
          playIndex = i;
        } 
    }    
            
    // 재생 중이던 플레이어를 일시 중지
    if ( stopIndex !== null ) { players[stopIndex].pauseVideo();
    	stopIndex = null;
    }  
        
		if ( playIndex !== null ) { playingIndex = playIndex ;
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
	  
	  var flat = (isSet(item.flat) && item.flat != "" ? item.flat * 1 : -999);
		var flng = (isSet(item.flng) && item.flng != "" ? item.flng * 1 : -999);	  

	  if (flat != -999) {
	  	appendRow = appendRow + "<div class='col-md-4'><div id='map_" + curIndex + "' style='height:200px;width:100%;'></div>";
	  	appendRow = appendRow + "</div><div class='col-md-4'>";//row
	  }
	  else {
	  	appendRow = appendRow + "<div class='col-md-8'>";//row
	  }

	  appendRow = appendRow + "<div id='youTubePlayer_" + curIndex + "'></div>";//row
	  appendRow = appendRow + "</div><div class='col-md-4'>";//row
		appendRow = appendRow
						+ "<a onclick='GATAGM(\"flight_list_public_title_click_"
						+ name + "\", \"CONTENT\", \""
						+ langset + "\");' href='/center/main.html?page_action=publicrecordlist_detail&record_name="
						+ encodeURIComponent(name) + "'>" + name + "</a><hr size=1 color=#eeeeee>";

	  if (flat != -999) {
	  		appendRow = appendRow + "<small><span class='text-xs' id='map_address_" + curIndex + "'></span></small>";
	  }
	  
	  if (isSet(tag_values) && tag_values != "") {
	  	appendRow = appendRow + "<br><br>";    	
    	var tag_array = JSON.parse(tag_values);
    	tag_array.forEach(function(tg) {
    		appendRow = appendRow + "<a href=/center/main.html?page_action=publicrecordlist&keyword=" + encodeURIComponent(tg.value) + "><span class='badge badge-light'>" + tg.value + "</span></a> ";
    	});
    }

	  appendRow = appendRow + "<br><small>" + dtimestamp + "</small>";

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
	  	setYoutubeVideo(curIndex, youtube_url);
	  }
	  else {
	  	setEmptyVideo(curIndex);
	  }

	  if (tableCount == 0 && flat != -999) {
      moveFlightHistoryMap(flat, flng);
    }

	  tableCount++;
	}
	
	
	function setFlightlistFullHistory() {
		flightRecFullArray.forEach(function(item, index, arra) {
	    var icon = createNewIconFor2DMap(index, {lat:item.flat, lng:item.flng, name: item.name, alt:0, address: item.address, hasYoutube : (isSet(item.youtube_data_id) == true ? true : false) });
	    if (isSet(flightHistorySource)) {
	        flightHistorySource.addFeature(icon);
	    }
	  });
	}

	function setFlightlistHistory() {
	  flightRecArray.forEach(function(item) {
	    appendFlightListTable(item);
	  });
	}

	function ajaxRequest(data, callback, errorcallback) {
    $.ajax({url : "https://api.duni.io/v1/",
           dataType : "json",
           crossDomain: true,
           cache : false,
           data : JSON.stringify(data),
           type : "POST",
           contentType: "application/json; charset=utf-8",
           success : function(r) {
             callback(r);
           },
           error:function(request,status,error){
               monitor("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
               errorcallback(request,status,error);
           }
    });
	}
	
	function getFlightList() {
	  var jdata = {"action": "public_record_list", "list" : true};

	  showLoader();
	  ajaxRequest(jdata, function (r) {
	    hideLoader();
	    if(r.result == "success") {
	      if (r.data == null || r.data.length == 0) {
	        showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
					hideLoader();
	        return;
	      }

				flightRecFullArray = r.data;
	      setFlightlistFullHistory();
				hideLoader();
	    }
	    else {
	    	if (r.reason == "no data") {
	    		showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
	    	}
	    	else {
		    	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
		    }

				hideLoader();
	    }
	  }, function(request,status,error) {
	    hideLoader();
	  });
	}

	function getFlightSomeList() {
	  var jdata = {"action": "public_record_list"};

	  showLoader();
	  ajaxRequest(jdata, function (r) {
	    hideLoader();
	    if(r.result == "success") {
	      if (r.data == null || r.data.length == 0) {
	        showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
					hideLoader();
	        return;
	      }

				flightRecArray = r.data;
	      setFlightlistHistory();
				hideLoader();
	    }
	    else {
	    	if (r.reason == "no data") {
	    		showAlert(LANG_JSON_DATA[langset]['msg_no_data']);
	    	}
	    	else {
		    	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
		    }

				hideLoader();
	    }
	  }, function(request,status,error) {
	    hideLoader();
	  });
	}	

	function initYoutubeAPI() {
		var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}

	function onYouTubeIframeAPIReady() {
	  	getFlightSomeList();
			getFlightList();
  }

$(function(){
	mobileMenuOutsideClick();
	offcanvasMenu();
	burgerMenu();
	contentWayPoint();
	dropdown();
	owlCarousel();
	tabs();
	goToTop();
	loaderPage();
	flightHistoryMapInit();
	getCompanyList();
	initYoutubeAPI();
});
