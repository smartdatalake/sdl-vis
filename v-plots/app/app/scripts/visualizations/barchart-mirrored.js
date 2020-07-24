'use strict';

/**
 * Class to create a single v-plot.
 */
class BarchartMirrored {

  /**
   * @param selector the d3 selector to attache the visualization on -- assuming this is a svg selector.
   * @param distributionTop the actual data records (top/left), format: array of numbers.
   * @param distributionBottom the actual data records (bottom/right), format: array of numbers.
   * @param properties the properties of the visualization. See plot.js -> $scope.properties for a full list of properties.
   * @param histogramfunctions a angular service with histogram functions.
   */
  constructor(selector, distributionTop, distributionBottom, properties, histogramfunctions, rotation) {

    // const WIDTH = 200;
    // const HEIGHT = 200;

    const WIDTH = 270;
    const HEIGHT = 270;

    rotation = rotation ? rotation : 0;

    // margins around the plot and between the two bar charts.
    let margin = {top: 5, right: 5, bottom: 5, left: 5, between: 5},
      width = +WIDTH - margin.left - margin.right,
      height = (+HEIGHT - margin.top - margin.bottom - margin.between) / 2,
      offsetRotation = rotation > 0 ? width : 0,
      g = selector.append("g").attr("transform", "translate(" + (margin.left + offsetRotation) + "," + margin.top + ") rotate(" + rotation + ")");

    let y = d3.scaleLinear()
      .rangeRound([height, 0]);


    // Partially copied from vplot.js -- Code refinement necessary.
    // combine both distributions to compute values such as min/max etc.
    let combinedDistribution = [].concat(distributionTop, distributionBottom);
    // min and max of both distributions.
    let extent =  d3.extent(combinedDistribution);

    let ticks = histogramfunctions.getTicksHistogramDiscrete(extent[0], extent[1]);
    let xScaleHistogram = histogramfunctions.getXScaleHistogramDiscrete(extent[0], extent[1], width);

    // -----
    // compute the histograms and its properties
    let histogramTop = d3.histogram().domain(xScaleHistogram.domain()).thresholds(ticks)(distributionTop);
    let histogramBottom = d3.histogram().domain(xScaleHistogram.domain()).thresholds(ticks)(distributionBottom);

    // scale to draw the histogram
    let yScaleHistograms = undefined;
    let maxHistogramHeight = histogramfunctions.getMaxHistogramHeight(histogramTop, histogramBottom, distributionTop, distributionBottom);
    yScaleHistograms = d3.scaleLinear().domain([0, maxHistogramHeight]).range([0, height]);

    let appendHistogram = function(parent, histogramData, numOfElements, color, right){

      let g = parent.append("g")
        .attr("class","histogramGroup");

        g.selectAll("rect")
        .data(histogramData)
        .enter().append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", function (d, i) {
          if(i < histogramData.length - 1){
            return xScaleHistogram(d.x1) - xScaleHistogram(d.x0) - 3;   // -2 for gap between the histograms, except for the last. So far a hack, needs to be improved.
          } else{
            return xScaleHistogram(d.x1) - xScaleHistogram(d.x0);
          }
        })
        .attr("height", function (d) {
          return yScaleHistograms(d.length / numOfElements.length);
        })
        .attr("fill", color)
        .attr("transform", function(d){
          if(right){
            return "translate(" + xScaleHistogram(d.x0) + "," + (0) + ")";
          }else{
            return "translate(" + xScaleHistogram(d.x0) + "," + ((height - yScaleHistograms(d.length / numOfElements.length))) + ")";
          }
        });

        return g;
    };

    let left = appendHistogram(g, histogramTop, distributionTop, properties.kernelDensityColorTop.hex, false);
    left.attr("transform", "rotate(-90) translate(" + (- 2*height - margin.top) + "," + 0 + ")");
    let right = appendHistogram(g, histogramBottom, distributionBottom, properties.kernelDensityColorBottom.hex, true);
    right.attr("transform", "rotate(-90) translate(" + (- 2*height - margin.top) + "," + (height) + ")");
  }
}
