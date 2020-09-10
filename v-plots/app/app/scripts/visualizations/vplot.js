'use strict';

/**
 * Class to create a single v-plot.
 */
class VPlot{

  /**
   *
   * @param selector the d3 selector to attache the visualization on.
   * @param titleOfThePlot the title of the plot - optional.
   * @param nameOfTopDistribution the label of the top/left distribution - optional.
   * @param nameOfBottomDistribution the label of the bottom/right distribution - optional.
   * @param distributionTop the actual data records (top/left), format: array of numbers.
   * @param distributionBottom the actual data records (bottom/right), format: array of numbers.
   * @param properties the properties of the visualization. See plot.js -> $scope.properties for a full list of properties.
   * @param isContinuous [optional parameter] if true, the data distribution is interpreted as continious, if false as discrete. Missing parameter corresponds to discrete distribution.
   * @param numBins only relevant if isContinious is set to true. Defines the number of bins for both histograms.
   */
  constructor(selector, titleOfThePlot, nameOfTopDistribution, nameOfBottomDistribution, distributionTop, distributionBottom, properties, isContinuous, numBins){


    isContinuous = isContinuous ? isContinuous : false;

    /** The margin reserved for the title */
    const marginForTitle = properties.showTitleOfThePlot ? (20 + 5 + properties.fontSizeTitle) : 0;
    /** The margin reserved for the distribution names.  */
    const marginForDistributionNames = properties.showLabelsDistributionNames ? (20 + 2 + properties.fontSizeGroupNames) : 0;
    /** The margin for the grid labels (if enabled, and selected to be on the outside). */
    const marginForGridLabels = (properties.showGrid && !properties.gridWithin) ? (properties.orientation === 'vertical' ? (5 + properties.fontSizeGrid) : (20 + properties.fontSizeGrid)) : 0;

    /** Margins for labels etc. */
    let MARGIN = undefined;
    if(properties.orientation === 'horizontal'){

      MARGIN = {
        top: properties.showTitleOfThePlot ? marginForTitle : 20,
        right: 20,
        bottom: 20,
        left: properties.showLabelsDistributionNames ? marginForDistributionNames : 20,
      };

      /** Add additional margin, if the grid labels are enabled and drawn on the outside */
      if(properties.showGrid && !properties.gridWithin){
        if(properties.showGridLabels === 'left'){
          MARGIN.left += marginForGridLabels;
        }else if(properties.showGridLabels === 'right'){
          MARGIN.right += marginForGridLabels;
        }
      }

    }else if(properties.orientation === 'vertical'){

      MARGIN = {
        top: 20,
        right: properties.showTitleOfThePlot ? marginForTitle : 20,
        bottom: 20,
        left: properties.showLabelsDistributionNames ? marginForDistributionNames : 20
      };

      /** Add additional margin, if the grid labels are enabled and drawn on the outside */
      if(properties.showGrid && !properties.gridWithin){
        if(properties.showGridLabels === 'left'){
          MARGIN.left += marginForGridLabels;
        }else if(properties.showGridLabels === 'right'){
          MARGIN.right += marginForGridLabels;
        }
      }

    }



    /** The width of one plot considering margins etc. . */
    const WIDTH = properties.widthOfPlot - MARGIN.left - MARGIN.right;

    /** The width of one plot considering margins etc. . */
    const HEIGHT = (properties.heightOfPlot - MARGIN.top - MARGIN.bottom - properties.spaceBetweenPlots) / 2;

    /** Properties of all labels in the visualization. */
    const LABEL = {
      // "fill": "#626567",
      "font-family": "'Lato', 'Open Sans', 'Helvetica Neue', 'Arial', sans-serif"
    };

    /** Properties of the title label in the visualization. */
    const LABEL_TITLE = {
      "font-weight": "normal",
      // "font-size": "25px",
    };

    const LABEL_DISTRIBUTION_NAME = {
      "font-weight": "normal",
      // "font-size": "18px",
    };

    const LABEL_GRID = {
      "font-weight": "normal",
      // "font-size": "15px",
    };

    // adapt the font size for the grid etc.
    // if(properties.fontSizeValues){
    //   LABEL_GRID['font-size'] = properties.fontSizeValues + "px";
    // }


    const HISTOGRAM_STYLE = {
      "fill": "#bdbfc1",
      "stoke-width": "1px",
      "stroke": "#9c9ea0"
    };

    const DIFF_HISTOGRAM_STYLE = {
      "fill": "#6a6e72",
      "stoke-width": "0.2px",
      "stroke": "#595e60"
    };

    const GRID_STYLE = {
      "stroke-width": "0.5",
      "stroke": "#000",
      "stroke-dasharray": "1, 5"
    };

    const KERNEL_DENSITY_STYLE = {
      // "opacity": ".5",
      "stroke": "#000",
      "stroke-width": "1",
      "stroke-linejoin": "round"
    };


    // ===================================================================================
    // Check if the background color.
    // If left and right color are the same, the values need to be adapted here.
    if(properties.colorBackground.bothDistributionsSameColor){
      properties.colorBackground.colorLeft = properties.colorBackground.colorBoth;
      properties.colorBackground.colorRight = properties.colorBackground.colorBoth;
      properties.colorBackground.colorBetween = properties.colorBackground.colorBoth;
    }


    // ===================================================================================
    // Prepare and analyze the data.

    // sort the distributions, used for computing median etc.
    distributionTop = distributionTop.sort();
    distributionBottom = distributionBottom.sort();

    // combine both distributions to compute values such as min/max etc.
    let combinedDistribution = [].concat(distributionTop, distributionBottom);
    // min and max of both distributions.
    let extent = null;

    // Determine whether min and max value of the distribution automatically, or manually adjust.
    if(properties.distributionRangeAuto == false){
      extent = d3.extent(combinedDistribution);

      // Initialize min and max for next run.
      properties.distributionRangeMin = extent[0];
      properties.distributionRangeMax = extent[1];

    }else{
      // the min and max value is manually set.
      extent = [properties.distributionRangeMin, properties.distributionRangeMax];
    }

    // scale for the x domain -> use the full width for one plot.
    let xScaleHistogram = isContinuous ? getXScaleHistogramContinuous() : getXScaleHistogramDiscrete();

    // the ticks for the histogram.
    let ticks = isContinuous ? getTicksHistogramContinuous(extent[0], extent[1], numBins) : getTicksHistogramDiscrete(extent[0], extent[1], numBins);

    // -----
    // compute the histograms and its properties
    let histogramTop = d3.histogram().domain(xScaleHistogram.domain()).thresholds(ticks)(distributionTop);
    let histogramBottom = d3.histogram().domain(xScaleHistogram.domain()).thresholds(ticks)(distributionBottom);

    console.log("[vplot.js] histogramTop", histogramTop);
    console.log("[vplot.js] histogramBottom", histogramBottom);

    // scale to draw the histogram
    let yScaleHistograms = undefined;
    if(properties.scaleDomainOfBinHeight === undefined){
      let maxHistogramHeight = getMaxHistogramHeight(histogramTop, histogramBottom, distributionTop, distributionBottom);
      yScaleHistograms = d3.scaleLinear().domain([0, maxHistogramHeight]).range([0, HEIGHT]);
    }else{
      yScaleHistograms = d3.scaleLinear().domain([0, properties.scaleDomainOfBinHeight]).range([0, HEIGHT]);
    }

    // -----
    // Density distribution around histogram.

    // top density distribution
    let densityTop = undefined;
    let densityTopSecond = undefined;

    // bottom density distribution
    let densityBottom = undefined;
    let densityBottomSecond = undefined;

    // the y scale for the density distribution
    let yScaleDensity = undefined;

    let step = undefined;
    let xMinDensity = undefined;
    let xMaxDensity = undefined;

    let xScaleDensity = undefined;



    // ---
    // Configure main/outer shape
    // if(properties.showDensityShape){

    // IMPORTANT: the following part needs to be computed, otherwise the inner density cannot be computed.
    // --> compute, although it may not be necessary.

    if(properties.densityVisualization === 'kernelDensity'){

      let widthPerBin = WIDTH / (ticks.length + 1);
      let xScaleDensityForComputation = d3.scaleLinear()
        .domain([extent[0], extent[1]])
        .range([widthPerBin/2, WIDTH-widthPerBin/2]);   // move to center of the bin.

      densityTop = kernelDensityEstimator(kernelEpanechnikov(properties.kernelDensityBandwidth), xScaleDensityForComputation.ticks(properties.kernelDensityNumTicks))(distributionTop);
      densityBottom = kernelDensityEstimator(kernelEpanechnikov(properties.kernelDensityBandwidth), xScaleDensityForComputation.ticks(properties.kernelDensityNumTicks))(distributionBottom);

      let maxDensityTop = d3.max(densityTop, function (d) { return d[1]; });
      let maxDensityBottom = d3.max(densityBottom, function (d) { return d[1]; });
      let maxDensity = d3.max([maxDensityTop, maxDensityBottom]);

      yScaleDensity = d3.scaleLinear().domain([0, maxDensity]).range([0, HEIGHT * properties.maxKernelDensityHeight]);


    } else if(properties.densityVisualization === 'densityBasedOnHist'){

      densityTop = [];
      densityBottom = [];

      for(let i=0; i<histogramTop.length; i++){
        densityTop.push([(i+1), (histogramTop[i].length/distributionTop.length)]);
        densityBottom.push([(i+1), (histogramBottom[i].length/distributionBottom.length)]);
      }

      yScaleDensity = yScaleHistograms;


    }else{

      console.error("No such density shape: " + properties.densityVisualization);
    }


    // smooth the beginning and end of the density plot
    // begin: x=start of plot, y=0.5*height of the first value (dito for last bin)
    step = densityTop[1]['0'] - densityTop[0]['0'];
    xMinDensity = densityTop[0]['0'] - step/2;
    xMaxDensity = densityTop[densityTop.length - 1]['0'] + step/2;

    densityTop.unshift([xMinDensity, densityTop[0]['1']/2]);
    densityBottom.unshift([xMinDensity, densityBottom[0]['1']/2]);
    densityTop.push([xMaxDensity, densityTop[densityTop.length - 1]['1']/2]);
    densityBottom.push([xMaxDensity, densityBottom[densityBottom.length - 1]['1']/2]);

    xScaleDensity = d3.scaleLinear()
      .domain([xMinDensity,xMaxDensity])
      .range([0, WIDTH]);


    // ---
    // Configure the difference shape; smoothing is based on main shape (therefore, we have to compute this first)
    if(properties.showDifferenceDensityShape){

      // inner histogram
      densityTopSecond = [];
      densityBottomSecond = [];

      for(let i=0; i<histogramTop.length; i++){

        // compute the difference between each bin of the plot
        let diff = histogramTop[i].length / distributionTop.length
          - histogramBottom[i].length / distributionBottom.length;

        if (diff > 0) {
          // top is higher, add the difference histogram to the top.
          densityTopSecond.push([(i+1), Math.abs(diff)]);
          densityBottomSecond.push([(i+1), 0]);

        } else if (diff < 0) {
          // bottom is higher, add the difference histogram to the bottom.
          densityTopSecond.push([(i+1), 0]);
          densityBottomSecond.push([(i+1), Math.abs(diff)]);
        }

      }

      // The inner histograms have always the histogram scale.
      //yScaleDensity = yScaleHistograms;

      // smooth the beginning and end of the density plot
      densityTopSecond.unshift([xMinDensity, densityTopSecond[0]['1']/2]);
      densityTopSecond.push([xMaxDensity, densityTopSecond[densityTopSecond.length - 1]['1']/2]);

      densityBottomSecond.unshift([xMinDensity, densityBottomSecond[0]['1']/2]);
      densityBottomSecond.push([xMaxDensity, densityBottomSecond[densityBottomSecond.length - 1]['1']/2]);

    }




    // ==========================================================================================================================================
    // Draw the visualization.

    // the size of the svg need to consider the orientation
    let svg =  selector.append("svg")
      .attr("id", "vplot")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", properties.orientation === 'horizontal' ? properties.widthOfPlot : properties.heightOfPlot)
      .attr("height", properties.orientation === 'horizontal' ? properties.heightOfPlot : properties.widthOfPlot)
      .attr("align","center");

    let vplot = svg.append("g");

    // --------
    // rotate vplot element, if orientation changed.
    if(properties.orientation === 'vertical'){
      vplot.attr("transform","translate(0," + properties.widthOfPlot + ") rotate(-90)");
    }

    // ----
    // background color + border around the plot
      vplot.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", properties.widthOfPlot-4)             // otherwise it did not work for the stroke when rotating
        .attr("height", properties.heightOfPlot-4)
        .attr("fill", properties.colorBackgroundMargin.hex)  // use a background color
        .attr("stroke-width", properties.showBorderAroundPlot ? "1" : "0")
        .attr("stroke", shadeColor(properties.colorBackgroundMargin.hex, - 40))
        .attr("transform","translate(2,2)");

    // ----
    // show the title of the plot, top, centered, if selected by the user.
    if(properties.showTitleOfThePlot){

      let title = vplot.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", properties.colorLabel.hex)
        .attr("font-familiy", LABEL['font-familiy'])
        .attr("font-weight", LABEL_TITLE['font-weight'])
        .attr("font-size", properties.fontSizeTitle)
        .text(titleOfThePlot);

      if(properties.orientation === 'horizontal'){
        title
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("transform","translate(" + (properties.widthOfPlot / 2) + "," + (marginForTitle / 2) + ")");
      }else if(properties.orientation === 'vertical'){
        title
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("transform","translate(" + (properties.widthOfPlot-marginForTitle/2) + "," + (properties.heightOfPlot/2) + ") rotate(90)");
      }

    }

    // ---
    // groups for the background
    let topPlotBackground = vplot.append("g")
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform","translate(" + MARGIN.left + "," + MARGIN.top + ")")
      .on('click', ()=>{console.log('highlight the columns for top plot', properties)});

    let bottomPlotBackground = vplot.append("g")
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform","translate(" + MARGIN.left + "," + (MARGIN.top + HEIGHT + properties.spaceBetweenPlots) + ")")
      .on('click', ()=>{console.log('highlight the columns for bottom plot', properties)});

    let middlePlotBackground = vplot.append("g")
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform","translate(" + MARGIN.left + "," + (MARGIN.top + HEIGHT) + ")");


    // ----
    // groups for the statistic plot, add here if it should be visualized in the background
    let statisticsPlot = null;
    if(!properties.statisticInForeground){
      statisticsPlot = vplot.append("g")
        .attr("x", 0)
        .attr("y", 0)
        .attr("transform","translate(" + MARGIN.left + "," + (MARGIN.top + HEIGHT) + ")");
    }

    // ----
    // groups for the top and bottom plot and the middle part.
    let topPlot = vplot.append("g")
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform","translate(" + MARGIN.left + "," + MARGIN.top + ")");

    let bottomPlot = vplot.append("g")
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform","translate(" + MARGIN.left + "," + (MARGIN.top + HEIGHT + properties.spaceBetweenPlots) + ")");

    let middlePlot = vplot.append("g")
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform","translate(" + MARGIN.left + "," + (MARGIN.top + HEIGHT) + ")");

    // ----
    // groups for the statistic plot, add here if it should be visualized in the background
    if(properties.statisticInForeground){
      statisticsPlot = vplot.append("g")
        .attr("x", 0)
        .attr("y", 0)
        .attr("transform","translate(" + MARGIN.left + "," + (MARGIN.top + HEIGHT) + ")");
    }


    // ----
    // Add labels for the distribution names, if enabled by the user.
    if(properties.showLabelsDistributionNames) {

      let t = topPlot.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", properties.colorLabel.hex)
        .attr("font-familiy", LABEL['font-familiy'])
        .attr("font-weight", LABEL_DISTRIBUTION_NAME['font-weight'])
        .attr("font-size", properties.fontSizeGroupNames)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .text(nameOfTopDistribution);

      if(properties.orientation === 'horizontal'){
        if(properties.showGridLabels === 'left'){
          t.attr("transform","translate(" + (- marginForGridLabels- marginForDistributionNames/2) + "," + (HEIGHT / 2) + ") rotate(-90)"); // WIDTH + for label on the right side.
        }else if(properties.showGridLabels === 'right'){
          t.attr("transform","translate(" + (- marginForDistributionNames/2) + "," + (HEIGHT / 2) + ") rotate(-90)"); // WIDTH + for label on the right side.
        }else{
          t.attr("transform","translate(" + (- marginForDistributionNames/2) + "," + (HEIGHT / 2) + ") rotate(-90)"); // WIDTH + for label on the right side.
        }
      }else if(properties.orientation === 'vertical'){
        if(properties.showGridLabels === 'left'){
          t.attr("transform","translate(" + (- marginForGridLabels - marginForDistributionNames/2) + "," + (HEIGHT / 2) + ") rotate(90)"); // WIDTH + for label on the right side.
        }else if(properties.showGridLabels === 'right'){
          t.attr("transform","translate(" + (- marginForDistributionNames/2) + "," + (HEIGHT / 2) + ") rotate(90)"); // WIDTH + for label on the right side.
        }else{
          t.attr("transform","translate(" + (- marginForDistributionNames/2) + "," + (HEIGHT / 2) + ") rotate(90)"); // WIDTH + for label on the right side.
        }
      }

      t = bottomPlot.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", properties.colorLabel.hex)
        .attr("font-familiy", LABEL['font-familiy'])
        .attr("font-weight", LABEL_DISTRIBUTION_NAME['font-weight'])
        .attr("font-size", properties.fontSizeGroupNames)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .text(nameOfBottomDistribution);

      if(properties.orientation === 'horizontal'){
        if(properties.showGridLabels === 'left'){
          t.attr("transform","translate(" + (- marginForGridLabels- marginForDistributionNames/2) + "," + (HEIGHT / 2) + ") rotate(-90)"); // WIDTH + for label on the right side.
        }else if(properties.showGridLabels === 'right'){
          t.attr("transform","translate(" + (- marginForDistributionNames/2) + "," + (HEIGHT / 2) + ") rotate(-90)"); // WIDTH + for label on the right side.
        }else{
          t.attr("transform","translate(" + (- marginForDistributionNames/2) + "," + (HEIGHT / 2) + ") rotate(-90)"); // WIDTH + for label on the right side.
        }
      }else if(properties.orientation === 'vertical'){
        if(properties.showGridLabels === 'left'){
          t.attr("transform","translate(" + (- marginForGridLabels - marginForDistributionNames/2) + "," + (HEIGHT / 2) + ") rotate(90)"); // WIDTH + for label on the right side.
        }else if(properties.showGridLabels === 'right'){
          t.attr("transform","translate(" + (- marginForDistributionNames/2) + "," + (HEIGHT / 2) + ") rotate(90)"); // WIDTH + for label on the right side.
        }else{
          t.attr("transform","translate(" + (- marginForDistributionNames/2) + "," + (HEIGHT / 2) + ") rotate(90)"); // WIDTH + for label on the right side.
        }
      }

    }



    // ===================================================================================
    // Background of the top, bottom, middle plot.

    let appendBackground = function(parent, height, background){
      parent.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", WIDTH)
        .attr("height", height)
        .attr("fill", background)
        .attr("stroke-width", "0.1")
        .attr("stroke", "#909497");
    };

    appendBackground(topPlotBackground, HEIGHT, properties.colorBackground.colorLeft.hex);
    appendBackground(bottomPlotBackground, HEIGHT, properties.colorBackground.colorRight.hex);
    appendBackground(middlePlotBackground, properties.spaceBetweenPlots, properties.colorBackground.colorBetween.hex);



    // ===================================================================================
    // Histogram  top and bottom distribution.

    if(properties.showHistograms){

      let appendHistogram = function(parent, histogramData, numOfElements){

        return parent.append("g")
          .attr("class","histogramGroup")
          .selectAll("rect")
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
          .attr("fill", properties.colorHistogram.hex)
          .attr("opacity", properties.colorHistogramOpacity)
          .attr("stoke-width", HISTOGRAM_STYLE['stoke-width'])
          .attr("stroke", shadeColor(properties.colorHistogram.hex, -60));
          // .attr("stroke", HISTOGRAM_STYLE['stroke']);
      };

      appendHistogram(topPlot,histogramTop, distributionTop).attr("transform",function(d){return "translate(" + xScaleHistogram(d.x0) + "," + (HEIGHT - yScaleHistograms(d.length / distributionTop.length)) + ")"});
      appendHistogram(bottomPlot,histogramBottom, distributionBottom).attr("transform",function(d){return "translate(" + xScaleHistogram(d.x0) + "," + (0) + ")"});

    }


    // ===================================================================================
    // Visualize the differences between the histograms, if enabled by the user.
    if(properties.showDifferenceHistogram){

      // groups for the difference plots
      let diffTop    = topPlot.append("g").attr("class","differenceHistogram");
      let diffBottom = bottomPlot.append("g").attr("class","differenceHistogram");

      // # pixels for each bin of the general histogram.
      let binSize = WIDTH / histogramTop.length;
      let innerBinSize = binSize * properties.sizeInnerHistogram;
      let margin = (binSize - 1.5 - innerBinSize) / 2;      // 1.5 corresponds to the width between the  histogram bins

      let appendInnerBin = function(parent, diff){
        return parent.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", innerBinSize)
          .attr("height", yScaleHistograms(diff))
          .attr("fill",properties.colorInnerHistogram.hex)
          .attr("opacity",properties.colorInnerHistogramOpacity)
          .attr("stroke-width",DIFF_HISTOGRAM_STYLE['stroke-width'])
          .attr("stroke",shadeColor(properties.colorInnerHistogram.hex, -60))
      };

      for (let i = 0; i < histogramTop.length; i++) {

        // compute the difference between each bin of the plot
        let diff = histogramTop[i].length / distributionTop.length
          - histogramBottom[i].length / distributionBottom.length;

        if (diff > 0) {
          // top is higher, add the difference histogram to the top.
          appendInnerBin(diffTop, diff).attr("transform","translate(" + (i * binSize + margin) + "," + (HEIGHT - yScaleHistograms(diff)) + ")");

        } else if (diff < 0) {
          // bottom is higher, add the difference histogram to the bottom.
          diff = Math.abs(diff);
          appendInnerBin(diffBottom, diff).attr("transform","translate(" + (i * binSize + margin) + "," + 0 + ")");

        }
      }
    }



    // ===================================================================================
    // Show the grid and the grid labels in the visualization, if enabled by the user.
    if(properties.showGrid){

      // show only the grid lins, which are within the visible area.
      let gridScaled = _.map(properties.grid, function(d){return yScaleHistograms(d);});
      gridScaled = _.filter(gridScaled, function(d){return d < HEIGHT});

      let lengthOfGrid = undefined;
      let offset = undefined;
      if(properties.showGridLabels === 'none' || !properties.gridWithin){
        lengthOfGrid = WIDTH;
        offset = 0;
      }else{
        lengthOfGrid = properties.orientation === 'horizontal' ? WIDTH - 40 : WIDTH - 35;
        offset = properties.showGridLabels === 'right' ? 0 : (properties.orientation === 'horizontal' ? 40 : 35);
      }

      let appendGrid = function(parent){
        return parent.selectAll("line")
          .data(gridScaled)
          .enter()
          .append("line")
          .attr("x1", 0)
          .attr("x2", lengthOfGrid)
          .attr("y1", 0)
          .attr("y2", 0)
          .attr("stroke-width",GRID_STYLE['stroke-width'])
          .attr("stroke",GRID_STYLE['stroke'])
          .attr("stroke-dasharray",GRID_STYLE['stroke-dasharray'])
      };

      let topGridGroup = topPlot.append("g").attr("class", "gridGroup");
      let bottomGridGroup = bottomPlot.append("g").attr("class", "gridGroup");

      appendGrid(topGridGroup, gridScaled).attr("transform", function(d) {return "translate(" + offset + "," + (HEIGHT - d) + ")";});
      appendGrid(bottomGridGroup, gridScaled).attr("transform", function(d) {return "translate(" + offset + "," + (d) + ")";});


      // draw also the labels of the grid, if selected by the user.
      if(properties.showGridLabels === 'left' || properties.showGridLabels === 'right'){

        let xPos = undefined;
        let textAnchor = undefined;

        if(properties.gridWithin) {
          if (properties.orientation === 'horizontal') {
            xPos = properties.showGridLabels === 'left' ? 3 : WIDTH - 3;
          } else if (properties.orientation === 'vertical') {
            xPos = properties.showGridLabels === 'left' ? 15 : WIDTH - 15;
          }
          textAnchor = properties.showGridLabels === 'left' ? 'left' : 'end';
        }else{
          if (properties.orientation === 'horizontal') {
            xPos = properties.showGridLabels === 'left' ? -properties.fontSizeGrid-3 : WIDTH + properties.fontSizeGrid + 3;
          } else if (properties.orientation === 'vertical') {
            xPos = properties.showGridLabels === 'left' ? -properties.fontSizeGrid + 3 : WIDTH + properties.fontSizeGrid - 3;
          }
          if(properties.orientation === 'horizontal'){
            textAnchor = properties.showGridLabels === 'left' ? 'middle' : 'middle';
          }else{
            textAnchor = properties.showGridLabels === 'left' ? 'middle' : 'middle';
          }

        }

        let appendGridLabel = function(parent, label){
          return parent.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("fill", properties.colorLabel.hex)
            .attr("font-familiy", LABEL['font-familiy'])
            .attr("font-weight", LABEL_GRID['font-weight'])
            .attr("font-size", properties.fontSizeGrid)
            .attr("text-anchor", textAnchor)
            // .attr("text-anchor", function(){
            //   return properties.orientation === 'horizontal' ? textAnchor : 'middle';
            // })
            .attr("dominant-baseline", "central") // hanging
            .text(label)
        };

        for(let i=0; i<gridScaled.length; i++){

          let label = (properties.grid[i] * 100) + "%";
          appendGridLabel(topGridGroup, label).attr("transform", function() {
            return properties.orientation === 'horizontal' ? "translate(" + xPos + "," + (HEIGHT - gridScaled[i]) + ")" : "translate(" + xPos + "," + (HEIGHT - gridScaled[i]) + ") rotate(90) ";
          });  // + 3;
          appendGridLabel(bottomGridGroup, label).attr("transform", function() {
            return properties.orientation === 'horizontal' ? "translate(" + xPos + "," + (gridScaled[i]) + ")" : "translate(" + xPos + "," + (gridScaled[i]) + ") rotate(90) ";
            //return "translate(" + xPos + "," + (gridScaled[i]) + ")";
          });

        }
      }

    }

    // ===================================================================================
    // add labels to the histograms with the percentage
    if(properties.showLabelHeightInPercentage) {
      let appendPercentageHistogram = function (parent, histogramData, allElements, top) {

        let widthOfBackground = 50;
        let heightOfBackground = 22;

        let r = parent.append("g")
          .attr("class", "percentageLabels")
          .selectAll(".text")
          .data(histogramData)
          .enter()
          .append("g")
          .append("rect")
          .attr("x",0)
          .attr("y",0)
          .attr("width",widthOfBackground)
          .attr("height",heightOfBackground)
          .attr("transform",function() {
            if(properties.orientation === 'horizontal'){
              return "translate(" + (-widthOfBackground / 2) + "," + (- heightOfBackground / 2) + ")";
            }else{
              if(top){
                return "translate(" + (-widthOfBackground+5) + "," + (- heightOfBackground / 2) + ")";
              }else{
                return "translate(" + (-5) + "," + (- heightOfBackground / 2) + ")";
              }
            }
          })
          // .attr("fill","red")
          .attr("fill", function(){
            if(top){
              return properties.colorBackground.colorLeft.hex;
            }else{
              return properties.colorBackground.colorRight.hex;
            }

          })
          .attr("opacity",0.8)
          .select(function() { return this.parentNode; })
          .append("text")
          .text(function (d) {
            return (100 * d.length / allElements.length).toFixed(1) + "%"
          })
          .attr("fill", properties.colorLabelHeightInPercentage.hex)
          .attr("opacity", properties.opacityLabelHeightInPercentage)
          .attr("font-familiy", LABEL['font-familiy'])
          .attr("font-weight", LABEL_GRID['font-weight'])
          .attr("font-size", properties.fontSizeHistogramBinHeight)
          .attr("text-anchor", function () {
            if (top) {
              return properties.orientation === 'horizontal' ? 'middle' : 'end';
            } else {
              return properties.orientation === 'horizontal' ? 'middle' : 'start';
            }

          })
          .attr("dominant-baseline", "central")
          .select(function() { return this.parentNode; });

        return r;
      };

      let distToHist = properties.orientation === 'horizontal' ? 15 : 10;
      let rotation = properties.orientation === 'horizontal' ? 0 : 90;

      // console.log("append",appendPercentageHistogram(topPlot, histogramTop, distributionTop, true));

      appendPercentageHistogram(topPlot, histogramTop, distributionTop, true).attr("transform", function (d) {
        return "translate(" + xScaleHistogram((d.x1 + d.x0) / 2) + "," + (-distToHist + HEIGHT - yScaleHistograms(d.length / distributionTop.length)) + ") rotate(" + rotation + ")"
      });
      appendPercentageHistogram(bottomPlot, histogramBottom, distributionBottom, false).attr("transform", function (d) {
        return "translate(" + xScaleHistogram((d.x1 + d.x0) / 2) + "," + (distToHist + yScaleHistograms(d.length / distributionBottom.length)) + ") rotate(" + rotation + ")"
      });

    }

    // ===================================================================================
    // Visualize the kernel density estimation, if enabled by the user.
    if(properties.showDensityShape || properties.showDifferenceDensityShape){

      let curve = undefined;
      if(properties.densityCurve === 'cubic basis spline'){
        curve = d3.curveBasis;
      }else if(properties.densityCurve === 'cubic cardinal spline'){
        curve = d3.curveCatmullRom.alpha(0.5);
      }

      let kdeTop = topPlot.append("g")
        .attr("class","kdeGroup");

      let kdeBottom = bottomPlot.append("g")
        .attr("class","kdeGroup");


      if(properties.showDensityShape) {

        kdeTop.append("path")
          .datum(densityTop)
          .attr("d", d3.area()
            .curve(curve)
            .x(function (d) {
              return xScaleDensity(d[0]);
            })
            .y0(0)
            .y1(function (d) {
              return -yScaleDensity(d[1]);
            })
          )
          .attr("stroke", shadeColor(properties.kernelDensityColorTop.hex, -40))
          .attr("stroke-width", KERNEL_DENSITY_STYLE['stroke-width'])
          .attr("stroke-linejoin", KERNEL_DENSITY_STYLE['stroke-linejoin'])
          .attr("opacity", properties.colorShapesOpacity)
          .attr("fill", properties.kernelDensityColorTop.hex)
          .attr("transform", "translate(" + 0 + "," + HEIGHT + ")");


        kdeBottom.append("path")
          .datum(densityBottom)
          .attr("d", d3.area()
            .curve(curve)
            .x(function (d) {
              return xScaleDensity(d[0]);
            })
            .y0(0)
            .y1(function (d) {
              return yScaleDensity(d[1]);
            })
          )
          .attr("stroke", shadeColor(properties.kernelDensityColorBottom.hex, -40))
          .attr("stroke-width", KERNEL_DENSITY_STYLE['stroke-width'])
          .attr("stroke-linejoin", KERNEL_DENSITY_STYLE['stroke-linejoin'])
          .attr("opacity", properties.colorShapesOpacity)
          .attr("fill", properties.kernelDensityColorBottom.hex)
          .attr("transform", "translate(" + 0 + "," + 0 + ")");
      }


      /* Additionally, we need to add the inner density plot as well */
      if(properties.showDifferenceDensityShape){ // properties.densityVisualization === 'densityBasedOnHistAndDiffHist'

        kdeTop.append("path")
          .datum(densityTopSecond)
          .attr("d", d3.area()
            .curve(curve)
            .x(function (d) {
              return xScaleDensity(d[0]);
            })
            .y0(0)
            .y1(function (d) {
              return -yScaleHistograms(d[1]);
            })
          )
          .attr("stroke",shadeColor(properties.kernelDensityColorTop.hex, -60))
          .attr("stroke-width",KERNEL_DENSITY_STYLE['stroke-width'])
          .attr("stroke-linejoin",KERNEL_DENSITY_STYLE['stroke-linejoin'])
          .attr("opacity", properties.colorDifferenceShapesOpacity)
          .attr("fill", shadeColor(properties.kernelDensityColorTop.hex, -20))
          .attr("transform","translate(" + 0 + "," + HEIGHT + ")");



        kdeBottom.append("path")
          .datum(densityBottomSecond)
          .attr("d", d3.area()
            .curve(curve)
            .x(function (d) {
              return xScaleDensity(d[0]);
            })
            .y0(0)
            .y1(function (d) {
              return yScaleHistograms(d[1]);
            })
          )
          .attr("stroke", shadeColor(properties.kernelDensityColorBottom.hex, -60))
          .attr("stroke-width",KERNEL_DENSITY_STYLE['stroke-width'])
          .attr("stroke-linejoin",KERNEL_DENSITY_STYLE['stroke-linejoin'])
          .attr("opacity", properties.colorDifferenceShapesOpacity)
          .attr("fill", shadeColor(properties.kernelDensityColorBottom.hex, -20))
          .attr("transform","translate(" + 0 + "," + 0 + ")");

      }


      // -------
      if(properties.densityVisualization === 'kernelDensity' && properties.showKernelDensityTicks){

        kdeTop.selectAll(".ticks")
          .data(densityTop)
          .enter()
          .append("g")
          .attr("transform",function(d){ return "translate(" + (xScaleDensity(d[0]) - 1) + "," + (HEIGHT - yScaleDensity(d[1]) - 5) + ")"; })
          .append("rect")
          .attr("x",0)
          .attr("y",0)
          .attr("width",2)
          .attr("height",10)
          .attr("fill","black");

        kdeBottom.selectAll(".ticks")
          .data(densityBottom)
          .enter()
          .append("rect")
          .attr("x",0)
          .attr("y",0)
          .attr("width",2)
          .attr("height",10)
          .attr("fill","black")
          .attr("transform",function(d){ return "translate(" + (xScaleDensity(d[0]) - 1) + "," + (yScaleDensity(d[1]) - 5) + ")"; });

      }

    }

    let binSize = WIDTH / histogramTop.length;

    // ===================================================================================
    // Show the mean/standard deviation, if enabled by the user.
    if(properties.showLabelsHistogramBins) {

      let ticks = [];
      if(isContinuous){
        let currentBin = 0;
        histogramTop.map(function (bin) {

          // option 1: open the range as for continuous data it is not fixed.
          // if(currentBin < histogramTop.length -1) {
          //   ticks.push("[" + bin.x0.toFixed(1) + "," + bin.x1.toFixed(1) + "]");
          // }else{
          //   ticks.push("[" + bin.x0.toFixed(1) + "," + bin.x1.toFixed(1) + "[");
          // }

          // option 2: close the range for continuous data (as required by end users).
          ticks.push("[" + bin.x0.toFixed(1) + "," + bin.x1.toFixed(1) + "]");
          currentBin++;
        });

      }else{
        histogramTop.map(function (bin) {
          ticks.push(bin.x0);
        });
      }



      middlePlot.selectAll("text")
        .data(ticks)
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", properties.colorLabel.hex)
        .attr("font-familiy", LABEL['font-familiy'])
        .attr("font-weight", LABEL_GRID['font-weight'])
        .attr("font-size", properties.fontSizeHistogramBins)
        .attr("text-anchor", "middle")
        // .attr("text-anchor", function(){
        //   return properties.orientation === 'horizontal' ? textAnchor : 'middle';
        // })
        .attr("dominant-baseline", "central ") // hanging
        .text(function (d) {
          return d
        })
        .attr("transform", function (d, i) {
          if (properties.orientation === "vertical") {
            return "translate(" + (binSize / 2 + i * binSize) + "," + (properties.spaceBetweenPlots / 2 - 0.5) + ") rotate(90) ";
          } else {
            return "translate(" + (binSize / 2 + i * binSize) + "," + (properties.spaceBetweenPlots / 2 - 0.5) + ") ";
          }
        });

    }

    // ===================================================================================
    // Show the mean/standard deviation, if enabled by the user.
    if(properties.showStatistics){

      let sizeStatistic = properties.sizeStatistic;

      const heightMean = 3 * sizeStatistic;
      const widthMean = sizeStatistic;
      const heightStd = 2 * sizeStatistic;
      const widthStd = sizeStatistic;

      // scale for the axis, we start in the middle of the first bin and end in the middle of the last bin
      let xScaleStatistics = d3.scaleLinear().domain(extent).range([binSize / 2, WIDTH - binSize / 2]);

      let yPosTop = - HEIGHT * properties.positionOfMeanStatistic;
      let yPosBottom = properties.spaceBetweenPlots + HEIGHT * properties.positionOfMeanStatistic;


      // ---
      // compute all possible values for the statistic
      let topStatistic = {
        'mean' :  d3.mean(distributionTop),
        'median' : d3.quantile(distributionTop, 0.5),
        'standarddeviation' : d3.deviation(distributionTop),
        'standarderror': d3.deviation(distributionTop) / Math.sqrt(distributionTop.length),
        'quartiles' : [d3.quantile(distributionTop, 0.25), d3.quantile(distributionTop, 0.75)]
      };

      let bottomStatistic = {
        'mean' :  d3.mean(distributionBottom),
        'median' : d3.quantile(distributionBottom, 0.5),
        'standarddeviation' : d3.deviation(distributionBottom),
        'standarderror': d3.deviation(distributionBottom) / Math.sqrt(distributionBottom.length),
        'quartiles' : [d3.quantile(distributionBottom, 0.25), d3.quantile(distributionBottom, 0.75)]
      };

      // --
      // Store the ticks for the statistic here.
      let ticksTop = {
        'main' : null,        // the main tick, e.g., the mean value
        'span' : [],          // the upper and lower span
        'additional' : []     // additional ticks to show, e.g., median while showing mean as most prominent.
      };

      let ticksBottom = {
        'main' : null,        // the main tick, e.g., the mean value
        'span' : [],          // the upper and lower span
        'additional' : []     // additional ticks to show, e.g., median while showing mean as most prominent.
      };

      // --
      // select the proper ticks based on the user selection
      if(properties.aggregatedStatistic === 'mean+std'){

        ticksTop.main = topStatistic.mean;
        ticksTop.span = [topStatistic.mean - topStatistic.standarddeviation, topStatistic.mean + topStatistic.standarddeviation];
        ticksTop.additional = [];

        ticksBottom.main = bottomStatistic.mean;
        ticksBottom.span = [bottomStatistic.mean - bottomStatistic.standarddeviation, bottomStatistic.mean + bottomStatistic.standarddeviation];
        ticksBottom.additional = [];

      }else if(properties.aggregatedStatistic === 'mean+serr'){

        ticksTop.main = topStatistic.mean;
        ticksTop.span = [topStatistic.mean - topStatistic.standarderror, topStatistic.mean + topStatistic.standarderror];
        ticksTop.additional = [];

        ticksBottom.main = bottomStatistic.mean;
        ticksBottom.span = [bottomStatistic.mean - bottomStatistic.standarderror, bottomStatistic.mean + bottomStatistic.standarderror];
        ticksBottom.additional = [];

      }else if(properties.aggregatedStatistic === 'mean+quart'){

        ticksTop.main = topStatistic.mean;
        ticksTop.span = [topStatistic.quartiles[0], topStatistic.quartiles[1]];
        ticksTop.additional = [topStatistic.median];

        ticksBottom.main = bottomStatistic.mean;
        ticksBottom.span = [bottomStatistic.quartiles[0], bottomStatistic.quartiles[1]];
        ticksBottom.additional = [bottomStatistic.median];

      }else if(properties.aggregatedStatistic === 'median+quart'){

        ticksTop.main = topStatistic.median;
        ticksTop.span = [topStatistic.quartiles[0], topStatistic.quartiles[1]];
        ticksTop.additional = [];

        ticksBottom.main = bottomStatistic.median;
        ticksBottom.span = [bottomStatistic.quartiles[0], bottomStatistic.quartiles[1]];
        ticksBottom.additional = [];

      }else{
        console.error('Undefined aggregated statistic: ' + properties.aggregatedStatistic);
      }




      // ---
      // add mean and standard deviation
      // let meanTop = d3.mean(distributionTop);
      // let stdTop = d3.deviation(distributionTop);
      // let meanBottom = d3.mean(distributionBottom);
      // let stdBottom = d3.deviation(distributionBottom);

      // --------------------------------------------------------------------------------------------
      // Draw connection of statistical information (before the actual values in order to make sure it is not over drawn.

      let statisticOverlay = statisticsPlot.append("g")
        .attr("class","statisticOverlay");

      // color the background of the statistic connection
      if(properties.statisticConnectionBackground){

        let lineFunctionBackground = d3.line()
           .x(function(d) { return d.x; })
           .y(function(d) { return d.y; });

        let lineData = [
          { "x": xScaleStatistics(ticksTop.span[0]),   "y": yPosTop},
          { "x": xScaleStatistics(ticksTop.span[1]),   "y": yPosTop},
          { "x": xScaleStatistics(ticksBottom.span[1]),   "y": yPosBottom},
          { "x": xScaleStatistics(ticksBottom.span[0]),   "y": yPosBottom}
        ];

        statisticOverlay.append("path")
          .attr("d", lineFunctionBackground(lineData))
          .attr("fill", properties.colorStatisticBackgroundConnection.hex)
          .attr("opacity", properties.colorStatisticBackgroundConnectionOpacity);
      }

      // connect median, if enabled.
      if(properties.connectMean){
        statisticOverlay.append("line")
          .attr("x1", xScaleStatistics(ticksTop.main))
          .attr("x2", xScaleStatistics(ticksBottom.main))
          .attr("y1", (yPosTop + heightMean))
          .attr("y2", (yPosBottom - heightMean))
          .attr("stroke",properties.colorStatisticConnection.hex)
          .attr("stroke-width",sizeStatistic)
          .attr("opacity", properties.colorStatisticConnectionOpacity);
      }

      // connect std, if enabled.
      if(properties.connectStd){
        statisticOverlay.append("line")
          .attr("x1", xScaleStatistics(ticksTop.span[0]))
          .attr("x2", xScaleStatistics(ticksBottom.span[0]))
          .attr("y1", (yPosTop + heightStd))
          .attr("y2", (yPosBottom - heightStd))
          .attr("stroke",properties.colorStatisticConnectionStd.hex)
          .attr("stroke-width",sizeStatistic)
          .attr("opacity", properties.colorStatisticConnectionStdOpacity);

        statisticOverlay.append("line")
          .attr("x1", xScaleStatistics(ticksTop.span[1]))
          .attr("x2", xScaleStatistics(ticksBottom.span[1]))
          .attr("y1", (yPosTop + heightStd))
          .attr("y2", (yPosBottom - heightStd))
          .attr("stroke",properties.colorStatisticConnectionStd.hex)
          .attr("stroke-width",sizeStatistic)
          .attr("opacity", properties.colorStatisticConnectionStdOpacity);
      }

      // --------------------------------------------------------------------------------------------
      // to append mean, std
      let appendTick = function(parent, width, height, color){
        return parent.append("rect")
          .attr("x",0)
          .attr("y",0)
          .attr("width",width)
          .attr("height",height)
          .attr("fill",color)
          .attr("opacity", 1);
      };

      // append the value of mean etc. to the plot.
      let appendStaticLabel = function(parent, label, top){

        let g = parent.append("g");

        // background to "remove" the grid.
        g.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 3 * properties.fontSizeValues)
          .attr("height", properties.fontSizeValues + 6)
          .attr("fill", function () {
            if(top){
              return properties.colorBackground.colorLeft.hex;
            }else{
              return properties.colorBackground.colorRight.hex;
            }
          })
          .attr("transform", function() {
            if(properties.orientation == 'horizontal') {
              if(top){
                return "translate(" + (-1.5 * properties.fontSizeValues) + " ," + (-properties.fontSizeValues / 2 - 4) + ")"
              }else{
                return "translate(" + (-1.5 * properties.fontSizeValues) + " ," + (-properties.fontSizeValues / 2 - 2) + ")"
              }
            }else{
              if(top){
                return "translate(" + (- 2.5 * properties.fontSizeValues) + " ," + (-properties.fontSizeValues / 2 - 2) + ")"
              }else{
                return "translate(" + (-5) + " ," + (-properties.fontSizeValues / 2 - 2) + ")"
              }
            }

          })
          ;

        // label
        g.append("text")
          .attr("x", 0)
          .attr("y", 0)
          .attr("fill", properties.colorLabel.hex)
          .attr("font-familiy", LABEL['font-familiy'])
          .attr("font-weight", LABEL_GRID['font-weight'])
          .attr("font-size", properties.fontSizeValues)
          .attr("text-anchor", function(){
            if(properties.orientation == 'horizontal') {
              return 'middle';
            } else{
              return top ? 'end' : 'start';
            }
          })
          .attr("dominant-baseline", "central")
          .text(label);

        return g;

      };


      // ---
      // top
      let topStat = statisticsPlot.append("g")
        .attr("class","statistic");

      // main ticks (e.g., mean value)
      if(properties.orientation == 'horizontal'){
        appendStaticLabel(topStat, ticksTop.main.toFixed(2), true).attr("transform","translate(" + (xScaleStatistics(ticksTop.main) - widthMean/2) + "," + (yPosTop - 2 * properties.fontSizeValues / 3) + ")");
      }else{
        appendStaticLabel(topStat, ticksTop.main.toFixed(2), true).attr("transform","translate(" + (xScaleStatistics(ticksTop.main) - widthMean/2) + "," + (yPosTop - (properties.fontSizeValues / 2)) + ") rotate(90)");
      }
      appendTick(topStat,widthMean, heightMean, properties.kernelDensityColorTop.hex).attr("transform","translate(" + (xScaleStatistics(ticksTop.main) - widthMean/2) + "," + (yPosTop) + ")");


      // span ticks (e.g., std deviation)
      appendTick(topStat, widthStd, heightStd, properties.kernelDensityColorTop.hex).attr("transform", "translate(" + (xScaleStatistics(ticksTop.span[0]) - widthStd/2) + "," + (yPosTop) + ")");
      appendTick(topStat, widthStd, heightStd, properties.kernelDensityColorTop.hex).attr("transform", "translate(" + (xScaleStatistics(ticksTop.span[1]) - widthStd/2) + "," + (yPosTop) + ")");

      // additional ticks, if enabled.
      if(ticksTop.additional !== null && ticksTop.additional.length > 0){
        ticksTop.additional.map(function(d){
          appendTick(topStat, widthStd, heightStd, properties.kernelDensityColorTop.hex).attr("transform", "translate(" + (xScaleStatistics(d) - widthStd/2) + "," + (yPosTop) + ")");
        })
      }

      // line between the standard deviation
      topStat.append("line")
        .attr("x1", xScaleStatistics(ticksTop.span[0]) - widthStd / 2)
        .attr("x2", xScaleStatistics(ticksTop.span[1]) + widthStd / 2)
        .attr("y1", yPosTop)
        .attr("y2", yPosTop)
        .attr("stroke",properties.kernelDensityColorTop.hex)
        .attr("stroke-width",sizeStatistic)
        .attr("opacity", 1);


      // ---
      // bottom
      let bottomStat = statisticsPlot.append("g")
        .attr("class","statistic");

      // main ticks (e.g., mean value)
      if(properties.orientation == 'horizontal') {
        appendStaticLabel(topStat, ticksBottom.main.toFixed(2), false).attr("transform", "translate(" + (xScaleStatistics(ticksBottom.main) - widthMean / 2) + "," + (yPosBottom + 2 * properties.fontSizeValues / 3) + ")");
      }else{
        appendStaticLabel(topStat, ticksBottom.main.toFixed(2), false).attr("transform", "translate(" + (xScaleStatistics(ticksBottom.main) - widthMean / 2) + "," + (yPosBottom + properties.fontSizeValues / 2) + ") rotate(90)");
      }

      appendTick(bottomStat,widthMean, heightMean, properties.kernelDensityColorBottom.hex).attr("transform","translate(" + (xScaleStatistics(ticksBottom.main) - widthMean/2) + "," + (yPosBottom - heightMean) + ")");


      // span ticks (e.g., std deviation)
      appendTick(bottomStat, widthStd, heightStd, properties.kernelDensityColorBottom.hex).attr("transform", "translate(" + (xScaleStatistics(ticksBottom.span[0]) - widthStd/2) + "," + (yPosBottom - heightStd) + ")");
      appendTick(bottomStat, widthStd, heightStd, properties.kernelDensityColorBottom.hex).attr("transform", "translate(" + (xScaleStatistics(ticksBottom.span[1]) - widthStd/2) + "," + (yPosBottom - heightStd) + ")");

      // additional ticks, if enabled.
      if(ticksBottom.additional !== null && ticksBottom.additional.length > 0){
        ticksBottom.additional.map(function(d){
          appendTick(bottomStat, widthStd, heightStd, properties.kernelDensityColorBottom.hex).attr("transform", "translate(" + (xScaleStatistics(d) - widthStd/2) + "," + (yPosBottom - heightStd) + ")");
        })
      }



      // line between the standard deviation
      bottomStat.append("line")
        .attr("x1", xScaleStatistics(ticksBottom.span[0]) - widthStd / 2)
        .attr("x2", xScaleStatistics(ticksBottom.span[1]) + widthStd / 2)
        .attr("y1", yPosBottom)
        .attr("y2", yPosBottom)
        .attr("stroke",properties.kernelDensityColorBottom.hex)
        .attr("stroke-width",sizeStatistic)
        .attr("opacity", 1);

    }

    /**
     * Returnns the max height (in percentage) of any bin in any of the two histograms.
     * @param hist1 the first histogram
     * @param hist2 the second histogram
     * @param dist1 the distribution corresponding to the first histogram
     * @param dist2 the distribution corresponding to the second histogram
     */
    function getMaxHistogramHeight(hist1, hist2, dist1, dist2){
      let maxHistTop = d3.max(hist1, function(d){return d.length / dist1.length});
      let maxHistBottom = d3.max(hist2, function(d){return d.length / dist2.length});
      return d3.max([maxHistTop, maxHistBottom]);
    }


    /**
     * Returns the histogram ticks for discrete distributions.
     * @param min min value in distribution
     * @param max max value in distribution
     * @param maxNumBins maximum number of bis to fix issues with large ranges
     * @return {Array}
     */
    function getTicksHistogramDiscrete(min, max, maxNumBins= 10){
      if(max > maxNumBins) {
        return getTicksHistogramContinuous(min, max, maxNumBins)
      }

      // @TS: This function causes trouble for very high integer ranges. [FIXED]
      let ticks = [];
      for(let i=1; i<=max; i++) {
        ticks.push(min + i);
      }
      return ticks;
    }

    /**
     * Returns the histogram ticks for continuous distributions.
     * @param min min value in distribution
     * @param max max value in distribution
     * @param numBins the number of bins.
     * @return {Array}
     */
    function getTicksHistogramContinuous(min, max, numBins){
      let stepSize = (max - min) / (numBins);
      let ticks = [];
      for(let i=0; i<numBins-1; i++){
        ticks.push(extent[0] + (i+1)*stepSize);
      }
      return ticks;
    }

    /**
     * Returns the x scale for continuous distributions.
     */
    function getXScaleHistogramContinuous(){
      return d3.scaleLinear()
        .domain([extent[0], extent[1]])
        .range([0, WIDTH]);
    }

    /**
     * Returns the x scale for discrete distributions.
     */
    function getXScaleHistogramDiscrete(){
      return d3.scaleLinear()
        .domain([extent[0], extent[1] + 0.9999])   // +1 for the last histogram bin, do not use 1, otherwise the histogram will be one bin larger.
        .range([0, WIDTH]);
    }


    function kernelDensityEstimator(kernel, X) {
      return function (V) {
        return X.map(function (x) {
          return [x, d3.mean(V, function (v) {
            return kernel(x - v);
          })];
        });
      };
    }

    function kernelEpanechnikov(k) {
      return function (v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
      };
    }

    /**
     * Take the given color and make it darker (- percentage) or lighter (+ percentage)
     * Taken from Pablo @ https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
     *
     * @param color the color to change in hex-format, e.g., #FF55FF
     * @param percent the percentage
     * @return {string} a new color.
     */
    function shadeColor(color, percent) {

      let R = parseInt(color.substring(1,3),16);
      let G = parseInt(color.substring(3,5),16);
      let B = parseInt(color.substring(5,7),16);

      R = parseInt(R * (100 + percent) / 100);
      G = parseInt(G * (100 + percent) / 100);
      B = parseInt(B * (100 + percent) / 100);

      R = (R<255)?R:255;
      G = (G<255)?G:255;
      B = (B<255)?B:255;

      let RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
      let GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
      let BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

      return "#"+RR+GG+BB;
    }

  }


  get svg() {
    return this._svg;
  }
}
