angular.module('shopmycourse.controllers')

.controller('ProfileEditCtrl', function($scope, $state, $ionicHistory, $ionicViewSwitcher, CurrentUser, UserAPI) {

  $scope.user = CurrentUser.get();

  $scope.endEdit = function () {
    UserAPI.update($scope.user, function (user) {
      CurrentUser.set(user);
      $ionicViewSwitcher.nextDirection('back');
      $ionicHistory.nextViewOptions({
        disableAnimate: false,
        disableBack: true
      });
      $state.go('tabs.profile');
    }, function (err) {

    });
  }
})
