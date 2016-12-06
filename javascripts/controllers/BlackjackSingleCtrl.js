"use strict";

app.controller("BlackjackSingleCtrl", function($scope, $routeParams, $location, CardFactory){
    $scope.outcome = ''; 
    $scope.isPlaying = true; 
    // $scope.isPlaying = false; 
    $scope.userHand = {};
    $scope.dealerHand = {};
    $scope.userHand.score = 0;
    $scope.dealerHand.score = 0;
    var needShuffle = false;    

    var shuffle = function (){
        CardFactory.shuffleCards();
    };

    $scope.deal = function (){
        if(needShuffle){
            shuffle();
            needShuffle = false;
        }        
        CardFactory.getCards(4).then(function(response){
            if(parseInt(response.remaining) <= 60) { needShuffle = true; }
            // $scope.isPlaying = true; 
            $scope.userHand.cards = response.cards.splice(0, 2);
            $scope.dealerHand.cards = response.cards;
            checkDeal($scope.userHand, $scope.dealerHand);
        });
    }; //start to play

    $scope.userHit = function (){
        CardFactory.getCards(1).then(function(cards){
            $scope.userHand.cards = $scope.userHand.cards.concat(cards);
            checkUserHit($scope.userHand, $scope.dealerHand);
        });
    }; //user's play

    $scope.userStand =  function (){
        console.log("userStand");
        if ($scope.dealerHand.score >= 17){
            dealerStand();
        }else{
            dealerHit();
        }
    }; //let dealer play

    var dealerHit = function (){
        if ($scope.dealerHand.score < 17){
            CardFactory.getCards(1).then(function(cards){
                console.log("dealer hit");
                $scope.dealerHand.cards = $scope.dealerHand.cards.concat(cards);
                $scope.dealerHand.score = getScore($scope.dealerHand.cards);
                if ($scope.dealerHand.score >= 17){
                    dealerStand();
                    return;
                }
                dealerHit();
            });
        }
    }

    var dealerStand = function (){
        console.log("dealer stand");
        checkWinner($scope.userHand, $scope.dealerHand);
    }

    /* calculate score of the Hand */
    var getScore = function (cards){
        var score = 0, cardVal = 0, aces = 0; 
        
        for (let i=0; i<cards.length; i++){
            switch (cards[i].value.toLowerCase()){
                case "ace":
                    cardVal = 11;
                    aces += 1;
                    break;
                case "king":
                case "queen":
                case "jack":
                    cardVal = 10;
                    break;
                default:
                    cardVal = parseInt(cards[i].value);
                    break;
            }
            score += cardVal;
        }
        /* Check to see if Aces should be 1 or 11 */
        while (score > 21 && aces > 0){
            score -= 10;
            aces -=1;
        }
        return score;
    };

    var checkDeal = function (userHand, dealerHand){
        userHand.score = getScore(userHand.cards);
        dealerHand.score = getScore(dealerHand.cards)
        if (userHand.score === 21 && dealerHand.score === 21){
            $scope.outcome = "You tied!";
            // $scope.isPlaying = false; 
        }else if (userHand.score === 21){
            $scope.outcome = "You win!";
            // $scope.isPlaying = false; 
        }else if (dealerHand.score === 21){
            $scope.outcome = "You lose!";
            // $scope.isPlaying = false; 
        }
    };

    var checkUserHit = function (userHand, dealerHand){
        userHand.score = getScore(userHand.cards);
        if (userHand.score === 21){
            $scope.outcome = "You win!";
            // $scope.isPlaying = false; 
        }else if (userHand.score > 21){
            $scope.outcome = "You lose!";
            // $scope.isPlaying = false; 
        }
    };

    var checkWinner = function (userHand, dealerHand){
        userHand.score = getScore(userHand.cards);
        dealerHand.score = getScore(dealerHand.cards)
        if (userHand.score > 21 || dealerHand.score === 21){
            $scope.outcome = "You lose!";
            // $scope.isPlaying = false; 
        }else if (userHand.score === 21 || dealerHand.score > 21 || userHand.score > dealerHand.score){
            $scope.outcome = "You win!";
            // $scope.isPlaying = false; 
        }else if (dealerHand.score > userHand.score){
            $scope.outcome = "You lose!";
            // $scope.isPlaying = false; 
        }else if (dealerHand.score === userHand.score){
            $scope.outcome = "You tied!";
            // $scope.isPlaying = false; 
        }
    };

    var resetDeal = function(){
        $scope.outcome = ''; 
        // $scope.isPlaying = false; 
        $scope.userHand = {};
        $scope.dealerHand = {};
        $scope.userHand.score = 0;
        $scope.dealerHand.score = 0;
    };

});
