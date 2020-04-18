global.request = require('request');
global.urlModule = require('url');
global.resourceBundle = csInterface.initResourceBundle();
(function () {
	'use strict';

	var csInterface = new CSInterface();
	
	function init() {
				
		themeManager.init();
}
		
	init();


}());
	

function switchTab(n) {
    document.getElementsByClassName("tab")[0].setAttribute('class', "tab off");
    document.getElementsByClassName("tab")[1].setAttribute('class', "tab off");
    document.getElementsByClassName("tab")[2].setAttribute('class', "tab off");

    document.getElementsByClassName("tab")[n].setAttribute('class', "tab on");

    document.getElementById("tab_content_0").style["display"] = "none";
    document.getElementById("tab_content_1").style["display"] = "none";
    document.getElementById("tab_content_2").style["display"] = "none";

    document.getElementById("tab_content_" + n.toString()).style["display"] = "block";
}
function getRequest() {

    return request.defaults({
		"headers": {
			"Content-Type": "text/plain"
		  },
        timeout: 300000,
        rejectUnauthorized: false //readFromConfigFile("seqMode")
    });
}

/** perform request, using a custom timeout */
function performRequest(endpoint, method, data, success) {
    var timeout = null;
    performRequestWithTimeout(endpoint, method, data, timeout, success);
}

function performRequestWithTimeout(endpoint, method, data, timeout, success) {
    var serverurl = "https://translation.googleapis.com";
    var myURL = new URL(endpoint, serverurl);
    var request = getRequest();
	openModal();
    var options = {
        uri: myURL.href,
        method: method,
        headers: {}
    };
    if (timeout && timeout > 0) {
        options.timeout = timeout;
       // logDebug('performing request with  timeout: ' + options.timeout);
    }

    if (method == 'GET' && data) {
        options.qs = data
    } else {
        //the remaining headers should be calculated correctly IIRC
        options.json = data;
        options.qs = data.sessionId;
    }
    console.log(options);
    var responseString = '';
    request(options, function (error, response, body) {
            //TODO what do do here?

            if (error) {
				closeModal();
                logError("error occured: " + error);
            }
            if (response.statusCode !=200) {
                closeModal();
                logError("error occured: " + error);
                displayAlert("error","Error","alertTranslationError");
            }
            if (response) {
                var responseObject = "";

                console.log("request callback for: " + endpoint);
                //console.log("body: " + body);
                console.log("response.statusCode: " + response.statusCode);
                responseObject = JSON.parse(responseString);
                    if (success)
					{success(responseObject);
					closeModal();
					}
            }
        })
        .on('error', function (error) {
			logError("error occured: " + error);
			closeModal();
        })
        .on('data', function (data) {
            responseString += data;
        })
        .on('response', function (response) { //used to be 'end' event
        closeModal();
        });
}

function displayAlert(type, title, text) {

    switch (type) {
        case "success":
            document.getElementById("alertIcon").className = "ion-ios-checkmark-circle-outline";
            break;
        case "error":
            document.getElementById("alertIcon").className = "ion-ios-close-circle-outline";
            break;
        case "information":
            document.getElementById("alertIcon").className = "ion-ios-information-circle-outline";
            break;
        default:
            document.getElementById("alertIcon").className = "ion-ios-checkmark-circle-outline";
    }


    if (resourceBundle[title] != undefined) {
        document.getElementById("alertTitle").innerHTML = resourceBundle[title];
    } else document.getElementById("alertTitle").innerHTML = title;

    if (resourceBundle[text] != undefined) {
        document.getElementById("alertText").innerHTML = resourceBundle[text];
    } else document.getElementById("alertText").innerHTML = text;

    document.getElementById("popup-success").style.display = "block";
}
function performRequestAsync(endpoint, method, data) {

	var serverurl = "https://translation.googleapis.com";
    var myURL = new URL(endpoint, serverurl);
    var request = getRequest();
	openModal();
    var options = {
        uri: myURL.href,
        method: method,
        headers: {}
    };
   options.json = data;

    return new Promise((resolve, reject) => {
		var responseString = '';
		request(options, function (error, response, body) {
				if (error) reject(error);
				if (response) {
					var responseObject = "";
	
					console.log("request callback for: " + endpoint);
					console.log("response.statusCode: " + response.statusCode);
					responseObject = JSON.parse(responseString);
					if (response.statusCode != 200) {
						reject('Invalid status code <' + response.statusCode + '>');
						closeModal();
					}
					resolve(responseObject);
					closeModal();
				}
				
				
			}).on('error', function (error) {
				logError("error occured: " + error);
				closeModal();
			 })
			 .on('data', function (data) {
				 responseString += data;
			 })
			 .on('response', function (response) { 
			   
			 });

    });
}