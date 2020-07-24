'use strict';

/**
 * Service for various histogram functions / helper methods.
 */
angular.module('codeApp')
  .service('histogramfunctions', function () {

    /**
     * Returns the histogram ticks for continuous distributions.
     * @param min min value in distribution
     * @param max max value in distribution
     * @param numBins the number of bins.
     * @return {Array}
     */
    this.getTicksHistogramDiscrete = function(min, max){
      let ticks = [];
      for(let i=1; i<max; i++){
        ticks.push(min + i);
      }
      return ticks;
    };

    /**
     * Returns the x scale for continuous distributions.
     */
    this.getXScaleHistogramContinuous = function(min, max, rangeMax){
      return d3.scaleLinear()
        .domain([min, max])
        .range([0, rangeMax]);
    };

    /**
     * Returns the x scale for discrete distributions.
     */
    this.getXScaleHistogramDiscrete = function(min, max, rangeMax){
      return d3.scaleLinear()
        .domain([min, max + 0.9999])   // +1 for the last histogram bin, do not use 1, otherwise the histogram will be one bin larger.
        .range([0, rangeMax]);
    };

    /**
     * Returnns the max height (in percentage) of any bin in any of the two histograms.
     * @param hist1 the first histogram
     * @param hist2 the second histogram
     * @param dist1 the distribution corresponding to the first histogram
     * @param dist2 the distribution corresponding to the second histogram
     */
    this.getMaxHistogramHeight = function(hist1, hist2, dist1, dist2){
      let maxHistTop = d3.max(hist1, function(d){return d.length / dist1.length});
      let maxHistBottom = d3.max(hist2, function(d){return d.length / dist2.length});
      return d3.max([maxHistTop, maxHistBottom]);
    };

    this.getMaxDensityHeight = function(density1, density2){
      let max1 = d3.max(density1, function(d){return d[1]});
      let max2 = d3.max(density2, function(d){return d[1]});
      return d3.max([max1, max2]);
    };

    /**
     * Returnns the max height (in percentage) of any bin in any of the two histograms (for stacked bar charts)
     * @param hist1 the first histogram
     * @param hist2 the second histogram
     * @param dist1 the distribution corresponding to the first histogram
     * @param dist2 the distribution corresponding to the second histogram
     */
    this.getMaxHistogramHeightCombinedBins = function(hist1, hist2, dist1, dist2){

      let heightsTop = hist1.map(function(d){return d.length / dist1.length});
      let heightsBottom = hist2.map(function(d){return d.length / dist2.length});

      let combined = [];
      for(let i=0; i<heightsTop.length; i++){
        combined.push(heightsTop[i] + heightsBottom[i]);
      }

      return d3.max(combined);
    };

  });
