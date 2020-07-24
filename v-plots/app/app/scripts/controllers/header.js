'use strict';

/**
 * @ngdoc function
 * @name langchangeClientApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the langchangeClientApp
 */
angular.module('codeApp')
  .controller('HeaderCtrl', function ($scope, $location) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

    /**
     * Navigate to the given location. Used instead of <a href="location"> as navigation using $location.path preserves all parameters.
     * @param location the location to navigate to, e.g. "/about"
     */
    $scope.navigateTo = function(location){
      $location.path(location);
    }

  });
