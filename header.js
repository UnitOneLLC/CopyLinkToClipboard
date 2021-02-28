// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Copyright (c) 2020 Frederick Hewett
"use strict"; 

function firefoxGetLink() {
	try {
		var scripts=document.getElementsByTagName("script");
		for (var i=0; i < scripts.length; ++i) {
			var s = scripts[i];
			var t = s.textContent;
			let varName = "DOCS_modelChunk = ";
			if (t.indexOf(varName) == 0) {
				var jsText = t.substring(varName.length, t.indexOf(";")); 
				var objs = JSON.parse(jsText);
				for (var j = 0; j < objs.length; ++j) {
					var obj = objs[j];
					if (obj["sm"] && obj["sm"]["lnks_link"]) {
						var theUrl = obj["sm"]["lnks_link"]["ulnk_url"];
						return theUrl;
					}
				}
			}
		}
	} catch (e) {
		console.log("firefoxGetLink threw " + e.message);
	}
	return "";
}


function getLetterHeader(currentUrl, extensionId)
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
			else if ((url=firefoxGetLink()).length > 0) {
				meta.responseToUrl = url;
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
		chrome.runtime.sendMessage(extensionId,meta);
		return {status: true};
	}
	else 
		return {status: false};
}
