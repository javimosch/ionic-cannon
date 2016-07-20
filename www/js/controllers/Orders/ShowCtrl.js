angular.module('shopmycourse.controllers')

.controller('OrdersShowCtrl', function($scope, $state, $ionicLoading, $ionicPopup, $rootScope, $stateParams, CurrentCart, CurrentDelivery, $ionicModal, OrderStore, $interval, $cordovaSms, DeliveryAPI, CurrentUser, $state, $ionicSlideBoxDelegate) {

  $scope.order = {};
  $scope.user = {};

  $ionicLoading.show({
    template: 'Nous recherchons votre commande...'
  });

  CurrentUser.get(function(user) {
    $scope.user = user;
  })

  OrderStore.get({id: parseInt($stateParams.idOrder)}, function (err, order) {
    $scope.order = order[0];
    $scope.order.deliveryman.rating_average |= 0;
    $scope.avatarBackground = CurrentUser.avatarFromUserAvatar($scope.order.deliveryman.avatar);
    $scope.ratingStar = $scope.order.buyer_rating ? $scope.order.buyer_rating.rating : 0;
    CurrentCart.initFromLocalStorage($scope.order.id);
    $ionicLoading.hide();
  })

  $ionicModal.fromTemplateUrl('templates/Orders/Modals/Finish.html', {
      scope: $scope,
      animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.finishOrderModal = modal
  });

  $scope.goBack = function() {
    $state.go('tabs.orders');
  };

  $scope.openFinishOrderModal = function () {
    $scope.finishOrderModal.show();
  };

  $scope.closeFinishOrderModal = function () {
    $ionicSlideBoxDelegate.slide(0, 0);
    $scope.finishOrderModal.hide();
  };

  $scope.goFinishOrderModal = function () {
      $scope.finishOrderModal.hide();
      CurrentDelivery.clear();
      $state.go('tabs.home');
  };

  $scope.sendSMS = function () {
    var number = $scope.order.deliveryman.phone;
    $cordovaSms.send(number, '', {
              android: {
                intent: 'INTENT'// send SMS with the native android SMS messaging
            }
          }).then(function () {
      console.log('Succesfully send SMS');
    }, function (err) {
      console.log(err);
    });
  };

  $scope.deliveryStarted = function(schedule, date) {
    if (!schedule || !date)
      return;

    var hours = schedule.replace('h', '').split('-');
    var from_ = hours[0];
    var now = moment()
    var date = moment(date);

    date.hours(from_);
    return now.unix() > date.unix();
  }

  $scope.confirmDelivery = function() {
    total = Math.round(($scope.order.total + $scope.order.commission) * 100) / 100

    if ($scope.user.wallet && $scope.user.wallet.credit_card_display) {
       var confirmPopup = $ionicPopup.confirm({
         title: 'Paiement',
         template: 'Votre carte ' + $scope.user.wallet.credit_card_display + ' sera débitée de ' + total + ' €. Vous pouvez modifier ce numéro de carte dans la partie Paramètres de l\'application.',
         cancelText: 'Retour',
         okText: 'OK'
       });

       confirmPopup.then(function(res) {
         if(res) {
           $ionicLoading.show({
              template: 'Nous envoyons votre commande...'
            });
           DeliveryAPI.confirm({
             'idDelivery': $scope.order.id
           }, function() {
             OrderStore.pull(function(orders) {
               $scope.modalTitle = "<div class=\"mascot\"><img src=\"img/notifs/commande_envoyee.jpg\" alt=\"commande_envoyee\"></div><span class=\"title\">Commande envoyée</span>"
               $scope.modalMessage = "Votre livreur va recevoir votre liste de courses d'ici quelques minutes."
               $scope.modalClose = function () {
                 $state.go('tabs.orders');
                 $scope.modal.hide();
               }

               $ionicModal.fromTemplateUrl('default-modal.html', {
                 scope: $scope,
                 animation: 'slide-in-up'
               }).then(function(modal) {
                 $scope.modal = modal;
                 $ionicLoading.hide();
                 $scope.modal.show();
               });
            })
          }, function(err) {
            var alertPopup = $ionicPopup.alert({
              title: 'Erreur',
              template: "Une erreur est survenue lors du paiement, vous avez peut-être dépassé l'heure limite. Si ce n'est pas le cas merci de nous contacter.",
            });

            alertPopup.then(function(res) {
              console.log(err);
              $state.go('tabs.orders')
            })
            $ionicLoading.hide();
          })
        }
      })
    } else {
      $state.go('tabs.orderpayment', {
        idOrder: parseInt($stateParams.idOrder)
      })
    }
  }
})
