
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
        resize();
        usersProcessed = window.openDatabase("user", "1.0", "Users processed", 1000000);
        var regs = window.localStorage.getItem("registered");
        fbId = window.localStorage.getItem("fbid");
        console.log(regs);
        if(regs == "active" && fbId.length != 0) {
            personalJSON = JSON.parse(window.localStorage.getItem("data"));
            mainScreen();
        }
        else {
            document.getElementById("fblog").style.display = "block";
            document.getElementById("fblog").addEventListener("click", function() {
                app.fblogin();
            });
            facebookConnectPlugin.getLoginStatus(function(response) {
              if (response.status === 'connected') {
                  app.fblogin();
                var uid = response.authResponse.userID;
                var accessToken = response.authResponse.accessToken;
              } else if (response.status === 'not_authorized') {
              } else {
                // the user isn't logged in to Facebook.
              }
		 });
        }
		
    },
	fblogin: function() {
		var fbLoginSuccess = function (userData) {
				fullJSON = userData;
				fbId = fullJSON.authResponse.userID;
                ajaxPost(
                    "http://www.divinitycomputing.com/apps/beoples/hasreg.php", 
                    function (response) {
                        console.log("type of login " + response);
                    if(response == "yes") {
                        mainScreen();
                    }
                    else if(response == "no") {
                        registerGetInfo();
                    }
                    else {
                        alert(response);
                    }
                },
               'fbid=' + fullJSON.authResponse.userID);
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
            
            function resize() {
                var w = document.documentElement.clientWidth;
                var h = document.documentElement.clientHeight;
                var styleSheet = document.styleSheets[0];
                // ar = aspect ratio h/w; Replace this with your apps aspect ratio
                var ar = 1.17;
                // x = scaling factor
                var x = 0.01; 
                var rem;
                if (h / w > ar) { // higher than aspect ratio
                    rem = x * w;
                } else { // wider than aspect ratio
                    rem = x * h;
                }
                document.documentElement.style.fontSize = rem + 'px';
            }
var fullJSON;

var interestJSON;
var mainTypeInterest ;
var profileJSON;
var personalJSON;

var fbId;        


function registerGetInfo() {
	newPage("register.html");
	
    usersProcessed.transaction(populateDB, errorCB, successCB);
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
            personalJSON = JSON.parse('{ "personalData": { "firstname":"' + profileJSON.first_name +'","age":"' + calculateAge(new Date(datesset[2],datesset[0],datesset[1],0,0,0)) +'","relationship":"' + profileJSON.relationship_status + '", "description":"' + profileJSON.bio +'","gender":"'+ profileJSON.gender +'","profileImage":"-1","question":"0","answer":"0"  }, "interests": {"music":[],"movies":[],"travel":[],"books":[],"games":[],"crafts":[],"dancing":[],"dining":[],"exercising":[],"artsandculture":[],"sports":[],"technology":[] },"version":0  }');
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
        callback(xhr.responseText);
      }
    }
    xhr.send(null);
    return xhr;
}
var ajaxPost = function (url, callback,data) {
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
    xhr.open("POST", url,true);
    xhr.onreadystatechange=function() {
      if (xhr.readyState==4 && callback) {
        callback(xhr.responseText);
      }
    }
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send(data);
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
			document.getElementById("profileIcon").setAttribute("assignedimage", editProfImg.data[i].source);
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
            idc("answer").value = idc("answer").getAttribute("textdet");
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
    var itemchose = document.getElementById(item);
    itemchose.style.left = "-100%";
    setTimeout(function(){ 
        document.getElementById("pagewrap").removeChild(itemchose);
    }, 600);
}
var intereststypes = ["music","movies","travel","games","books","crafts","dancing","dining","exercising","artsandculture","sports","technology"];
function mainInterestCheck(type) {
    if(mainTypeInterest == type) {
        idc("subcats").style.left = "100%";
        mainTypeInterest = -1;
    }
    else {
        mainTypeInterest = type;
        idc("subcats").style.left = "16%";
        
        var myNode = idc("subcats");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
        for(i = 0;i <interestJSON[intereststypes[mainTypeInterest]].length;i++) {
            var container = document.createElement("div");
            var active = document.createElement("button");
            
            for(b = 0; b < personalJSON.interests[intereststypes[mainTypeInterest]].length; b++) {
                if(i == personalJSON.interests[intereststypes[mainTypeInterest]][b].count) {
                    active.className = "active";
                }
            }
            
            active.setAttribute("counter",i);
            active.onclick = function() {
                if(this.className == "active") {
                    personalJSON.interests[intereststypes[mainTypeInterest]].splice(parseInt(this.getAttribute("counter")),1);
                    this.className = "";
                }
                else {
                    this.className = "active";
                    personalJSON.interests[intereststypes[mainTypeInterest]].push({"count": this.getAttribute("counter") });
                }
            }
            var details = document.createElement("p");
            container.appendChild(active);container.appendChild(details);
            details.innerHTML = interestJSON[intereststypes[mainTypeInterest]][i]["name"];
            idc("subcats").appendChild(container);
        }
    }
}
function assignInterests() {
    var maininterests = document.getElementById("interests");
    
    while (maininterests.children.length != 1 && maininterests.children.length != 0) {
        maininterests.removeChild(maininterests.firstChild);
    }
    for(i = 0; i < intereststypes.length;i++) {
        if(personalJSON.interests[intereststypes[i]].length != 0) {
            maininterests.innerHTML = "<div class='imageint'><img src='img/icons/" + intereststypes[i] +".png'></div>" +maininterests.innerHTML;
        }
    }
}
function register() {
    var img = idc("profileIcon").getAttribute("assignedimage");

    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=img.substr(img.lastIndexOf('/')+1);
    options.mimeType="image/jpeg";

    var params = new Object();
    params.id = fbId;

    options.params = params;
    options.chunkedMode = false;

    var ft = new FileTransfer();
    ft.upload(img, "http://www.divinitycomputing.com/apps/beoples/saveprofilepicture.php", function(responsedata) {
        var responsePicture = JSON.parse(responsedata.response);
        if(responsePicture.success == "success") {
            personalJSON.personalData.profileImage = responsePicture.image.url;
            if(idc("description").value == "undefined") {
                idc("description").value = "";
            }
            personalJSON.personalData.description = idc("description").value;
            personalJSON.personalData.question = idc("question").children[0].value;
            personalJSON.personalData.answer = idc("answer").value;

            ajaxPost(
                "http://www.divinitycomputing.com/apps/beoples/register.php", 
                function (response) {
                if(response == "success") {
                    window.localStorage.setItem("registered", "active");
                    window.localStorage.setItem("genderlook", "2");
                    window.localStorage.setItem("distance", "50");
                    var minage = 30;
                    if(parseInt(personalJSON.personalData.age) - 5 < 16) {
                       minage = 16;
                    }else {
                        minage = personalJSON.personalData.age;
                    }
                    window.localStorage.setItem("minage", minage);
                    window.localStorage.setItem("maxage", parseInt(personalJSON.personalData.age) + 5);
                    window.localStorage.setItem("data", JSON.stringify(personalJSON));
                    window.localStorage.setItem("fbid", fbId);
                    mainScreen();
                }
                else {
                    alert(response);

                }
            },
            'fbid=' + fbId + '&data=' + JSON.stringify(personalJSON));
        }
        else {
            alert(responsedata.response);
        }
    }, function(response) {
        alert(response);
    }, options);
}
function mainScreen() {
    newPage("mainscreen.html");
    searchProfile();
}
function searchProfile() {
    var onSuccess = function(position) {
        getUsersBaseOnLocation(position.coords.longitude,position.coords.latitude);  
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}
function getUsersBaseOnLocation(longitude,latitude) {
    if(!window.localStorage.getItem("distance")) {
        window.localStorage.setItem("distance", "50");
    }
    var distance = window.localStorage.getItem("distance");
    
    ajaxPost(
        "http://www.divinitycomputing.com/apps/beoples/locationfinder.php", 
        function (response) {
        if(response == "no results") {
        }
        else {
            alert(response);
            var data = JSON.parse(response);
        }
    },
    'fbid=' + fbId + '&distance=' + distance + '&longitude=' + longitude + '&latitude=' + latitude);
}
/* Users Details */
var usersProcessed;

function populateDB(tx) {
     tx.executeSql('CREATE TABLE IF NOT EXISTS users (userid,type)');
     tx.executeSql('CREATE TABLE IF NOT EXISTS messages (userid,message,time,sentfrom)');
}
function errorCB(err) {
    alert("Error processing SQL: "+err.code);
}
var activeLocalDB = false;
function successCB() {
    activeLocalDB = true;
}
var genderLookUp = 2;
function genderChange(type) {
    var genderobjs = document.getElementsByClassName("gender");
    
    if(genderobjs[type].className == "gender active") {
        genderobjs[type].className = "gender";
    }
    else {
        genderobjs[type].className = "gender active";
    }
    if(genderobjs[0].className == "gender active" && genderobjs[1].className == "gender active") {
        window.localStorage.setItem("genderlook", "2");
    }
    else if(genderobjs[0].className == "gender active") {
        window.localStorage.setItem("genderlook", "1");
    }
    else {
        window.localStorage.setItem("genderlook", "0");
    }
}
function openMenu(ele) {
    var tl = new TimelineMax();
    if(idc("menu").style.display == "none") {
        tl.set(idc("menu"), {display:"block"})
        .fromTo(ele.children[0], 1, {rotation:"0deg"}, {rotation:"45deg",ease: Circ.easeOut},0.5)
        .fromTo(ele.children[1], 1, {opacity:"1"}, {opacity:"0",ease: Circ.easeOut},0.5)
        .fromTo(ele.children[2], 1, {rotation:"0deg"}, {rotation:"-45deg",ease: Circ.easeOut},0.5)
        .fromTo(idc("menu"), 1, {x:"100%"}, {x:"0%",ease: Circ.easeOut},0.5);
    }
    else {
        tl.fromTo(idc("menu"), 1, {x:"0%"}, {x:"100%",ease: Circ.easeOut})
        .fromTo(ele.children[0], 1, {rotation:"45deg"}, {rotation:"0deg",ease: Circ.easeOut},0.5)
        .fromTo(ele.children[1], 1, {opacity:"0"}, {opacity:"1",ease: Circ.easeOut},0.5)
        .fromTo(ele.children[2], 1, {rotation:"-45degdeg"}, {rotation:"0deg",ease: Circ.easeOut},0.5)
            .set(idc("menu"), {display:"none"})
    }
}