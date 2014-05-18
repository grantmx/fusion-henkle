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
	
	//sets the default date and time for the checkin and checkout
	app.setCheckInTime = function (time, date) {
		var nowTime = new Date().timeNow(),
			nowDate = new Date().today();

		if(time){ document.getElementById(time).value = nowTime; }
		
		if(date){ document.getElementById(date).value = nowDate; }
	};

	app.setCheckInTime("timeIn", "demoDate");

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