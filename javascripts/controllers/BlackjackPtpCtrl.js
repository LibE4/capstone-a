"use strict";

app.controller("BlackjackPtpCtrl", function($scope, $rootScope, $location, RoomService){
    $rootScope.blackJack.hasDealer = false;
    $rootScope.blackJack.newRoom.profile.maxPlayers = 2;
    RoomService.getRooms();

    $scope.getRooms = function(){
        RoomService.getRooms();
    };

    $scope.createNewRoom = function(){
        RoomService.createNewRoom();
    };

    $scope.joinRoom = function(roomIdDOM){
        RoomService.joinRoom(roomIdDOM, 2);
    };

    $scope.leaveRoom = function(){
        $location.url("/game/blackjack");
        RoomService.leaveRoom();
    };

    $scope.deal = function (){
        RoomService.deal();
    }; //start to play

    $scope.userHit = function (){
        RoomService.userHit();
    }; //user's play

    $scope.userStand =  function (){
        RoomService.userStand();
    }; //let dealer play

    $scope.resetDeal = function(){
        RoomService.resetDeal();
    };
    
    $scope.filterDealer = function(players) {
        var result = {};
        angular.forEach(players, function(value, key) {
            if (value !== 'Dealer') {
                result[key] = value;
            }
        });
        return result;
    }; 

    $scope.send = function(){
        event.preventDefault();
        RoomService.send();
    };    
});
