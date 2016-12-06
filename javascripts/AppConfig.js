"use strict";

let isAuth = (AuthFactory) => new Promise((resolve, reject) => {
	if (AuthFactory.isAuthenticated()){
		resolve();
	} else {
		reject();
	}
});

app.run(function($rootScope, $location, FIREBASE_CONFIG, AuthFactory){
	firebase.initializeApp(FIREBASE_CONFIG);
	$rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute){
		let logged = AuthFactory.isAuthenticated();
		let appTo;
		if(currRoute.originalPath){
			appTo = currRoute.originalPath.indexOf('/auth') !== -1;
		}
		if(!appTo && !logged){
			event.preventDefault();
			$location.path('/auth');
		}
	});
});

app.config(function($routeProvider){
	$routeProvider
		.when('/auth', {
				templateUrl: 'partials/auth.html',
				controller: 'AuthCtrl'
		})
		.when('/game/blackjack', {
				templateUrl: 'partials/blackjack.html',
				controller: 'BlackjackCtrl'
		})		
		.when('/game/blackjack/single', {
				templateUrl: 'partials/blackjackSingle.html',
				controller: 'BlackjackSingleCtrl'
		})		
		.when('/game/blackjack/multiplayer', {
				templateUrl: 'partials/blackjackMulti.html',
				controller: 'BlackjackMultiCtrl'
		})		
		.when('/game/superTTT', {
				templateUrl: 'partials/blackjack.html',
				controller: 'BlackjackCtrl'
		})		
		.when('/game/tetris', {
				templateUrl: 'partials/blackjack.html',
				controller: 'BlackjackCtrl'
		})		
		.when('/logout', {
				templateUrl: 'partials/auth.html',
				controller: 'AuthCtrl',
				resolve: {isAuth}
		})
		.otherwise('/auth');

});

