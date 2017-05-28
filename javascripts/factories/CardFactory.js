"use strict";

app.factory("CardFactory", function($q, $http){

	var deck_id = "vnw5yaosuii3";

	var getNewDecks = function(n){
		return $q((resolve, reject)=>{
			$http.get(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${n}`)
			.success(function(response){
				deck_id = response.deck_id;
				resolve(response);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var getCards = function(n){
		return $q((resolve, reject)=>{
			$http.get(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${n}`)
			.success(function(response){
				resolve(response);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	var shuffleCards = function(){
		return $q((resolve, reject)=>{
			$http.get(`https://deckofcardsapi.com/api/deck/${deck_id}/shuffle/`)
			.success(function(response){
				resolve(response);
			})
			.error(function(errorResponse){
				reject(errorResponse);
			});
		});
	};

	return {getNewDecks: getNewDecks,
					getCards: getCards,
					shuffleCards: shuffleCards};
});