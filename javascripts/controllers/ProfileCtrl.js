"use strict";

app.controller("ProfileCtrl", function($scope, $rootScope, UserFactory, fileReader){
  $scope.recharge = function(rechargeAmount){
    $rootScope.user.balance += rechargeAmount;
    UserFactory.editUser($rootScope.user);
  };

  $scope.getFile = function () {
    fileReader.readAsDataUrl($scope.file, $scope)
                  .then(function(result) {
                      $scope.imageSrc = result;
                  });
  };

  $scope.uploadFile = function () {
  	var storageRef = firebase.storage().ref();
	  // Upload file and metadata to the object 'icons/mountains.jpg'
	  var uploadTask = storageRef.child('icons/' + $scope.file.name).put($scope.file);

	  // Listen for state changes, errors, and completion of the upload.
	  uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
	    function(snapshot) {
	      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
	      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
	      console.log('Upload is ' + progress + '% done');
	      switch (snapshot.state) {
	        case firebase.storage.TaskState.PAUSED: // or 'paused'
	          console.log('Upload is paused');
	          break;
	        case firebase.storage.TaskState.RUNNING: // or 'running'
	          console.log('Upload is running');
	          break;
	      }
	    }, function(error) {
	    switch (error.code) {
	      case 'storage/unauthorized':
	        // User doesn't have permission to access the object
	        break;

	      case 'storage/canceled':
	        // User canceled the upload
	        break;
	      case 'storage/unknown':
	        // Unknown error occurred, inspect error.serverResponse
	        break;
	    }
	  }, function() {
	    // Upload completed successfully, now we can get the download URL
	    $scope.downloadURL = uploadTask.snapshot.downloadURL;
	    var img = document.getElementById('userIcon');
		  img.src = $scope.downloadURL;
      $rootScope.user.icon = $scope.downloadURL;
	    UserFactory.editUser($rootScope.user).then(function(){
	    	$scope.file = "";
	    	$scope.imageSrc = "";
	    });

	  });
  };

});
