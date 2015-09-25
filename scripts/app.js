/*===============================================================================================================
* Fusion Demo Customer Interactions App
*
*	Purpose:
*		- Mobile App for associates when interacting with Custoemrs
*
*	Dependencies:
*		- Data: Submits via REST api to Appmanagr.net
*		- Libraries: AngularJS 1.2.6, jQuery 1.10.2, jQuery Mobile 1.4.2
*
*	Originally written by: Marshall Grant
* =================================================================================================================*/





/* ---------------------------------------
	Helper Methods
-----------------------------------------*/

// For todays date;
Date.prototype.today = function () {
	return( (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "-" + ((this.getDate() < 10) ? "0" : "") + this.getDate()) + "-" + this.getFullYear();
};

// For the time now
Date.prototype.timeNow = function () {
	return((this.getHours() < 10) ? "0" : "") + ((this.getHours() > 12) ? (this.getHours() - 12) : this.getHours()) + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds() + ((this.getHours() > 12) ? (' PM') : ' AM');
};



/* ----------------------------------------------------
	Defacto Controllers that have some DOM interation
-------------------------------------------------------*/
!function (app, $){

	//run add to home screen prompt
	window.addToHomescreen();


	//MOBILE: scroll past the nav bar to hide
	app.broswerScrollTo = function () {
		return /mobile/i.test(navigator.userAgent) && !location.hash && setTimeout(function () {
			window.scrollTo(0, 1);
		}, 1000);
	};


	//checks to see if you are in a session.  if not you will be redirected to the login screen
	app.loginCheck = function(){
		if(!app.config.loggedin){
			window.location.href = "#login";
		}
	}();


	//Message to show at the top of the page when a save occurs
	app.showSavedMessage = function(display){
		var nowTime = new Date().timeNow(),
			nowDate = new Date().today(),
			message = (display) ? app.config.messages.not_saved : '<p class="alert alert-success">Last saved at '+ nowTime +'</p>';

		$(".saved-message").html(message);
	};


	app.ajaxLoading = function(yes){
		var where = (window.location.hash === "") ? "#login" : window.location.hash,
			what = '<div class="ajax-loading"><img src="http://appmanagr.net/mobile/apps/fusion-henkle/assets/ajax-loader.gif"></div>';

		return (yes) ? $(where).append(what) : $(".ajax-loading").remove();
	};


	/* Show Hide Other Field
	-----------------------------------------*/
	function showHideOther(){
		var option = $("#location option:selected").val(),
			when = Boolean(option === "other");

		$("#whenOther, #whenOtherField").toggleClass('hide', !when);
	}


	/* resets form's UI with context
	-----------------------------------------------*/
	app.resetForm = function(where){
		$("input", where).siblings("label").removeClass("ui-checkbox-on").addClass("ui-checkbox-off");
		$("select", where).siblings('span').html("&nbsp;");
	};


	//resets the interactions report
	function resetReport(){
		app.resetForm("#add");
	}

	function setupApp(){
		$("div.saved-message").html(app.config.messages.not_saved);
	}

	/* Listners
	-----------------------------------------*/
	$(document)
		.on("change", "#location", showHideOther)
		.on("click", "#finish", resetReport)
		.on("ready", setupApp);

}(window.app, window.jQuery);





/* ----------------------------------------------------------------
	App Controller
------------------------------------------------------------------*/

!function (angular, app, $, fusionApp){


	/* App Controller
	----------------------------------------------------*/
	fusionApp.controller("FusionAppController", ["$scope", "$window", "$interval", "apiService", "locStorage", "urlBuilder", "now", "utility", function ($scope, $window, $interval, apiService, locStorage, urlBuilder, now, utility){
		var count = 1, autoSave,
			useSaved = false,
			showOnce = 0,
			config = app.config,
			geo_options = {
				enableHighAccuracy: true,
				maximumAge: 30000,
				timeout: 27000
			};

		$scope.App = {};

		$scope.checkedIn = false;



		if ("geolocation" in navigator) {
			function geo_error() { alert("Sorry, no position available."); }

			navigator.geolocation.getCurrentPosition(function (position){
				var img, address, coords = {lat: position.coords.latitude, lon: position.coords.longitude};
				
				$scope.position = coords;
				
				img = new Image();
				img.src = "http://maps.googleapis.com/maps/api/staticmap?maptype=roadmap&zoom=18&size=900x200&markers=color:red|label:A|"+ coords.lat +","+ coords.lon +"&key="+ app.config.googleKey +"";
				img.style.width = "100%";
				$("#userLocation").html(img);


				$.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+ coords.lat +","+ coords.lon +"&key="+ app.config.googleKey +"" , function(data){
					$scope.checkedInAddress = " Aprox. "+ data.results[0].formatted_address;
				});

			},geo_error, geo_options);
		}
		

		//Demo Controller Array for better formatting
		$scope.demos = [
			{label: "Rubber Hose Demo", value: "Rubber Hose Demo"},
			{label: "Dispenser Demo", value: "Dispenser Demo"},
			{label: "Drip Control Demo", value: "Drip Control Demo"},
			{label: "Strength Test Demo", value: "Strength Test Demo"}
		];

		/* Main App Model Data
		----------------------------------------*/
		$scope.App = {
			title: "Fusion-Henkle",
			//checkin
			staffid: "",
			storeNumber: "",
			demoDate: now.getDate(),
			timeIn: now.getTime(),
			inventory: "",
			price: "",
			demoLocation: "",
			otherLocation: "",
			//checkout
			managerName: "",
			managerReaction: "",
			insights: "",
			pics_of_table: "",
			pics_of_display_demo_start: "",
			pics_of_interaction: "",
			pics_of_display_demo_end: "",
			timeOut: "",
			//client interactions
			interactions: [],
			numberOfInteractions: ""
		};


		//Interaction iteration
		$scope.addInteractions = function(){
			$scope.App.interactions.push({
				type: $scope.type.value,
				familiar: $scope.familiar,
				krazyGlue: $scope.krazyGlue,
				gorillaGlue: $scope.gorillaGlue,
				comments: $scope.comments,
				date: now.getDate(),
				time: now.getTime(),
			});

			$scope.App.numberOfInteractions = $scope.App.interactions.length;

			//resets the form data
			$scope.type = "";
			$scope.familiar = false;
			$scope.krazyGlue = false;
			$scope.gorillaGlue = false;
			$scope.comments = "";

			$scope.saveReport();
		};



		/* sets the checkout time on the checkout hash
		----------------------------------------------------------------*/
		$scope.setCheckOut = function(){
			var time, checkoutCheck;

			if($window.location.hash === "#checkOut"){
				time = now.getTime();
				checkoutCheck = $window.confirm(config.messages.checkout_confirm);
			}

			//make sure its only setting once
			if(count === 1 && Boolean(time) && checkoutCheck === true){
				$scope.App.timeOut = time;
				document.getElementById("timeOut").value = time; //for some reason angular isnt taking the inital binding, but on second click it will, so I have to update it manually.
				count += 1;
			}

			if(checkoutCheck === false){
				$window.location.hash = "#report";
			}
		};


		
		//Checks localstorage to see if the user has a saved report
		$scope.checkStorage = function(){
			var lastVersion, items, i,
				storage = $window.localStorage.fusionHenkle;

			if(storage !== "" && useSaved === false && showOnce === 0){
				useSaved = $window.confirm(config.messages.use_last_saved);

				//If the person said yes, populate form from saved version in local storage
				if(useSaved === true){
					lastVersion = locStorage.get();

					lastVersion = $.parseJSON(lastVersion);

					//pushes saved items to the scope except for interactions
					for(items in lastVersion){
						if(items !== "interactions"){
							$scope.App[items] = lastVersion[items];
						}
					}

					//itterates though the saved interactions and pushes them to the scope
					for (i = lastVersion.interactions.length - 1; i >= 0; i -= 1) {
						$scope.App.interactions.push(lastVersion.interactions[i]);
					}
				}

				showOnce = 1;
			}
			
		};


		/* Auto Saves every 60 secons via the storage service
		----------------------------------------------------------------*/
		$scope.startAutoSave = function(){
			autoSave = $interval(function(){
				$scope.saveReport();
			}, 30000, 0, true);
		};

		/* stops the Auto Save
		----------------------------------------------------------------*/
		$scope.stopAutoSave = function(){
			if (angular.isDefined(autoSave)) {
				$interval.cancel(autoSave);
				autoSave = undefined;
			}
		};




		/* packages and pushes the report to the device
		------------------------------------------------ */
		$scope.saveReport = function(){
			var currentlySaved = locStorage.get(),
				scopeStr = $scope.App;

			scopeStr = JSON.stringify(scopeStr);

			//if what is in local storage is smaller than what is currently in the form or empty, save what is in the form, otherwise dont overwrite
			if(currentlySaved.length <= scopeStr.length || currentlySaved === 0){
				locStorage.save(scopeStr);
			}
			
			app.showSavedMessage();
		};



		/* Build the data URL and Submit
		----------------------------------------------------------------*/
		// $scope.submitReport = function(){
		// 	var dataUrl = urlBuilder.construct($scope.App);

		// 	if($scope.checkedIn){
		// 		app.ajaxLoading(true);

		// 		apiService.submit(dataUrl)
		// 			.then(function(){
		// 				app.ajaxLoading(false);

		// 				$window.alert(config.messages.submit_success);

		// 				//delete saved report in local storage
		// 				//locStorage.delete();

		// 				//stop the auto save
		// 				$scope.stopAutoSave();

		// 				//reset form controls
		// 				app.resetForm("#checkOut, #checkIn");

		// 				//log the user out
		// 				app.config.loggedin = false;

		// 				//refresh the browser
		// 				$window.location.href = "index.html";
		// 			});

		// 	}else{
		// 		app.checkInConfirm();
		// 	}
		// };


		/* listners
		----------------------------------------------------------------*/
		$(window)
			.on("hashchange", $scope.setCheckOut);

	}]);

}(window.angular, window.app, window.jQuery, window.fusionApp);


