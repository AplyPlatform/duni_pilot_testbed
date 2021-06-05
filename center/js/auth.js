// The client ID is obtained from the Google API Console
// at https://console.developers.google.com/.
// If you run this code from a server other than http://localhost,
// you need to register your own client ID.
var OAUTH2_CLIENT_ID = '796696970892-p16dtq9oq2oks814lu661hreampk6kjn.apps.googleusercontent.com';
var OAUTH2_SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload'
];

var apiIsReady = false;
// Upon loading, the Google APIs JS client automatically invokes this callback.
var googleApiClientReady = function () {

    gapi.auth.init(function () {
        apiIsReady = true;        
    });            
};

function tryAuth() {
    window.setTimeout(checkAuth, 1);
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
        
        setCookie("user_google_auth_token", gapi.auth.getToken().access_token);
        hideLoader();
        
        if (uploadVideo) {
        	showLoader();
        	uploadVideo.ready();
        	uploadVideo.handleUploadClicked();
        }
        else {
        	$('#uploadVideoToYoutubeButton').attr('disabled', false);
        	hideLoader();
        	showAlert(LANG_JSON_DATA[langset]['msg_error_sorry']);
        }

    } else {
        // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
        // client flow. The current function is called when that flow completes.
        $('#login-link').click(function () {
            gapi.auth.authorize({
                client_id: OAUTH2_CLIENT_ID,
                scope: OAUTH2_SCOPES,
                immediate: false
            }, handleAuthResult);
        });
    }
}

