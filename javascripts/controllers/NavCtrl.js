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
		  	name:"Super Gomoku",
		  	url:"#/game/super gomoku"
		  }, 
		  {
		  	name:"Blackjack",
		  	url:"#/game/blackjack"
		  } , 
		  {
		  	name:"User Profile",
		  	url:"#/game/user profile"
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
