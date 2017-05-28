"use strict";

app.controller("AuthCtrl", function($scope, $rootScope, $location, AuthFactory, UserFactory){
	$scope.loginContainer = true;
	$scope.registerContainer = false;
  $scope.googleLoginContainer = false;
	//$scope.login = {
	//	email: "a@a.com",
	//	password: "123456"
	//};
	

	if($location.path() === "/logout"){
		AuthFactory.logout();
		$rootScope = {};
		$location.url("/auth");
	}

	let logMeIn = function(loginStuff){
		AuthFactory.authenticate(loginStuff).then(function(didLogin){
			return UserFactory.getUser(didLogin.uid);
		})
		.then(function(userCreds){
			$rootScope.user = userCreds;
			$scope.login = {};
			$scope.register = {};
			$location.url("/game/home");
		});
	};
	
	$scope.setLoginContainer = function(){
		$scope.loginContainer = true;
		$scope.registerContainer = false;
    $scope.googleLoginContainer = false;
	};

	$scope.setRegisterContainer = function(){
		$scope.loginContainer = false;
		$scope.registerContainer = true;
    $scope.googleLoginContainer = false;
	};

  $scope.setGoogleLoginContainer = () => {
      $scope.loginContainer = false;
      $scope.registerContainer = false;
      $scope.googleLoginContainer = true;
  };

	$scope.registerUser = function(registerNewUser){
		AuthFactory.registerWithEmail(registerNewUser).then(function(didRegister){
			registerNewUser.uid = didRegister.uid;
			registerNewUser.icon = 'img/user-default.png';
			registerNewUser.balance = 0;
			registerNewUser.wins = 0;
			registerNewUser.losses = 0;
			registerNewUser.sgWins = 0;
			registerNewUser.sgLosses = 0;
			registerNewUser.totalLines = 0;
			registerNewUser.totalShapes = 0;
			return UserFactory.addUser(registerNewUser);
		}).then(function(registerComplete){
			logMeIn(registerNewUser);

		});
	};

	$scope.loginUser = function(loginNewUser){
		logMeIn(loginNewUser);
	};
	
  $scope.googleLoginUser = () => {
    AuthFactory.authenticateGoogle().then((userData) => {
      // The signed-in user info.
			UserFactory.getUser(userData.uid).then(function(newUserData){
        if (newUserData === undefined){
	        $rootScope.user = {
	          uid: userData.uid,
						icon: "img/user-default.png",
	          username: userData.displayName,
						balance : 100,
						wins : 0,
						losses : 0,
						sgWins : 0,
						sgLosses : 0,
						totalLines : 0,
						totalShapes : 0
	        };
					UserFactory.addUser($rootScope.user).then(function(){});
        } else {
					$rootScope.user = newUserData;
        }
			});
      $location.url("/game/home");
    }).catch(function(error) {
      // Handle Errors here.
      console.log("user error", error);
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  };

});