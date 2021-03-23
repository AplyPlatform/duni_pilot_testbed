﻿/*
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

        function mountIframe(langset, name, owner) {
            var iframeElement = '<iframe src="'+videoPopup.embedLink+'" allowfullscreen frameborder="0" width="'+settings.width+'"></iframe>';

            if(!videoPopup.embedLink) {
                iframeElement = '<div class="videopopupjs__block--notfound">Video not found</div>';
            }
		
						var htmlString = '';
						if(name) {
							htmlString = '<div class="col text-left"><font color="white"><b>' + name + '</b></font>';
						}
						
						if(owner) {
							htmlString = htmlString + ' / <font color="white"><b>' + owner + '</b></font>';
						}
						
						htmlString = htmlString + '</div><div class="col text-right">';						
						
						htmlString = htmlString + '<a onclick="GATAGM(\'flight_list_public_map_video_title_click_'
							+ name + '\', \'CONTENT\', \''
							+ langset + '\');" href="/center/main.html?page_action=publicrecordlist_detail&record_name='
							+ encodeURIComponent(name) + '">' + (langset == 'KR' ? '상세보기' : 'Detailed View') + '</a>';
						
						htmlString = htmlString + '</div><hr size=1 width=100% color=#white>';
						
            return '<div class="videopopupjs videopopupjs--animation">'+
                        '<div class="videopopupjs__content">'+                            
                        		'<span class="videopopupjs__close"></span>'+
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
            var videoName = $(this).attr("video-name");
            var videoOwner = $(this).attr("video-owner");
            var langset = $(this).attr("video-lang");

            $("body").append(mountIframe(langset, videoName, videoOwner));

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