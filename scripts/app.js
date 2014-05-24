
//namespace
var app = app || {};

/*-------------- Example URLs ------------------
* get - http://appmanagr.net/mobile/index.php/api/rest/read_entry/json?auth[username]=grantmx&auth[password]=malaka&data[entry_id]=1
* auth - http://appmanagr.net/mobile/index.php/api/rest/authenticate_username/json?auth[username]=grantmx&auth[password]=malaka
* create - http://appmanagr.net/mobile/index.php/api/rest/create_entry/json?auth[username]=grantmx&auth[password]=malaka&data[channel_name]=interactions&data[title]=blah&data[site_id]=1
-----------------------------------------------*/

/* Global Configurations
-----------------------------------------*/
app.config = {
	url: "http://appmanagr.net/mobile/index.php/api/rest",
	type: "json?",
	loggedin: false,
	methods: {
		auth: "authenticate_username",
		create: "create_entry",
		read: "read_entry"
	},
	channel: "interactions"
};


// For todays date;
Date.prototype.today = function () {
	return((this.getDate() < 10) ? "0" : "") + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "-" + this.getDate() + "-" + this.getFullYear();
};

// For the time now
Date.prototype.timeNow = function () {
	return((this.getHours() < 10) ? "0" : "") + ((this.getHours() > 12) ? (this.getHours() - 12) : this.getHours()) + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds() + ((this.getHours() > 12) ? ('PM') : 'AM');
};



!function (app, $){

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


	/* Show Hide Other Field
	-----------------------------------------*/
	function showHideOther(){
		var option = $("#location option:selected").val(),
			when = Boolean(option === "other");

		$("#whenOther, #whenOtherField").toggleClass('hide', !when);
	}


	/* resets the Customer Interaction form's UI
	-----------------------------------------*/
	function resetForm(){
		$("input[type='checkbox']").siblings("label").removeClass("ui-checkbox-on").addClass("ui-checkbox-off");
		$("select").siblings('span').html("&nbsp;");
	}


	/* Event Listners
	-----------------------------------------*/
	$(document)
		.on("change", "#location", showHideOther)
		.on("click", "#finish", resetForm);

}(window.app, window.jQuery);





!function (angular, app, $){
	var fusionApp = angular.module("fusion", []);


	/* API Serice communction wih our backend
	----------------------------------------------------*/
	fusionApp.service('apiService', function ($http, $q){
		var serviceURL, response,
			config = app.config,
			authData,
			apiService = {

				//authroizes the user aginst the backend
				auth: function(user, pass){
					authData = "auth[username]="+ user +"&auth[password]="+ pass;

					serviceURL = config.url +"/"+ config.methods.auth +"/"+ config.type + authData;

					var promise = $http({ method: "GET", url: serviceURL, headers: {'Content-Type': 'application/json'} })
						.then(function(response){
							return response.data;
						});

					return promise;
				},


				//creates a new record in the backend
				submit: function(data){
					serviceURL = config.url +"/"+ config.methods.create +"/"+ config.type +"/"+ authData +"&"+ data;
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
			return window.localStorage["fusionHenkle"];
		};

		//removes the saved object
		this.delete = function(){
			window.localStorage.removeItem("fusionHenkle");
			return "deleted";
		};
		
	});




	/* App Controller
	----------------------------------------------------*/
	fusionApp.controller("FusionAppController", function ($scope, apiService, locStorage, $q){
		var count = 1, autoSave;


		//called on login and uses the auth service
		$scope.login = function(){
			var validUser = angular.isDefined($scope.username), auth,
				validPass = angular.isDefined($scope.password);

			if(!validUser){
				$("#username").addClass("error").attr("placeholder", "Required");
			}

			if(!validPass){
				$("#pass").addClass("error").attr("placeholder", "Required");
			}

			if(validUser && validPass){
				apiService.auth($scope.username, $scope.password)
					.then(function(data){
						setup(data);
					});
			}
		};



		function setup(response){
			if(response.code === 200){
				app.config.loggedin = true;
				window.location.href = "#checkIn";

				startAutoSave();

				checkStorage();
			}
		}


		//sets the default date and time for the checkin and checkout
		$scope.setCheckInTime = function (time, date) {
			var nowTime = new Date().timeNow(),
				nowDate = new Date().today();

			if(time){ return nowTime; }
			if(date){ return nowDate; }
			if(date && time){ return nowDate +" "+ nowTime; }
		};


		//demo model.  this may not be needed any longer
		$scope.demos = [
			{label: "Rubber Hose Demo", value: "Rubber Hose"},
			{label: "Dispenser Demo", value: "Dispenser"},
			{label: "Drip Control Demo", value: "Drip Control"},
			{label: "Strength Test Demo", value: "Strength Test"}
		];


		/* Main App Model Data
		----------------------------------------*/
		$scope.App = {
			//checkin
			staffid: "",
			storeNumber: "",
			demoDate: $scope.setCheckInTime(false, true),
			timeIn: $scope.setCheckInTime(true, false),
			inventory: "",
			price: "",
			location: "",
			otherLocation: "",

			//checkout
			managerName: "",
			managerReaction: "",
			insights: "",
			pics: "",
			timeOut: ""
		};


		//Interaction parent
		$scope.App.interactions = [];


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
			var time = (window.location.hash === "#checkOut") ? $scope.setCheckInTime(true, false) : "";

			//make sure its only setting once
			if(count === 1 && Boolean(time)){
				$scope.App.timeOut = time;
				document.getElementById("timeOut").value = time; //for some reason angular isnt taking the inital binding, but on second click it will, so I have to update it manually.
				count += 1;
			}
		};


		function checkStorage(){
			if(window.location.hash === "#checkIn"){
				if(window.localStorage.length === 1){
					$("#popupDialog").popup();
				}
			}
		}

		$(window)
			.on("hashchange", $scope.setCheckOut)
			.on("hashchange", checkStorage);



		/* Auto Saves every 30 secons via the storage service
		----------------------------------------------------------------*/
		function startAutoSave(){
			autoSave = setInterval(function(){
				locStorage.save($scope.App);
			}, 30000);
		}




		$scope.submitReport = function(){
			console.log($scope.App);
		};


	});

}(window.angular, window.app, window.jQuery);


