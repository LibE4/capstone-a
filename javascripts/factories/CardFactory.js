"use strict";

app.factory("CardFactory", function($q, $http){

	var getCards = function(n){
		return $q((resolve, reject)=>{
			$http.get(`https://deckofcardsapi.com/api/deck/45ptvgtmyihm/draw/?count=${n}`)
			.success(function(response){
				console.log("response", response);
				resolve(response);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var shuffleCards = function(){
		return $q((resolve, reject)=>{
			$http.get(`https://deckofcardsapi.com/api/deck/45ptvgtmyihm/shuffle/`)
			.success(function(response){
				console.log("response", response);
				resolve(response);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	return {getCards: getCards,
					shuffleCards: shuffleCards};
});