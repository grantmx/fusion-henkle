!function (angular, app, $, fusionApp){

	/* Check the user in and disable form
	-----------------------------------------------*/
	fusionApp.directive("checkInCheck", ["$window","$timeout", function ($window, $timeout){
		return {
			restrict: "AC",
			template: '<a href="" class="ui-btn btn" id="checkMeIn">Check Me In</a>',
			link: function($scope, element){

				app.checkInConfirm = function(){
					if($scope.App.staffid && $scope.App.storeNumber && $scope.App.inventory && $scope.App.price && $scope.App.demoLocation){
						$("#checkIn").find("input").attr("readonly", true).end()
							.find("select").selectmenu('disable');

						element.replaceWith("<div class='green ui-btn btn'>Thanks! You're in!</div>");

						$scope.checkedIn = true;
						$scope.startAutoSave();

						$timeout(function(){
							$window.location.hash = "#report";
						}, 1000);

					}else{
						$window.alert(app.config.messages.havent_checked_in);
					}
				};

				//bind to the element
				element.click(function (){
					app.checkInConfirm();
				});

			}
		};
	}]);



	/* Login Directive: sets login button and displays messages
	----------------------------------------------------------------*/
	fusionApp.directive('login', ["$window", "apiService", "utility", function ($window, apiService, utility){
		return {
			restrict: 'AE',
			template: '<a href="#" class="ui-btn btn">Login</a>',
			link: function($scope, element) {
				var config = app.config;

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

						apiService.authenticate($scope.username, $scope.password).then(setup, displayErrorMessage);
					}
				});



				//setup after good auth
				function setup (response){
					if(response.hasOwnProperty("session_id")){
						app.config.loggedin = true;

						$window.location.hash = "#checkIn";

						app.ajaxLoading(false);

						$scope.checkStorage();

						// //bring in our form with the compiled html
						// apiService.getRegistrationForm().then(function (data){
						// 	var form = $compile(data)($scope);

						// 	$("#").html(form);
						// });

					}else{
						displayErrorMessage();
					}
				}


				//displays the error message on the login page when there was a problem
				function displayErrorMessage (){
					app.ajaxLoading(false);

					$window.alert(config.messages.login_error);

					$scope.username = "";
					$scope.password = "";
					
				}

			}
		};
	}]);


	//controls the action when the user clicks the "reserve room" button to complete session
	fusionApp.directive("completeReservation", ["$window", "apiService", "urlBuilder","locStorage", function ($window, apiService, urlBuilder, locStorage){
		return{
			restrict: "EA",
			link: function($scope, element){
				
				function postSuccess(data){
					app.ajaxLoading(false);

					$window.alert(app.config.messages.submit_success);

					//stop the auto save
					$scope.stopAutoSave();

					//reset form controls
					app.resetForm("#checkOut, #checkIn");
					locStorage.delete();

					//log the user out
					app.config.loggedin = false;

					//refresh the browser
					$window.location.href = $window.location.pathname + "#login";

				}

				//if we failed to submit the form to the server
				function postFail(data){
					$window.alert(app.config.messages.error_save);
				}
				

				
				element.click(function (e){
					var data, url, i, item,
						theForm = element.parents("form");

					e.preventDefault();

					//for all the data added by the user loop build our extra fields and loop post the form
					urlBuilder.fieldDataConstructor($scope.App);

					// data = theForm.serialize();
					// url = theForm.attr("action");

					//apiService.postRegistrationForm(url, data).then(postSuccess, postFail);
					theForm.submit();

					postSuccess();

				});
				

			}
		};
	}]);

}(window.angular, window.app, window.jQuery, window.fusionApp);
