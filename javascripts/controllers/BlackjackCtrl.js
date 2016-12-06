"use strict";

app.controller("BlackjackCtrl", function($scope){
    $scope.navCardGame = 
        [
          {
            name:"Play Single Game",
            url:"#/game/blackjack/single"
          }, 
          {
            name:"Create Multiplayer Game",
            url:"#/game/blackjack/multiplayer"
          }, 
          {
            name:"Join Multiplayer Game",
            url:"#/game/blackjack/join-multi"
          }, 
          {
            name:"Create One To One Game",
            url:"#/game/blackjack/createptp"
          },
          {
            name:"Join One To One Game",
            url:"#/game/blackjack/playptp"
          }
    ];
});
