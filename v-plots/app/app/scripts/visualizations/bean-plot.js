'use strict';

/**
 * Class to create a single v-plot.
 */
class BeanPlot {

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
      width = (+WIDTH - margin.left - margin.right - margin.between) / 4,   // in this example: width per distribution (2*width for one violin plot)
      height = +HEIGHT - margin.top - margin.bottom,
      g = selector.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Partially copied from vplot.js -- Code refinement necessary.
    // combine both distributions to compute values such as min/max etc.
    let combinedDistribution = [].concat(distributionTop, distributionBottom);
    // min and max of both distributions.
    let extent =  d3.extent(combinedDistribution);

    const OFFSET_CLOSE_DENSITY = 0.5;

    let yScale = d3.scaleLinear()
      .domain([extent[0]-OFFSET_CLOSE_DENSITY, extent[1]+OFFSET_CLOSE_DENSITY]) // +/-1 to close the density curve.
      .range([height, 0]);

    // density for both distributions; find max.
    let densityTop = kernelDensityEstimator(kernelEpanechnikov(0.5), yScale.ticks(7))(distributionTop);
    let densityBottom = kernelDensityEstimator(kernelEpanechnikov(0.5), yScale.ticks(7))(distributionBottom);
    let maxDensityAnyBin = histogramfunctions.getMaxDensityHeight(densityTop, densityBottom);

    let xScale = d3.scaleLinear().domain([0, maxDensityAnyBin]).range([0, width]);

    let appendBean = function(group, density, distribution, color){

      // statistics inside
      distribution.sort();

      let median = d3.median(distribution);
      let quartils = [d3.quantile(distribution, 0.25), d3.quantile(distribution, 0.75)];
      let iqr = quartils[1] - quartils[0];
      let extentStats = [
        d3.max([quartils[0] - 1.5 * iqr, yScale.domain()[0] + OFFSET_CLOSE_DENSITY]),   // -1?
        d3.min([quartils[1] + 1.5 * iqr, yScale.domain()[1] - OFFSET_CLOSE_DENSITY])
      ];


      let appendKernelDensity = function(parent, density, color, bottom){

        // close the distribution.
        density.unshift([yScale.domain()[0], 0]);
        density.push([yScale.domain()[1], 0]);

        let g = parent.append("g");

        g.append("path")
          .datum(density)
          .attr("fill", color)
          .attr("opacity", 0.5)
          .attr("stroke", color)
          .attr("stroke-width", 1)
          .attr("stroke-linejoin", "round")
          .attr("d",  d3.line()
            .curve(d3.curveBasis)
            .x(function(d) {
              if(bottom){
                return width + xScale(d[1]);
              }else{
                return width - xScale(d[1]);
              }
            })
            .y(function(d) {
              return yScale(d[0]);
            }));

        return g;

      };

      appendKernelDensity(group, density, color, false);
      appendKernelDensity(group, density, color, true);

      // append inner statistics
      let statGroup = group.append("g");

      // gradient plot with the actual values
      statGroup
        .selectAll(".gradient")
        .data(distribution)
        .enter()
          .append("line")
          .attr("x1", -10)
          .attr("x2", 10)
          .attr("y1", function(d){return yScale(d);})
          .attr("y2", function(d){return yScale(d);})
          .attr("stroke", color)
          .attr("opacity", 0.2)
          .attr("stroke-width", 1)
        .attr("transform", "translate("+ width + "," + 0 + ")");


      // median
      statGroup.append("line")
        .attr("x1", 0)
        .attr("x2", 2* width)
        .attr("y1", yScale(median))
        .attr("y2", yScale(median))
        .attr("stroke", color)
        .attr("stroke-width", 3);

    };

    let gLeft = g.append("g");
    appendBean(gLeft, densityTop, distributionTop, properties.kernelDensityColorTop.hex);

    // move to the right side.
    let gRight = g.append("g")
      .attr("transform", "translate(" + (2 * width + margin.between) + "," + 0 + ")");
    appendBean(gRight, densityBottom, distributionBottom, properties.kernelDensityColorBottom.hex);




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
