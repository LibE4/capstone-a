"use strict";

app.controller("AuthCtrl", function($scope, $rootScope, $location, AuthFactory, UserFactory){
	$scope.loginContainer = true;
	$scope.registerContainer = false;
	$scope.login = {
		email: "a@a.com",
		password: "123456"
	};
	

	if($location.path() === "/logout"){
		AuthFactory.logout();
		$rootScope = {};
		$location.url("/auth");
	}

	let logMeIn = function(loginStuff){
		AuthFactory.authenticate(loginStuff).then(function(didLogin){
			console.log("didLogin", didLogin);
			return UserFactory.getUser(didLogin.uid);
		})
		.then(function(userCreds){
			$rootScope.user = userCreds;
			$scope.login = {};
			$scope.register = {};
			$location.url("/game/blackjack");
		});
	};
	
	$scope.setLoginContainer = function(){
		$scope.loginContainer = true;
		$scope.registerContainer = false;

	};

	$scope.setRegisterContainer = function(){
		$scope.loginContainer = false;
		$scope.registerContainer = true;

	};

  $scope.setGoogleLoginContainer = () => {
      $scope.loginContainer = false;
      $scope.registerContainer = false;
      $scope.googleLoginContainer = true;
  };

	$scope.registerUser = function(registerNewUser){
		AuthFactory.registerWithEmail(registerNewUser).then(function(didRegister){
			registerNewUser.uid = didRegister.uid;
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
        $rootScope.user = {
          uid: userData.uid,
          username: userData.displayName
        };
        console.log("$rootScope.user",$rootScope.user );
        $location.url("/game/blackjack");
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