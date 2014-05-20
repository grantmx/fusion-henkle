var app = app || {};


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

	fusionApp.controller("FusionAppController", function ($scope, $http){
	
		//sets the default date and time for the checkin and checkout
		$scope.setCheckInTime = function (time, date) {
			var nowTime = new Date().timeNow(),
				nowDate = new Date().today();

			if(time){ return nowTime; }
			if(date){ return nowDate; }
			if(date && time){ return nowDate +" "+ nowTime; }
		};

		$scope.demos = [
			{label: "Rubber Hose Demo", value: "Rubber Hose"},
			{label: "Dispenser Demo", value: "Dispenser"},
			{label: "Drip Control Demo", value: "Drip Control"},
			{label: "Strength Test Demo", value: "Strength Test"}
		];

		/* Main App Model Data
		----------------------------------------*/
		$scope.App = {};

		//checkin page
		$scope.App.CheckIn = {
			staffid: "",
			storeNumber: "",
			demoDate: $scope.setCheckInTime(false, true),
			timeIn: $scope.setCheckInTime(true, false),
			inventory: "",
			price: "",
			location: "",
			otherLocation: ""
		};

		//Interaction parent
		$scope.App.Interactions = [];

		//Interaction itteration
		$scope.addInteractions = function(){
			$scope.App.Interactions.push({
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

			console.log($scope.App);
		};

		//Checkout page
		$scope.App.CheckOut = {
			managerName: "",
			managerReaction: "",
			insights: "",
			pics: "",
			timeOut:""
		};

	});

}(window.angular, window.app, window.jQuery);


