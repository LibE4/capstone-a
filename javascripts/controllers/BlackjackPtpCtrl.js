"use strict";

app.controller("BlackjackPtpCtrl", function($scope, $rootScope, $routeParams, $location, CardFactory, RoomFactory, UserFactory, ResultService, RoomService){
    $scope.SharedRoomData = RoomService.SharedRoomData;
    $scope.SharedRoomData.hasDealer = false;

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

    $scope.resetDeal = function(){
        RoomService.resetDeal();
    };
  
});
