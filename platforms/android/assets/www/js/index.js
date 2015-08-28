
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
				fullJSON = JSON.stringify(userData);
				userId = fullJSON["userID"];
				console.log(fullJSON);
				newPage("register.html");
				console.log("user ID" + userId);
				registerGetInfo();
			}

			facebookConnectPlugin.login(["public_profile", "user_birthday","user_photos","user_hometown","user_likes","user_work_history","user_location","user_about_me","user_actions.books","user_actions.news","user_likes","user_actions.fitness","user_actions.music","user_actions.video"],
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
	facebookConnectPlugin.api("/" + userId, ["user_birthday"],
    function (result) {
        console.log("Result: " + userId);
       
    },
    function (error) {
        console.log("Failed: " + error);
    });
}