/*
Copyright 2021 APLY Inc. All rights reserved.
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


function loadEnd(e) {
  $("#screenDownloadComplete").show();
  $("#screenDownloadProgress").hide();
}

function downloadFile(file_url) {	
	let temp_file_name = file_url.substring(file_url.lastIndexOf("/") + 1).split("?")[0];
	var xhrObj = new XMLHttpRequest();
	xhrObj.addEventListener("loadend", loadEnd);
	xhrObj.responseType = 'blob';
	xhrObj.onload = function () {		
				
			if (xhrObj.status == 200) {
				console.log( xhrObj.response );
		    var linker = document.createElement('a');
		    linker.href = window.URL.createObjectURL(xhrObj.response);
		    linker.download = temp_file_name;
		    linker.style.display = 'none';    
		    document.body.appendChild(linker);
		    linker.click();
		    delete linker;
		  }
		  else if (xhrObj.status == 403) {
		  	alert("존재하지 않는 파일이거나 오류가 발생하여 다운로드를 진행할 수 없습니다. (File is not exists or failed to download)");
		  }
	};
	
	xhrObj.onerror = function() { alert("오류가 발생하여 다운로드를 진행할 수 없습니다. (Failed to download)"); };
	
	xhrObj.onprogress = function (e) {
			let pos = Math.floor(e.loaded / e.total * 100);
			$("#progressBarForDownload").val(pos);
	};
	xhrObj.open('GET', file_url);
	
	try {
		xhrObj.send();
	}
	catch(error) {
		alert("오류가 발생하여 다운로드를 진행할 수 없습니다. (Failed to download)");
	}
}

function getQueryVariable() {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == "id") {
            return "https://s3.ap-northeast-2.amazonaws.com/io.droneplay/temp_user_files/" + decodeURIComponent(pair[1]);
        }
    }
    
    return "";
}

function startDownload() {
		let file_url = getQueryVariable();
		
		$("#screenDownloadComplete").hide();
		
		if (file_url == "") {
			alert("Invalid access");
			location.href="/index.html";
		}
		else {
			downloadFile(file_url);	
		}
}

$(function () {

	startDownload();

});