"use strict";

app.controller("BlackjackSingleCtrl", function($scope, $rootScope, $location, CardFactory, ResultService){
  $scope.SharedGameData = ResultService.SharedGameData;
  $scope.SharedGameData.userHand = {};
  $scope.SharedGameData.dealerHand = {};
  $scope.SharedGameData.userHand.score = 0;
  $scope.SharedGameData.dealerHand.score = 0;
  $scope.SharedGameData.bet = 0;
  $scope.SharedGameData.isPlaying = true; 
  var needShuffle = false;    
  var holeCardImg = "./winner_logo.png";


  $scope.deal = function (){
      CardFactory.getCards(4).then(function(response){
          if(parseInt(response.remaining) <= 75) { needShuffle = true; }
          // isPlaying = true; 
          $scope.SharedGameData.userHand.cards = response.cards.splice(0, 2);
          $scope.SharedGameData.dealerHand.cards = response.cards;
          let c = $scope.SharedGameData.dealerHand.cards[0].image;
          $scope.SharedGameData.dealerHand.cards[0].image = holeCardImg;
          holeCardImg = c;
          ResultService.checkDeal($scope.SharedGameData.userHand, $scope.SharedGameData.dealerHand);
      });
  }; //start to play

  $scope.userHit = function (){
      CardFactory.getCards(1).then(function(response){
          $scope.SharedGameData.userHand.cards = $scope.SharedGameData.userHand.cards.concat(response.cards);
          ResultService.checkUserHit($scope.SharedGameData.userHand, $scope.SharedGameData.dealerHand);
      });
  }; //user's play

  $scope.userStand =  function (){
      console.log("userStand");
      if ($scope.SharedGameData.dealerHand.score >= 17){
          dealerStand();
      }else{
          dealerHit();
      }
  }; //let dealer play

  $scope.resetDeal = function(){
      if(needShuffle){
          CardFactory.shuffleCards();
          needShuffle = false;
      }        
      $scope.SharedGameData.outcome = ''; 
      $scope.SharedGameData.userHand = {};
      $scope.SharedGameData.dealerHand = {};
      $scope.SharedGameData.userHand.score = 0;
      $scope.SharedGameData.dealerHand.score = 0;
      // isPlaying = false; 
  };    

  var dealerHit = function (){
      if ($scope.SharedGameData.dealerHand.score < 17){
          CardFactory.getCards(1).then(function(response){
              console.log("dealer hit");
              $scope.SharedGameData.dealerHand.cards = $scope.SharedGameData.dealerHand.cards.concat(response.cards);
              $scope.SharedGameData.dealerHand.score = ResultService.getScore($scope.SharedGameData.dealerHand.cards);
              if ($scope.SharedGameData.dealerHand.score >= 17){
                  dealerStand();
                  return;
              }
              dealerHit();
          });
      }
  }

  var dealerStand = function (){
      console.log("dealer stand");
      let c = $scope.SharedGameData.dealerHand.cards[0].image;
      $scope.SharedGameData.dealerHand.cards[0].image = holeCardImg;
      holeCardImg = c;
      ResultService.checkWinner($scope.SharedGameData.userHand, $scope.SharedGameData.dealerHand);
  }

  $scope.leaveRoom = function(){
      $location.url("/game/blackjack");
      $scope.resetDeal();
  };

  $scope.resetDeal();
});
