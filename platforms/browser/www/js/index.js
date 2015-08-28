
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
		facebookConnectPlugin.getLoginStatus(function(response) {
		  if (response.status === 'connected') {
			fblogin();
			var uid = response.authResponse.userID;
			var accessToken = response.authResponse.accessToken;
		  } else if (response.status === 'not_authorized') {
			document.getElementById("fblog").addEventListener("click", function() {
				fblogin();
			});
		  } else {
			document.getElementById("fblog").addEventListener("click", function() {
				fblogin();
			});
		  }
		 });
    },
	fblogin:function() {
		var fbLoginSuccess = function (userData) {
			fullJSON = userData;
			fbId = fullJSON.authResponse.userID;
			console.log(fullJSON);
			newPage("register.html");
			registerGetInfo();
		}

		facebookConnectPlugin.login(["public_profile", "user_birthday","user_photos","user_hometown","user_likes","user_work_history","user_location","user_about_me","user_actions.books","user_actions.news","user_likes","user_actions.fitness","user_actions.music","user_actions.video"],
			fbLoginSuccess,
			function (error) { console.warn("" + error) }
		);
	}
};

var fullJSON;

var profileJSON;

var fbId;
// Facebook Functions
function registerGetInfo() {
	facebookConnectPlugin.api("/" + fbId, ["public_profile", "user_birthday","user_photos","user_hometown","user_likes","user_work_history","user_location","user_about_me","user_actions.books","user_actions.news","user_likes","user_actions.fitness","user_actions.music","user_actions.video"],
    function (result) {
        profileJSON = result;
       idc("mainDetails").getElementsByTagName("h2")[0].innerHTML = result.first_name;
		var datesset = result.birthday.split('/');
       idc("mainDetails").getElementsByTagName("h3")[0].innerHTML = calculateAge(new Date(datesset[1],datesset[1],datesset[0],0,0,0)) + " Years old";
		idc("description").value = result.bio;
    },
    function (error) {
        console.log("Failed: " + error);
    });
	facebookConnectPlugin.api("/" + fbId + "/picture", ["public_profile"],
		function (result) {
			console.log("profile picture");
		   console.log(result);
		},
		function (error) {
			console.log("Failed: " + error);
		}
	 );
	
	idc("plus-icon-blue").addEventListener("click", function() {
		getPhotos();
	}
}
function getPhotos() {
			console.log("all pictures");
	facebookConnectPlugin.api("/" + fbId + "/photos", ["public_profile"],
		function (result) {
		   console.log(result);
		},
		function (error) {
			console.log("Failed: " + error);
		}
	 );
}
// COMMON FUCTIONS 
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
function idc(chosenid) {
	return document.getElementById(chosenid);
}
function calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
