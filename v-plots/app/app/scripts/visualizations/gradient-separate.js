'use strict';

/**
 * Class to create a single v-plot.
 */
class GradientSeparate {

  /**
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
      height = (+HEIGHT - margin.top - margin.bottom - margin.between) / 2,
      g = selector.append("g").attr("transform", "translate(" + (margin.left) + "," + (2*margin.top + 2*height) + ") rotate(-90)");

    // Partially copied from vplot.js -- Code refinement necessary.
    // combine both distributions to compute values such as min/max etc.
    let combinedDistribution = [].concat(distributionTop, distributionBottom);
    // min and max of both distributions.
    let extent =  d3.extent(combinedDistribution);

    let xScale = d3.scaleLinear().domain([extent[0], extent[1]]).range([0,width-3]); // -3 for the width of the last bin.

    let appendGradient = function(parent, values, color, yOffset){

      let heightGradient = 3*height/4;

      let g = parent.append("g");
      g.attr("transform", "translate(" + 0 + "," + (yOffset + height/8) + ")");

      g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", heightGradient)
        .attr("fill", "#eeeeee");

      g.selectAll(".stripe")
        .data(values)
        .enter().append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 3)
        .attr("height", heightGradient)
        .attr("fill", color)
        .attr("opacity", 0.1)
        .attr("transform",function(d){return "translate(" + (xScale(d)) + ",0)"});

    };

    appendGradient(g, distributionTop, properties.kernelDensityColorTop.hex, 0);
    appendGradient(g, distributionBottom, properties.kernelDensityColorBottom.hex, height + margin.between);


  }
}
