
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		document.getElementById("fblog").style.display = "block";
		document.getElementById("fblog").addEventListener("click", function() {
			console.warn("you clicked the facebook button");
			var fbLoginSuccess = function (userData) {
				console.log("UserInfo: " + JSON.stringify(userData));
				fullJSON = JSON.stringify(userData);
				
				
				
				newPage("register.html");
				registerGetInfo();
			}

			facebookConnectPlugin.login(["id","public_profile", "user_birthday","about","bio","email","first_name","last_name","gender"],
				fbLoginSuccess,
				function (error) { console.warn("" + error) }
			);

		});
    }
};

var fullJSON;

var userId;

function newPage(pagename) {
	var myNode = document.getElementById("pagewrap");
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}
	
	var xmlhttp;
	if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	}
	else { // code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			document.getElementById("pagewrap").innerHTML = xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET", "screens/" + pagename, true);
	xmlhttp.send();
}
function registerGetInfo() {
	
}