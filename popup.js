// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Copyright (c) 2016 Frederick Hewett
"use strict"; 

function singlePage(tab)
{
	chrome.tabs.executeScript( {
	  code: "window.getSelection().toString();"
	}, function(selection) {
		var linkText = selection[0];
		if (!linkText) {
			linkText = trimTitle(tab.title);
		}
	    chrome.runtime.sendMessage(
        	{ 
        		method: "setClipboard", 
        		value: linkText,
        		url: tab.url
        	},
       		function(response) {
       			var resultNode;
       			if (response) {
       				resultNode = document.createTextNode("Link copied.");
       			}
       			else {
       				resultNode = document.createTextNode("Error: failed to copy.");
       			}
       			document.getElementById("result").appendChild(resultNode);
        	}
    	);
	});
}

function processAllInactive(tabs) {
	chrome.runtime.sendMessage(
		{ 
			method: "setClipboardMulti", 
			value: tabs
		},
		function(response) {
			var resultNode;
			if (response) {
				resultNode = document.createTextNode("Multiple links copied.");
			}
			else {
				resultNode = document.createTextNode("Error: multiple link mode - failed to copy.");
			}
			document.getElementById("result").appendChild(resultNode);
		}
	);
	


}

function buildLink(tab) {

	if ((tab.title.indexOf("gmail.com") >= 0) || (tab.url.indexOf("ltesearch.org") >= 0)) {
		console.log("found gmail or feed digest - multi mode");
		getAllInactiveTabs(processAllInactive);
	}
	else {
		console.log("single page mode");
		singlePage(tab);
	}
}

document.addEventListener("DOMContentLoaded", function() {
  getCurrentTab(buildLink);
});
