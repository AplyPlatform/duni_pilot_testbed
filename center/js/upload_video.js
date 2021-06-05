/*
Copyright 2015 Google Inc. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/*
var signinCallback = function (result){
  if(result.access_token) {
    var uploadVideo = new UploadVideo();
    uploadVideo.ready(result.access_token);
  }
};
*/

let upload_not_allow = false;

var STATUS_POLLING_INTERVAL_MILLIS = 60 * 1000; // One minute.


/**
 * YouTube video uploader class
 *
 * @constructor
 */
var UploadVideo = function () {
    /**
     * The array of tags for the new YouTube video.
     *
     * @attribute tags
     * @type Array.<string>
     * @default ['google-cors-upload']
     */
    this.tags = ['flight-record'];

    /**
     * The numeric YouTube
     * [category id](https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.videoCategories.list?part=snippet&regionCode=us).
     *
     * @attribute categoryId
     * @type number
     * @default 22
     */
    this.categoryId = 22;

    /**
     * The id of the new video.
     *
     * @attribute videoId
     * @type string
     * @default ''
     */
    this.videoId = '';

    this.uploadStartTime = 0;     
    this.onUploadCompleteCallback = null;
};


UploadVideo.prototype.ready = function () {
		let accessToken = getCookie("user_google_auth_token");
		if (accessToken === "undefined" || accessToken === null || accessToken == "") return;
		
    this.accessToken = accessToken;
    this.gapi = gapi;     
};

/**
 * Uploads a video file to YouTube.
 *
 * @method uploadFile
 * @param {object} file File object corresponding to the video to upload.
 */
UploadVideo.prototype.uploadFile = function (file, fname, fdesc) {
		
    var metadata = {
        snippet: {
            title: fname,
            description: fdesc,
            tags: this.tags,
            categoryId: this.categoryId
        },
        status: {
            privacyStatus: $('#privacy-status option:selected').val()
        }
    };
    var uploader = new MediaUploader({
        baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
        file: file,
        token: this.accessToken,
        metadata: metadata,
        params: {
            part: Object.keys(metadata).join(',')
        },
        onError: function (data) {
            var message = data;
            // Assuming the error is raised by the YouTube API, data will be
            // a JSON string with error.message set. That may not be the
            // only time onError will be raised, though.
            try {
                var errorResponse = JSON.parse(data);
                message = errorResponse.error.message;
            } finally {
                showAlert(LANG_JSON_DATA[langset]['msg_error_sorry'] + "\n" + message);
            }
        }.bind(this),
        onProgress: function (data) {
            var currentTime = Date.now();
            var bytesUploaded = data.loaded;
            var totalBytes = data.total;
            // The times are in millis, so we need to divide by 1000 to get seconds.
            var bytesPerSecond = bytesUploaded / ((currentTime - this.uploadStartTime) / 1000);
            var estimatedSecondsRemaining = (totalBytes - bytesUploaded) / bytesPerSecond;
            var percentageComplete = Math.round((bytesUploaded * 100) / totalBytes);

            $('#upload-progress').attr({
                value: bytesUploaded,
                max: totalBytes
            });

            $('#percent-transferred').text(percentageComplete);
            $('#bytes-transferred').text(Math.round(bytesUploaded/1024));
            $('#total-bytes').text(Math.round(totalBytes/1024));

            $('.during-upload').show();
        }.bind(this),
        onComplete: function (data) {
            var uploadResponse = JSON.parse(data);
            this.videoId = uploadResponse.id;
            if (this.onUploadCompleteCallback)
            	this.onUploadCompleteCallback(this.videoId);
            //this.pollForVideoStatus();
        }.bind(this)
    });
    // This won't correspond to the *exact* start of the upload, but it should be close enough.
    this.uploadStartTime = Date.now();
    uploader.upload();
};

UploadVideo.prototype.handleUploadClicked = function () {
		GATAGM('uploadVideoToYoutubeButton', 'CONTENT', langset);
		
		if (upload_not_allow){
				showAlert(LANG_JSON_DATA[langset]['msg_sorry_now_on_preparing_youtube']);
				return;
		}
		
		if (apiIsReady == false) {
        showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        return;
    }
    else {
        if (authSucceed == false) {        
            tryAuth();
            return;
        }
    }
		
    if (!$('#movieFile').get(0).files[0] || $('#movieFile').get(0).files[0] == null) {
        showAlert(LANG_JSON_DATA[langset]['msg_select_file']);
        return;
    }
		
		var mmemo = $("#memoTextarea").val();
    if (mmemo == "") {
			showAlert(LANG_JSON_DATA[langset]['msg_fill_memo']);
			return;
		}

		if ($('#record_name_field').val() == "") {
			showAlert(LANG_JSON_DATA[langset]['msg_input_record_name']);
			return;
		}
		
		let tag_values = $("#tagTextarea").val();
		
		if (tag_values != "") {
			var tagArray = JSON.parse(tag_values);
			var curTags = [];
			tagArray.forEach(function(tg) {
				curTags.push(tg.value);
			});	
			
			this.tags = curTags;
		}
		
		$('#uploadVideoToYoutubeButton').attr('disabled', true);
		
		var fname = $('#record_name_field').val();
		var fdesc = $('#memoTextarea').val();
    this.uploadFile($('#movieFile').get(0).files[0], fname, fdesc);
};

UploadVideo.prototype.uploadVideoAction = function () {

		

}

UploadVideo.prototype.pollForVideoStatus = function () {
    this.gapi.client.request({
        path: '/youtube/v3/videos',
        params: {
            part: 'status,player',
            id: this.videoId
        },
        callback: function (response) {
            if (response.error) {
                // The status polling failed.
                console.log(response.error.message);
                setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
            } else {
                var uploadStatus = response.items[0].status.uploadStatus;
                switch (uploadStatus) {
                    // This is a non-final status, so we need to poll again.
                    case 'uploaded':
                        $('#post-upload-status').append('<li>Upload status: ' + uploadStatus + '</li>');
                        setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
                        break;
                    // The video was successfully transcoded and is available.
                    case 'processed':
                        $('#player').append(response.items[0].player.embedHtml);
                        $('#post-upload-status').append('<li>Final status.</li>');
                        break;
                    // All other statuses indicate a permanent transcoding failure.
                    default:
                        $('#post-upload-status').append('<li>Transcoding failed.</li>');
                        break;
                }
            }
        }.bind(this)
    });
};
