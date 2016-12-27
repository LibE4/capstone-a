"use strict";

app.factory("RoomFactory", function($q, $http, FIREBASE_CONFIG){
	var getRooms = function(){
		return $q((resolve, reject)=>{
			$http.get(`${FIREBASE_CONFIG.databaseURL}/cardRooms.json`)
			.success(function(response){
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
				JSON.stringify({
					profile: newRoom.profile,
					gameStatus: newRoom.gameStatus
				})
			)
			.success(function(postResponse){
				resolve(postResponse);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var deleteRoom =  function(roomId){
		return $q((resolve, reject) =>{
			$http.delete(`${FIREBASE_CONFIG.databaseURL}/cardRooms/${roomId}.json`
			)
			.success(function(deleteResponse){
				resolve();
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var editRoom = function(editRoom, roomId){
		return $q((resolve, reject) =>{
			$http.put(`${FIREBASE_CONFIG.databaseURL}/cardRooms/${roomId}.json`,
				JSON.stringify({
					profile: editRoom.profile,
					gameStatus: editRoom.gameStatus
				})
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

	var getProfileInRoom = function(roomId){
		return $q((resolve, reject)=>{
			$http.get(`${FIREBASE_CONFIG.databaseURL}/cardRooms/${roomId}/profile.json`)
			.success(function(response){
				resolve(response);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};
	
	var getGameStatus = function(roomId){
		return $q((resolve, reject)=>{
			$http.get(`${FIREBASE_CONFIG.databaseURL}/cardRooms/${roomId}/gameStatus.json`)
			.success(function(response){
				resolve(response);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var editGameStatus = function(roomId, gameStatus){
		return $q((resolve, reject) =>{
			$http.put(`${FIREBASE_CONFIG.databaseURL}/cardRooms/${roomId}/gameStatus.json`,
				JSON.stringify(gameStatus)
			)
			.success(function(editResponse){
				resolve(editResponse);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var postCardInRoom = function(roomId, newCard){
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

	var postMsgInRoom = function(roomId, newMessage){
		return $q((resolve, reject) =>{
			$http.post(`${FIREBASE_CONFIG.databaseURL}/cardRooms/${roomId}.json`,
				JSON.stringify(newMessage)
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
					getProfileInRoom: getProfileInRoom,
					getGameStatus: getGameStatus,
					editGameStatus: editGameStatus,
					postCardInRoom: postCardInRoom,
					postMsgInRoom: postMsgInRoom};
});