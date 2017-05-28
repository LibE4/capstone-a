"use strict";

app.controller("BlackjackSingleCtrl", function($scope, $rootScope, $location, CardFactory, ResultService){
  $rootScope.blackJack.userHand = {};
  $rootScope.blackJack.dealerHand = {};
  $rootScope.blackJack.userHand.score = 0;
  $rootScope.blackJack.dealerHand.score = 0;
  $rootScope.blackJack.bet = 0;
  $rootScope.blackJack.isPlaying = true; 
  $rootScope.blackJack.isDealerTurn = false; 
  $rootScope.blackJack.isResultOut = false; 
  var needShuffle = false;    
  var holeCardImg = "img/buffy.jpg";
  $scope.gameOn = false;
  $scope.standOn = false;

  $scope.deal = function (){
    $scope.gameOn = true;
    CardFactory.getCards(4).then(function(response){
        if (parseInt(response.remaining) <= 75) { needShuffle = true; }
        $rootScope.blackJack.userHand.cards = response.cards.splice(0, 2);
        getPlayerScore("userHand");
        $rootScope.blackJack.dealerHand.cards = response.cards;
        getPlayerScore("dealerHand");
        // dealer hide first card
        dealerFlipCard();
        ResultService.checkDeal($rootScope.blackJack.userHand, $rootScope.blackJack.dealerHand);
        if ($rootScope.blackJack.isResultOut) { dealerFlipCard(); voice(); }
        else if ($rootScope.blackJack.isDealerTurn) $scope.userStand();
    });
  }; //start to play

  $scope.userHit = function (){
      CardFactory.getCards(1).then(function(response){
          $rootScope.blackJack.userHand.cards = $rootScope.blackJack.userHand.cards.concat(response.cards);
          getPlayerScore("userHand");
          ResultService.checkUserHit($rootScope.blackJack.userHand);
          if ($rootScope.blackJack.isResultOut) { dealerFlipCard(); voice(); }
          else if ($rootScope.blackJack.isDealerTurn) $scope.userStand();
      });
  }; //user's play

  $scope.userStand =  function (){
    $scope.standOn = true;
    $rootScope.blackJack.isDealerTurn = true;
    dealerFlipCard();
    if ($rootScope.blackJack.dealerHand.score >= 17){
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
    $rootScope.blackJack.outcome = ''; 
    $rootScope.blackJack.userHand = {};
    $rootScope.blackJack.dealerHand = {};
    $rootScope.blackJack.userHand.score = 0;
    $rootScope.blackJack.dealerHand.score = 0;
    $rootScope.blackJack.isDealerTurn = false;
    $rootScope.blackJack.isResultOut = false;
    holeCardImg = "img/buffy.jpg";      
    $scope.gameOn = false;
    $scope.standOn = false;
  };    

  var dealerHit = function (){
      if ($rootScope.blackJack.dealerHand.score < 17){
          CardFactory.getCards(1).then(function(response){
              $rootScope.blackJack.dealerHand.cards = $rootScope.blackJack.dealerHand.cards.concat(response.cards);
              getPlayerScore("dealerHand");
              if ($rootScope.blackJack.dealerHand.score >= 17){
                  dealerStand();
                  return;
              }
              dealerHit();
          });
      }
  };

  var dealerStand = function (){
      ResultService.checkWinner($rootScope.blackJack.userHand, $rootScope.blackJack.dealerHand);
      voice();
  };

  var dealerFlipCard = function (){
      let c = $rootScope.blackJack.dealerHand.cards[0].image;
      $rootScope.blackJack.dealerHand.cards[0].image = holeCardImg;
      holeCardImg = c;
  };

  var getPlayerScore = function (hand){
      $rootScope.blackJack[hand].score = ResultService.getScore($rootScope.blackJack[hand].cards);
  };

  $scope.leaveRoom = function(){
      $location.url("/game/blackjack");
      $scope.resetDeal();
  };

  var msg = new SpeechSynthesisUtterance();
  var voice = function(){
    msg.text = $rootScope.blackJack.outcome;
    window.speechSynthesis.speak(msg);
  };

});
