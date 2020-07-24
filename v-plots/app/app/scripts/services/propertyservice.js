'use strict';

/**
 * Service storing the properties of the visualization as well as default properties.
 */
angular.module('codeApp')
  .service('propertyservice', function () {

    const SELF = this;

    this.previousProperties = [];

    /** These are the default properties for the entire v-plot visualization */
    this.defaultProperties = {


      /** detecting a click on the plot */
      //clickOnPlotActive = false,

      /** The background color of the margin area. */
      colorBackgroundMargin : {
        hex: '#FFFFFF'
      },

      /** The background color behind the histogram and density curve; used if both distributions get the same background color. */
      colorBackground : {
        bothDistributionsSameColor : true,
        colorBoth : {
          hex: '#f3f4f4'
        },
        colorLeft : {
          hex: null
        },
        colorRight : {
          hex: null
        },
        colorBetween : {
          hex: null
        }

      },

      /** The grid of the histogram */
      grid : [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],

      /** The granularity of the grid; possible values are '0.2', '0.1', '0.05', '0.01'.
       *  This field is only used in the GUI and not in the actual visualization.*/
      gridGranularity : 0.1,

      /** ====================================================================== */
      /** General Properties **/

      /** The width of the plot considering a horizonal layout. This is the absolute #pixels for the whole plit including margins etc. */
      widthOfPlot: 750,
      /** The height of the plot considering a horizonal layout. */
      heightOfPlot:750,

      /** The space between the plots, used e.g., for median and standard deviation. */
      spaceBetweenPlots : 16,
      /** The orientation of the plots, possible values: 'horizontal', 'vertical'. */
      orientation : "vertical", //orientation : "horizontal",
      /** Decide to draw a border around the whole plot. */
      showBorderAroundPlot : true,
      /** Shows the grid in the visualization. */
      showGrid : true,
      /** Should the grid within or outside of the visualization */
      gridWithin : false,
      /** Shows the labels of the grid in the visualization. Possible values: 'right', 'left', 'none' */
      showGridLabels : 'right',
      /** Show the statistics of the distribution in the middle part. */
      showStatistics : true,
      /** Which aggregated statistic is shown? Possible values: 'mean+std', 'mean+serr', 'mean+quart', 'median+quart' */
      aggregatedStatistic: 'mean+std',
      /** Connect the two mean values together */
      connectMean : false,
      /** Connect the standard deviation values together */
      connectStd : false,
      /** Enable or disable the statistic background connection. */
      statisticConnectionBackground : false,
      /** Color of the statistic connection of mean values. */
      colorStatisticConnection : {
        hex: '#b9b9b9'
      },
      /** Color of the statistic connection of std values. */
      colorStatisticConnectionStd : {
        hex: '#b9b9b9'
      },
      colorStatisticConnectionOpacity : 0.5,
      colorStatisticConnectionStdOpacity : 0.5,
      /** Color of the background of the statistic connection. */
      colorStatisticBackgroundConnection : {
        hex: '#cbcbcb'
      },
      /** Color of the background of the statistic connection. */
      colorStatisticBackgroundConnectionOpacity : 0.2,
      /** Put the connection and the highlighted area in the background. */
      statisticInForeground : true,
      /** Show the labels of the histogram bins in the middle of the visualization*/
      showLabelsHistogramBins : true,
      /** The position of the statistic containing the mean and standard deviation.*/
      positionOfMeanStatistic : 0.85,
      /** The scale of the bin height; used to normalize different plots with the same scale. Possible values [0,1] or undefined.  */
      scaleDomainOfBinHeight : 0.5,
      /** Show the labels of the distribution names on the top/bottom. */
      showLabelsDistributionNames : true,

      /** Show the name of the plot on top of the visualization*/
      showTitleOfThePlot : true,

      /** Determine the distribution range (min/max) of the distribution automatically. */
      distributionRangeAuto : false,
      /** Min of the distribution that need to be taken into account. This value is only considered iff distributionRangeAuto == false */
      distributionRangeMin : null,
      /** Max of the distribution that need to be taken into account. This value is only considered iff distributionRangeAuto == false */
      distributionRangeMax : null,

      /** Histogram Properties **/

      /** Show the histograms in the visualization. */
      showHistograms : true,
      /** Show the difference histograms in the visualization. */
      showDifferenceHistogram : true,
      /** Show a label with the percentage height of the histogram bins.*/
      showLabelHeightInPercentage : false,
      /** Color a label with the percentage height of the histogram bins.*/
      colorLabelHeightInPercentage : {
        hex: '#626567'
      },
      /** Opacity a label with the percentage height of the histogram bins.*/
      opacityLabelHeightInPercentage : 0.6,
      /** Size of the inner histogram, 0.9 -> 0.9 * default histogram. */
      sizeInnerHistogram : 0.8,
      /** Color of the histogram */
      colorHistogram : {
        hex: '#87898a'
      },
      /** Opacity of the histogram. */
      colorHistogramOpacity : 0.55,
      /** Color of the inner histogram */
      colorInnerHistogram : {
        hex: '#4a4d50'
      },
      /** Opacity of the inner histogram */
      colorInnerHistogramOpacity : 0.55,
      /** Density Properties **/

      /** Show the kernel density as overlay. */
      showDensityShape : true, //showKernelDensity : true,
      /** Show the density shape for the differences between the distributions */
      showDifferenceDensityShape : false,
      /** Show the ticks of the kernel density estimation as debugging feature. Maybe delete later(?) */
      showKernelDensityTicks : false,
      /** Interpolation used for density curve. */
      densityCurve : 'cubic cardinal spline',
      /** Which density visualization is used? */
      // densityVisualization : 'densityBasedOnDiffHist',
      densityVisualization : 'densityBasedOnHist',
      /** Bandwith parameter for the Kernel Density Estimation. */
      kernelDensityBandwidth : 0.8, // TODO use a heuristic to set a default.
      /** Defines the max height of the kernel density estimation. Set o 0.8 corresponds to 0.8 * largest histogram bin. */
      maxKernelDensityHeight : 0.8,
      /** Number of ticks parameter for the Kernel Density Estimation. */
      kernelDensityNumTicks : 5,    // TODO use a heuristic to set a default.
      /** The color for the Kernel Density Estimation area (top)*/
      kernelDensityColorTop : { hex: "#1F618D" },
      /** The color for the Kernel Density Estimation area (bottom)*/
      kernelDensityColorBottom : { hex: "#922B21" },
      /** The opacity of the shape (e.g., kernel density)*/
      colorShapesOpacity : 0.4,
      /** The opacity of the difference shape (e.g., kernel density)*/
      colorDifferenceShapesOpacity : 0.4,
      /** The font size for the statistic. */
      fontSizeValues : 15,
      /** The font size for the grid. */
      fontSizeGrid : 15,
      /** The font size for the histogram bins. */
      fontSizeHistogramBins : 15,
      /** The font size for the histogram bin height. */
      fontSizeHistogramBinHeight : 15,
      /** The font size of the title */
      fontSizeTitle : 25,
      /** The font size of the two groups. */
      fontSizeGroupNames : 18,
      /** The color of all labels. */
      colorLabel : {
        hex: '#626567'
      },
      /** the size of the statistic */
      sizeStatistic : 2
    };

    this.disable = false;

    /* This keeps the selected or non-selected settings of the wizard */
    this.wizardSettings = null;

    /**
     * Get a deep copy of the properties.
     * @param properties
     */
    this.getDeepCopy = function(properties){
      let copy = {};
      _.keys(properties).map(function(k){
        let p = properties[k];
        copy[k] = (typeof p == 'object') ? _.clone(p) : p;
      });
      return copy;
    };


    /**
     * Get the default properties of the v-plots.
     * Make a deep copy of the properties, so that we can call this method later on.
     * @return {{}}
     */
    this.getDefaultProperties = function(){
      let props = {};
      _.keys(SELF.defaultProperties).map(function(k){
        let p = SELF.defaultProperties[k];
        props[k] = (typeof p == 'object') ? _.clone(p) : p;
      });
      return props;
    };


    /**
     * Add the current properties to a queue, so that we can store undo later on.
     */
    this.addPreviousProperties = function(currentProperties){

      if(SELF.disable){
        return;
      }

      // add the new properties, but only if something has changed.
      if(SELF.previousProperties.length == 0 || !_.isEqual(SELF.previousProperties[0], currentProperties)){

        // store the previous properties for undo
        SELF.previousProperties.unshift(SELF.getDeepCopy(currentProperties));

      }

    };

    /**
     * Get the most recent previous property and delete it from the array.
     */
    this.getPreviousProperty = function(){

      if(SELF.previousProperties.length > 1){
        SELF.previousProperties.shift();
        return SELF.previousProperties.shift();
      }else{
        return SELF.getDeepCopy(SELF.defaultProperties);
      }

    };

    this.disableStoreProperties = function(){
      SELF.disable = true;
    };

    this.enableStoreProperties = function(){
      SELF.disable = false;
    }

    this.setWizardSettings = function(data){
      SELF.wizardSettings=data;
      console.log(SELF.wizardSettings);
    }

    this.getWizardSettings = function(){
      return SELF.wizardSettings;
    }

  });
