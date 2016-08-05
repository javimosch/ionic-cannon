angular.module('shopmycourse.controllers')

.controller('ProfileSignInCtrl', function($scope, $rootScope, $state, toastr, $ionicLoading, $ionicPopup, $ionicModal, Authentication, Validation, CurrentUser, UserAPI) {

  $scope.validation = Validation;

  $scope.isSignin = true;

  $scope.init = function () {
    $scope.user = {
      email: '',
      password: ''
    };
  };

  $scope.signIn = function() {
    $ionicLoading.show({
      template: 'Nous vérifions vos identifiants...'
    });
    Authentication.login($scope.user, function (correct, errorMessage) {
      $ionicLoading.hide();

      if (correct) {
        $scope.init();
        $state.go('tabs.home');
      } else {
        toastr.warning(errorMessage, 'Authentification');
        console.error('SignIn error : ' + errorMessage);
      }
    });
  };

  $scope.init();

  $scope.signInWithFacebook = function () {
    $ionicPopup.show({
      templateUrl: 'templates/Profile/ExternalServicesPopup.html',
      title: 'Connexion avec Facebook',
      scope: $scope,
      buttons: [
        {
          text: 'Retour',
          onTap: function(e) {
            return (true);
          }
        },
        {
          text: 'OK',
          type: 'button-positive',
          onTap: function(e) {
            facebookConnectPlugin.login(["email", "public_profile"], function(data) {
              $scope.user.auth_token = data.authResponse.accessToken;
              $scope.user.auth_method = 'facebook';
              $scope.signIn();
            }, function(error) {
              toastr.error('Une erreur est survenue lors de la connexion via Facebook', 'Connexion');
              console.log('Facebook login errors : ', error);
            });
            return (true);
          }
        }
      ]
    });
  };


  $scope.signInWithGoogle = function () {
    $ionicPopup.show({
      templateUrl: 'templates/Profile/ExternalServicesPopup.html',
      title: 'Connexion avec Google',
      scope: $scope,
      buttons: [
        {
          text: 'Retour',
          onTap: function(e) {
            return (true);
          }
        },
        {
          text: 'OK',
          type: 'button-positive',
          onTap: function(e) {
            window.plugins.googleplus.login(
              {
                'webClientId': '979481548722-mj63ev1utfe9v21l5pdiv4j0t1v7jhl2.apps.googleusercontent.com',
                'offline': true
              },
              function (data) {
                $scope.user.auth_token = data.serverAuthCode;
                $scope.user.refresh_token = data.refreshToken;
                $scope.user.auth_method = 'google';
                $scope.signIn();
              },
              function (error) {
                toastr.error('Une erreur est survenue lors de la connexion via Google', 'Connexion');
                console.log('Google login errors : ', error);
              }
            );
            return (true);
          }
        }
      ]
    });
  };

  $scope.signInWithEmail = function () {
    $scope.user.auth_method = 'email';
    $scope.signIn();
  };

  $scope.forgotPassword = function () {
    if (!$scope.user.email || $scope.user.email.length <= 0) {
      toastr.warning('Veuillez rentrer une adresse email valide', 'Mot de passe oublié');
      return;
    }
    $ionicLoading.show({
      template: 'Envoi du mot de passe...'
    });
    UserAPI.forgotPassword({ user: {email: $scope.user.email} }, function (data) {
      toastr.info('Votre mot de passe a été envoyé par email', 'Mot de passe oublié');
      $ionicLoading.hide();
    }, function (err) {
      toastr.warning('Cettre adresse email n\'est pas enregistrée', 'Mot de passe oublié');
      $ionicLoading.hide();
    });
  };

  $ionicModal.fromTemplateUrl('templates/CGU.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.openCGU = function () {
    $scope.modal.show();
  };

  $scope.openLemonWayCGU = function() {
    window.open('https://www.lemonway.fr/legal/conditions-generales-d-utilisation', '_system', 'location=yes');
    return false;
  };

  $scope.closeCGU = function () {
    $scope.modal.hide();
  };

})
