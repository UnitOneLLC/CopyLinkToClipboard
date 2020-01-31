// Copyright (c) 2016 Frederick Hewett

'use strict'; 

function _el(id) {
	return document.getElementById(id);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        switch (request.method) {
        case 'setClipboard':
            sendResponse(setClipboard(request.url, request.value));
            break;
        case 'setClipboardMulti':
        	sendResponse(setClipboardMulti(request.value));
        	break;
		// pass newspaper db up to pop-up
		case 'getNewspaperDatabase':
			sendResponse({"_papers": _LTE_PAPERS});
			break;
		case 'getHeader':
			sendResponse(copyHeaderToClipboard(request));
			break;
        default:
            console.error('Unknown method "%s"', request.method);
            sendResponse(false);
    }
});


function setClipboard(url, value) {
    var result = false;
    
    var paperSpan = document.getElementById("paperName")
    var anch = document.getElementById("anchor0");
    var tn = document.createTextNode(value);
    var range = document.createRange();
    var follows = document.getElementById("follows");
    var paper = lookupPaper(_LTE_PAPERS, url);
    if (paper) {
    	paper += ": "
    }
    if (!paperSpan || !anch || !tn || !range || !follows) {
    	console.log("failed to create object");
    	return false;
    }

	var fc = paperSpan.firstChild;
	while( fc ) {
    	paperSpan.removeChild( fc );
    	fc = paperSpan.firstChild;
	}    

	paperSpan.appendChild(document.createTextNode(paper))
    
	fc = anch.firstChild;
	while( fc ) {
    	anch.removeChild( fc );
    	fc = anch.firstChild;
	}    
    
    anch.href = url
	anch.appendChild(tn);    

    range.setStart(paperSpan, 0);
    range.setEnd(follows, 0);
    
	var selObj = window.getSelection()
	selObj.removeAllRanges();
	selObj.addRange(range);
    
    if (document.execCommand('copy')) {
        result = true;
    } else {
        console.error('failed to get clipboard content');
    }

    return result;
}


function setClipboardMulti(tabs) {
	var outer = document.createElement("div");
	var last = document.createElement("div");
	var c = tabs.length;
	if (c == 0)
		return false;
	else {
		var sortedTabs = tabs.slice();
		sortedTabs.sort(function(a,b) {return a.title.localeCompare(b.title)});
	
		for (var i=0; i < sortedTabs.length; ++i) {
			var t = sortedTabs[i];
			var link = createLink(_LTE_PAPERS, trimTitle(t.title), t.url);
			outer.appendChild(link);
		}
		document.body.appendChild(outer);
		document.body.appendChild(last);
	    var range = document.createRange();

		range.setStart(outer, 0);
		range.setEnd(last, 0);
	
		var selObj = window.getSelection()
		selObj.removeAllRanges();
		selObj.addRange(range);
	
		if (document.execCommand('copy')) {
			return true;
		} else {
			console.error('failed to get multi clipboard content');
			return false;
		}
		outer.remove();
		last.remove();
	}
	
}

function makeLinkMarkup(url)
{
	var container = document.createElement("div");
	var anchor = document.createElement("a");
	anchor.href = url;
	anchor.innerHTML = url;
	container.appendChild(anchor);
	return container.innerHTML;
}

function clearHeader()
{
	var ids=["hdr-date", "hdr-author", "hdr-media", "hdr-resp-link", "hdr-gdoc-link"];
	
	for (var i=0; i < ids.length; ++i) {
		_el(ids[i]).innerHTML = "";
	}
}

function refNumber(dateText) 
{
	var ref;
	try {
		var d = new Date(dateText);
		ref = "" + d.getFullYear() - 2000 + "." + d.getMonth() + "." + d.getDate() + ".";
	}
	catch (e) {
		return "";
	}
	return  ref;
}

function copyHeaderToClipboard(meta) 
{
	clearHeader();
	
	_el("hdr-date").innerHTML = meta.date;
	_el("hdr-ref").innerHTML = refNumber(meta.date);
	_el("hdr-author").innerHTML = meta.author;
	_el("hdr-sender").innerHTML = meta.submitted ? meta.author : "";
	_el("hdr-media").innerHTML = meta.newspaper;
	_el("hdr-resp-link").innerHTML = makeLinkMarkup(meta.responseToUrl);
	_el("hdr-gdoc-link").innerHTML = makeLinkMarkup(meta.docUrl);
	
	var range = document.createRange();
	range.setStart(_el("hdr-table"), 0);
	range.setEnd(_el("hdr-end"), 0);
	
	var selObj = window.getSelection()
	selObj.removeAllRanges();
	selObj.addRange(range);
	
	if (document.execCommand('copy')) {
		return true;
	} else {
		console.error('failed to get clipboard content');
		return false;
	}
}



var _LTE_PAPERS = null;
function loadDoc() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      _LTE_PAPERS = JSON.parse(this.responseText);
    }
  };
  xhttp.open("GET", "http://ltesearch.org/ltesearch.php?action=getpaperdb", true);
  xhttp.send();
}
loadDoc();







