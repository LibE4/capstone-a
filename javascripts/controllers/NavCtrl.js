"use strict";

app.controller("NavCtrl", function($scope, $rootScope){
	$scope.navGame = 
		[
			// {
			// 	name:`Logout ${$rootScope.user.username}`,
			// 	url:"#/logout"
			// },
		  {
		  	name:"Tetris Game",
		  	url:"#/game/tetris"
		  }, 
		  {
		  	name:"Super Tic-Tac-Toe",
		  	url:"#/game/superTTT"
		  }, 
		  {
		  	name:"Blackjack",
		  	url:"#/game/blackjack"
		  } 
  	];
});
