/*
    GitHub URL: https://github.com/gucastiliao/video-popup-js
*/

(function($) {
    $.fn.videoPopup = function(options) {
        var videoPopup = {
            embedLink: ''
        }

        var settings = $.extend({
            autoplay: true,
            showControls: true,
            controlsColor: null,
            loopVideo: false,
            showVideoInformations: true,
            width: null,
            customOptions: {}
        }, options);

        var parsers = {
            youtube: {
                regex: /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/,
                test: function (videoUrl, regex) {
                    var match = videoUrl.match(regex);
                    return (match && match[7].length==11) ? match[7] : false;
                },
                mount: function (videoCode) {
                    var youtubeOptions = { 
                        autoplay: settings.autoplay,
                        color: settings.controlsColor,
                        loop: settings.loopVideo,
                        controls: settings.showControls,
                        showinfo: settings.showVideoInformations,
                    }

                    Object.assign(youtubeOptions, settings.customOptions);
                    
                    return "https://www.youtube.com/embed/"+videoCode+"/?"+$.param(youtubeOptions);
                }
            },
            vimeo: {
                regex: /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/,
                test: function (videoUrl, regex) {
                    var match = videoUrl.match(regex);
                    return (match && match[5].length) ? match[5] : false;
                },
                mount: function (videoCode) {
                    var vimeoOptions = {
                        autoplay: settings.autoplay,
                        color: settings.controlsColor,
                        loop: settings.loopVideo,
                        controls: settings.showControls,
                        title: settings.showVideoInformations,
                    }

                    Object.assign(vimeoOptions, settings.customOptions);
                    
                    return "https://player.vimeo.com/video/"+videoCode+"/?"+$.param(vimeoOptions);
                }
            }
        }
        
        function mountEmbedLink(videoUrl) {
            $.each(parsers, function(index, parser){
                var videoCode = parser.test(videoUrl, parser.regex);
                
                if(videoCode) {
                    videoPopup.embedLink = parser.mount(videoCode);
                    return this;
                }
            })
        }

        function mountIframe(isPublic, langset, name, prodUrl, owner, videoAddress, isOuter) {
            var iframeElement = '<div class="video-container"><iframe src="'+videoPopup.embedLink+'" allowfullscreen frameborder="0" width="'+settings.width+'"></iframe></div>';

            if(!videoPopup.embedLink) {
                iframeElement = '<div class="videopopupjs__block--notfound">Video not found</div>';
            }
		
						var htmlString = '<div class="video-info-wrap"><div class="video-info1">';
						
						if(name) {
								htmlString = htmlString + name;
						}
						
						htmlString = htmlString + '<div class="video-info1-sub">';
								
						if (videoAddress) {
								htmlString = htmlString + videoAddress;
						}
						
						htmlString = htmlString + '</div></div>'; //sub1, info1
						
						htmlString = htmlString + '<div class="video-info2"><div class="video-info2-sub">';
								
						if (isOuter == false) { //내부 db
									if(owner) {
										htmlString = htmlString + ' / <a onclick="GATAGM(\'flight_list_map_video_email_click_'
										+ owner + '\', \'CONTENT\');" href="/center/main.html?page_action=publicrecordlist&user_email='
										+ owner + '"><font color=cyan>' + owner + '</font></a>';
									}						
																																				
									htmlString = htmlString + '<a onclick="GATAGM(\'flight_list_map_video_detail_click_'
										+ name + '\', \'CONTENT\');" href="/center/main.html?page_action=' + (isPublic == "public" ? "public" : '') + 'recordlist_detail&record_name='
										+ encodeURIComponent(name) + '">' + '<i class="fas fa-file-alt"></i>' + "&nbsp;&nbsp;" + (langset == 'KR' ? '상세보기' : 'Detailed View') + '</a>' + "&nbsp;&nbsp;&nbsp;&nbsp;";
						}
								
						if(prodUrl && prodUrl != "") {                  												
							htmlString = htmlString + '<a onclick="GATAGM(\'flight_list_public_map_video_prod_url_click_'
								+ name + '\', \'CONTENT\', \''
								+ langset + '\');" href=' + prodUrl + '>' + '<i class="fas fa-shopping-cart"></i>' + "&nbsp;&nbsp;" + (langset == 'KR' ? '구매하기' : 'Purchase') + '</a>';
						}
            else {                            
							htmlString = htmlString + '<a onclick="GATAGM(\'flight_list_public_map_video_qa_click_'
								+ name + '\', \'CONTENT\', \''
								+ langset + '\');" href="https://duni.io/index.php?page=contact" target=_black>' + '<i class="fas fa-comments"></i>' + "&nbsp;&nbsp;" + (langset == 'KR' ? '문의하기' : 'Contact us') + '</a>';
            }
						
						htmlString = htmlString + '</div></div>';
						
						
            return '<div class="videopopupjs videopopupjs--animation">'+
                        '<div class="videopopupjs__content">'+                            
                        		'<div class="videopopupjs__close"><i class="fas fa-times-circle"></i></div>'+
                            iframeElement + 
                            htmlString +
                        '</div>'+
                    '</div>';
        }

        $(this).css('cursor', 'pointer');
        $(this).on('click', function (event) {
            event.preventDefault();
            
            var videoUrl = $(this).attr("video-url");
            var videoIframe = mountEmbedLink(videoUrl);
            var videoProdUrl = $(this).attr("video-prod-url");
            var videoName = $(this).attr("video-name");
            var videoAddress = $(this).attr("video-address");
            var videoOwner = $(this).attr("video-owner");
            var isPublic = $(this).attr("video-ispublic");
            var langset = $(this).attr("video-lang");
            var outer = $(this).attr("video-outer");
            
            var isOuter = false;
            if (outer !== undefined && outer == "true") {
            	isOuter = true;
            }

            $("body").append(mountIframe(isPublic, langset, videoName, videoProdUrl, videoOwner, videoAddress, isOuter));

            $('.videopopupjs__content').css('max-width', 700);
            if(settings.width) {
                $('.videopopupjs__content').css('max-width', settings.width);
            }

            if($('.videopopupjs').hasClass('videopopupjs--animation')){
                setTimeout(function() {
                    $('.videopopupjs').removeClass("videopopupjs--animation");
                }, 200);
            }

            $(".videopopupjs, .videopopupjs__close").click(function(){
                $(".videopopupjs").addClass("videopopupjs--hide").delay(515).queue(function() { $(this).remove(); });
            });
        });

        $(document).keyup(function(event) {
            if (event.keyCode == 27){
                $('.videopopupjs__close').click();
            }
        });

        return this;
    };
}(jQuery));