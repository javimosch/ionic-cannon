angular.module('shopmycourse.controllers')

/**
 * @name DeliveriesShopCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Sélection du magasin pour une ou plusieurs propositions de livraison
 */

.controller('DeliveriesShopCtrl', function($scope, $state, $ionicLoading, $ionicPopup, $cordovaGeolocation, toastr, ShopAPI, CurrentAvailability, $timeout, $log) {
  
  window.s = $scope;

  /**
   * Initialisation de la recherche de magasins
   */
  $scope.self = $scope;
  $scope.shops = [];
  $scope.address = "";
  var timer = null;
  var posOptions = {
    timeout: 10000,
    enableHighAccuracy: true
  };
  
  
  $scope.onAddressChange = function(newAddress){
    $log.debug('ShopCtrl: new address '+newAddress);
    
    if(newAddress=='') return $log.warn('address empty');
    
    $scope.search(newAddress);
  }

  /**
   * Affichage du premier chargement de la liste des magasins
   */
  $ionicLoading.show({
    template: 'Nous recherchons les magasins à proximité...'
  });

  /**
   * @name refreshShopList
   * @description Rafraichissement de la liste des magasins
   */
  function refreshShopList() {
    $ionicLoading.show({
      template: 'Nous recherchons les magasins correspondants...'
    });
    if (timer) {
      $timeout.cancel(timer);
    }
    timer = $timeout(function getProduct() {
      ShopAPI.search({
        lat: ($scope.position ? $scope.position.coords.latitude : undefined),
        lon: ($scope.position ? $scope.position.coords.longitude : undefined),
        stars: $scope.minimumStar,
        address: ($scope.position ? undefined : $scope.address)
      }, function(shops) {
        $scope.shops = shops;
        $ionicLoading.hide();
      }, function(err) {
        console.log(err);
      });
    }, 1300);
  };

  function onCurrentPosition(position) {
    console.log('position', position);
    $scope.position = position;
    refreshShopList();

  }


  /**
   * Récupération des coordonnées GPS du téléphone
   */
  $scope.searchUsingGeolocation = function() {
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(onCurrentPosition, function(err) {

        if (!window.plugins && window.navigator && window.navigator.geolocation) {
          console.log('browser geo get position');
          return window.navigator.geolocation.getCurrentPosition(onCurrentPosition, function(error) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.")
                break;
              case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.")
                break;
              case error.TIMEOUT:
                console.log("The request to get user location timed out.")
                break;
              case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.")
                break;
            }
          });
        }

        $ionicPopup.alert({
          title: 'Attention !',
          template: "Nous n'arrivons pas à vous géolocaliser. Vous pouvez soit activer le GPS, soit renseigner une adresse manuellement"
        });
        $ionicLoading.hide();
      });
  }

  /**
   * @name $scope.setShop
   * @description Enregistrement du magasin sélectionné
   */
  $scope.setShop = function(shop) {
    $log.debug('ShopCtrl: setShop '+JSON.stringify(shop));
    CurrentAvailability.setShop(shop, function() {
      $state.go('tabs.scheduledelivery');
    });
  };

  /**
   * @name $scope.openMap
   * @description Ouverture d'une carte avec la localisation du magasin
   */
  $scope.openMap = function(shop) {
    var address = shop.address;
    var url = '';
    if (ionic.Platform.isIOS()) {
      url = "http://maps.apple.com/maps?q=" + encodeURIComponent(address);
    }
    else if (ionic.Platform.isAndroid()) {
      url = "geo:?q=" + encodeURIComponent(address);
    }
    else {
      url = "http://maps.google.com?q=" + encodeURIComponent(address);
    }
    window.open(url, "_system", 'location=no');
  };

  /**
   * @name $scope.search
   * @description Lancement de la recherche de magasin
   */
  $scope.search = function(query) {
    $scope.position = undefined
    $scope.address = query;
    $log.debug('ShopCtrl: search address ' + $scope.address);
    refreshShopList();
  };
  
  
  
  $scope.searchUsingGeolocation();

})
