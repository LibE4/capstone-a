"use strict";

app.service("ResultService", function($rootScope, UserFactory){
  $rootScope.blackJack = {};
  $rootScope.blackJack.outcome = "";
  $rootScope.blackJack.isResultOut = false;
  $rootScope.blackJack.isDealerTurn = false;
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
	    if (dealerHand.score === 21){
	    	$rootScope.blackJack.isResultOut = true;
		    if (userHand.score === 21){
		        $rootScope.blackJack.outcome = "You tied!";
		    }else {
		        $rootScope.blackJack.outcome = "You lost!";
		        $rootScope.user.losses++;
		        $rootScope.user.balance -= $rootScope.blackJack.bet;
		        UserFactory.editUser($rootScope.user);
        } 
	    } else if (userHand.score === 21){
	    	$rootScope.blackJack.isDealerTurn = true;
	    }
	};

	this.checkUserHit = function (userHand){
	    if (userHand.score >= 21){
		    	$rootScope.blackJack.isDealerTurn = true;
			    if (userHand.score > 21){
			    	$rootScope.blackJack.isResultOut = true;
		        $rootScope.blackJack.outcome = "You lost!";
		        $rootScope.user.losses++;
		        $rootScope.user.balance -= $rootScope.blackJack.bet;
		        UserFactory.editUser($rootScope.user);
		    	}
	    }
	};

	this.checkWinner = function (userHand, dealerHand){
    	$rootScope.blackJack.isResultOut = true;
	    if (dealerHand.score > 21 || userHand.score > dealerHand.score){
	        $rootScope.blackJack.outcome = "You won!";
	        $rootScope.user.wins++;
	        $rootScope.user.balance += $rootScope.blackJack.bet;
	        UserFactory.editUser($rootScope.user);
	    }else if (dealerHand.score > userHand.score){
	        $rootScope.blackJack.outcome = "You lost!";
	        $rootScope.user.losses++;
	        $rootScope.user.balance -= $rootScope.blackJack.bet;
	        UserFactory.editUser($rootScope.user);
	    }else if (dealerHand.score === userHand.score){
	        $rootScope.blackJack.outcome = "You tied!";
	    }
	};

	this.checkPtpDeal = function (userHand, rivalHand){
	    if (userHand.score === 21 && rivalHand.score === 21){
	        $rootScope.blackJack.outcome = "You tied!";
	    }else if (userHand.score === 21 && rivalHand.score !== 21){
	        $rootScope.blackJack.outcome = "You won!";
	        $rootScope.user.wins++;
	        $rootScope.user.balance += $rootScope.blackJack.bet;
	        UserFactory.editUser($rootScope.user);
	    }else if (userHand.score !== 21 && rivalHand.score === 21){
	        $rootScope.blackJack.outcome = "You lost!";
	        $rootScope.user.losses++;
	        $rootScope.user.balance -= $rootScope.blackJack.bet;
	        UserFactory.editUser($rootScope.user);
      } 
	}; 
	this.checkPtpWinner = function (userHand, rivalHand){
    	$rootScope.blackJack.isResultOut = true;
	    if (rivalHand.score > 21 && userHand.score <= 21){
        $rootScope.blackJack.outcome = "You won!";
		  } else if (rivalHand.score <= 21 && userHand.score > 21){
        $rootScope.blackJack.outcome = "You lost!";
		  } else if (rivalHand.score <= 21 && userHand.score <= 21){
		    if (userHand.score > rivalHand.score){
		        $rootScope.blackJack.outcome = "You won!";
		        $rootScope.user.wins++;
		        $rootScope.user.balance += $rootScope.blackJack.bet;
		        UserFactory.editUser($rootScope.user);
		    }else if (rivalHand.score > userHand.score){
		        $rootScope.blackJack.outcome = "You lost!";
		        $rootScope.user.losses++;
		        $rootScope.user.balance -= $rootScope.blackJack.bet;
		        UserFactory.editUser($rootScope.user);
		    }else if (rivalHand.score === userHand.score){
		        $rootScope.blackJack.outcome = "You tied!";
		    }
		  } else {
		        $rootScope.blackJack.outcome = "You both busted!";
		      }
	};
});