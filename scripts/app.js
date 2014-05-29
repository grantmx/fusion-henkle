/*===============================================================================================================
* Fusion Henkle Customer Interactions App
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
	Global Settings
-----------------------------------------*/

//Global Namespace
var app = app || {};


//Global Configurations
app.config = {
	url: "http://appmanagr.net/mobile/index.php/api/rest",
	type: "json?",
	loggedin: false,
	methods: {
		auth: "authenticate_username",
		create: "create_entry",
		read: "read_entry"
	},
	channel: "interactions",
	messages: {
		required: "Required Field!",
		use_last_saved: "Welcome back, friend! Hey, it looks like you have 1 autosaved report. Do you want to use it or start with a fresh report?",
		login_error: "Sorry, but that is an invalid Username or Password.  Please try again.",
		checkout_confirm: "Are you sure you are ready to checkout?  Your checkout time will be autoset and cannot be undone",
		submit_success: "Whoot! Congrats! Your report submitted succesfully!",
		checkout_already_set: "Hey, sorry!  You've already set your checkout time and this cannot be updated.",
		havent_checked_in: "Sorry, but you need to fill out all the checkin fields."
	}
};


/* ---------------------------------------
	Helper Methods
-----------------------------------------*/

// For todays date;
Date.prototype.today = function () {
	return((this.getDate() < 10) ? "0" : "") + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "-" + this.getDate() + "-" + this.getFullYear();
};

// For the time now
Date.prototype.timeNow = function () {
	return((this.getHours() < 10) ? "0" : "") + ((this.getHours() > 12) ? (this.getHours() - 12) : this.getHours()) + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds() + ((this.getHours() > 12) ? ('PM') : 'AM');
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
			//window.location.href = "#login";
		}
	}();


	//Message to show at the top of the page when a save occurs
	app.showSavedMessage = function(){
		var nowTime = new Date().timeNow(),
			nowDate = new Date().today();

		$("p.saved-message").text("Last saved " + nowDate +" at " + nowTime);
	};


	//browser refresh
	app.browserRefresh = function(){
		var refreshURL = window.location.href;
		refreshURL = refreshURL.split("#");
		refreshURL = refreshURL[0];

		window.location.href = refreshURL;
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


	/* resets the Customer Interaction form's UI
	-----------------------------------------------*/
	function resetForm(){
		$("input.interact").siblings("label").removeClass("ui-checkbox-on").addClass("ui-checkbox-off");
		$("#type").siblings('span').html("&nbsp;");
	}


	/* Listners
	-----------------------------------------*/
	$(document)
		.on("change", "#location", showHideOther)
		.on("click", "#finish", resetForm);

}(window.app, window.jQuery);





/* ----------------------------------------------------------------
	Angular Controller, Service & Directive Methods
------------------------------------------------------------------*/

!function (angular, app, $){
	var fusionApp = angular.module("fusion", []);

	/* API Serice communction wih our backend
	----------------------------------------------------------------------------------------------------
	* get - http://appmanagr.net/mobile/index.php/api/rest/read_entry/json?data[entry_id]=1
	* auth - http://appmanagr.net/mobile/index.php/api/rest/authenticate_username/json?auth[username]=grantmx&auth[password]=malaka
	* create - appmanagr.net/mobile/index.php/api/rest/create_entry/json?auth[username]=grantmx&auth[password]=malaka&data[channel_name]=interactions&data[site_id]=1&data[title]=entryApi&data[interactions][rows][0][type]=1&data[interactions][rows][0][familiar]=1&data[interactions][rows][1][type]=2&data[interactions][rows][1][familiar]=2
	---------------------------------------------------------------------------------------------------*/

	fusionApp.service('apiService', function ($http, $q){
		var serviceURL, response, authData,
			config = app.config,
			apiService = {

				//authroizes the user aginst the backend
				auth: function(user, pass, promise){
					authData = "auth[username]="+ user +"&auth[password]="+ pass;

					serviceURL = config.url +"/"+ config.methods.auth +"/"+ config.type + authData;

					promise = $http.get(serviceURL).then(function (response){ return response.data; });

					return promise;
				},


				//creates a new record in the backend
				submit: function(data, promise){
					serviceURL = config.url +"/"+ config.methods.create +"/"+ config.type + authData + data;

					promise = $http.get(serviceURL).then(function (response){ return response.data; });

					return promise;
				}
			};

		return apiService;

	});



	/* LocalStorage Service for backups and autosave
	----------------------------------------------------*/
	fusionApp.service('locStorage', function(){

		//saves the fusionHenkle object
		this.save = function(data){
			window.localStorage["fusionHenkle"] = data;
			return "saved";
		};

		//gets the fusionHenkle object
		this.get = function(){
			var itemStored = window.localStorage["fusionHenkle"];
			return (itemStored === undefined) ? 0 : itemStored;
		};

		//removes the saved object
		this.delete = function(){
			window.localStorage.removeItem("fusionHenkle");
			return "deleted";
		};
		
	});




	/* URL Builder service for final form submission
	----------------------------------------------------*/
	fusionApp.service("urlBuilder", function(){
		var data = "", interactionsData;

		//URL constructor function
		this.construct = function(formData){
			data += "&data[channel_name]="+ app.config.channel;
			data += "&data[site_id]=1";
			data += "&data[status]=open";

			//adds all the fields except for interactions
			angular.forEach(formData, function (value, key) {
				if(key !== "interactions"){
					data += "&data["+ key +"]="+ (value !== "" ? value : 0);
				}
			});

			//build interactions objects
			interactionsData = (function (formData){
				var i, row = "", customers = formData.interactions.length;

				for (i = customers - 1; i >= 0; i -= 1) {
					row += "&data[interactions][rows]["+ i +"][type]="+ formData.interactions[i].type;
					row += "&data[interactions][rows]["+ i +"][familiar]="+ (formData.interactions[i].familiar === undefined ? false : formData.interactions[i].familiar);
					row += "&data[interactions][rows]["+ i +"][krazyGlue]="+ (formData.interactions[i].krazyGlue === undefined ? false : formData.interactions[i].krazyGlue);
					row += "&data[interactions][rows]["+ i +"][gorillaGlue]="+ (formData.interactions[i].gorillaGlue === undefined ? false : formData.interactions[i].gorillaGlue);
					row += "&data[interactions][rows]["+ i +"][comments]="+ (formData.interactions[i].comments === undefined ? false : formData.interactions[i].comments);
					row += "&data[interactions][rows]["+ i +"][date]="+ formData.interactions[i].date;
					row += "&data[interactions][rows]["+ i +"][time]="+ formData.interactions[i].time;
				}

				return row;

			}(formData));

			data += interactionsData;

			return data;
		};
	});



	/* Check the user in and disable form
	-----------------------------------------------*/
	fusionApp.directive("checkInCheck", function (){
		return {
			scope: {},
			restrict: "AC",
			template: '<a href="" class="ui-btn btn" data-transition="slide" id="checkMeIn">Check Me In</a>',
			link: function(scope, element){
				var $scope = scope.$parent;

				app.checkInConfirm = function(){
					if($scope.App.staffid || $scope.App.storeNumber || $scope.App.inventory || $scope.App.price || $scope.App.demoLocation || $scope.App.otherLocation){
						$("#checkIn").find("input").attr("readonly", true).end()
							.find("select").selectmenu('disable');

						element.replaceWith("<div class='green ui-btn btn'>Thanks!  You're all checked in.</div>");

						$scope.App.checkedIn = true;

					}else{
						alert(app.config.messages.havent_checked_in);
						window.location.href = "#checkIn";
					}
				
				};

				element.click(function (){
					app.checkInConfirm();
				});

			}
		};
	});



	/* Login Directive: sets login button and displays messages
	----------------------------------------------------------------*/
	fusionApp.directive('login', function (apiService){
		return {
			scope: {},
			restrict: 'AE',
			template: '<a href="#" class="ui-btn btn">Login</a>',
			link: function(scope, element) {
				var $scope = scope.$parent,
					config = app.config;

				//called on login and uses the auth service
				element.click(function(){
					var validUser = angular.isDefined($scope.username),
						validPass = angular.isDefined($scope.password);

					if(!validUser){
						$("#username").attr("placeholder", config.messages.required);
					}

					if(!validPass){
						$("#pass").attr("placeholder", config.messages.required);
					}

					if(validUser && validPass){
						app.ajaxLoading(true);

						apiService.auth($scope.username, $scope.password)
							.then(setup, displayErrorMessage);
					}
				});


				//setup after good auth
				function setup (response){
					if(response.code === 200){
						app.config.loggedin = true;

						window.location.href = "#checkIn";

						app.ajaxLoading(false);

						app.startAutoSave();
						app.checkStorage();
					}
				}


				//displays the error message on the login page when there was a problem
				function displayErrorMessage (response){
					if(response.status === 503){
						app.ajaxLoading(false);

						alert(config.messages.login_error);

						$scope.username = "";
						$scope.password = "";
					}
				}

			}
		};
	});




	/* App Controller
	----------------------------------------------------*/
	fusionApp.controller("FusionAppController", function ($scope, apiService, locStorage, $q, urlBuilder){
		var count = 1, autoSave,
			useSaved = false,
			showOnce = 0,
			config = app.config;

		$scope.App = {};

		//Demo Controller Array for better formatting
		$scope.demos = [
			{label: "Rubber Hose Demo", value: "Rubber Hose Demo"},
			{label: "Dispenser Demo", value: "Dispenser Demo"},
			{label: "Drip Control Demo", value: "Drip Control Demo"},
			{label: "Strength Test Demo", value: "Strength Test Demo"}
		];


		//sets the default date and time for the checkin and checkout
		$scope.setCheckInTime = function (time, date) {
			var nowTime = new Date().timeNow(),
				nowDate = new Date().today();

			if(time){ return nowTime; }
			if(date){ return nowDate; }
			if(date && time){ return nowDate +" "+ nowTime; }
		};



		/* Main App Model Data
		----------------------------------------*/
		$scope.App = {
			title: "Fusion-Henkle",
			//checkin
			staffid: "",
			storeNumber: "",
			demoDate: $scope.setCheckInTime(false, true),
			timeIn: $scope.setCheckInTime(true, false),
			inventory: "",
			price: "",
			demoLocation: "",
			otherLocation: "",
			//checkout
			managerName: "",
			managerReaction: "",
			insights: "",
			pics: "",
			timeOut: "",
			//client interactions
			interactions: []
		};


		//Interaction itteration
		$scope.addInteractions = function(){
			$scope.App.interactions.push({
				type: $scope.type.value,
				familiar: $scope.familiar,
				krazyGlue: $scope.krazyGlue,
				gorillaGlue: $scope.gorillaGlue,
				comments: $scope.comments,
				date: $scope.setCheckInTime(false, true),
				time: $scope.setCheckInTime(true, false),
			});

			//resets the form data
			$scope.type = "";
			$scope.familiar = false;
			$scope.krazyGlue = false;
			$scope.gorillaGlue = false;
			$scope.comments = "";
		};



		/* sets the checkout time on the checkout hash
		----------------------------------------------------------------*/
		$scope.setCheckOut = function(){
			var time, checkoutCheck;

			if(window.location.hash === "#checkOut"){
				time = $scope.setCheckInTime(true, false);
				checkoutCheck = window.confirm(config.messages.checkout_confirm);
			}

			//make sure its only setting once
			if(count === 1 && Boolean(time) && checkoutCheck === true){
				$scope.App.timeOut = time;
				document.getElementById("timeOut").value = time; //for some reason angular isnt taking the inital binding, but on second click it will, so I have to update it manually.
				count += 1;
			}

			if(checkoutCheck === false){
				window.location.href = "#report";
			}
		};


		
		//Checks localstorage to see if the user has a saved report
		app.checkStorage = function(){
			var lastVersion, items, i;

			if(window.localStorage.length === 1 && useSaved === false && showOnce === 0){
				useSaved = window.confirm(config.messages.use_last_saved);

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
					for (i = lastVersion["interactions"].length - 1; i >= 0; i -= 1) {
						$scope.App.interactions.push(lastVersion["interactions"][i]);
					}
				}

				showOnce = 1;
			}
			
		};




		/* Auto Saves every 60 secons via the storage service
		----------------------------------------------------------------*/
		app.startAutoSave = function(){
			autoSave = setInterval(function(){
				var currentlySaved = locStorage.get(),
					scopeStr = $scope.App;

				scopeStr = JSON.stringify(scopeStr);

				//if what is in local storage is smaller than what is currently in the form or empty, save what is in the form, otherwise dont overwrite
				if(currentlySaved.length <= scopeStr.length || currentlySaved === 0){
					locStorage.save(scopeStr);
				}
				
				app.showSavedMessage();
			}, 60000);
		};


		//resets all form fields for the whole app
		$scope.resetFields = function(){
			$scope.username = "";
			$scope.password = "";
			//checkin
			$scope.App.staffid = "";
			$scope.App.storeNumber = "";
			$scope.App.demoDate = "";
			$scope.App.timeIn = "";
			$scope.App.inventory = "";
			$scope.App.price = "";
			$scope.App.demoLocation = "";
			$scope.App.otherLocation = "";
			//checkout
			$scope.App.managerName = "";
			$scope.App.managerReaction = "";
			$scope.App.insights = "";
			$scope.App.pics = "";
			$scope.App.timeOut = "";
			//client interactions
			$scope.App.interactions = [];

			$scope.type = "";
			$scope.familiar = false;
			$scope.krazyGlue = false;
			$scope.gorillaGlue = false;
			$scope.comments = "";
		};


		/* Build the data URL and Submit
		----------------------------------------------------------------*/
		$scope.submitReport = function(){
			var dataUrl = urlBuilder.construct($scope.App);

			app.ajaxLoading(true);

			apiService.submit(dataUrl)
				.then(function(data){
					app.ajaxLoading(false);

					alert(config.messages.submit_success);

					//delete saved report in local storage
					locStorage.delete();

					//stop the auto save
					clearInterval(autoSave);

					//log the user out
					app.config.loggedin = false;

					//clear all fields
					$scope.resetFields();

					//refresh the browser
					window.location.href = "#login";
				});
		};


		/* listners
		----------------------------------------------------------------*/
		$(window)
			.on("hashchange", $scope.setCheckOut);

	});

}(window.angular, window.app, window.jQuery);


