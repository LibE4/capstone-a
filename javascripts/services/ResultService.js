"use strict";

app.service("ResultService", function($rootScope, UserFactory){
	this.SharedGameData = {};
  var that = this; // to make this accesible inside any function

  /* calculate score of the Hand */
  this.getScore = function (cards){
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

	this.checkDeal = function (userHand, dealerHand){
	    userHand.score = that.getScore(userHand.cards);
	    dealerHand.score = that.getScore(dealerHand.cards);
	    if (userHand.score === 21 && dealerHand.score === 21){
	        that.SharedGameData.outcome = "You tied!";
	        // isPlaying = false; 
	    }else if (dealerHand.score === 21){
	        that.SharedGameData.outcome = "You lose!";
	        $rootScope.user.losses++;
	        $rootScope.user.balance -= that.SharedGameData.bet;
	        UserFactory.editUser($rootScope.user);
	        // isPlaying = false; 
	    }
	};

	this.checkUserHit = function (userHand, dealerHand){
	    userHand.score = that.getScore(userHand.cards);
	    if (userHand.score > 21){
	        that.SharedGameData.outcome = "You lose!";
	        $rootScope.user.losses++;
	        $rootScope.user.balance -= that.SharedGameData.bet;
	        UserFactory.editUser($rootScope.user);
	        // isPlaying = false; 
	    }
	};

	this.checkWinner = function (userHand, dealerHand){
	    userHand.score = that.getScore(userHand.cards);
	    dealerHand.score = that.getScore(dealerHand.cards);
	    if (dealerHand.score > 21 || userHand.score > dealerHand.score){
	        that.SharedGameData.outcome = "You win!";
	        $rootScope.user.wins++;
	        $rootScope.user.balance += that.SharedGameData.bet;
	        UserFactory.editUser($rootScope.user);
	        // isPlaying = false; 
	    }else if (dealerHand.score > userHand.score){
	        that.SharedGameData.outcome = "You lose!";
	        $rootScope.user.losses++;
	        $rootScope.user.balance -= that.SharedGameData.bet;
	        UserFactory.editUser($rootScope.user);
	        // isPlaying = false; 
	    }else if (dealerHand.score === userHand.score){
	        that.SharedGameData.outcome = "You tied!";
	        // isPlaying = false; 
	    }
	};
});