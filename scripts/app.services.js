!function (angular, app, $, fusionApp){

	/*--------------------------------------------------------------------------------------------
		Helper Service to GET and POST data to the backend
	--------------------------------------------------------------------------------------------*/
	fusionApp.service('Backend', ['$http', function ($http){
		var promissory;

		//Get Method
		this.GET = function(url){
			promissory = $http.get(url).then(function (response){ return response.data; });
			return promissory;
		};

		//Post Method
		this.POST = function(url, data){
			promissory = $http({
				method: "POST",
				url: url,
				data: data,
				headers: {"Content-Type": "application/x-www-form-urlencoded"}
			}).then(function (response){
				return response.data;
			});
			
			return promissory;
		};
	}]);


	/* API Serice communction wih our backend
	----------------------------------------------------------------------------------------------------
	* get - http://appmanagr.net/mobile/index.php/api/rest/read_entry/json?data[entry_id]=1
	* auth - http://appmanagr.net/mobile/index.php/api/rest/authenticate_username/json?auth[username]=grantmx&auth[password]=malaka
	* create - appmanagr.net/mobile/index.php/api/rest/create_entry/json?auth[username]=grantmx&auth[password]=malaka&data[channel_name]=interactions&data[site_id]=1&data[title]=entryApi&data[interactions][rows][0][type]=1&data[interactions][rows][0][familiar]=1&data[interactions][rows][1][type]=2&data[interactions][rows][1][familiar]=2
	---------------------------------------------------------------------------------------------------*/

	fusionApp.service('apiService', ["$http", "$window", "Backend", function ($http, $window, Backend){
		var serviceURL, authData, promise, host = $window.location.origin +"/mobile/index.php",
			config = app.config.methods;

			return {

				// //authroizes the user aginst the backend
				// auth: function(user, pass){
				// 	var promise;

				// 	authData = "auth[username]="+ user +"&auth[password]="+ pass;
				// 	serviceURL = config.url +"/"+ config.methods.auth +"/"+ config.type + authData;
				// 	promise = $http.get(serviceURL).then(function (response){ return response.data; });

				// 	return promise;
				// },

				postRegistrationForm: function(url, data){
					promise = Backend.POST(url, data);
					return promise;
				},

				//authenticates the user for checkout
				authenticate: function(user, pass){
					var authData = "username="+user+"\u0026password="+pass,
						serviceURL = host + config.authUser;

					promise = Backend.POST(serviceURL, authData);

					return promise;
				},

				getRegistrationForm: function(){
					promise = Backend.GET(host + config.registrationForm);
					return promise;
				},

				// //creates a new record in the backend
				// submit: function(data){
				// 	var promise;

				// 	serviceURL = config.url +"/"+ config.methods.create +"/"+ config.type + authData + data;
				// 	promise = $http.get(serviceURL).then(function (response){ return response.data; });

				// 	return promise;
				// }
			};

	}]);




	fusionApp.service('utility', function(){

		//if user allows, gets the position of the user
		this.getGeoPosition = function(){

			//if supported
			if ("geolocation" in navigator) {
				var coords = navigator.geolocation.getCurrentPosition(function (position){
					return position.coords.latitude;
				});

				return coords;
			}


		};
	});


	/* LocalStorage Service for backups and autosave
	----------------------------------------------------*/
	fusionApp.service('locStorage', function(){

		//saves the fusionHenkle object
		this.save = function(data){
			window.localStorage.fusionHenkle = data;
			return "saved";
		};

		//gets the fusionHenkle object
		this.get = function(){
			var itemStored = window.localStorage.fusionHenkle;
			return (itemStored === undefined) ? 0 : itemStored;
		};

		//removes the saved object
		this.delete = function(){
			window.localStorage.fusionHenkle = "";
			return "deleted";
		};
		
	});




	/* URL Builder service for final form submission
	----------------------------------------------------*/
	fusionApp.service("urlBuilder", function(){
		var data = "", interactionsData;

		//URL constructor function
		// this.construct = function(formData){
		// 	data += "&data[channel_name]="+ app.config.channel;
		// 	data += "&data[site_id]=1";
		// 	data += "&data[status]=open";

		// 	//adds all the fields except for interactions
		// 	angular.forEach(formData, function (value, key) {
		// 		if(key !== "interactions"){
		// 			data += "&data["+ key +"]="+ (value !== "" ? value : 0);
		// 		}
		// 	});

		// 	//build interactions objects
		// 	interactionsData = (function (formData){
		// 		var i, row = "", customers = formData.interactions.length;

		// 		for (i = customers - 1; i >= 0; i -= 1) {
		// 			row += "&data[interactions][rows]["+ i +"][type]="+ formData.interactions[i].type;
		// 			row += "&data[interactions][rows]["+ i +"][familiar]="+ (formData.interactions[i].familiar === undefined ? false : formData.interactions[i].familiar);
		// 			row += "&data[interactions][rows]["+ i +"][krazyGlue]="+ (formData.interactions[i].krazyGlue === undefined ? false : formData.interactions[i].krazyGlue);
		// 			row += "&data[interactions][rows]["+ i +"][gorillaGlue]="+ (formData.interactions[i].gorillaGlue === undefined ? false : formData.interactions[i].gorillaGlue);
		// 			row += "&data[interactions][rows]["+ i +"][comments]="+ (formData.interactions[i].comments === undefined ? false : formData.interactions[i].comments);
		// 			row += "&data[interactions][rows]["+ i +"][date]="+ formData.interactions[i].date;
		// 			row += "&data[interactions][rows]["+ i +"][time]="+ formData.interactions[i].time;
		// 		}

		// 		return row;

		// 	}(formData));

		// 	data += interactionsData;

		// 	return data;
		// };

		
		//construts the final submission url for the recap for each object argument passed in from $scope.App
		this.fieldDataConstructor = function(formData){
			var interactions, $publishForm = $("#publishForm");

			// for(var data in formData){
			// 	if(data !== "interactions"){
			// 		$("input[name="+data+"]", $publishForm).val(formData[data]).attr("type", "hidden");
			// 	}
			// }
			
			
			//builds the interaction array for the Grid fieldtype in the entry
			interactions = (function (formData){
				var row = "", j;

				for (j = formData.interactions.length - 1; j >= 0; j-=1) {
					row += '<input type="hidden" name="interactions[rows][new_row_'+ (j + 1) +'][col_id_1]" value="'+formData.interactions[j].type+'">';
					row += '<input type="hidden" name="interactions[rows][new_row_'+ (j + 1) +'][col_id_2]" value="'+(formData.interactions[j].familiar === undefined ? false : formData.interactions[j].familiar)+'">';
					row += '<input type="hidden" name="interactions[rows][new_row_'+ (j + 1) +'][col_id_3]" value="'+(formData.interactions[j].krazyGlue === undefined ? false : formData.interactions[j].krazyGlue)+'">';
					row += '<input type="hidden" name="interactions[rows][new_row_'+ (j + 1) +'][col_id_4]" value="'+(formData.interactions[j].gorillaGlue === undefined ? false : formData.interactions[j].gorillaGlue)+'">';
					row += '<input type="hidden" name="interactions[rows][new_row_'+ (j + 1) +'][col_id_5]" value="'+(formData.interactions[j].comments === undefined ? false : formData.interactions[j].comments)+'">';
					row += '<input type="hidden" name="interactions[rows][new_row_'+ (j + 1) +'][col_id_6]" value="'+formData.interactions[j].date+'">';
					row += '<input type="hidden" name="interactions[rows][new_row_'+ (j + 1) +'][col_id_7]" value="'+formData.interactions[j].time+'">';
				}
				
				$publishForm.append(row);

			}(formData));


			return true;
		};


	});



	/* Now service sets the current device date and time
	--------------------------------------------------------*/
	fusionApp.service('now', function(){
		return {
			getTime: function(){
				var nowTime = new Date().timeNow();
				return nowTime;
			},

			getDate: function(){
				var nowDate = new Date().today();
				return nowDate;
			},

			getTimeDate: function(){
				var nowTime = new Date().timeNow(),
					nowDate = new Date().today();
				return nowDate +" "+ nowTime;
			}
		};
	});


}(window.angular, window.app, window.jQuery, window.fusionApp);

