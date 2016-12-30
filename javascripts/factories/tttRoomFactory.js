"use strict";

app.factory("tttRoomFactory", function($q, $http, FIREBASE_CONFIG){
	var getRooms = function(){
		return $q((resolve, reject)=>{
			$http.get(`${FIREBASE_CONFIG.databaseURL}/tttRooms.json`)
			.success(function(response){
				let tttRooms = [];
				Object.keys(response).forEach(function(key){
					response[key].id = key;
					tttRooms.push(response[key]);
				});
				resolve(tttRooms);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var postNewRoom = function(newRoom){
		return $q((resolve, reject) =>{
			$http.post(`${FIREBASE_CONFIG.databaseURL}/tttRooms.json`,
				JSON.stringify({
					profile: newRoom.profile,
					gameStatus: newRoom.gameStatus,
					gameData: newRoom.gameData
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
			$http.delete(`${FIREBASE_CONFIG.databaseURL}/tttRooms/${roomId}.json`
			)
			.success(function(deleteResponse){
				resolve();
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var editRoom = function(roomId, editRoom){
		return $q((resolve, reject) =>{
			$http.put(`${FIREBASE_CONFIG.databaseURL}/tttRooms/${roomId}.json`,
				JSON.stringify({
					profile: editRoom.profile,
					gameData: editRoom.gameData,
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
			$http.put(`${FIREBASE_CONFIG.databaseURL}/tttRooms/${roomId}/profile/players.json`,
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
			$http.get(`${FIREBASE_CONFIG.databaseURL}/tttRooms/${roomId}/profile.json`)
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
			$http.get(`${FIREBASE_CONFIG.databaseURL}/tttRooms/${roomId}/gameStatus.json`)
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
			$http.put(`${FIREBASE_CONFIG.databaseURL}/tttRooms/${roomId}/gameStatus.json`,
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

	var editGameReset = function(roomId, gameReset){
		return $q((resolve, reject) =>{
			$http.put(`${FIREBASE_CONFIG.databaseURL}/tttRooms/${roomId}/gameReset.json`,
				JSON.stringify(gameReset)
			)
			.success(function(editResponse){
				resolve(editResponse);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var editGameData = function(roomId, gameData){
		return $q((resolve, reject) =>{
			$http.put(`${FIREBASE_CONFIG.databaseURL}/tttRooms/${roomId}/gameData.json`,
				JSON.stringify(gameData)
			)
			.success(function(editResponse){
				resolve(editResponse);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var postMsgInRoom = function(roomId, newMessage){
		return $q((resolve, reject) =>{
			$http.post(`${FIREBASE_CONFIG.databaseURL}/tttRooms/${roomId}.json`,
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
					editGameReset: editGameReset,
					editGameData: editGameData,
					postMsgInRoom: postMsgInRoom};
});