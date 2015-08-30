
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
			console.log("you clicked the facebook button");
			app.fblogin();

		});
		facebookConnectPlugin.getLoginStatus(function(response) {
		  if (response.status === 'connected') {
			  app.fblogin();
			var uid = response.authResponse.userID;
			var accessToken = response.authResponse.accessToken;
		  } else if (response.status === 'not_authorized') {
			// the user is logged in to Facebook, 
			// but has not authenticated your app
		  } else {
			// the user isn't logged in to Facebook.
		  }
		 });
    },
	fblogin: function() {
		var fbLoginSuccess = function (userData) {
				fullJSON = userData;
				fbId = fullJSON.authResponse.userID;
				registerGetInfo();
              ajaxGet(
                    'js/interests-1.json', 
                    function (response) {
                        interestJSON = JSON.parse(response);
                });
			}

			facebookConnectPlugin.login(["public_profile", "user_birthday","user_photos","user_hometown","user_likes","user_work_history","user_location","user_about_me","user_actions.books","user_actions.news","user_likes","user_actions.fitness","user_actions.music","user_actions.video"],
				fbLoginSuccess,
				function (error) { console.warn("" + error) }
			);
	}
};

var fullJSON;

var interestJSON;
var mainTypeInterest ;
var profileJSON;

var fbId;

function registerGetInfo() {
	newPage("register.html");
	
	facebookConnectPlugin.api(fbId + "/picture?redirect=false&type=large", ['email', 'public_profile', 'user_friends'],
		function (image) {
			var pp = document.createElement("style");
            pp.type = 'text/css';
            pp.appendChild(document.createTextNode("#profileIcon { background-image:url('" + image.data.url + "'); }"));
			document.getElementById("profileIcon").appendChild(pp);
			document.getElementById("profileIcon").setAttribute("assignedimage", image.data.url);
            document.getElementById("profileIcon").className = "noplus";
		
			facebookConnectPlugin.api(fbId, ["public_profile", "user_birthday","user_photos","user_hometown","user_likes","user_work_history","user_location","user_about_me","user_actions.books","user_actions.news","user_likes","user_actions.fitness","user_actions.music","user_actions.video"],
			function (result) {
				profileJSON = result;
			   idc("mainDetails").getElementsByTagName("h2")[0].innerHTML = profileJSON.first_name;
				var datesset = result.birthday.split('/');
				idc("description").value = profileJSON.bio;
                idc("description").setAttribute("textdet", profileJSON.bio);
			   idc("mainDetails").getElementsByTagName("h3")[0].innerHTML = calculateAge(new Date(datesset[2],datesset[0],datesset[1],0,0,0)) + " Years old";
				
			},
			function (error) {
				console.log("Failed: " + error);
			});
		},
		function (error) {
			console.log("Failed: " + error);
		}
	 );
	
}
function setupProfileicon() {
		photoChosen = document.getElementById("profileIcon");
		getPhotos(fbId);
}
var photoChosen;
function getPhotos(facebookid) {
	facebookConnectPlugin.api(facebookid + "/photos?type=uploaded", ['email', 'public_profile', 'user_friends'],
		function (def) {
			editProfImg = def;
			addPage("findphotos.html" , 0);
			
		},
		function (error) {
			console.log("Failed: " + error);
		}
	 );
}
var ajaxGet = function (url, callback) {
    var callback = (typeof callback == 'function' ? callback : false), xhr = null;
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {
      try {
        ajxhrax = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      }
    }
    if (!xhr)
           return null;
    xhr.open("GET", url,true);
    xhr.onreadystatechange=function() {
      if (xhr.readyState==4 && callback) {
        callback(xhr.responseText)
      }
    }
    xhr.send(null);
    return xhr;
}
// COMMON FUCTIONS 
function newPage(pagename) {
	var myNode = document.getElementById("pagewrap");
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}
    ajaxGet(
        'screens/' + pagename, 
        function (response) {
        document.getElementById("pagewrap").innerHTML = response;
    });
    
}
var editProfImg;
function editprofileImage() {
	var maingallery = document.getElementById("imageGallery");
	document.getElementById("gallery").style.opacity = 1;
	for(i = 0; i < editProfImg.data.length; i++) (function(i){ 
		var imgage = document.createElement("img");
		imgage.style.opacity = 0;
		imgage.onload = function() {
			imgage.style.opacity = 1;
		}
		imgage.addEventListener("click", function() {
			var aa = document.createElement("style");
            aa.type = 'text/css';
            aa.appendChild(document.createTextNode("#profileIcon { background-image:url('" + editProfImg.data[i].source + "'); }"));
			document.getElementById("profileIcon").innerHTML = "";
			document.getElementById("profileIcon").setAttribute("assignedimage", this.url);
			document.getElementById("profileIcon").appendChild(aa);
            document.getElementById("profileIcon").className = "noplus";
            document.getElementById("pagewrap").removeChild(document.getElementById("gallery"));
		});
		imgage.src = editProfImg.data[i].source;
		maingallery.appendChild(imgage);
	})(i);
}
function addPage(pagename,type) {
	var myNode = document.getElementById("pagewrap");
	
    ajaxGet(
        'screens/' + pagename, 
        function (response) {
        
			document.getElementById("pagewrap").innerHTML += response;
			if(type == 0) {
				editprofileImage();
			}
            else if(type == 1) {
                idc("pagewrap").lastChild.style.left = "0%";
            }
            idc("description").value = idc("description").getAttribute("textdet");
    });
}
function idc(chosenid) {
	return document.getElementById(chosenid);
}
function calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
function openeditInterests() {
    addPage("interests.html",1);
}
function backScreen(item) {
    item.style.left = "-100%";
    setTimeout(function(){ 
        document.getElementById("pagewrap").removeChild(item);
    }, 600);
}

function mainInterestCheck(type) {
    if(mainTypeInterest == type) {
        idc("subcats").style.left = "100%";
    }
    else {
        mainTypeInterest = type;
        idc("subcats").style.left = "16%";
        for(i = 0;i <interestJSON[0][mainTypeInterest].length;i++) {
            var container = document.createElement("div");
            var active = document.createElement("button");
            var details = document.createElement("p");
            container.appendChild(active);container.appendChild(details);
            details.innerHTML = interestJSON[0][mainTypeInterest][i];
            idc("subcats").appendChild(container);
        }
    }
}