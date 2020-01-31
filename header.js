// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Copyright (c) 2020 Frederick Hewett
"use strict"; 

var COPYLINK_EXTENSION_ID = "olalhnimknmpojkgpaphbfffmbhfkbfl";

function getLetterHeader(currentUrl)
{
	var lines = document.getElementsByClassName("kix-lineview-content");
	var meta = {
		method: "getHeader",
		docUrl: currentUrl
	};
	for (var i=0; (i < 20) && (i < lines.length); ++i) {
		var lineText = lines[i].innerText.trim().replace(/\u200C/g, '');
		if (lineText.indexOf("Status") == 0) {
			if (lineText.toLowerCase().indexOf("submitted", 29) !== -1) {
				meta.submitted = true;
			}
			else {
				meta.submitted = false;
			}
		}
		if (lineText.indexOf("In response to:") == 0) {
			var url = lines[i].getElementsByTagName("a");
			if (url.length > 0) {
				meta.responseToUrl = url[0].href;
			}
			else {
				meta.responseToUrl = lineText.substring(15);
			}
		}
		if (lineText.indexOf("Newspaper:") == 0) {
			meta.newspaper = lineText.substring(11);
		}
		if (lineText.indexOf("Date:") == 0) {
			meta.date = new Date(lineText.substring(5).trim()).toLocaleDateString();
		}
		if (lineText.indexOf("Author:") == 0) {
			meta.author = lineText.substring(7).trim();
		}

	}
	if (meta.author) {
		chrome.runtime.sendMessage(COPYLINK_EXTENSION_ID,meta);
		return {status: true};
	}
	else 
		return {status: false};
}
