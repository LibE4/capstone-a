"use strict";

app.factory("RoomFactory", function($q, $http, FIREBASE_CONFIG){
	var getRooms = function(){
		return $q((resolve, reject)=>{
			$http.get(`${FIREBASE_CONFIG.databaseURL}/cardRooms.json`)
			.success(function(response){
				console.log("rrresponse", response);
				let cardRooms = [];
				Object.keys(response).forEach(function(key){
					response[key].id = key;
					cardRooms.push(response[key]);
				});
				resolve(cardRooms);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var postNewRoom = function(newRoom){
		return $q((resolve, reject) =>{
			$http.post(`${FIREBASE_CONFIG.databaseURL}/cardRooms.json`,
				JSON.stringify(newRoom)
			)
			.success(function(postResponse){
				resolve(postResponse);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var deleteRoom =  function(groupId){
		return $q((resolve, reject) =>{
			$http.delete(`${FIREBASE_CONFIG.databaseURL}/cardRooms/${groupId}.json`
			)
			.success(function(deleteResponse){
				resolve();
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var editRoom = function(editRoom){
		return $q((resolve, reject) =>{
			$http.put(`${FIREBASE_CONFIG.databaseURL}/cardRooms/${editRoom.id}.json`,
				JSON.stringify(editRoom)
			)
			.success(function(editResponse){
				resolve(editResponse);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};	

	var editPlayerList = function(roomId, players){
		return $q((resolve, reject) =>{
			$http.put(`${FIREBASE_CONFIG.databaseURL}/cardRooms/${roomId}/profile/players.json`,
				JSON.stringify(players)
			)
			.success(function(editResponse){
				resolve(editResponse);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var postPlayerInRoom = function(newPlayer, roomId){
		return $q((resolve, reject) =>{
			$http.post(`${FIREBASE_CONFIG.databaseURL}/cardRooms/${roomId}.json`,
				JSON.stringify(newPlayer)
			)
			.success(function(postResponse){
				resolve(postResponse);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var getPlayerInRoom = function(roomId){
		return $q((resolve, reject)=>{
			$http.get(`${FIREBASE_CONFIG.databaseURL}/cardRooms/${roomId}/profile/players.json`)
			.success(function(response){
				resolve(response);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};
	var postCardInRoom = function(newCard, roomId){
		return $q((resolve, reject) =>{
			$http.post(`${FIREBASE_CONFIG.databaseURL}/cardRooms/${roomId}.json`,
				JSON.stringify(newCard)
			)
			.success(function(postResponse){
				resolve(postResponse);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	return {getRooms: getRooms,
					postNewRoom: postNewRoom,
					editRoom: editRoom,
					editPlayerList: editPlayerList,
					deleteRoom: deleteRoom,
					postPlayerInRoom: postPlayerInRoom,
					getPlayerInRoom: getPlayerInRoom,
					postCardInRoom: postCardInRoom};
});