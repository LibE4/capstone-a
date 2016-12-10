"use strict";

app.controller("BlackjackMultiCtrl", function($scope, $rootScope, $routeParams, $location, CardFactory, RoomFactory, UserFactory, ResultService, RoomService){
    $scope.SharedRoomData = RoomService.SharedRoomData;

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
    // $scope.resetDeal();


//     var thisPlayer = $rootScope.user.username;
//     $scope.newRoom = {};
//     $scope.newRoom.profile = {};
//     $scope.newRoom.standStatus = {numPlayerStand:0, isDealerStand:false};
//     $scope.rooms = {};
//     $scope.outcome = ''; 
//     $scope.isPlaying = true; 
//     $scope.isRoomSet = false; 
//     // $scope.isPlaying = false; 
//     $scope.dealerHand = {};
//     $scope.dealerHand.cards = [];
//     $scope.dealerHand.score = 0;
//     $scope.HumanPlayers = {};
//     $scope.HumanPlayers[thisPlayer] = {};
//     // $scope.userHand = {};
//     $scope.userHand = $scope.HumanPlayers[thisPlayer];
//     $scope.HumanPlayers[thisPlayer].cards = [];
//     $scope.HumanPlayers[thisPlayer].score = 0;
//     $scope.bet = 0;
//     var needShuffle = false;
//     var roomId = "";
//     var roomRef;
//     var numPlayers = 0;
//     var holeCardImg = "./winner_logo.png";


// //card room setup
//     let getRooms = () => {
//         RoomFactory.getRooms().then((response) => {
//             $scope.rooms = response;
//             console.log("rooms response", response);
//         });
//     };
//     getRooms();   

//     $scope.createNewRoom = function(){
//         $scope.newRoom.standStatus.clearTable = false;
//         $scope.newRoom.standStatus.isDealerStand = false;
//         $scope.newRoom.standStatus.numPlayerStand = 0;
//         $scope.newRoom.profile.players = {};
//         $scope.newRoom.profile.players[thisPlayer] = thisPlayer;
//         RoomFactory.postNewRoom($scope.newRoom).then(function(response){
//             // console.log("create response", response);
//             $scope.isRoomSet = true; 
//             roomId = response.name;
//             $rootScope.user.roomid = roomId;
//             // Reference to the /messages/ database path.
//             roomRef = firebase.database().ref(`cardRooms/${roomId}`);
//             roomRef.off();
//             roomRef.on('child_added', setRealtimeData);
//             roomRef.on('child_changed', setRealtimeData);
//         });
//     };

//     $scope.joinRoom = function(roomIdDOM){
//         roomId = roomIdDOM;
//         $rootScope.user.roomid = roomId;
//         RoomFactory.getProfileInRoom(roomId).then(function(roomProfile){
//             $scope.newRoom.profile = roomProfile;
//             $scope.newRoom.profile.players[thisPlayer] = thisPlayer;
//             RoomFactory.editPlayerList(roomId, $scope.newRoom.profile.players).then(function(){
//                 $scope.isRoomSet = true; 
//                 // Reference to the /messages/ database path.
//                 roomRef = firebase.database().ref(`cardRooms/${roomId}`);
//                 console.log("roomRef", roomRef);
//                 roomRef.off();
//                 roomRef.on('child_added', setRealtimeData);
//                 roomRef.on('child_changed', setRealtimeData);
//             });
//         })
//     };

// // to sync cards, players in same room
//     var setRealtimeData = function(data1, data2) {
//         console.log("data1", data1.val());
//         if (data1.val().hasOwnProperty("code")) {
//             console.log("data", data1.val(), data2);
//             // process cards received
//             let card = data1.val();
//             if (card.username === "Dealer") {
//                     $scope.dealerHand.cards.push(card);
//                     if($scope.dealerHand.cards.length === 1){
//                         let c = $scope.dealerHand.cards[0].image;
//                         $scope.dealerHand.cards[0].image = holeCardImg;
//                         holeCardImg = c;
//                     }            
//                 console.log("$scope.dealerHand.cards", $scope.dealerHand.cards);
//                     checkDeal($scope.HumanPlayers[thisPlayer], $scope.dealerHand);
//             } else {
//                 if (!$scope.HumanPlayers.hasOwnProperty(card.username)) {
//                     $scope.HumanPlayers[card.username] = {};
//                     $scope.HumanPlayers[card.username].cards = [];
//                     $scope.HumanPlayers[card.username].cards[0] = card;
//                 } else {
//                     // console.log("$scope.HumanPlayers[card.username].cards", $scope.HumanPlayers[card.username]);
//                     $scope.HumanPlayers[card.username].cards.push(card);
//                     if (thisPlayer === card.username){
//                         checkUserHit($scope.HumanPlayers[thisPlayer], $scope.dealerHand);
//                         // console.log("$scope.HumanPlayers[thisPlayer]", $scope.HumanPlayers[thisPlayer]);
//                     }
//                 }
//             }
//         } else if (data1.val().hasOwnProperty("players")) {
//             // process room profile info
//             $scope.newRoom.profile.players = data1.val().players;
//             numPlayers = Object.keys($scope.newRoom.profile.players).length;
//         } else if (data1.val().hasOwnProperty("isDealerStand")) {
//             // process stand status info 
//             let clearTable = data1.val().clearTable;
//             if (clearTable){
//                 $scope.outcome = ''; 
//                 $scope.dealerHand = {};
//                 $scope.dealerHand.cards = [];
//                 $scope.dealerHand.score = 0;
//                 $scope.HumanPlayers = {};
//                 $scope.HumanPlayers[thisPlayer] = {};
//                 $scope.HumanPlayers[thisPlayer].cards = [];
//                 $scope.HumanPlayers[thisPlayer].score = 0;
//                 $scope.newRoom.standStatus.clearTable = false;
//                 RoomFactory.editRoom($scope.newRoom, roomId).then(function(){});
//             }
//             $scope.newRoom.standStatus.numPlayerStand = data1.val().numPlayerStand;        
//             console.log("$scope.newRoom.standStatus.numPlayerStand", $scope.newRoom.standStatus.numPlayerStand);      
//             let isDealerStand = data1.val().isDealerStand;
//             if (isDealerStand) {
//                 let c = $scope.dealerHand.cards[0].image;
//                 $scope.dealerHand.cards[0].image = holeCardImg;
//                 holeCardImg = c;
//                 checkWinner($scope.HumanPlayers[thisPlayer], $scope.dealerHand);  
//             }
//         }
//         $scope.$apply();
//     };

//     $scope.deal = function (){
//         if(needShuffle){
//             shuffle();
//             needShuffle = false;
//         }
//         CardFactory.getCards( numPlayers * 2 + 2 ).then(function(response){
//             console.log("response.remaining", response.remaining);
//             if(parseInt(response.remaining) <= 60) { needShuffle = true; }
//             // $scope.isPlaying = true;
//             let count = 0;
//             for (let prop in $scope.newRoom.profile.players) {
//                 for (let i = 0; i < 2; i++){
//                     let card = response.cards[count];
//                     card.username = prop;
//                     RoomFactory.postCardInRoom(roomId, card).then(function(){
//                     });
//                     count++;
//                 }
//             }
//             for (let i = count; i < count + 2; i++){
//                 let card = response.cards[i];
//                 card.username = "Dealer";
//                 RoomFactory.postCardInRoom(roomId, card).then(function(){
//                 });
//             }
//         });
//     }; //start to play

//     var shuffle = function (){
//         CardFactory.shuffleCards();
//     };

//     $scope.userHit = function (){
//         CardFactory.getCards(1).then(function(response){
//             let card = response.cards[0];
//             card.username = thisPlayer;
//             RoomFactory.postCardInRoom(roomId, card).then(function(){});
//         });
//     }; //user's play

//     $scope.userStand =  function (){
//         let numPlayerStand = ++$scope.newRoom.standStatus.numPlayerStand;
//         RoomFactory.editStandStatus(roomId, $scope.newRoom.standStatus).then(function(){});
//         console.log("numPlayerStand", numPlayerStand);
//         console.log("numPlayers", numPlayers);
//         if (numPlayerStand === numPlayers){
//             // dealer reveal cards,then
//             if ($scope.dealerHand.score >= 17){
//                 $scope.newRoom.standStatus.isDealerStand = true;
//                 RoomFactory.editStandStatus(roomId, $scope.newRoom.standStatus).then(function(){});
//             }else{
//                 dealerHit();
//             }
//         }
//     }; //let dealer play

//     var dealerHit = function (){
//         if ($scope.dealerHand.score < 17){
//             CardFactory.getCards(1).then(function(response){
//                 console.log("dealer hit");
//                 let card = response.cards[0];
//                 card.username = "Dealer";
//                 RoomFactory.postCardInRoom(roomId, card).then(function(){
//                     $scope.dealerHand.score = getScore($scope.dealerHand.cards);
//                     if ($scope.dealerHand.score >= 17){
//                         $scope.newRoom.standStatus.isDealerStand = true;
//                         RoomFactory.editStandStatus(roomId, $scope.newRoom.standStatus).then(function(){});
//                         return;
//                     }
//                     dealerHit();
//                 });
//             });
//         }
//     }

//     /* calculate score of the Hand */
//     var getScore = function (cards){
//         var score = 0, cardVal = 0, aces = 0; 
        
//         for (let i=0; i<cards.length; i++){
//             switch (cards[i].value.toLowerCase()){
//                 case "ace":
//                     cardVal = 11;
//                     aces += 1;
//                     break;
//                 case "king":
//                 case "queen":
//                 case "jack":
//                     cardVal = 10;
//                     break;
//                 default:
//                     cardVal = parseInt(cards[i].value);
//                     break;
//             }
//             score += cardVal;
//         }
//         /* Check to see if Aces should be 1 or 11 */
//         while (score > 21 && aces > 0){
//             score -= 10;
//             aces -=1;
//         }
//         return score;
//     };

//     var checkDeal = function (userHand, dealerHand){
//         userHand.score = getScore(userHand.cards);
//         dealerHand.score = getScore(dealerHand.cards)
//         if (userHand.score === 21 && dealerHand.score === 21){
//             $scope.outcome = "You tied!";
//             $scope.userStand();
//             // $scope.isPlaying = false; 
//         }else if (dealerHand.score === 21){
//             $scope.outcome = "You lose!";
//             $rootScope.user.losses++;
//             $rootScope.user.balance -= $scope.bet;
//             UserFactory.editUser($rootScope.user);
//             $scope.userStand();
//             // $scope.isPlaying = false; 
//         }
//     };

//     var checkUserHit = function (userHand, dealerHand){
//         userHand.score = getScore(userHand.cards);
//         if (userHand.score > 21){
//             $scope.outcome = "You lose!";
//             $rootScope.user.losses++;
//             $rootScope.user.balance -= $scope.bet;
//             UserFactory.editUser($rootScope.user);
//             $scope.userStand();
//             // $scope.isPlaying = false; 
//         }
//     };

//     var checkWinner = function (userHand, dealerHand){
//         userHand.score = getScore(userHand.cards);
//         dealerHand.score = getScore(dealerHand.cards)
//         if (dealerHand.score > 21 || userHand.score > dealerHand.score){
//             $scope.outcome = "You win!";
//             $rootScope.user.wins++;
//             $rootScope.user.balance += $scope.bet;
//             UserFactory.editUser($rootScope.user);
//             // $scope.isPlaying = false; 
//         }else if (dealerHand.score > userHand.score){
//             $scope.outcome = "You lose!";
//             $rootScope.user.losses++;
//             $rootScope.user.balance -= $scope.bet;
//             UserFactory.editUser($rootScope.user);
//             // $scope.isPlaying = false; 
//         }else if (dealerHand.score === userHand.score){
//             $scope.outcome = "You tied!";
//             // $scope.isPlaying = false; 
//         }
//     };

//     $scope.resetDeal = function(){
//         console.log("$scope.newRoom", $scope.newRoom);
//         $scope.newRoom.standStatus.clearTable = true;
//         $scope.newRoom.standStatus.isDealerStand = false;
//         RoomFactory.editRoom($scope.newRoom, roomId).then(function(){});
//         // $scope.isPlaying = false; 
//         // $scope.userHand = {};
//         // $scope.dealerHand = {};
//         // $scope.dealerHand.cards = [];
//     };

});
