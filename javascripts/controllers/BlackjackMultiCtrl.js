"use strict";

app.controller("BlackjackMultiCtrl", function($scope, $rootScope, $location, RoomService){
    $rootScope.blackJack.hasDealer = true;
    $scope.maxPlayersOptions = [2, 3, 4, 5, 6];
    $rootScope.blackJack.newRoom.profile.maxPlayers = 3 + '';
    RoomService.getRooms();

    $scope.getRooms = function(){
        RoomService.getRooms();
    };

    $scope.createNewRoom = function(){
        RoomService.createNewRoom();
    };

    $scope.joinRoom = function(roomIdDOM){
        RoomService.joinRoom(roomIdDOM);
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

    var dealerHit = function (){
        RoomService.dealerHit();
    };

    var dealerStand = function (){
        RoomService.dealerStand();
    };

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
