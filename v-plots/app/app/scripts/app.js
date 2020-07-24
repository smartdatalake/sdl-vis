'use strict';

/**
 * @ngdoc overview
 * @name codeApp
 * @description
 * # codeApp
 *
 * Main module of the application.
 */
angular
  .module('codeApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngMaterial',
    'ngTouch',
    'ngCsvImport',
    'material.components.expansionPanels',
    'mdColorMenu',
    'hc.downloader',
    'lfNgMdFileInput'
  ])
  .config(function ($routeProvider, $compileProvider) {
    $routeProvider
/*       .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/dataprotection', {
        templateUrl: 'views/data-protection.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
 */      .when('/plot', {
        templateUrl: 'views/plot.html',
        controller: 'PlotCtrl',
        controllerAs: 'plot'
      })
      .when('/vplotmatrix', {
        templateUrl: 'views/matrix.html',
        controller: 'MatrixCtrl',
        controllerAs: 'matrix'
      })
      .when('/comparison', {
        templateUrl: 'views/comparison.html',
        controller: 'ComparisonCtrl',
        controllerAs: 'comparison'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/plot'
      });

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
  })
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('indigo');
  });
