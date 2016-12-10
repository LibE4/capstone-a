"use strict";

app.controller("BlackjackCtrl", function($scope){
    $scope.navCardGame = 
        [
          {
            name:"Play Single Game",
            url:"#/game/blackjack/single"
          }, 
          {
            name:"Multiplayer Game",
            url:"#/game/blackjack/multiplayer"
          }, 
          {
            name:"Player Dual Game",
            url:"#/game/blackjack/playptp"
          }
    ];
});
