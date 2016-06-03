angular.module('shopmycourse.controllers')

.controller('ProfileShowCtrl', function($scope, $ionicLoading, $state, $ionicPopup, Authentication, CurrentUser, CurrentAddress, UserAPI) {

  $scope.user = {};
  $ionicLoading.show({
    template: 'Nous récupérons votre profil...'
  });
  CurrentUser.get(function (user) {
      $scope.user = user;
      $scope.avatarBackground = CurrentUser.getAvatar();
      $ionicLoading.hide();
  })

  $scope.togglePhone = function () {
    if (!$scope.user.share_phone) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Masquer son numéro de téléphone',
        template: 'Êtes-vous sûr de vouloir masquer votre numéro de téléphone ?<br>On vous le déconseille afin de pouvoir communiquer plus facilement avec les autres utilisateurs, si un article est manquant par exemple.<br>De plus cela peut détériorer la note laissée par les autres utilisateurs.'
      });

      confirmPopup.then(function (res) {
        $scope.user.share_phone = !res;
        $ionicLoading.show({
          template: 'Nous sauvegardons vos préférences...'
        });
        UserAPI.update($scope.user, function (user) {
          $ionicLoading.hide();
          CurrentUser.set(user, function() {});
          $scope.user = user;
        });
      });
    } else {
      $ionicLoading.show({
        template: 'Nous sauvegardons vos préférences...'
      });
      UserAPI.update($scope.user, function (user) {
        $ionicLoading.hide();
        CurrentUser.set(user, function() {});
        $scope.user = user;
      });
    }

  };


  $scope.logout = function () {
    Authentication.logout(function() {
      $state.go('start');
    });
  }
})
