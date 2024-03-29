// Copyright (c) 2016-2018  Frederick Hewett
"use strict"; 

function NewsItem() {
	this.paper = null;
	this.url = "";
	this.headline = "";
	this.isActiveTab = false;
}

/**
 * Get the current tab.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTab(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs[0]);
  });
}

function getAllInactiveTabs(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: false,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs);
  });
}

function getGoogleDocsTab(callback) {
  var queryInfo = {
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
  	for (var i in tabs) {
  		if (tabs[i].url.indexOf("docs.google.com/document") != -1) {
  			callback(tabs[i]);
  			return;
  		}
  	}
    callback(null);
  });
}

function findPaper(_papers, url) {
	var result = null;
	var matchedDomain = "";

	for (var i in _papers) {
		var p = _papers[i];
		if (url.indexOf(p.domain) >= 0) {
			if (p.domain.length > matchedDomain.length) {
				result = p;
				matchedDomain = p.domain;
			}
		}
	}
	
	return result;
}

function lookupPaper(_papers, url) {
	var result = findPaper(_papers, url);
	
	if (!result) {

		var idx = url.indexOf("wickedlocal.com")
		if (idx > 1) {
			var town = url.substring(0, idx-1);
			if (town.indexOf("https://") === 0) {
				town = town.substring(8);
			}
			else if (town.indexOf("http://") === 0) {
				town = town.substring(7);
			}	
			var firstChar = town.charAt(0).toUpperCase();
			town = firstChar + town.substring(1) + " Wicked Local";
	
			result.name = town;	
		}
	}
	
	return result;
}

function lookupPaperObject(_papers, url) {
	var result = findPaper(_papers, url);
	
	if (!result) {

		var idx = url.indexOf("wickedlocal.com")
		if (idx > 1) {
			var town = url.substring(0, idx-1);
			if (town.indexOf("https://") === 0) {
				town = town.substring(8);
			}
			else if (town.indexOf("http://") === 0) {
				town = town.substring(7);
			}
			
			var firstChar = town.charAt(0).toUpperCase();
			var townCap = firstChar + town.substring(1) + " Wicked Local";
		
			result = {
				domain: town + ".wickedlocal.com",
				name: townCap,
				lteaddr: town + "@wickedlocal.com",
				max_words: 0
			};	
		}
	}
	
	return result;
}



function trimTitle(s) {
	if (s.indexOf("The Recorder") == 0) {
		return s.substring("The Recorder".length + 3);
	}
	var ix;
	ix = s.indexOf(" |");
	if (ix === -1)
		ix = s.indexOf(" — "); // mdash
	if (ix === -1) 
		ix = s.indexOf(" – "); // ndash
	if (ix === -1) 
		ix = s.indexOf(" - "); // dash		
	if (ix > 0) {
		return s.substring(0, ix);
	}
	else {
		ix = s.indexOf(" |");
		if (ix > 0) {
			return s.substring(0, ix);
		}
	}
	return s;
}

function createLink(papers, text, url, readerUrl) {
	var root = document.createElement("div");
	var anch = document.createElement("a");
	var paper = lookupPaper(papers, url);
	root.appendChild(document.createTextNode(paper.name + ": "));
	root.appendChild(anch);
	anch.href = url;
	var textNode = document.createTextNode(text);
	anch.appendChild(textNode);
	root.setAttribute("style","font-size:14.5px");
	
	if (readerUrl) {
		var readerAnch = document.createElement("a");
		readerAnch.setAttribute("style", "font-weight:bold");
		root.appendChild(document.createTextNode(" "));
		root.appendChild(readerAnch);
		readerAnch.href = readerUrl;
		var readerText = document.createTextNode(" (text only)");
		readerAnch.appendChild(readerText);
	}
	
	return root;
}

/**
 * Get the current tab.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTab(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs[0]);
  });
}

function getAllInactiveTabs(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: false,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs);
  });
}

function formatDate(d) {
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var midx = d.getMonth();
	var day = d.getDate();
	var year = d.getFullYear();
	
	return months[midx] + " " + day + ", " + year;
}

function clearSelect(sel) {
	while (sel.length > 0) {
		sel.remove(sel.length-1);
	}
}

function setupClipboardResult(args) {
	// set the date field
	document.getElementById("date").textContent = formatDate(new Date());
	
	// set the author field
	var authSpan = document.getElementById("author");
	authSpan.textContent = args.author;
	
	// set the "responding to" and newspaper fields if present
	var np = document.getElementById("newspaper");
	var sa = document.getElementById("submit_addr");
	var sanch = document.getElementById("submit_anchor");
	var proto = "";
	if (args.paper) {	
		np.textContent = args.paper.name;
		sa.textContent = args.paper.lteaddr;
		if (args.paper.lteaddr.indexOf('@') != -1)
			proto = "mailto:";
		sanch.href = proto + args.paper.lteaddr;
	}
	else {
		np.textContent = "";
		sa.textContent = "";
	}
	
	// hyperlink to article
	var link = document.getElementById("hyper");
	console.log("url: " + args.response_to_url)
	link.href = args.response_to_url;
	link.textContent = args.response_to_title;
}
