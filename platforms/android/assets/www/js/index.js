
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
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
        
        var minage = window.localStorage.getItem("minage");
        var maxage = window.localStorage.getItem("maxage");
        
        if(minage === null || minage.length === 0) {
                    window.localStorage.setItem("minage", 18);
        }
        if(maxage === null || maxage.length === 0) {
                    window.localStorage.setItem("maxage", 24);
        }
        
        resize();
        socket = io.connect("http://www.divinitycomputing.com:3000");
        
        assignSockets();
        
        usersProcessed = window.openDatabase("user", "1.0", "Users processed", 1000000);
        var regs = window.localStorage.getItem("registered");
        fbId = window.localStorage.getItem("fbid");
        ajaxGet(
            'js/interests-1.json', 
            function (response) {
                interestJSON = JSON.parse(response);
        });
        if(regs == "active" && fbId.length != 0) {
            var datapersonal = window.localStorage.getItem("data");
            if(datapersonal === null || datapersonal === 0) {
                ajaxPost(
                    "http://www.divinitycomputing.com/apps/beoples/fbviewprofile.php", 
                    function (response) {
                        window.localStorage.setItem("data",response);
                        datapersonal = response;
                },
               'factualid=' + fbId);
            }
            
            personalJSON = JSON.parse(datapersonal);
            
            mainScreen();
            
        }
        else {
            var tlaa = new TimelineMax();
                tlaa.set(document.getElementById("pagewrap"), {display:"block"})
                .fromTo(document.getElementById("pagewrap"), 1, {y:"100%"}, {y:"0%",ease: Circ.easeOut});
            
            document.getElementById("fblog").style.display = "block";
            document.getElementById("fblog").addEventListener("click", function() {
                app.fblogin();
            });
            facebookConnectPlugin.getLoginStatus(function(response) {
              if (response.status === 'connected') {
                app.fblogin();
                var uid = response.authResponse.userID;
                var accessToken = response.authResponse.accessToken;
              }
              else if (response.status === 'not_authorized') {
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
                    if(response == "yes") {
                        ajaxPost(
                        "http://www.divinitycomputing.com/apps/beoples/fbviewprofile.php", 
                        function (response) {
                                var foundjson = JSON.parse(response);
                                window.localStorage.setItem("data",response);
                                window.localStorage.setItem("registered", "active");
                                window.localStorage.setItem("fbid", fbId);
                                personalJSON = foundjson;
                                mainScreen();
                        },
                       'factualid=' + fbId);
                        
                    }
                    else if(response == "no") {
                        registerGetInfo();
                    }
                    else {
                        alert(response);
                    }
                },
               'fbid=' + fullJSON.authResponse.userID);
                
			}

			facebookConnectPlugin.login(["public_profile", "user_birthday","user_photos","user_hometown","user_likes","user_work_history","user_location","user_about_me","user_actions.books","user_actions.news","user_likes","user_actions.fitness","user_actions.music","user_actions.video"],
				fbLoginSuccess,
				function (error) { console.warn("" + error) }
			);
	}
};
            function onPause() {
                 socket.emit('offapp', userId, function(data) {
                    if(data == "logged in") {
                        loggedintochat = false;
                    }
                    else {
                        logontochat(1);
                    }
                });
            }
            function onResume() {
                socket = io.connect("http://www.divinitycomputing.com:3000");
                assignSockets();
                 socket.emit('onapp', userId, function(data) {
                    if(data == "logged in") {
                        console.log("logged in");
                        loggedintochat = true;
                    }
                     else {
                        loggedintochat = true;
                        logontochat();
                     }
                });
            }
            function showMainScreen() {
                var tlaa = new TimelineMax();
                    tlaa
                    .fromTo(document.getElementById("pagewrap"), 0.5, {y:"0%"}, {y:"110%",ease: Circ.easeOut})
                        .set(document.getElementById("pagewrap"), {display:"block"})
                    .fromTo(document.getElementsByClassName("rocketLoader")[0], 1.5, {x:"0%"}, {x:"100%",ease: Circ.easeOut},2)
                    .fromTo(document.getElementById("pagewrap"), 0.5, {y:"-30%"}, {y:"0%",ease: Circ.easeOut})
                    .fromTo(document.getElementById("pagewrap"), 0.5, {scale:1.1}, {y:0,scale:1,ease: Circ.easeOut},"-=0.3")
                    .set(document.getElementsByClassName("rocketLoader")[0], {display:"none"});
            }
            function assignSockets () {
                socket.on('missed login', function(data,callback){
                    logontochat();
                });
                socket.on('receive message', function(data,callback){
                    var datajson = JSON.parse(data);
                    var arc = document.getElementById("messagesarchive").getAttribute("messagerid");
                    if(arc == datajson["toid"]) {
                        setupMessage(0, datajson["profileImage"], datajson["message"], timeSince(toDateTime(datajson["time"])));
                        updateScroll();
                    }
                    else {
                        setupMessage(1, datajson["profileImage"], datajson["message"], timeSince(new Date(datajson["time"])));
                    }
                });
                socket.on('match found', function(data,callback){
                    var datajson = JSON.parse(data);
                    
                    if(datajson["sentid"] == userId) {
                        document.getElementsByClassName("match")[0].getElementsByTagName("h2")[1].innerHTML = datajson["sentname"];
                        document.getElementsByClassName("match")[0].getElementsByTagName("img")[0].src = datajson["sentimage"];
                    }
                    else {
                        document.getElementsByClassName("match")[0].getElementsByTagName("h2")[1].innerHTML = datajson["toname"];
                        document.getElementsByClassName("match")[0].getElementsByTagName("img")[0].src = datajson["toimage"];
                    }
                    
                    var tl = new TimelineMax();

                     tl.set(document.getElementsByClassName("match")[0], {display:"block"})
                       .fromTo(document.getElementsByClassName("match")[0], 0.5,{opacity:0}, {opacity:1, ease:Circ.easeOut})
                       .fromTo(document.getElementsByClassName("match")[0].getElementsByTagName("h2")[0], 0.5,{x:"-100%"}, {x:"0%", ease: Back.easeOut.config(1.7)}, "-=0.2")
                       .fromTo(document.getElementsByClassName("match")[0].getElementsByTagName("img")[0], 0.5,{scale:"0",rotation:0}, {rotation:360,scale:"1", ease: Back.easeOut.config(1.7)}, "-=0.2")
                       .fromTo(document.getElementsByClassName("match")[0].getElementsByTagName("h2")[1], 0.5,{x:"100%"}, {x:"0%", ease: Back.easeOut.config(1.7)}, "-=0.2");
                });
            }
            function resize() {
                var w = document.documentElement.clientWidth;
                var styleSheet = document.styleSheets[0];
                // x = scaling factor
                var x = 0.01; 
                var rem;
                    rem = x * w;
                document.documentElement.style.fontSize = rem + 'px';
            }
var fullJSON;
var socket;
var interestJSON;
var mainTypeInterest ;
var profileJSON;
var personalJSON;
var push;
var fbId;    

var messageCount = 0;
	
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
		
			facebookConnectPlugin.api(fbId, ["public_profile","user_birthday","user_photos","user_hometown","user_likes","user_work_history","user_location","user_about_me","user_actions.books","user_actions.news","user_likes","user_actions.fitness","user_actions.music","user_actions.video"],
			function (result) {
				profileJSON = result;
			   idc("mainDetails").getElementsByTagName("h2")[0].innerHTML = profileJSON.first_name;
				var datesset = result.birthday.split('/');
				idc("description").value = profileJSON.bio;
                idc("description").setAttribute("textdet", profileJSON.bio);
                if(idc("description").value == "undefined") {
                    idc("description").value = "";
                idc("description").setAttribute("textdet", "");
            }
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

var loggedintochat = false;
var userId;

var registrationPush;
function logontochat(numify) {
     ajaxPost(
        "http://www.divinitycomputing.com/apps/beoples/getid.php", 
        function (responsedata) {
        if(responsedata != "no id") {
            userId = responsedata;
            push = PushNotification.init({ "android": {"senderID": "355324533451"},
         "ios": {"alert": "true", "badge": "true", "sound": "true"}, "windows": {} } );

            push.on('notification', function(data) {
                // data.message,
                // data.title,
                // data.count,
                // data.sound,
                // data.image,
                // data.additionalData
            });

            push.on('error', function(e) {
                // e.message
                alert(e.message);
            });
            
             push.on('registration', function(data) {
                 registrationPush = data.registrationId;
                 ajaxPost(
                "http://www.divinitycomputing.com/apps/beoples/setpush.php", 
                function (response) {
                         socket.emit('user login absea', '{"id":"' + userId + '","pushid":"' + registrationPush + '","device":"' + device.platform + '"}',
                        function(data) {
                            if(data == "user logged in") {
                                console.log("logged in");
                                loggedintochat = true;
                                if(numify == 1) {
                                    onPause();
                                }
                            }
                            else if(data == "already exists") {
                                loggedintochat = true;
                            }
                            else {
                                loggedintochat = false;
                            }
                        });
                 
                },
                'id=' + userId + "&pushnote=" + registrationPush + "&device=" + device.platform);
             });
        }
        else {
            alert(responsedata);
        }
    },
    'factualid=' + fbId );
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
        for(i = 0;i <interestJSON[intereststypes[mainTypeInterest]].length;i++)  {
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
    
    logontochat(0);
    showMainScreen();
    setTimeout(function(){ 
    searchProfile(); }, 4000);
}
var userDef = false;
function searchProfile() {
    userDef = false;
    TweenMax.to(document.getElementById("viewprofile"), 0.5, {x:"100%",onComplete:function() {
        TweenMax.set(document.getElementById("seachUserLoader").children,  {scale:"0",transformOrigin:"50% 100%", onComplete:function() {
                TweenMax.set(document.getElementById("viewprofile"), {display: "none"});
                TweenMax.set(document.getElementById("seachUserLoader"), {display: "block",x:"0%"});
                var searchAnimation = new TimelineMax({onComplete:function () {
                    if(userDef == true) {
                        var tlaa = new TimelineMax();
                            tlaa.set(document.getElementById("viewprofile"), {display:"block"})
                            .fromTo(document.getElementById("seachUserLoader"), 1, {x:"0%"}, {x:"-100%", ease: Power2.easeOut},0.5)
                            .fromTo(document.getElementById("viewprofile"), 1, {x:"100%"}, {x:"0%",ease: Circ.easeOut})
                            .fromTo(document.getElementById("viewprofile").lastChild, 1, {x:"100%"}, {x:"0%",ease: Circ.easeOut})
                            .set(document.getElementById("seachUserLoader"), {display:"none"});
                    }
                    else {
                        TweenLite.fromTo(document.getElementById("seachUserLoader").children, 1, {scale:"1"}, {scale:"0",ease: Back.easeIn.config(1.7), onComplete:function() {
                            searchAnimation.restart();
                        }});
                    }
                }});
                    searchAnimation.staggerFromTo(document.getElementById("seachUserLoader").children, 0.5, {scale:"0"}, {scale:"1",ease: Back.easeOut.config(1.7)},0.3);
            }});
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
    } });
}
function getUsersBaseOnLocation(longitude,latitude) {
    if(!window.localStorage.getItem("distance")) {
        window.localStorage.setItem("distance", "50");
    }
    document.getElementById("viewprofile").innerHTML = "";
    var distance = window.localStorage.getItem("distance");
    ajaxPost(
        "http://www.divinitycomputing.com/apps/beoples/locationfinder.php", 
        function (response) {
        if(response == "no results") {
            userDef = true;
            document.getElementById("viewprofile").innerHTML = "<div onclick='searchProfile()'><h2 class='none'>We can't find anyone</h2><button class='none' >Try Again</button><div class='none' ></div><img class='bigguy' src='img/astro/main.png' /></div>";
        }
        else {
            
            dataFromLocation = JSON.parse(response);
            transformUserData();
        }
    },
    'genid=' + userId + '&distance=' + distance + '&longitude=' + longitude + '&latitude=' + latitude + '&young=' + window.localStorage.getItem("minage") + '&old=' + window.localStorage.getItem("maxage") + '&gender=' + window.localStorage.getItem("genderlook") + '&owngender=' + personalJSON.personalData.gender + '&ownage=' + personalJSON.personalData.age);
}
var dataFromLocation;
var usersProcessed;

function transformUserData() {
    if(dataFromLocation.userprofiles.length != 0) {
        ajaxGet(
            'screens/viewprofile.html', 
            function (response) {
                document.getElementById("viewprofile").innerHTML += response;
                ajaxPost(
                    "http://www.divinitycomputing.com/apps/beoples/viewprofile.php", 
                    function (viewprofilebb) {
                    if(response == "no id") {
                    }
                    else {
                        userDef = true;
                        setdataViewprofile(JSON.parse(viewprofilebb));
                        
                        if(dataFromLocation.userprofiles.length != 0) {
                                ajaxGet(
                                'screens/viewprofile.html', 
                                function (viewprofilehtml) {
                                    document.getElementById("viewprofile").innerHTML += viewprofilehtml;
                                    ajaxPost(
                                        "http://www.divinitycomputing.com/apps/beoples/viewprofile.php", 
                                        function (viewprofilesec) {
                                        if(response == "no id") {
                                        }
                                        else {
                                            setdataViewprofile(JSON.parse(viewprofilesec));
                                        }
                                    },
                                    'factualid=' + dataFromLocation.userprofiles[0].id );
                            });
                        }
                    }
                },
                'factualid=' + dataFromLocation.userprofiles[0].id );
        });
    }
}
function setdataViewprofile(data) {
    var viewprofile = document.getElementById("viewprofile").lastChild;
    viewprofile.setAttribute("idset", dataFromLocation.userprofiles[0].id);
    viewprofile.setAttribute("imagelink", data.personalData.profileImage);
    viewprofile.getElementsByClassName("profileIcon")[0].className = "profileIcon noplus profileimage" + dataFromLocation.userprofiles[0].id;
    var aa = document.createElement("style");
    aa.type = 'text/css';
    aa.appendChild(document.createTextNode(".profileimage" + dataFromLocation.userprofiles[0].id +"  { background-image:url('" +    data.personalData.profileImage + "'); }"));
    viewprofile.getElementsByClassName("profileIcon")[0].appendChild(aa);

    viewprofile.getElementsByClassName("mainDetails")[0].children[0].innerHTML = data.personalData.firstname;
    viewprofile.getElementsByClassName("mainDetails")[0].children[1].innerHTML = data.personalData.age + " yr old";
    if( dataFromLocation.userprofiles[0].distance_in_km < 1) {
        viewprofile.getElementsByClassName("mainDetails")[0].children[2].innerHTML =  "Less than a km";
    }
    else {
        viewprofile.getElementsByClassName("mainDetails")[0].children[2].innerHTML = Math.ceil(dataFromLocation.userprofiles[0].distance_in_km) + " km";
    }
    viewprofile.getElementsByClassName("profilemain")[0].getElementsByTagName("p")[0].innerHTML = data.personalData.description;
    
    var maininterests = viewprofile.getElementsByClassName("interests")[0];
    for(i = 0; i < intereststypes.length;i++) {
        if(personalJSON.interests[intereststypes[i]].length != 0) {
            maininterests.innerHTML = "<div class='imageint'><img src='img/icons/" + intereststypes[i] +".png'></div>" + maininterests.innerHTML;
        }
    }
    if(maininterests.children.length == 0) {
        maininterests.innerHTML = "<h3>No interests</h3>";
    }
    
    viewprofile.getElementsByClassName("whiteback")[0].getElementsByClassName("questionview")[0].innerHTML =  interestJSON.question[parseInt(data.personalData.question)].name;
    viewprofile.getElementsByClassName("whiteback")[0].getElementsByTagName("h4")[0].innerHTML =  data.personalData.answer;
    
    dataFromLocation.userprofiles.splice(0, 1);
    TweenLite.set(viewprofile, {x:"100%"});
}
function appliedUser(type, element) {
    ajaxPost(
        "http://www.divinitycomputing.com/apps/beoples/acceptedusers.php", 
        function (response) {
        if(response == "success" || response == "match") {
            if(response == "match") {
                var viewprofile = document.getElementById("viewprofile").lastChild;
                var sendJSON = '{"sentid":"' + userId +'", "toid":"' + viewprofile.getAttribute("idset") + '", "sentname":"' + personalJSON["personalData"]["firstname"] + '", "toname":"' + viewprofile.getElementsByClassName("mainDetails")[0].children[0].innerHTML + '", "toimage":"' + viewprofile.getAttribute("imagelink") + '", "sentimage":"' + personalJSON["personalData"]["profileImage"] + '"}';

                socket.emit('check match', sendJSON, function(data) {
                        nextProfileView(element);
                });
            }
            else {
                nextProfileView(element);
            }
        } 
        else {
            alert(response);
        }
    },
    'acceptedstate=' + type + '&yourid=' + userId + '&touserid=' + element.getAttribute("idset") );
}

function nextProfileView(element) {
    var tl = new TimelineMax();
    tl.fromTo(element, 1, {x:"0%"}, {x:"-100%",ease: Circ.easeOut,onComplete:function() {
        element.parentNode.removeChild(element);
        if( element.parentNode.children.length == 1) {
            var tl2 = new TimelineMax();
                tl2.fromTo(document.getElementById("viewprofile").lastChild, 1, {x:"100%"}, {x:"0%",ease: Circ.easeOut});
            if(dataFromLocation.userprofiles.length != 0) {
                ajaxGet(
                    'screens/viewprofile.html', 
                    function (response) {
                        document.getElementById("viewprofile").innerHTML += response;
                        ajaxPost(
                            "http://www.divinitycomputing.com/apps/beoples/viewprofile.php", 
                            function (response) {
                            if(response == "no id") {
                            }
                            else {
                                setdataViewprofile(JSON.parse(response));
                            }
                        },
                        'factualid=' + dataFromLocation.userprofiles[0].id );
                });
            }
        }
        else {
            searchProfile();
        }
    }});
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
        window.localStorage.setItem("genderlook", "0");
    }
    else if(genderobjs[1].className == "gender active") {
        window.localStorage.setItem("genderlook", "1");
    }
    else {
        window.localStorage.setItem("genderlook", "-1");
    }
}

function setupMessage(messageType, imageurl, message,time) {
    var messagemain = document.createElement("div");
    var messageimage = document.createElement("img");
    var messagesent = document.createElement("p");
    var messagetime = document.createElement("p");
    if(messageType == 0) {
        messagemain.className = "sentfromuser";
        messagemain.appendChild(messagesent);
        messagemain.appendChild(messageimage);
    }
    else {
        messagemain.className = "senttouser";
        messagemain.appendChild(messageimage);
        messagemain.appendChild(messagesent);
    }
    messageimage.src = imageurl;

    messagesent.innerHTML = message;
    messagetime.innerHTML = time;
    messagemain.appendChild(messagetime);
    document.getElementById("messagesarchive").appendChild(messagemain);
}

function sendMessagetouser() {
    var d = new Date();
     var sendJSON = '{"sentid":"' + userId +'", "toid":"' + document.getElementById("messagesarchive").getAttribute("messagerid") +'", "message":"' + document.getElementById("messagesender").value +'","profileName":"' + personalJSON["personalData"]["firstname"] + '","profileimage":"' + personalJSON["personalData"]["profileImage"] + '","time":"' + d.getTime() +'"}';
    
    ajaxPost(
        "http://www.divinitycomputing.com/apps/beoples/savemessage.php", 
        function (response) {
        if(response == "saved") {
            document.getElementById("messagesender").value = "";
            socket.emit('grant message', sendJSON, function(data) {
                if(data == "messageSent") {
                    console.log("message in");
                }
                else {
                    alert(data);
                }
            });
        }
        else {
           alert(response);
        }
    },
    'factualid=' + userId + '&toid=' + document.getElementById("messagesarchive").getAttribute("messagerid") + '&message=' + document.getElementById("messagesender").value);
}
function openMenu(ele) {
    var tl = new TimelineMax();
    if(idc("menu").style.display == "none") {
        tl.set(idc("menu"), {display:"block"})
        .fromTo(ele.children[0], 1, {rotation:"0deg",marginTop:"0%"}, {marginTop:"33%",rotation:"45deg",ease: Circ.easeOut},0)
        .fromTo(ele.children[1], 1, {opacity:"1"}, {opacity:"0",ease: Circ.easeOut},0)
        .fromTo(ele.children[2], 1, {rotation:"0deg",marginTop:"0%"}, {marginTop:"-33%",rotation:"-45deg",ease: Circ.easeOut},0)
        .fromTo(idc("menu"), 1, {x:"100%"}, {x:"0%",ease: Circ.easeOut},0);
    }
    else {
        tl.fromTo(idc("menu"), 1, {x:"0%"}, {x:"100%",ease: Circ.easeOut})
        .fromTo(ele.children[0], 1, {marginTop:"33%",rotation:"45deg"}, {marginTop:"0%",rotation:"0deg",ease: Circ.easeOut},0)
        .fromTo(ele.children[1], 1, {opacity:"0"}, {opacity:"1",ease: Circ.easeOut},0)
        .fromTo(ele.children[2], 1, {marginTop:"-33%",rotation:"-45deg"}, {marginTop:"0%",rotation:"0deg",ease: Circ.easeOut},0)
            .set(idc("menu"), {display:"none"})
    }
}
var upperagelimit;
var loweragelimit;
function openSubMenu(idof) {
    openMenu(idc("mainmenuclick"));
    var picky = idc(idof);
    var tl = new TimelineMax();
    if(picky.style.display == "none") {
        tl.set(picky, {display:"block"})
        .set(idc("backButton"), {display:"block"})
        .to(document.getElementsByClassName("submenu"), 1, {x:"100%",ease: Circ.easeOut})
        .fromTo(idc("backButton"), 1, {opacity:0}, {opacity:1,ease: Circ.easeOut},1)
        .fromTo(picky, 1, {x:"100%"}, {x:"0%",ease: Circ.easeOut},1);
    }
    else {
        tl.fromTo(picky, 1, {x:"0%"}, {x:"100%",ease: Circ.easeOut})
            .set(picky, {display:"none"});
    }
    if(idof == "picky") {
        startXPositions();
    }
}
function closeSubMenu() {
    var tl = new TimelineMax();
        tl.to(document.getElementsByClassName("submenu"), 1, {x:"100%",ease: Circ.easeOut})
        .fromTo(idc("backButton"), 1, {opacity:1}, {opacity:0,ease: Circ.easeOut},0.5)
        .set(idc("backButton"), {display:"none"});
}
function startXPositions() {
     var genderobjs = document.getElementsByClassName("gender");
    
    if(window.localStorage.getItem("genderlook") == 0) {
        genderobjs[0].className == "gender active";
    }
    else if(window.localStorage.getItem("genderlook") == 1) {
        genderobjs[1].className == "gender active";
    
    }
    else if(window.localStorage.getItem("genderlook") == 2) {
        genderobjs[0].className == "gender active";
        genderobjs[1].className == "gender active";
    }
     new Dragdealer('distanceslider', {
          animationCallback: function(x, y) {
              document.getElementById("kilometres").innerHTML = "Within "+ Math.round(x * 100) +" kilometres";
              window.localStorage.setItem("distance", Math.round(x * 100));
          },
        x: (parseInt(window.localStorage.getItem("distance")) * 0.01)
    });
    document.getElementById("smallslider").children[0].ontouchmove  = function(e) {
    e.preventDefault();
                    var width = document.documentElement["clientWidth"];
                    var elewidth = this.offsetWidth;
                    var touch = e.touches[0];
                    var posX = touch.pageX;
                    var trueleft = ((posX - (width *0.05)) - (elewidth / 2) );

                    if(trueleft < 0 - (elewidth / 2)) {
                       trueleft = 0 - (elewidth / 2);
                    }
                    else if(trueleft > width *0.9) {
                        trueleft = width *0.9;
                    }

                    this.setAttribute("x", trueleft);
                    this.style.left = trueleft + "px";
                    if(trueleft < document.getElementById("smallslider").children[1].getAttribute("x")) {
                        document.getElementById("barbetween").style.left = (trueleft) + "px";
                        document.getElementById("barbetween").style.width = Math.abs((trueleft - document.getElementById("smallslider").children[1].getAttribute("x")) - (elewidth / 2)) + "px";
                        this.className = "bluehandle ";
                        document.getElementById("smallslider").children[1].className = "bluehandle big";

                        upperagelimit = Math.floor((16 +  ((document.getElementById("smallslider").children[1].getAttribute("x") / (width *0.9) * 86))));
                        loweragelimit = Math.floor((16 + ((trueleft / (width *0.9)) * 86)));
                        if(loweragelimit < 16) 
                            loweragelimit = 16;
                        if(upperagelimit < 16) 
                            upperagelimit = 16;
                        document.getElementById("ages").innerHTML = "Between " + loweragelimit + " and " + upperagelimit;
                    }
                    else {
                        document.getElementById("barbetween").style.left = (document.getElementById("smallslider").children[1].getAttribute("x")) + "px";
                        document.getElementById("barbetween").style.width = Math.abs((trueleft - document.getElementById("smallslider").children[1].getAttribute("x")) + (elewidth / 2)) + "px";
                        this.className = "bluehandle big";
                        document.getElementById("smallslider").children[1].className = "bluehandle ";

                        loweragelimit = Math.floor((16 +  ((document.getElementById("smallslider").children[1].getAttribute("x") / (width *0.9) * 86))));
                        upperagelimit = Math.floor((16 + ((trueleft / (width *0.9)) * 86)));
                        if(loweragelimit < 16) 
                            loweragelimit = 16;
                        if(upperagelimit < 16) 
                            upperagelimit = 16;
                        document.getElementById("ages").innerHTML = "Between " + loweragelimit + " and " + upperagelimit;
                    }
                    window.localStorage.setItem("minage", loweragelimit);
                    window.localStorage.setItem("maxage", upperagelimit);
                };
                document.getElementById("smallslider").children[1].ontouchmove  = function(e) {
                    e.preventDefault();
                    var  width = document.documentElement["clientWidth"];
                    var elewidth = this.offsetWidth;
                    var touch = e.touches[0];
                    var posX = touch.pageX;
                    var trueleft = ((posX - (width *0.05)) - (elewidth / 2) );
                    if(trueleft < 0 - (elewidth / 2)) {
                       trueleft =0- (elewidth / 2);
                    }
                    else if(trueleft > (width *0.9) - (elewidth / 2)) {
                        trueleft = (width *0.9) - (elewidth / 2);
                    }
                    this.setAttribute("x", trueleft);

                    this.style.left = trueleft + "px";
                    if(trueleft < document.getElementById("smallslider").children[0].getAttribute("x")) {
                        document.getElementById("barbetween").style.left = (trueleft) + "px";
                        document.getElementById("barbetween").style.width = Math.abs((trueleft - document.getElementById("smallslider").children[0].getAttribute("x")) - (elewidth / 2)) + "px";
                        this.className = "bluehandle ";
                        document.getElementById("smallslider").children[0].className = "bluehandle big";
                        upperagelimit = Math.floor((16 +  ((document.getElementById("smallslider").children[0].getAttribute("x") / (width *0.9) * 86))));
                        loweragelimit = Math.floor((16 + ((trueleft / (width *0.9)) * 86)));
                        if(loweragelimit < 16) 
                            loweragelimit = 16;
                        if(upperagelimit < 16) 
                            upperagelimit = 16;
                        document.getElementById("ages").innerHTML = "Between " + loweragelimit + " and " + upperagelimit;
                    }
                    else {
                        document.getElementById("barbetween").style.left = ( document.getElementById("smallslider").children[0].getAttribute("x")) + "px";
                        document.getElementById("barbetween").style.width = Math.abs((trueleft - document.getElementById("smallslider").children[0].getAttribute("x")) + (elewidth / 2)) + "px";
                        this.className = "bluehandle big";
                        document.getElementById("smallslider").children[0].className = "bluehandle ";
                        loweragelimit = Math.floor((16 +  ((document.getElementById("smallslider").children[0].getAttribute("x") / (width *0.9) * 86))));
                        upperagelimit = Math.floor((16 + ((trueleft / (width *0.9)) * 86)));
                        if(loweragelimit < 16) 
                            loweragelimit = 16;
                        if(upperagelimit < 16) 
                            upperagelimit = 16;
                        document.getElementById("ages").innerHTML = "Between " + loweragelimit + " and " + upperagelimit;
                    }
                    window.localStorage.setItem("minage", loweragelimit);
                    window.localStorage.setItem("maxage", upperagelimit);
                };
    
    var width = document.documentElement["clientWidth"];
    var aas = document.getElementById("smallslider").children[1].offsetWidth;
    var elewidth = width * 0.9; 
    loweragelimit = window.localStorage.getItem("minage");
    upperagelimit = window.localStorage.getItem("maxage");
    var onewidth = (elewidth / 100) * (loweragelimit - 16);
    var twowidth = (elewidth / 100) * (upperagelimit - 16);
    document.getElementById("smallslider").children[0].setAttribute("x",onewidth);
    document.getElementById("smallslider").children[1].setAttribute("x",twowidth);

    document.getElementById("smallslider").children[0].style.left = onewidth + "px";
    document.getElementById("smallslider").children[1].style.left = twowidth + "px";

    document.getElementById("barbetween").style.left = onewidth + "px";
    document.getElementById("barbetween").style.width = ((twowidth - onewidth) + (aas / 2)) + "px";

    document.getElementById("ages").innerHTML = "Between " + loweragelimit + " and " + upperagelimit;
}

var acceptedids;
function messageToRecieve() {
    var myNode = document.getElementById("mainMessagesContainer");
    
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}
    
    var tl = new TimelineMax();
        tl.set(document.getElementById("messages"), {display:"block"})
        .to(document.getElementById("messages"), 1, {x:"0%",ease: Circ.easeOut})
        .fromTo(document.getElementById("messangerLoader"), 1, {display:"block",opacity:0},{opacity:1,ease: Circ.easeOut},"-=0.5");
    ajaxPost(
        "http://www.divinitycomputing.com/apps/beoples/retrieveusermatches.php", 
        function (response) {
            var jof = JSON.parse(response);
            if(jof.length != 0) {
            for(i = 0; i < jof.length;i++) (function(i){ 
                
                var datajson = JSON.parse(jof[i]["data"]);
                var contactcreate = document.createElement("div");
                var contactimage = document.createElement("img");
                var contactname = document.createElement("h2");
                var contactmessage = document.createElement("h3");
                var contacttime = document.createElement("p");
                contactimage.className = "divImage";
                contactimage.src = datajson["personalData"]["profileImage"];
                otherUserImageSrc = datajson["personalData"]["profileImage"];
                contactname.innerHTML = datajson["personalData"]["firstname"];
                if(jof[i]["mess"]){
                    contactmessage.innerHTML = jof[i]["mess"].substring(0, 100);
                    contacttime.innerHTML = timeSince(new Date(jof[i]["time"]));
                }
                else {
                    contactmessage.innerHTML = "no recent messages";
                }
                
                contactcreate.setAttribute("otheruserimage", datajson["personalData"]["profileImage"]);
                contactcreate.setAttribute("otherfirstname", datajson["personalData"]["firstname"]);
                contactcreate.setAttribute("messagerid", jof[i]["id"]);
                contactcreate.appendChild(contactimage);
                contactcreate.appendChild(contactname);
                contactcreate.appendChild(contactmessage);
                contactcreate.appendChild(contacttime);
                contactcreate.onclick = function() {
                    getLastMessages(contactcreate);
                }
                document.getElementById("mainMessagesContainer").insertBefore(contactcreate, document.getElementById("mainMessagesContainer").childNodes[0]);
                
               })(i);
            }
            else {
            }
            
            var tl = new TimelineMax();
                tl.fromTo(document.getElementById("messangerLoader"), 1, {opacity:1},{opacity:0,ease:Circ.easeIn})
                .set(document.getElementById("messangerLoader"), {display:"none"})
                .staggerFromTo(document.getElementById("mainMessagesContainer"), 0.4, {x:"100%"}, {x:"0%",ease: Circ.easeOut},0.3);
    },
    'idfound=' + userId );
}
function timeSince(date) {

    var seconds = Math.floor(((new Date().getTime()/1000) - (date.getTime()/1000) )),
    interval = Math.floor(seconds / 31536000);

    if (interval > 1) return interval + " years ago";

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + " days ago";

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hours ago";

    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + " minutes ago";

    return Math.floor(seconds) + " seconds ago";
}
function toDateTime(secs) {
    var t = new Date(1970,0,1);
    t.setSeconds(secs);
    return t;
}
function getLastMessages(mainuserofchat) {
	var myNode = document.getElementById("messagesarchive");
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}
    var idcheck = mainuserofchat.getAttribute("messagerid");
    document.getElementById("messagesarchive").setAttribute("messagerid",idcheck);
    document.getElementById("messangername").innerHTML = mainuserofchat.getAttribute("otherfirstname");
    var tl = new TimelineMax();
        tl.set(document.getElementById("activeMessages"), {display:"block"})
            .fromTo(document.getElementById("activeMessages"), 1,{x:"100%"}, {x:"0%",ease: Circ.easeOut})
            .fromTo(document.getElementById("mainMessages"), 1,{x:"0%"}, {x:"-100%",ease: Circ.easeOut, onComplete:function() {
            document.getElementById("activeMessages").style.display = "block";
        }},0)
        .fromTo(document.getElementById("messangerLoader"), 1, {display:"block",opacity:0},{opacity:1,ease: Circ.easeOut},"-=0.5");
        document.getElementById("activeMessages").setAttribute("yourid", userId);
        ajaxPost(
            "http://www.divinitycomputing.com/apps/beoples/getmessages.php", 
            function (messagereturn) {
                if(messagereturn != "no messages") {
                    var messagesinfo = JSON.parse(messagereturn);
                    for(i = 0; i < messagesinfo["rmeg"].length;i++) {

                        if(messagesinfo["rmeg"][i].fromuser == userId) {
                           setupMessage(0, personalJSON["personalData"]["profileImage"], messagesinfo["rmeg"][i]["messagesync"], timeSince(new Date(messagesinfo["rmeg"][i]["time"])));
                        }
                        else {
                            setupMessage(1, mainuserofchat.getAttribute("otheruserimage"), messagesinfo["rmeg"][i]["messagesync"], timeSince(new Date(messagesinfo["rmeg"][i]["time"])));
                        }

                    }
                    updateScroll();
                }
                var lastMessageCheck = new TimelineMax();
                    lastMessageCheck.fromTo(document.getElementById("messangerLoader"), 1, {opacity:1},{opacity:0,ease: Circ.easeIn})
                    .set(document.getElementById("messangerLoader"), {display:"none"});
        },
            'secondaryid=' + idcheck + "&primeid=" + userId);
}
function updateScroll(){
    var element = document.getElementById("messagesarchive");
    element.scrollTop = element.scrollHeight - element.clientHeight; 
}
function closeMainMessages() {
    var tl = new TimelineMax();
        tl.fromTo(document.getElementById("messages"), 1,{x:"0%"}, {x:"-100%",ease: Circ.easeOut})
        .set(document.getElementById("messages"), {display:"none",x:"100%"});
}
function closeActiveMessages() {
    var tl = new TimelineMax();
        tl.fromTo(document.getElementById("activeMessages"), 1,{x:"0%"}, {x:"-100%",ease: Circ.easeOut})
        .fromTo(document.getElementById("mainMessages"), 1,{x:"100%",y:0}, {x:"0%",ease: Circ.easeOut},0)
        .set(document.getElementById("activeMessages"), {display:"none",x:"100%"})
        .set(document.getElementById("mainMessages"), {display:"block"});
}
function closeMatch(ele) {
    var tlundo = new TimelineMax();

     tlundo.fromTo(document.getElementsByClassName("match")[0].getElementsByTagName("h2")[0], 0.5,{x:"0%"}, {x:"100%", ease: Back.easeIn.config(1.7)}, "-=0.2")
       .fromTo(document.getElementsByClassName("match")[0].getElementsByTagName("img")[0], 0.5,{scale:"1",rotation:360}, {rotation:0,scale:"0", ease: Back.easeIn.config(1.7)}, "-=0.2")
       .fromTo(document.getElementsByClassName("match")[0].getElementsByTagName("h2")[1], 0.5,{x:"0%"}, {x:"-100%", ease: Back.easeIn.config(1.7)}, "-=0.2")
       .fromTo(document.getElementsByClassName("match")[0], 0.5,{opacity:1}, {opacity:0, ease:Circ.easeOut})
     .set(document.getElementsByClassName("match")[0], {display:"none"});
}