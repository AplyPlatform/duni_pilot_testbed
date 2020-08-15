// The client ID is obtained from the Google API Console
// at https://console.developers.google.com/.
// If you run this code from a server other than http://localhost,
// you need to register your own client ID.
var OAUTH2_CLIENT_ID = '796696970892-p16dtq9oq2oks814lu661hreampk6kjn.apps.googleusercontent.com';
var OAUTH2_SCOPES = [
  'https://www.googleapis.com/auth/youtube'
];

var apiIsReady = false;
// Upon loading, the Google APIs JS client automatically invokes this callback.
googleApiClientReady = function() {	
	apiIsReady = true;  
}

function tryUpload() {
	$("#movieButton").click(function() {
			if (apiIsReady == false) {
				showAlert("죄송합니다. 일시적인 오류가 발생했습니다. 잠시후 다시 시도해 주세요.");
			}
			else {
				tryAuth();
			}
	});
}

function tryAuth() {
	gapi.auth.init(function() {
		    window.setTimeout(checkAuth, 1);
	});
}

// Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
// If the currently logged-in Google Account has previously authorized
// the client specified as the OAUTH2_CLIENT_ID, then the authorization
// succeeds with no user intervention. Otherwise, it fails and the
// user interface that prompts for authorization needs to display.
function checkAuth() {
  gapi.auth.authorize({
    client_id: OAUTH2_CLIENT_ID,
    scope: OAUTH2_SCOPES,
    immediate: false
  }, handleAuthResult);
}

// Handle the result of a gapi.auth.authorize() call.
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    // Authorization was successful. Hide authorization prompts and show
    // content that should be visible after authorization succeeds.
    
    var uploadVideo = new UploadVideo();
    uploadVideo.ready(gapi.auth.getToken().access_token);
    
  } else {
    // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
    // client flow. The current function is called when that flow completes.
    $('#login-link').click(function() {
      gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: false
        }, handleAuthResult);
    });
  }
}

