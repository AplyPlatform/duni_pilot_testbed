

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





	var flightRecArray = [];
	var tableCount = 0;
	var pos_icon_image = './center/imgs/position4.png';
	function isSet(value) {
	  if (value == "" || value == null || value == "undefined") return false;

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

	function styleFunction(textMsg) {
	  return [
	    new ol.style.Style(
	    	{
		      image: new ol.style.Icon(({
		      	opacity: 0.77,
		        crossOrigin: 'anonymous',
		        scale: 1.5,
		        src: pos_icon_image
		      	}))
		      ,
		      text: new ol.style.Text({
		        font: '12px Calibri,sans-serif',
		        fill: new ol.style.Fill({ color: '#000' }),
		        stroke: new ol.style.Stroke({
		          color: '#fff', width: 2
		        }),
		        // get the text from the feature - `this` is ol.Feature
		        // and show only under certain resolution
		        text: textMsg
		      	})
	    	})
	  ];
	}

	function createNewIconFor2DMap(i, item) {
		var pos_icon = new ol.Feature({
	          geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
	          name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
	          mindex : i,
						maddress : item.address
	      });

	  pos_icon.setStyle(styleFunction((i + 1) + ""));

	  return pos_icon;
	}

	function makeForFlightListMap(index, flat, flng, address) {
		var dpoint = ol.proj.fromLonLat([flng, flat]);

	  var c_view = new ol.View({
	      center: dpoint,
	      zoom: 16
	    });

	  var vSource = new ol.source.Vector();

	  var vVectorLayer = new ol.layer.Vector({
	      source: vSource,
	      zIndex: 10000,
	      style: new ol.style.Style({
	            fill: new ol.style.Fill({
	              color: 'rgba(255, 255, 255, 0.2)'
	            }),
	            stroke: new ol.style.Stroke({
	              color: '#ff0000',
	              width: 2
	            }),
	            image: new ol.style.Circle({
	              radius: 7,
	              fill: new ol.style.Fill({
	                color: '#ff0000'
	              })
	            })
	          })
	    });

	    var bingLayer = new ol.layer.Tile({
		    visible: true,
		    preload: Infinity,
		    source: new ol.source.BingMaps({
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
		      ],
		      // Improve user experience by loading tiles while animating. Will make
		      // animations stutter on mobile or slow devices.
		      loadTilesWhileAnimating: true,
		      view: c_view
		    });

		  var icon = createNewIconFor2DMap(index, {lat:flat, lng:flng, alt:0, address: address});
		  vSource.addFeature(icon);

	    if (isSet(flightHistorySource)) {
	        flightHistorySource.addFeature(icon);
	    }

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
	
	var oldLat = 0 , oldLng = 0;	
	
	var container = document.getElementById('popup');
	var content = document.getElementById('popup-content');
	var closer = document.getElementById('popup-closer');

	function flightHistoryMapInit() {
		var dpoint = ol.proj.fromLonLat([0, 0]);

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
	      zoom: 4
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
	  var vVectorLayerForCompany = new ol.layer.Vector({
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
			            fill: new ol.style.Fill({ color: '#a08bd23e' }),
			            stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
	                }),
	                text: new ol.style.Text({
	                  text: size.toString(),
	                  fill: new ol.style.Fill({ color: '#fff' }),
	                  scale: 1.5,
	                })
	              })];

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
	  var vVectorLayer = new ol.layer.Vector({
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
			            fill: new ol.style.Fill({ color: '#a03e8bd2' }),
			            stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
	                }),
	                text: new ol.style.Text({
	                  text: size.toString(),
	                  fill: new ol.style.Fill({ color: '#fff' }),
	                  scale: 1.5,
	                })
	              })];

	          		styleCache[size] = style
				    }
				    return style;
				  },
	    });

	  var bingLayer = new ol.layer.Tile({
	    visible: true,
	    preload: Infinity,
	    source: new ol.source.BingMaps({
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
	      target: 'historyMap',
	      layers: [
	          bingLayer, vVectorLayer, vVectorLayerForCompany
	      ],
				overlays: [overlay],
	      // Improve user experience by loading tiles while animating. Will make
	      // animations stutter on mobile or slow devices.
	      loadTilesWhileAnimating: true,
	      view: flightHistoryView
	    });

	  vMap.on('click', function(evt) {
	        	var feature = vMap.forEachFeatureAtPixel(evt.pixel, function (feature) { return feature; });	        		        					    	        		        		        	
	        	processMapClick(evt, feature);
			});

		vMap.on('pointermove', function(evt) {
		        var feature = vMap.forEachFeatureAtPixel(evt.pixel, function (feature) { return feature; });
		        processMapOver(evt, feature, overlay);
				});
				
		vMap.on('moveend', function(evt) {						
						
						/*
								
						var extent = vMap.getView().calculateExtent(vMap.getSize());
  					var bottomLeft = ol.proj.toLonLat(ol.extent.getBottomLeft(extent));
  					var topRight = ol.proj.toLonLat(ol.extent.getTopRight(extent));
  					  					
  					if (Math.abs(bottomLeft[0] - topRight[0]) > 0.4) return;
  					if (Math.abs(bottomLeft[1] - topRight[1]) > 0.1) return;
  
  					*/
  					
  					var coord = flightHistoryView.getCenter();
  					var lonlat = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');				    
  					
  					if (Math.abs(oldLat - lonlat[1]) > 0.1 || Math.abs(oldLng - lonlat[0]) > 0.4) {
  							processMapMove(lonlat[0], lonlat[1]);
  							oldLng = lonlat[0];				    
  							oldLat = lonlat[1]; 
  					}  					  					 					
			});
	}
	
	function createNewCompanyIconFor2DMap(i, item) {
		var pos_icon = new ol.Feature({
	          geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
	          cname: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
	          cindex : (i + 1),
						caddress : item.address
	      });

	  pos_icon.setStyle(styleFunction((i + 1) + ""));
	  return pos_icon;
	}
	
	function processMapMove(curLon, curLat) {		
		flightCompanySource.clear();
						
	  var jdata = {"action": "public_company_list", "lat" : curLat, "lng" : curLon};

		showLoader();	  
  	ajaxRequest(jdata, function (r) {
	    hideLoader();
	    if(r.result == "success") {
	      if (r.data == null || r.data.length == 0) {	        
					hideLoader();
	        return;
	      }	      
	      
	      r.data.forEach(function(item, index, arr) {	    
	      	var icon = createNewCompanyIconFor2DMap(index, {lat:item.lat, lng:item.lng, alt:0, address: item.address});		
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
	
	function processMapOver(evt, feature, overlay) {
		if (!isCluster(feature)) return;
				
  	var features = feature.get('features');
  	
    for(var i = 0; i < features.length; i++) {
      var ii = features[i].get('mindex');
      if (!isSet(ii)) {
      	ii = features[i].get('cindex');      	
      	if (!isSet(ii)) return;
      	
      	var title = features[i].get('caddress');
				var coordinate = evt.coordinate;
			  content.innerHTML = '<p>' + title + '</p>';
			  overlay.setPosition(coordinate);
      	GATAGM("index_page_vMap_pointmove_cindex_" + ii, "CONTENT", langset);
      	return;
      }
      
			var title = features[i].get('maddress');
			var coordinate = evt.coordinate;
		  content.innerHTML = '<p>' + title + '</p>';
		  overlay.setPosition(coordinate);
			GATAGM("index_page_vMap_pointmove_" + ii, "CONTENT", langset);
    	return;
    }    
	}

	function processMapClick(evt, feature) {
		if (!isCluster(feature)) return;
		
  	var features = feature.get('features');
  	
    for(var i = 0; i < features.length; i++) {
      var ii = features[i].get('mindex');
      if (!isSet(ii)) {      	
      	ii = features[i].get('cindex');      	
      	if (!isSet(ii)) return;
      	
      	GATAGM("index_page_vMap_cindex_" + ii, "CONTENT", langset);    		
      	return;
      }

      GATAGM("index_page_vMap_" + ii, "CONTENT", langset);
    	var scrollTarget = "flight-list-" + ii;
    	location.href = "#" + scrollTarget;
    	return;
    }
	}

	function isCluster(feature) {
	  if (!feature || !feature.get('features')) {
	  	return false;
	  }

	  return feature.get('features').length >= 1;
	}

	function moveFlightHistoryMap(lat, lng) {
		var npos = ol.proj.fromLonLat([lng * 1, lat * 1]);
		flightHistoryView.setCenter(npos);
	}

	function getQueryVariable(query, variable) {
    var varfirst = query.split('?');
    var vars = varfirst[1].split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
	}

	var player = [];
	function setEmptyVideo(index) {
		//$("#youTubePlayer_" + index).show();
		//$("#youTubePlayerIframe_" + index).attr('src', "https://youtube.com/embed/q2PzFbh6HBE");
		player[index] = new YT.Player("youTubePlayer_" + index, {
      height: '200',
      width: '100%',
      videoId: "q2PzFbh6HBE",
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
	}

	function setYoutubeVideo(index, youtube_url) {
		var vid = getQueryVariable(youtube_url, "v");
		//$("#youTubePlayer_" + index).show();
		//$("#youTubePlayerIframe_" + index).attr('src', "https://youtube.com/embed/" + vid);

		player[index] = new YT.Player("youTubePlayer_" + index, {
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

  function onPlayerStateChange(event) {

  }

	function appendFlightListTable(item) {
		var name = item.name;
		var dtimestamp = item.dtime;
		var data = item.data;
		var flat = item.flat;
		var flng = item.flng;
		var address = item.address;
		var cada = item.cada;
		var youtube_url = item.youtube_data_id;

	  var appendRow = "<div class='service' id='flight-list-" + tableCount + "' name='flight-list-" + tableCount + "'><div class='row'>";

	  if (isSet(flat)) {
	  	appendRow = appendRow + "<div class='col-md-4'><div id='map_" + tableCount + "' style='height:200px;width:100%;'></div>";
	  	appendRow = appendRow + "</div><div class='col-md-4'>";//row
	  }
	  else {
	  	appendRow = appendRow + "<div class='col-md-8'>";//row
	  }

	  //appendRow = appendRow + "<div id='youTubePlayer_" + tableCount + "'><iframe id='youTubePlayerIframe_" + tableCount + "' width='100%' height='200' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe></div>";//row
	  appendRow = appendRow + "<div id='youTubePlayer_" + tableCount + "'></div>";//row

	  appendRow = appendRow + "</div><div class='col-md-4'>";//row
		appendRow = appendRow
						+ "<a onclick='GATAGM(\"flight_list_public_title_click_"
						+ name + "\", \"CONTENT\", \""
						+ langset + "\");' href='/center/main.html?page_action=publicflightview_detail&record_name="
						+ encodeURIComponent(name) + "'>" + name + "</a><hr size=1 color=#eeeeee>";

	  if (isSet(flat)) {
	  		appendRow = appendRow + "<small><span class='text-xs' id='map_address_" + tableCount + "'></span></small>";
	  }

	  appendRow = appendRow + "<br><small>" + dtimestamp + "</small>";

	  appendRow = appendRow + "</div></div></div>"; //col, row, service,

	  $('#dataTable-Flight_list').append(appendRow);

		var curIndex = tableCount;

		var retSource = null;
		if (isSet(flat)) {
	  	retSource = makeForFlightListMap(curIndex, flat, flng, address);
	  }

	  if (isSet(retSource) && isSet(address) && address != "") {
	  	setAddressAndCada("#map_address_" + curIndex, address, cada, retSource);
	  }


	  if (isSet(youtube_url)) {
	  	setYoutubeVideo(tableCount, youtube_url);
	  }
	  else {
	  	setEmptyVideo(tableCount);
	  }

	  if (isSet(flat)) {
        moveFlightHistoryMap(flat * 1, flng * 1);
    }

	  tableCount++;
	}

	function setFlightlistHistory(data) {
	  if (data == null || data.length == 0)
	    return;

	  data.forEach(function(item) {
	    appendFlightListTable(item);
	    flightRecArray.push(item);
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

	      setFlightlistHistory(r.data);
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

	function setScrollEvent() {
		$(document).scroll(function (e) {
	        var scrollAmount = $(window).scrollTop();
	        var documentHeight = $('body').height();
	        var viewPortHeight = $(window).height();

	        var a = viewPortHeight + scrollAmount;
	        var b = documentHeight - a;
	        var scrollHeight = window.innerHeight / 2;
					var scrolltop = $(window).scrollTop() + scrollHeight;
					checkAutoPlay(scrolltop);
		});
	}

	function checkAutoPlay(scrollCenter) {
		for(var i=0;i<tableCount;i++) {
			var divName = "flight-list-" + i;
			var videoTop = $("#" + divName).offset().top;
			var videoBottom =  $("#" + divName).offset().top + $("#" + divName).height();

			if(videoTop < scrollCenter && videoBottom > scrollCenter) {
				if (player[i] && typeof player[i] === 'object' && player[i].getPlayerState() != 1)
					player[i].playVideo();
			}
			else {
				if (player[i] && typeof player[i] === 'object' && player[i].getPlayerState() == 1)
					player[i].stopVideo();
			}
		}
	}

	function initYoutubeAPI() {
		var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}

	function onYouTubeIframeAPIReady() {
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
	initYoutubeAPI();
	setScrollEvent();	
});
