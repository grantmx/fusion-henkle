/* ---------------------------------------
	Global Settings
-----------------------------------------*/

//Global Namespace
var app = app || {};

var fusionApp = angular.module("fusion", []);

//Global Configurations
app.config = {
	url: "http://appmanagr.net/mobile/index.php/api/rest",
	type: "json?",
	loggedin: false,
	methods: {
		auth: "authenticate_username",
		create: "create_entry",
		read: "read_entry",
		registrationForm: "/includes/recap-submission-form",
		authUser: "/api/authenticate_username",
	},
	channel: "interactions",
	messages: {
		required: "Required Field!",
		use_last_saved: "Welcome back, friend! Hey, it looks like you have 1 autosaved report. Hit, OK to use it or hit Cancel to start with a fresh report?",
		login_error: "Sorry, but that is an invalid Username or Password.  Please try again.",
		checkout_confirm: "Are you sure you are ready to checkout?  Your checkout time will be autoset and cannot be undone",
		submit_success: "Whoot! Congrats! Your report submitted succesfully!",
		checkout_already_set: "Hey, sorry!  You've already set your checkout time and this cannot be updated.",
		havent_checked_in: "Sorry, but you need to fill out all the check-in fields and hit, 'Check me in'.",
		not_saved: '<p class="alert alert-error">Report not saved. <a href="#notSaved">More &raquo;</a></p>',
		error_save: "D'Oh! Looks like something happend.  Try to submit your form"
	},
	googleKey: "AIzaSyCJL4ZhaSPo0dib7Nlk1XoJEn1sNwWflJI"
	//https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyCJL4ZhaSPo0dib7Nlk1XoJEn1sNwWflJI&location=34.0274273,-84.3225148&radius=500
};