'use strict';

/**
 * Service to draw alternative visualizations.
 */
angular.module('codeApp')
  .service('alternativevisservice', function (histogramfunctions) {

    // const DISCRETE_ID = '#altDiscreteDistributions';
    // const CONTINUOUS_ID = '#altContinuousDistributions';

    const HISTOGRAM_BASED_ID = '#altHistogram';
    const SHAPE_BASED_ID = '#altShape';
    const OTHER_ID = '#altOther';
    const STATISTIC_BASED_ID = '#altStatistic';
    const BAR_SEPARATE_ID = '#barSeparate';

    const PREVIEW_ID ='#previewvplot';
    const PREVIEW_RANK_1_ID ='#previewr1';
    const PREVIEW_RANK_2_ID ='#previewr2';
    const PREVIEW_RANK_3_ID ='#previewr3';



    const BOX_PLOT_ID='#boxPlot';
    const DENSITY_I_ID='#density-I';
    const DENSITY_III_ID='#density-III';

    // const WIDTH = 200;
    // const HEIGHT = 250;

    const WIDTH = 270;
    const HEIGHT = 290;

    const SELF = this;

    /**
     * Delete all alternative visualizations.
     */
    this.clearAll = function(){
      // d3.select(DISCRETE_ID).selectAll("*").remove();
      // d3.select(CONTINUOUS_ID).selectAll("*").remove();
      d3.select(HISTOGRAM_BASED_ID).selectAll("*").remove();
      d3.select(SHAPE_BASED_ID).selectAll("*").remove();
      d3.select(OTHER_ID).selectAll("*").remove();
      d3.select(STATISTIC_BASED_ID).selectAll("*").remove();
      d3.select(BAR_SEPARATE_ID).selectAll("*").remove();
      d3.select(BOX_PLOT_ID).selectAll("*").remove();
      d3.select(DENSITY_I_ID).selectAll("*").remove();
      d3.select(DENSITY_III_ID).selectAll("*").remove();
    };

    this.clearPreview = function(){
      d3.select(PREVIEW_ID).selectAll("*").remove();
      d3.select(PREVIEW_RANK_1_ID).selectAll("*").remove();
      d3.select(PREVIEW_RANK_2_ID).selectAll("*").remove();
      d3.select(PREVIEW_RANK_3_ID).selectAll("*").remove();

      d3.select('#smallMultiple0').selectAll("*").remove();
      d3.select('#smallMultiple1').selectAll("*").remove();
      d3.select('#smallMultiple2').selectAll("*").remove();
      d3.select('#smallMultiple3').selectAll("*").remove();
      d3.select('#smallMultiple4').selectAll("*").remove();
      d3.select('#smallMultiple5').selectAll("*").remove();
      d3.select('#smallMultiple6').selectAll("*").remove();
      d3.select('#smallMultiple7').selectAll("*").remove();
      d3.select('#smallMultiple8').selectAll("*").remove();
      d3.select('#smallMultiple9').selectAll("*").remove();
      d3.select('#smallMultiple10').selectAll("*").remove();
      d3.select('#smallMultiple11').selectAll("*").remove();
      d3.select('#smallMultiple12').selectAll("*").remove();
      d3.select('#smallMultiple13').selectAll("*").remove();
      d3.select('#smallMultiple14').selectAll("*").remove();
      d3.select('#smallMultiple15').selectAll("*").remove();
      d3.select('#smallMultiple16').selectAll("*").remove();
      d3.select('#smallMultiple17').selectAll("*").remove();
      d3.select('#smallMultiple18').selectAll("*").remove();
      d3.select('#smallMultiple19').selectAll("*").remove();
    };
    /**
     * Add an empty element for discrete distributions.
     * @param label the name of the label.
     * @return a d3.selector (svg element).
     */

    this.addElementToHistogram = function(label){
      return SELF.addElement(HISTOGRAM_BASED_ID, label);
    };

    this.addElementToShape = function(label){
      return SELF.addElement(SHAPE_BASED_ID, label);
    };

    this.addElementToOther = function(label){
      return SELF.addElement(OTHER_ID, label);
    };

    this.addElementToStatistic = function(label){
      return SELF.addElement(STATISTIC_BASED_ID, label);
    };

    this.addElementToPreview = function(label, width, height){
      return SELF.addElement(PREVIEW_ID,label, width, height);
    };

    this.addElementToRank = function(label, width, height, rank){
      if(rank === 0) return SELF.addElementForPreview(PREVIEW_ID, label, width, height);
      if(rank === 1) return SELF.addElementForPreview(PREVIEW_RANK_1_ID,label, width, height);
      if(rank === 2) return SELF.addElementForPreview(PREVIEW_RANK_2_ID,label, width, height);
      if(rank === 3) return SELF.addElementForPreview(PREVIEW_RANK_3_ID,label, width, height);
    };

    this.addElementToSmallMultiple = function(label, id, width, height){
      return SELF.addElementForPreview(id, label, width, height);
    };

    this.addElementToBarSeparate= function(label)
    {
      return SELF.addElement(BAR_SEPARATE_ID,label);
    }

    this.addElementToBoxPlot = function(label)
    {
      return SELF.addElement(BOX_PLOT_ID,label);
    }

    this.addElementToDensityI = function(label)
    {
      return SELF.addElement(DENSITY_I_ID,label);
    }

    this.addElementToDensityIII = function(label)
    {
      return SELF.addElement(DENSITY_III_ID,label);
    }

    // width and height are optional
    this.addElement = function(id, label, width, height){

      width = width ? width : WIDTH;
      height = height ? height : HEIGHT;

      let div = d3.select(id).append("div")
        .attr("class","divProps");

      let svg = div.append("svg")
        .attr("x",0)
        .attr("y",0)
        .attr("width",width)
        .attr("height",height);

      // add a rectable
      svg.append("rect")
        .attr("class","backgroundAlternativeVis")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width",width)
        .attr("height",height);

      // add the label below.
      svg.append("text")
        .attr("class","labelAlternativeVis")
        .attr("x", 0)
        .attr("y", 0)
        .text(label)
        .attr("transform", "translate(" + (width/2) + "," + (width + (height - width)/2) + ")");

      return svg;
    };

    this.addElementForPreview = function(id, label, width, height){

      width = width ? width : WIDTH;
      height = height ? height : HEIGHT;

      let div = d3.select(id).append("div");
        // .attr("class","divPropsRanking");

      let svg = div.append("svg")
        .attr("x",0)
        .attr("y",0)
        .attr("width",width)
        .attr("height",height);

      // additional group, to scale the final chart.
      svg = svg.append("g")
        .attr("class","scale");

      let background = svg.append("g");

      // add a rectable
      background.append("rect")
        .attr("class","backgroundAlternativeVis")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width",width)
        .attr("height",height);

      // add the label below.
      background.append("text")
        .attr("class","labelAlternativeVisRank")
        .attr("x", 0)
        .attr("y", 0)
        .text(label)
        .attr("transform", "translate(" + (width/2) + "," + (width + (height - width)/2) + ")");

      return svg;
    };

    this.addVPlot = function(selector, parameters, continuous, optionalSize){
      let param = _.clone(parameters);

      optionalSize = optionalSize ? optionalSize : 270;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      selector = selector.append("g");
      new VPlot(selector, undefined, undefined, undefined, param.distributionTop, param.distributionBottom, param, continuous, 10)
      selector.attr("transform","scale(" + scale + ")");
    };

    this.addPreview = function(selector,parameters,continuous) {
      let param = _.clone(parameters);
      param.widthOfPlot = 200;
      param.heightOfPlot = 200;
      param.spaceBetweenPlots = 1;
      param.scaleDomainOfBinHeight = 0.5;
      param.showBorderAroundPlot = false;
      param.showGrid = false;
      //param.showStatistics = true;
      param.showLabelsHistogramBins = false;
      param.showLabelsDistributionNames = false;
      param.showTitleOfThePlot = false;
      new VPlot(selector, undefined, undefined, undefined, param.distributionTop, param.distributionBottom, param, continuous, 10)
    }


    this.addDiscreteBarChartSeparate = function(selector, parameters, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);
      new BarchartSeparate(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addDiscreteBarchartGrouped = function(selector, parameters, optionalSize){

      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);
      new BarchartGrouped(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");

    };

    this.addDiscreteCumulativeBarchartGrouped = function(selector, parameters, optionalSize){

      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);
      new BarchartCumulative(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addDiscreteBarchartStacked = function(selector, parameters, optionalSize){

      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);
      new BarchartStacked(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addDiscreteBarchartMirrored = function(selector, parameters, optionalSize){

      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);
      new BarchartMirrored(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addDiscreteBarchartMirroredRotated = function(selector, parameters, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);
      new BarchartMirrored(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions, 90);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addDiscreteBarchartBrokenLine = function(selector, parameters, optionalSize){

      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);
      new BarchartBrokenLine(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addDiscreteBrokenLine = function(selector, parameters, optionalSize){

      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);
      new BrokenLine(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };



    this.addContinuousBoxPlot = function(selector, parameters, useContinuous, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      if(useContinuous){
        param.distributionTop = param.distributionTopContinuous;
        param.distributionBottom = param.distributionBottomContinuous;
      }

      new BoxPlot(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addContinuousDensityDistributionSeparate = function(selector, parameters, useContinuous, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      if(useContinuous){
        param.distributionTop = param.distributionTopContinuous;
        param.distributionBottom = param.distributionBottomContinuous;
      }

      new DensityDistributionSeparate(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addContinuousDensityDistributionSeparateRotated = function(selector, parameters, useContinuous, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      if(useContinuous){
        param.distributionTop = param.distributionTopContinuous;
        param.distributionBottom = param.distributionBottomContinuous;
      }

      new DensityDistributionSeparateRotated(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addContinuousDensityDistributionCombined = function(selector, parameters, useContinuous, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      if(useContinuous){
        param.distributionTop = param.distributionTopContinuous;
        param.distributionBottom = param.distributionBottomContinuous;
      }

      new DensityDistributionCombined(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addContinuousDensityCumulativeCombined = function(selector, parameters, useContinuous, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      if(useContinuous){
        param.distributionTop = param.distributionTopContinuous;
        param.distributionBottom = param.distributionBottomContinuous;
      }

      new DensityCumulativeCombined(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addContinuousViolinPlot = function(selector, parameters, useContinuous, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      if(useContinuous){
        param.distributionTop = param.distributionTopContinuous;
        param.distributionBottom = param.distributionBottomContinuous;
      }

      new ViolinPlot(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addContinuousSplitViolinPlot = function(selector, parameters, useContinuous, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      if(useContinuous){
        param.distributionTop = param.distributionTopContinuous;
        param.distributionBottom = param.distributionBottomContinuous;
      }

      new SplitViolinPlot(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addContinuousBeanPlot = function(selector, parameters, useContinuous, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      if(useContinuous){
        param.distributionTop = param.distributionTopContinuous;
        param.distributionBottom = param.distributionBottomContinuous;
      }

      new BeanPlot(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addContinuousAsymmBeanPlot = function(selector, parameters, useContinuous, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      if(useContinuous){
        param.distributionTop = param.distributionTopContinuous;
        param.distributionBottom = param.distributionBottomContinuous;
      }

      new BeanPlotAsymmetric(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addContinuousGradientSeparate = function(selector, parameters, useContinuous, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      if(useContinuous){
        param.distributionTop = param.distributionTopContinuous;
        param.distributionBottom = param.distributionBottomContinuous;
      }

      new GradientSeparate(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addErrorBarsBar = function(selector, parameters, useContinuous, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      if(useContinuous){
        param.distributionTop = param.distributionTopContinuous;
        param.distributionBottom = param.distributionBottomContinuous;
      }

      new ErrorBarsBar(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.addErrorBarsLine = function(selector, parameters, useContinuous, optionalSize){
      let param = _.clone(parameters);
      optionalSize = optionalSize ? optionalSize : 200;
      let scale = optionalSize / d3.max([param.widthOfPlot, param.heightOfPlot]);

      if(useContinuous){
        param.distributionTop = param.distributionTopContinuous;
        param.distributionBottom = param.distributionBottomContinuous;
      }

      new ErrorBarsLine(selector, param.distributionTop, param.distributionBottom, param, histogramfunctions);
      // selector.attr("transform","scale(" + scale + ")");
    };

    this.convertDistributionToContinuous = function(param){

      // make the discrete values continiuous.
      let dConTop = [];
      let dConBottom = [];
      for(let i=0; i<param.distributionTop.length; i++){
        dConTop.push(param.distributionTop[i] + Math.random());
      }
      for(let i=0; i<param.distributionBottom.length; i++){
        dConBottom.push(param.distributionBottom[i] + Math.random());
      }

      param.distributionTopContinuous = dConTop;
      param.distributionBottomContinuous = dConBottom;

      return param;
    }


  });
