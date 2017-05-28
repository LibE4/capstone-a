"use strict";

app.factory("UserFactory", function($q, $http, FIREBASE_CONFIG){
	let addUser = (authData) => {
		return $q((resolve, reject) => {
			$http.post(`${FIREBASE_CONFIG.databaseURL}/users.json`,
		  JSON.stringify({
		  	uid: authData.uid,
		  	icon: authData.icon,
		  	username: authData.username,
		  	balance: authData.balance,
		  	wins: authData.wins,
		  	losses: authData.losses,
		  	sgWins: authData.sgWins,
		  	sgLosses: authData.sgLosses,
		  	totalLines: authData.totalLines,
		  	totalShapes: authData.totalShapes
		  }))
		  .success(function(storeUserSuccess){
		  	resolve(storeUserSuccess);
		  })
		  .error(function(storeUserError){
		  	reject(storeUserError);
		  });
		});
	};
	
	let getUser = (userId) => {
		return $q((resolve, reject) => {
			$http.get(`${FIREBASE_CONFIG.databaseURL}/users.json?orderBy="uid"&equalTo="${userId}"`)
		  .success(function(userObject){
		  	let users = [];
		  	Object.keys(userObject).forEach(function(key){
					userObject[key].userIndex = key;
		  		users.push(userObject[key]);
		  	});
		  	if (users[0] === undefined){
		  		resolve();
		  	} else {
			  	resolve(users[0]);
		  	}
		  })
		  .error(function(error){
		  	reject(error);
		  });
		});
	};

	let editUser = function(editUser){
		return $q((resolve, reject) =>{
			$http.put(`${FIREBASE_CONFIG.databaseURL}/users/${editUser.userIndex}.json`,
				JSON.stringify(editUser)
			)
			.success(function(editResponse){
				resolve(editResponse);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};	

	return {addUser:addUser, getUser:getUser, editUser:editUser};
});