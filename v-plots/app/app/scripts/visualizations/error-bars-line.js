'use strict';

/**
 * Class to create a single v-plot.
 */
class ErrorBarsLine {

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
      width = (+WIDTH - margin.left - margin.right - margin.between) / 2.0,
      height = (+HEIGHT - margin.top - margin.bottom),
      g = selector.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    let meanTop = d3.mean(distributionTop);
    let meanBottom = d3.mean(distributionBottom);

    let standardErrorTop = d3.deviation(distributionTop) / Math.sqrt(distributionTop.length);
    let standardErrorBottom = d3.deviation(distributionBottom) / Math.sqrt(distributionBottom.length);

    let maxHeight = d3.max([meanTop + standardErrorTop, meanBottom + standardErrorBottom]);
    let yScale = d3.scaleLinear().domain([0, maxHeight * 1.2]).range([0, height]); // 1.2 to reserve some space on the top.

    let appendErrorBar = function(parent, mean, standardError, color, xOffset){

      let widthBar = 3 * width / 4;
      let maLeft = (width - widthBar) / 2;

      let g = parent.append("g")
        .attr("transform", "translate(" + (xOffset + maLeft) + "," + 0 + ")");


      // error bar
      g.append("line")
        .attr("x1", widthBar/2)
        .attr("x2", widthBar/2)
        .attr("y1", -yScale(mean - standardError))
        .attr("y2", -yScale(mean + standardError))
        .attr("stroke", "black")
        .attr("stroke-width", 3)
        .attr("transform", "translate(" + 0 + "," + (height) + ")");

      g.selectAll(".errorBarLine")
        .data([mean - standardError, mean + standardError])
        .enter()
        .append("line")
        .attr("x1", widthBar/2 - 4)
        .attr("x2", widthBar/2 + 4)
        .attr("y1", function(d){return -yScale(d);})
        .attr("y2", function(d){return -yScale(d);})
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("transform", "translate(" + 0 + "," + (height) + ")");

    };

    appendErrorBar(g, meanTop, standardErrorTop, properties.kernelDensityColorTop.hex, 0);
    appendErrorBar(g, meanBottom, standardErrorBottom, properties.kernelDensityColorBottom.hex, width + margin.between);

  }
}
