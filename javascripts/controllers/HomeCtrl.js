"use strict";

app.controller("HomeCtrl", function($scope, $rootScope, UserFactory){
  $scope.recharge = function(rechargeAmount){
    $rootScope.user.balance += rechargeAmount;
    UserFactory.editUser($rootScope.user);
  };
});