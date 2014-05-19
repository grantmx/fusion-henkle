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


	/* Set Time Function
	-----------------------------------------*/

	//set time on click on checkout
	function setTime(){
		app.setCheckInTime("timeOut", false);
	}

	//set the time if the page was refreshed on the checkout page
	if(window.location.hash === "#checkOut"){
		app.setCheckInTime("timeOut", false);
	}


	/* Show Hide Other Field
	-----------------------------------------*/
	function showHideOther(){
		var option = $("#location option:selected").val(),
			when = Boolean(option === "other");

		$("#whenOther, #whenOtherField").toggleClass('hide', !when);
	}


	/* Event Listners
	-----------------------------------------*/
	$(document)
		.on("change", "#location", showHideOther)
		.on("click", "a[href='#checkOut']", setTime);

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

		$scope.App = {};

		$scope.App.CheckIn = {
			storeNumber: "",
			demoDate: $scope.setCheckInTime(false, true),
			timeIn: $scope.setCheckInTime(true, false),
			inventory: "",
			price: "",
			location: "",
			otherLocation: ""
		};

		$scope.App.Interactions = [];

		$scope.addInteractions = function(){
			$scope.App.Interactions.push({
				type: $scope.type,
				familiar: $scope.familiar,
				krazyGlue: $scope.krazyGlue,
				gorillaGlue: $scope.gorillaGlue,
				comments: $scope.comments,
				date: $scope.setCheckInTime(false, true),
				time: $scope.setCheckInTime(true, false),
			});


		};

		$scope.App.CheckOut = {
			managerName: "",
			managerReaction: "",
			insights: "",
			pics: "",
			timeOut: $scope.setCheckInTime(true, false)
		};

		$(document).on("blur", "input",function(){ console.log($scope.App) });
	});

}(window.angular, window.app, window.jQuery);


