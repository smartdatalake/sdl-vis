
/**
 * Directive for the plot
 */
angular.module('codeApp')
  .directive('vPlotMatrixDirective', function () {
    return {
      template: "<div id='vplotmatrix' style='margin: auto'></div>",
      restrict: 'E',
      scope: {
        titleOfThePlot : '=',   // the title of the plot
        order : '=',            // order of distributions in the matrix
        distributions : '=',    // all distributions; object distribution name -> distribution
        propertiesMatrix : '=', // the properties of the matrix
        propertiesVPlots : '=', // the properties of the v-plot
        propertiesLowerVPlots : '=', // the properties of the lower half of the v-plot
        continuous : '=',       // whether to treat the data as continuous or not, passed to VPlot directive
        numOfBins : '=',        // num of bins, if continuous, passed to VPlot directive
      },
      link: function (scope, element) {

        scope.$watchGroup(['titleOfThePlot', 'order', 'propertiesVPlots', 'propertiesLowerVPlots', 'distributions', 'continuous', 'numOfBins'], function(){
          scope.drawPlot();
        });

        scope.$watch('propertiesMatrix', function() {
          scope.drawPlot();
        }, true);

        /**
         * Draw or update the plot. The controller will call this method whenever it will be updated.
         */
        scope.drawPlot = function(){

          if(scope.titleOfThePlot !== undefined && scope.order !== undefined && scope.distributions !== undefined && scope.propertiesVPlots !== undefined && scope.propertiesLowerVPlots !== undefined && scope.propertiesMatrix) {

            let selector = d3.select(element[0]);
            selector.selectAll("*").remove();
            new VPlotMatrix(selector, scope.titleOfThePlot, scope.order, scope.distributions, scope.propertiesMatrix, scope.propertiesVPlots, scope.propertiesLowerVPlots, scope.continuous, scope.numOfBins);

          }

        };
      }
    };
  });
