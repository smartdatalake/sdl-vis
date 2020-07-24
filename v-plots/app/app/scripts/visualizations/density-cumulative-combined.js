'use strict';

/**
 * Class to create a single v-plot.
 */
class DensityCumulativeCombined {

  /**
   * Inspired by: https://bl.ocks.org/mbostock/4341954
   *
   * @param selector the d3 selector to attache the visualization on -- assuming this is a svg selector.
   * @param distributionTop the actual data records (top/left), format: array of numbers.
   * @param distributionBottom the actual data records (bottom/right), format: array of numbers.
   * @param properties the properties of the visualization. See plot.js -> $scope.properties for a full list of properties.
   * @param histogramfunctions a angular service with histogram functions.
   */
  constructor(selector, distributionTop, distributionBottom, properties, histogramfunctions) {

    // const WIDTH = 200;
    // const HEIGHT = 200;

    const WIDTH = 270;
    const HEIGHT = 270;

    // margins around the plot and between the two bar charts.
    let margin = {top: 5, right: 5, bottom: 5, left: 5, between: 5},
      width = +WIDTH - margin.left - margin.right,
      height = (+HEIGHT - margin.top - margin.bottom - margin.between),
      g = selector.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Partially copied from vplot.js -- Code refinement necessary.
    // combine both distributions to compute values such as min/max etc.
    let combinedDistribution = [].concat(distributionTop, distributionBottom);
    // min and max of both distributions.
    let extent =  d3.extent(combinedDistribution);

    let xScale = d3.scaleLinear()
      .domain([extent[0]-1, extent[1]+1]) // +/-1 to close the density curve.
      .range([margin.left, width]);   // move to center of the bin.

    // density for both distributions; find max.
    let densityTopTmp = kernelDensityEstimator(kernelEpanechnikov(0.5), xScale.ticks(7))(distributionTop);
    let densityBottomTmp = kernelDensityEstimator(kernelEpanechnikov(0.5), xScale.ticks(7))(distributionBottom);

    // compute cumulative density
    let densityTop = [];
    let densityBottom = [];
    let lastTop = 0;
    let lastBottom = 0;
    for(let i=0; i<densityTopTmp.length; i++){
      densityTop.push([densityTopTmp[i][0], lastTop + densityTopTmp[i][1]]);
      densityBottom.push([densityBottomTmp[i][0], lastBottom + densityBottomTmp[i][1]]);

      lastTop += densityTopTmp[i][1];
      lastBottom += densityBottomTmp[i][1];
    }

    let maxDensityAnyBin = histogramfunctions.getMaxDensityHeight(densityTop, densityBottom);

    let yScale = d3.scaleLinear().domain([0, maxDensityAnyBin]).range([0, height]);

    let appendKernelDensity = function(parent, density, color, yOffset){

      // close the distribution.
      density.unshift([xScale.domain()[0], 0]);
      density.push([xScale.domain()[1], 0]);

      return parent.append("path")
        .datum(density)
        .attr("fill", color)
        .attr("opacity", 0.5)
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d",  d3.line()
          .curve(d3.curveBasis)
          .x(function(d) { return xScale(d[0]); })
          .y(function(d) { return yOffset + height - yScale(d[1]); }));

    };

    appendKernelDensity(g, densityTop, properties.kernelDensityColorTop.hex, 0);
    appendKernelDensity(g, densityBottom, properties.kernelDensityColorBottom.hex, 0);



    function kernelDensityEstimator(kernel, X) {
      return function(V) {
        return X.map(function(x) {
          return [x, d3.mean(V, function(v) { return kernel(x - v); })];
        });
      };
    }

    function kernelEpanechnikov(k) {
      return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
      };
    }


  }
}
