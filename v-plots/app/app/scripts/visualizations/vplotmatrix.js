'use strict';

/**
 * Class to create a v-plot matrix
 */
class VPlotMatrix{


  constructor(selector, titleOfThePlot, order, distributions, propertiesMatrix, propertiesUpperVPlots, propertiesLowerVPlots, continuous, numOfBins){

    /** Margins for title etc. */
    const MARGIN = {
        top: propertiesMatrix.showTitleOfThePlot ? 50 : 20,
        right: 20,
        bottom: 20,
        left: 20,
      };

    const WIDTH_LABELS_OF_MATRIX = 150;

    const SIZE_PLOT = 80;

    /** Properties of all labels in the visualization. */
    const LABEL = {
      "fill": "#626567",
      "font-family": "'Lato', 'Open Sans', 'Helvetica Neue', 'Arial', sans-serif"
    };

    /** Properties of the title label in the visualization. */
    const LABEL_TITLE = {
      "font-weight": "normal",
      "font-size": "25px",
    };

    // the size of the svg need to consider the orientation
    const W_SVG = MARGIN.left + MARGIN.right + WIDTH_LABELS_OF_MATRIX + SIZE_PLOT * order.length;
    const H_SVG = MARGIN.top + MARGIN.bottom + WIDTH_LABELS_OF_MATRIX + SIZE_PLOT * order.length;
    let svg =  selector.append("svg")
      .attr("id", "vplotmatrix")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", W_SVG)
      .attr("height", H_SVG)
      .attr("align","center");

    let vPlotMatrix = svg.append("g");
    let labelGroup = svg.append("g")
      .attr("transform","translate(" + MARGIN.left + "," + MARGIN.top + ")");
    let matrixGroup = svg.append("g")
      .attr("transform","translate(" + (MARGIN.left + WIDTH_LABELS_OF_MATRIX) + "," + (MARGIN.top + WIDTH_LABELS_OF_MATRIX) + ")");

    // background of the whole visualization
    vPlotMatrix.append("rect")
      .attr("x",0)
      .attr("y",0)
      .attr("width",W_SVG - 4)
      .attr("height",H_SVG - 4)
      .attr("fill", propertiesMatrix.colorBackgroundMargin.hex)  // use a background color
      .attr("stroke-width", propertiesMatrix.showBorderAroundPlot ? "1" : "0")
      .attr("stroke", "#909497")
      .attr("transform","translate(2,2)");


    // ----
    // show the title of the plot, top, centered, if selected by the user.
    if(propertiesMatrix.showTitleOfThePlot){

      let title = vPlotMatrix.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", LABEL['fill'])
        .attr("font-familiy", LABEL['font-familiy'])
        .attr("font-weight", LABEL_TITLE['font-weight'])
        .attr("font-size", LABEL_TITLE['font-size'])
        .text(titleOfThePlot)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("transform","translate(" + (W_SVG / 2) + "," + (MARGIN.top / 2) + ")");



    }





    // add labels for the matrix

    // ----------------
    // horizontal
    labelGroup.selectAll(".matrixLabel")
      .data(order)
      .enter()
      .append("g")
      .attr("transform", function(d,i){return "translate(" + (WIDTH_LABELS_OF_MATRIX + i*SIZE_PLOT) + "," + 0 + ")"})
      // .append("rect")
      //   .attr("x",0)
      //   .attr("y",0)
      //   .attr("width", SIZE_PLOT)
      //   .attr("height",WIDTH_LABELS_OF_MATRIX)
      //   .attr("fill","#d1d4d6")
      //   .attr("stroke","black")
      //   .attr("stroke-width","0.2px")
      // .select(function() { return this.parentNode; })
      .append("text")
      .attr("x",0)
      .attr("y",0)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "central")
      .text(function(d){return d;})
      .attr("transform", function(){return "translate(" + (SIZE_PLOT/2) + "," + (WIDTH_LABELS_OF_MATRIX - 10) + ") rotate(-45)"});




    // ----------------
    // vertical
    labelGroup.selectAll(".matrixLabel")
      .data(order)
      .enter()
      .append("g")
      .attr("transform", function(d,i){return "translate(" + 0 + "," + (WIDTH_LABELS_OF_MATRIX + i*SIZE_PLOT) + ")"})
      // .append("rect")
      //   .attr("x",0)
      //   .attr("y",0)
      //   .attr("width",WIDTH_LABELS_OF_MATRIX)
      //   .attr("height",SIZE_PLOT)
      //   .attr("fill","#d1d4d6")
      //   .attr("stroke","black")
      //   .attr("stroke-width","0.2px")
      // .select(function() { return this.parentNode; })
      .append("text")
      .attr("x",0)
      .attr("y",0)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "central")
      .text(function(d){return d;})
      .attr("transform", function(){return "translate(" + (WIDTH_LABELS_OF_MATRIX - 10) + "," + (SIZE_PLOT / 2) + ") "});




    // create matrix of distribution combinations
    // TODO make dynamic
    let scaleFactor = SIZE_PLOT / 800;

    // propertiesVPlots.densityVisualization = 'densityBasedOnHist';
    for(let row=0; row<order.length; row++){
      for(let col=row+1; col<order.length; col++){

        let selector = matrixGroup.append("g")
          .attr("transform","translate(" + (col*SIZE_PLOT) + "," + (row*SIZE_PLOT) + ") scale(" + scaleFactor + ")");

        let vplot = new VPlot(selector, undefined, undefined, undefined, distributions.get(order[row]), distributions.get(order[col]), propertiesUpperVPlots, continuous, numOfBins).svg;

          // selector.append("rect")
          // .attr("x",0)
          // .attr("y",0)
          // .attr("width",WIDTH_LABELS_OF_MATRIX)
          // .attr("height",WIDTH_LABELS_OF_MATRIX)
          // .attr("fill","green");

      }
    }

    // create lower triangle -> only the difference visualizations
    // propertiesVPlots.densityVisualization = 'densityBasedOnDiffHist';
    for(let row=1; row<order.length; row++){
      for(let col=0; col<row; col++){

        let selector = matrixGroup.append("g")
          .attr("transform","translate(" + (col*SIZE_PLOT) + "," + (row*SIZE_PLOT) + ") scale(" + scaleFactor + ")");

        let vplot = new VPlot(selector, undefined, undefined, undefined, distributions.get(order[col]), distributions.get(order[row]), propertiesLowerVPlots, continuous, numOfBins).svg;

        // selector.append("rect")
        // .attr("x",0)
        // .attr("y",0)
        // .attr("width",WIDTH_LABELS_OF_MATRIX)
        // .attr("height",WIDTH_LABELS_OF_MATRIX)
        // .attr("fill","green");

      }
    }


  }


}
