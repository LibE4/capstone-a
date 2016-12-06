"use strict";

app.factory("BalanceFactory", function($q, $http, FIREBASE_CONFIG){
	var getBalance = function(userId){
		return $q((resolve, reject)=>{
			$http.get(`${FIREBASE_CONFIG.databaseURL}/balance.json?orderBy="uid"&equalTo="${userId}"`)
			.success(function(response){
				let balance = [];
				Object.keys(response).forEach(function(key){
					response[key].id = key;
					balance.push(response[key]);
				});
				resolve(balance);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var postNewBalance = function(newBalance){
		return $q((resolve, reject) =>{
			$http.post(`${FIREBASE_CONFIG.databaseURL}/balance.json`,
				JSON.stringify(newBalance)
			)
			.success(function(postResponse){
				resolve(postResponse);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var deleteBalance =  function(groupId){
		return $q((resolve, reject) =>{
			$http.delete(`${FIREBASE_CONFIG.databaseURL}/balance/${groupId}.json`
			)
			.success(function(deleteResponse){
				resolve();
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var editBalance = function(editBalance){
		return $q((resolve, reject) =>{
			$http.put(`${FIREBASE_CONFIG.databaseURL}/balance/${editBalance.id}.json`,
				JSON.stringify(editBalance)
			)
			.success(function(editResponse){
				resolve(editResponse);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	return {getBalance: getBalance,
					postNewBalance: postNewBalance,
					editBalance: editBalance,
					deleteBalance: deleteBalance};
});