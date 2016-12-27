"use strict";

app.controller("BlackjackCtrl", function($scope){
    $scope.navCardGame = 
        [
          {
            name:"Play Single Game",
            url:"#/game/blackjack/single",
            description:"In this game, you play against a computer dealer. All regular blackjack game rules apply."
          }, 
          {
            name:"Multiplayer Game",
            url:"#/game/blackjack/multiplayer",
            description:"In this game, multiplayers play against a computer dealer. All regular blackjack game rules apply."
          }, 
          {
            name:"Player Dual Game",
            url:"#/game/blackjack/playptp",
            description:"In this game, you are against one human player. There is no dealer. Results will be checked after deal or both players stand."
          }
    ];
});
