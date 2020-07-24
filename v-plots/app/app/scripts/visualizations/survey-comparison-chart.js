'use strict';

/**
 * Class to create a mirrored bar chart in order to compare the survey results.
 */
class SurveyComparisonChart {

  /**
   * @param selector the d3 selector to attache the visualization on -- assuming this is a svg selector.
   */
  constructor(selector, caption, ordering, counts, topVis) {

    const WIDTH = 500;
    const HEIGHT = 500;

    const MAX_BIN_FREQ = 1.0;

    const ENABLE_TOP_SELECTION = false;
    const WIDTH_TOP_SELECTION = ENABLE_TOP_SELECTION ? 30 : 0;

    /** Enable or disable the caption below the plot. Space for caption is 25px. */
    const SHOW_CAPTION = true;
    const marginCaption = SHOW_CAPTION ? 25 : 0;

    // margins around the plot and between the two bar charts.
    let margin = {top: 5, right: 5, bottom: (5 + marginCaption), left: 5, between: ENABLE_TOP_SELECTION ? 5 : 0},
      width    = +WIDTH - margin.left - margin.right - margin.between - WIDTH_TOP_SELECTION,
      height   = +HEIGHT - margin.top - margin.bottom,
      backG    = selector.append("g").attr("transform", "translate(" + 0 + "," + 0 + ")"),
      g        = selector.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
      gTopVis  = selector.append("g").attr("transform", "translate(" + (margin.left + width + margin.between) + "," + margin.top + ")");

    // background of the chart
    backG.append("rect")
      .attr("class", 'comparison-background')
      .attr("x",0)
      .attr("y",0)
      .attr("width",WIDTH)
      .attr("height",HEIGHT);

    // caption
    if(SHOW_CAPTION) {
      backG
        .append("text")
        .attr("class", "comparison-caption")
        .attr("x", 0)
        .attr("y", 0)
        .attr("transform", function (d, i) {
          return "translate(" + (margin.left + (width / 2)) + "," + (HEIGHT - margin.bottom / 2) + ")"
        })
        .text(caption);
    }

    let sizePerVis = height / ordering.length;
    let marginBetweenBins = 2;
    let heightPerBin = sizePerVis - 2*marginBetweenBins;


    let widthVisLabels = 150;
    let widthBinLeftRight = (width - widthVisLabels) / 2;

    // group for the labels in the middle
    let visLabelGroup = g.append("g")
      .attr("class", "labelGroup")
      .attr("transform", "translate(" + (widthBinLeftRight + widthVisLabels/2) + "," + 0 + ")");

    // group for negative bins (transform will be made to the left)
    let negativeBinGroup = g.append("g")
      .attr("transform", "translate(" + (widthBinLeftRight) + "," + 0 + ")");

    let positiveBinGroup = g.append("g")
      .attr("transform", "translate(" + (widthBinLeftRight + widthVisLabels) + "," + 0 + ")");

    // group for positive bins

    // console.log("ordering", ordering);

    visLabelGroup.selectAll(".visLabel")
      .data(ordering)
      .enter()
      .append("text")
      .attr("class","visLabel")
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform", function(d, i){return "translate(" + 0 + "," + (i*sizePerVis + sizePerVis/2) + ")"})
      .text(function(d){return d});

    let scale = d3.scaleLinear().domain([0, MAX_BIN_FREQ]).range([0, widthBinLeftRight]);

    // make '+' bins
    positiveBinGroup
      .selectAll(".plusBin")
      .data(ordering)
      .enter()
      .append("rect")
      .attr("class", "plusBin")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", function(d){
        let v = counts[d]['+'];
        return v ? scale(v) : 0;
      })
      .attr("height", heightPerBin)
      .attr("transform", function(d, i){return "translate(" + 0 + "," + (i*sizePerVis + marginBetweenBins) + ")"})
      .append("title")
      .text(function(d){return "" +
        "-- : " + counts[d]['--'].toFixed(2) + "\n" +
        "-  : " + counts[d]['-'].toFixed(2) + "\n" +
        "+  : " + counts[d]['+'].toFixed(2) + "\n" +
        "++ : " + counts[d]['++'].toFixed(2) + "\n"
      });

    // make '++' bins
    positiveBinGroup
      .selectAll(".plusPlusBin")
      .data(ordering)
      .enter()
      .append("rect")
      .attr("class", "plusPlusBin")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", function(d){
        let v = counts[d]['++'];
        return v ? scale(v) : 0;
      })
      .attr("height", heightPerBin)
      .attr("transform", function(d, i){
        let offset = counts[d]['+'];
        if(!offset) offset = 0;
        return "translate(" + (scale(offset)) + "," + (i*sizePerVis + marginBetweenBins) + ")"
      })
      .append("title")
      .text(function(d){return "" +
        "-- : " + counts[d]['--'].toFixed(2) + "\n" +
        "-  : " + counts[d]['-'].toFixed(2) + "\n" +
        "+  : " + counts[d]['+'].toFixed(2) + "\n" +
        "++ : " + counts[d]['++'].toFixed(2) + "\n"
      });

    // make '-' bins
    negativeBinGroup
      .selectAll(".minusBin")
      .data(ordering)
      .enter()
      .append("rect")
      .attr("class", "minusBin")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", function(d){
        let v = counts[d]['-'];
        return v ? scale(v) : 0;
      })
      .attr("height", heightPerBin)
      .attr("transform", function(d, i){
        let offset = counts[d]['-'];
        if(!offset) offset = 0;
        return "translate(" + (-scale(offset)) + "," + (i*sizePerVis + marginBetweenBins) + ")";
      })
      .append("title")
      .text(function(d){return "" +
        "-- : " + counts[d]['--'].toFixed(2) + "\n" +
        "-  : " + counts[d]['-'].toFixed(2) + "\n" +
        "+  : " + counts[d]['+'].toFixed(2) + "\n" +
        "++ : " + counts[d]['++'].toFixed(2) + "\n"
      });

    // make '--' bins
    negativeBinGroup
      .selectAll(".minusMinusBin")
      .data(ordering)
      .enter()
      .append("rect")
      .attr("class", "minusMinusBin")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", function(d){
        let v = counts[d]['--'];
        return v ? scale(v) : 0;
      })
      .attr("height", heightPerBin)
      .attr("transform", function(d, i){
        let offset1 = counts[d]['-'];
        if(!offset1) offset1 = 0;
        let offset2 = counts[d]['--'];
        if(!offset2) offset2 = 0;
        return "translate(" + (-scale(offset1) - scale(offset2)) + "," + (i*sizePerVis + marginBetweenBins) + ")";
      })
      .append("title")
      .text(function(d){return "" +
        "-- : " + counts[d]['--'].toFixed(2) + "\n" +
        "-  : " + counts[d]['-'].toFixed(2) + "\n" +
        "+  : " + counts[d]['+'].toFixed(2) + "\n" +
        "++ : " + counts[d]['++'].toFixed(2) + "\n"
      });


    // Visualize the top selected visualizations, if enabled
    if(ENABLE_TOP_SELECTION){

      // background of the chart
      // gTopVis.append("rect")
      //   .attr("x",0)
      //   .attr("y",0)
      //   .attr("width", WIDTH_TOP_SELECTION)
      //   .attr("height",height)
      //   .attr("fill", "blue");

      const scaleTopVis = d3.scaleLinear().domain([0, 1.0]).range([0, WIDTH_TOP_SELECTION]);

      gTopVis
        .selectAll(".topVisBin")
        .data(ordering)
        .enter()
        .append("rect")
        .attr("class", "topVisBin")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", function(d){
          let v = topVis[d];
          return v ? scaleTopVis(v) : 0;
        })
        .attr("height", heightPerBin)
        .attr("transform", function(d, i){
          let offset = topVis[d];
          if(!offset) offset = 0;
          return "translate(" + (WIDTH_TOP_SELECTION -scaleTopVis(offset)) + "," + (i*sizePerVis + marginBetweenBins) + ")";
        });


    }


  }
}
