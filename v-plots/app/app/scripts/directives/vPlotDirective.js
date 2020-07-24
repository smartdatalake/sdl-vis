
/**
 * Directive for the plot
 */
angular.module('codeApp')
  .directive('vPlotDirective', function () {
    return {
      template: "<div id='vplot' style='margin: auto'></div>",
      restrict: 'EA',
      scope: {
        titleOfThePlot : '=',
        nameOfTopDistribution : '=',
        nameOfBottomDistribution : '=',
        distributionTop : '=',
        distributionBottom : '=',
        properties : '=',
        continuous : '=',
        numOfBins : '=',
      },     // use parent scope.
      link: function (scope, element) {

        scope.$watchGroup(['titleOfThePlot', 'nameOfTopDistribution', 'nameOfBottomDistribution', 'distributionTop', 'distributionBottom', 'continuous', 'numOfBins'], function(){
          scope.drawPlot();
        });

        scope.$watch('properties', function(){
          scope.drawPlot();
        }, true); 

        /**
         * Draw or update the plot. The controller will call this method whenever it will be updated.
         */
        scope.drawPlot = function(){

          let selector = d3.select(element[0]);
          selector.selectAll("*").remove();

          new VPlot(selector, scope.titleOfThePlot, scope.nameOfTopDistribution, scope.nameOfBottomDistribution, scope.distributionTop, scope.distributionBottom, scope.properties, scope.continuous, scope.numOfBins);

        };
      }
    };
  });

