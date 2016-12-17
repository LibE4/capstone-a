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
		  	url:"#/game/super Tic-Tac-Toe"
		  }, 
		  {
		  	name:"Blackjack",
		  	url:"#/game/blackjack"
		  } , 
		  {
		  	name:"Home",
		  	url:"#/game/home"
		  } 
  	];

  $scope.clearNav = function(){
  	$rootScope.user = "";
  };
});
