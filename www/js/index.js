
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
			}

			facebookConnectPlugin.login(["public_profile"],
				fbLoginSuccess,
				function (error) { console.warn("" + error) }
			);

		});
		
    }
};
