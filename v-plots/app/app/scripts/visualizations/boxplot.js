'use strict';

/**
 * Class to create a single v-plot.
 */
class BoxPlot {

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

    distributionTop.sort();
    distributionBottom.sort();

    let medianTop = d3.median(distributionTop);
    let quartilsTop = [d3.quantile(distributionTop, 0.25), d3.quantile(distributionTop, 0.75)];
    let iqrTop = quartilsTop[1] - quartilsTop[0];
    let extentTop = [quartilsTop[0] - 1.5 * iqrTop, quartilsTop[1] + 1.5 * iqrTop];

    let medianBottom = d3.median(distributionBottom);
    let quartilsBottom = [d3.quantile(distributionBottom, 0.25), d3.quantile(distributionBottom, 0.75)];
    let iqrBottom = quartilsBottom[1] - quartilsBottom[0];
    let extentBottom = [quartilsBottom[0] - 1.5 * iqrBottom, quartilsBottom[1] + 1.5 * iqrBottom];

    let minHeight = d3.min([extentTop[0], extentBottom[0]]);
    let maxHeight = d3.max([extentTop[1], extentBottom[1]]);
    // let yScale = d3.scaleLinear().domain([minHeight * 0.8, maxHeight * 1.2]).range([0, height]); // 1.2 to reserve some space on the top.
    let yScale = d3.scaleLinear().domain([minHeight, maxHeight]).range([height, 0]); // 1.2 to reserve some space on the top.

    let appendBoxPlot = function(parent, median, quartils, iqr, extent, color, xOffset){

      let widthBar = 3 * width / 4;
      let maLeft = (width - widthBar) / 2;

      let g = parent.append("g")
        // .attr("transform", "translate(" + (xOffset + maLeft) + "," + yScale(extent[0]) + ")");
       .attr("transform", "translate(" + (xOffset + maLeft) + "," + 0 + ")");

      // main box
      g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", widthBar)
        .attr("height", yScale(quartils[0]) - yScale(quartils[1]))
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("transform", "translate(" + 0 + "," + yScale(quartils[1]) + ")"); // (height - yScale(iqr))

      // median
      g.append("line")
        .attr("x1", 0)
        .attr("x2", widthBar)
        .attr("y1", yScale(median))
        .attr("y2", yScale(median))
        .attr("stroke", color)
        .attr("stroke-width", 4)
        .attr("transform", "translate(" + 0 + "," + 0 + ")");


      g.selectAll(".endOfOnePoint")
        .data(extent)
        .enter()
        .append("line")
        .attr("x1", widthBar/2 - 8)
        .attr("x2", widthBar/2 + 8)
        .attr("y1", function(d){return yScale(d);})
        .attr("y2", function(d){return yScale(d);})
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("transform", "translate(" + 0 + "," + 0 + ")");

      g.selectAll(".linesTowards")
        .data([
          [extent[0],quartils[0]],
          [extent[1],quartils[1]],
        ])
        .enter()
        .append("line")
        .attr("x1", widthBar/2)
        .attr("x2", widthBar/2)
        .attr("y1", function(d){return yScale(d[0]);})
        .attr("y2", function(d){return yScale(d[1]);})
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("transform", "translate(" + 0 + "," + 0 + ")");


    };

    appendBoxPlot(g, medianTop, quartilsTop, iqrTop, extentTop, properties.kernelDensityColorTop.hex, 0);
    appendBoxPlot(g, medianBottom, quartilsBottom, iqrBottom, extentBottom, properties.kernelDensityColorBottom.hex, width + margin.between);

  }
}
