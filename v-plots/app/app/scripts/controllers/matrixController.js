'use strict';

/**
 * @ngdoc function
 * @name codeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the codeApp
 */
angular.module('codeApp')
  .controller('MatrixCtrl', function ($scope, $mdToast, $mdSidenav, $mdExpansionPanel, $anchorScroll, propertyservice) {

    /** The overall title of the plot. */
    $scope.titleOfThePlot = "v-plot matrix";

    $scope.order = undefined;

    $scope.distributions = {};

    /** The distribution for the top; init with some example. */
    $scope.inputDistributionTop = "3, 4, 1, 4, 2, 1, 2, 1, 2, 3, 1, 5, 4, 1, 4, 4, 6, 4, 1, 1, 2, 1, 1, 4, 2, 4, 4, 3, 2, 2, 1, 3, 3, 2, 2, 1, 4, 2, 3, 2, 2, 6, 2, 3, 3, 2, 2, 3, 3, 1, 2, 4, 5, 2, 1, 1, 3, 2, 1, 1, 1, 4, 5, 6, 3, 1, 1, 1, 1, 2, 1, 3, 1, 1, 1, 1, 1, 1, 1, 2, 5, 1, 2, 4, 2, 3, 2, 1, 5, 2, 1, 3, 2, 2, 2, 4, 1, 1, 2, 4, 1, 1, 1, 4, 4, 2, 2, 3, 2, 1, 2, 2, 3, 4, 4, 3, 3, 2, 2, 3, 2, 2, 2, 6, 5, 1, 2, 2, 1, 1, 4, 2, 2, 2, 4, 1, 2, 2, 4, 1, 3, 1, 1, 1, 2, 1, 2, 4, 2, 1, 2, 2, 2, 3, 4, 3, 2, 4, 2, 1, 1, 2, 4, 3, 2, 2, 4, 1, 1, 1, 1, 1, 1, 4, 4, 4, 6, 3, 2, 2, 1, 1, 2, 4, 2, 2, 1, 1, 2, 4, 2, 2, 4, 1, 2, 4, 1, 1, 1, 2, 3, 3, 2, 2, 3, 1, 2, 2, 2, 1, 2, 4, 1, 6, 1, 1, 2, 3, 3, 4, 2, 3, 5, 1, 4, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 3, 2, 2, 3, 1, 2, 2, 3, 1, 1, 1, 4, 1, 2, 2, 4, 2, 2, 4, 4, 2, 5, 2, 1, 2, 1, 2, 3, 3, 1, 3, 3, 2, 1, 2, 2, 3, 2, 4, 1, 1, 1, 1, 1, 1, 3, 3, 1, 6, 2, 3, 3, 1, 4, 3, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 2, 2, 4, 1, 1, 1, 5, 2, 5, 2, 4, 3, 4, 2, 4, 3, 1, 3, 1, 1, 3, 1, 2, 3, 4, 5, 4, 4, 1, 5, 4, 2, 1, 3, 3, 1, 2, 1, 1, 2, 4, 1, 2, 1, 2, 1, 2, 2, 2, 2, 3, 2, 1, 2, 2, 3, 1, 2, 1, 2, 2, 1, 1, 1, 1, 2, 1, 3, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 4, 2, 2, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 3, 2, 2, 2, 1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 2, 1, 1, 3, 1, 1, 2, 3, 2, 2, 2, 2, 2, 7, 1, 5";
    //
    /** The distribution for the bottom; init with some example. */
    $scope.inputDistributionBottom = "2, 1, 6, 1, 3, 2, 4, 7, 4, 6, 5, 3, 3, 4, 4, 2, 4, 1, 2, 2, 5, 2, 3, 2, 3, 4, 1, 1, 3, 5, 2, 4, 3, 3, 2, 5, 3, 2, 2, 1, 4, 4, 6, 3, 4, 4, 5, 3, 5, 1, 4, 2, 2, 4, 3, 5, 2, 3, 2, 3, 1, 5, 2, 2, 7, 2, 2, 4, 3, 2, 4, 4, 2, 2, 2, 2, 3, 3, 2, 7, 2, 4, 2, 2, 4, 4, 2, 3, 5, 2, 2, 1, 2, 3, 4, 7, 2, 3, 2, 1, 5, 3, 2, 2, 2, 2, 2, 6, 5, 4, 2, 3, 1, 5, 1, 5, 4, 4, 4, 7, 7, 3, 2, 4, 1, 4, 1, 2, 4, 5, 1, 2, 1, 6, 5, 1, 7, 2, 4, 5, 3, 2, 2, 2, 1, 1, 1, 6, 1, 1, 1, 2, 2";

    $scope.propertiesMatrix = {

      /** The background color of the margin area. */
      colorBackgroundMargin : {
        hex: '#FFFFFF'
      },

      /** The background color behind the histogram and density curve. */
      colorBackground : {
        hex: '#f3f4f4'
      },

      /** Show the name of the plot on top of the visualization*/
      showTitleOfThePlot : true,

      /** Decide to draw a border around the whole plot. */
      showBorderAroundPlot : true,

    };

    /** Visualization Properties for the lower and upper triangle */
    $scope.propertiesVPlots = {};
    $scope.propertiesLowerVPlots = {};

    // default properties. See data/default-properties-matrix; TODO: load from file.
    $scope.propertiesVPlots = {
      "colorBackgroundMargin": {
        "hex": "#FFFFFF"
      },
      "colorBackground": {
        "bothDistributionsSameColor": true,
        "colorBoth": {
          "name": "grey 50",
          "hex": "#fafafa",
          "style": {
            "color": "rgba(0,0,0,0.87)",
            "background-color": "rgb(250,250,250)"
          },
          "$$hashKey": "object:546"
        },
        "colorLeft": {
          "name": "grey 50",
          "hex": "#fafafa",
          "style": {
            "color": "rgba(0,0,0,0.87)",
            "background-color": "rgb(250,250,250)"
          },
          "$$hashKey": "object:546"
        },
        "colorRight": {
          "name": "grey 50",
          "hex": "#fafafa",
          "style": {
            "color": "rgba(0,0,0,0.87)",
            "background-color": "rgb(250,250,250)"
          },
          "$$hashKey": "object:546"
        },
        "colorBetween": {
          "name": "grey 50",
          "hex": "#fafafa",
          "style": {
            "color": "rgba(0,0,0,0.87)",
            "background-color": "rgb(250,250,250)"
          },
          "$$hashKey": "object:546"
        }
      },
      "grid": [
        0.1,
        0.2,
        0.3,
        0.4,
        0.5,
        0.6,
        0.7,
        0.8,
        0.9,
        1
      ],
      "gridGranularity": 0.1,
      "widthOfPlot": 750,
      "heightOfPlot": 750,
      "spaceBetweenPlots": 16,
      "orientation": "vertical",
      "showBorderAroundPlot": false,
      "showGrid": false,
      "gridWithin": false,
      "showGridLabels": "right",
      "showStatistics": false,
      "aggregatedStatistic": "mean+std",
      "connectMean": false,
      "connectStd": false,
      "statisticConnectionBackground": false,
      "colorStatisticConnection": {
        "hex": "#b9b9b9"
      },
      "colorStatisticConnectionStd": {
        "hex": "#b9b9b9"
      },
      "colorStatisticConnectionOpacity": 0.5,
      "colorStatisticConnectionStdOpacity": 0.5,
      "colorStatisticBackgroundConnection": {
        "hex": "#cbcbcb"
      },
      "colorStatisticBackgroundConnectionOpacity": 0.2,
      "statisticInForeground": true,
      "showLabelsHistogramBins": false,
      "positionOfMeanStatistic": 0.85,
      "scaleDomainOfBinHeight": 0.5,
      "showLabelsDistributionNames": false,
      "showTitleOfThePlot": false,
      "distributionRangeAuto": false,
      "distributionRangeMin": 1,
      "distributionRangeMax": 7,
      "showHistograms": true,
      "showDifferenceHistogram": false,
      "showLabelHeightInPercentage": false,
      "colorLabelHeightInPercentage": {
        "hex": "#626567"
      },
      "opacityLabelHeightInPercentage": 0.6,
      "sizeInnerHistogram": 0.8,
      "colorHistogram": {
        "hex": "#87898a"
      },
      "colorHistogramOpacity": 0.26,
      "colorInnerHistogram": {
        "hex": "#4a4d50"
      },
      "colorInnerHistogramOpacity": 0.55,
      "showDensityShape": true,
      "showDifferenceDensityShape": false,
      "showKernelDensityTicks": false,
      "densityCurve": "cubic cardinal spline",
      "densityVisualization": "densityBasedOnHist",
      "kernelDensityBandwidth": 0.8,
      "maxKernelDensityHeight": 0.8,
      "kernelDensityNumTicks": 5,
      "kernelDensityColorTop": {
        "hex": "#1F618D"
      },
      "kernelDensityColorBottom": {
        "hex": "#922B21"
      },
      "colorShapesOpacity": 0.69,
      "colorDifferenceShapesOpacity": 0.4,
      "fontSizeValues": 15,
      "fontSizeGrid": 15,
      "fontSizeHistogramBins": 15,
      "fontSizeHistogramBinHeight": 15,
      "fontSizeTitle": 25,
      "fontSizeGroupNames": 18,
      "colorLabel": {
        "hex": "#626567"
      },
      "sizeStatistic": 2
    };
    // default properties. See data/default-properties-matrix; TODO: load from file.
    $scope.propertiesLowerVPlots = {
      "colorBackgroundMargin": {
        "hex": "#FFFFFF"
      },
      "colorBackground": {
        "bothDistributionsSameColor": true,
        "colorBoth": {
          "name": "grey 50",
          "hex": "#fafafa",
          "style": {
            "color": "rgba(0,0,0,0.87)",
            "background-color": "rgb(250,250,250)"
          },
          "$$hashKey": "object:546"
        },
        "colorLeft": {
          "name": "grey 50",
          "hex": "#fafafa",
          "style": {
            "color": "rgba(0,0,0,0.87)",
            "background-color": "rgb(250,250,250)"
          },
          "$$hashKey": "object:546"
        },
        "colorRight": {
          "name": "grey 50",
          "hex": "#fafafa",
          "style": {
            "color": "rgba(0,0,0,0.87)",
            "background-color": "rgb(250,250,250)"
          },
          "$$hashKey": "object:546"
        },
        "colorBetween": {
          "name": "grey 50",
          "hex": "#fafafa",
          "style": {
            "color": "rgba(0,0,0,0.87)",
            "background-color": "rgb(250,250,250)"
          },
          "$$hashKey": "object:546"
        }
      },
      "grid": [
        0.1,
        0.2,
        0.3,
        0.4,
        0.5,
        0.6,
        0.7,
        0.8,
        0.9,
        1
      ],
      "gridGranularity": 0.1,
      "widthOfPlot": 750,
      "heightOfPlot": 750,
      "spaceBetweenPlots": 16,
      "orientation": "vertical",
      "showBorderAroundPlot": false,
      "showGrid": false,
      "gridWithin": false,
      "showGridLabels": "right",
      "showStatistics": false,
      "aggregatedStatistic": "mean+std",
      "connectMean": false,
      "connectStd": false,
      "statisticConnectionBackground": false,
      "colorStatisticConnection": {
        "hex": "#b9b9b9"
      },
      "colorStatisticConnectionStd": {
        "hex": "#b9b9b9"
      },
      "colorStatisticConnectionOpacity": 0.5,
      "colorStatisticConnectionStdOpacity": 0.5,
      "colorStatisticBackgroundConnection": {
        "hex": "#cbcbcb"
      },
      "colorStatisticBackgroundConnectionOpacity": 0.2,
      "statisticInForeground": true,
      "showLabelsHistogramBins": false,
      "positionOfMeanStatistic": 0.85,
      "scaleDomainOfBinHeight": 0.5,
      "showLabelsDistributionNames": false,
      "showTitleOfThePlot": false,
      "distributionRangeAuto": false,
      "distributionRangeMin": 1,
      "distributionRangeMax": 7,
      "showHistograms": true,
      "showDifferenceHistogram": false,
      "showLabelHeightInPercentage": false,
      "colorLabelHeightInPercentage": {
        "hex": "#626567"
      },
      "opacityLabelHeightInPercentage": 0.6,
      "sizeInnerHistogram": 0.8,
      "colorHistogram": {
        "hex": "#87898a"
      },
      "colorHistogramOpacity": 0.26,
      "colorInnerHistogram": {
        "hex": "#4a4d50"
      },
      "colorInnerHistogramOpacity": 0.55,
      "showDensityShape": false,
      "showDifferenceDensityShape": true,
      "showKernelDensityTicks": false,
      "densityCurve": "cubic cardinal spline",
      "densityVisualization": "densityBasedOnHist",
      "kernelDensityBandwidth": 0.8,
      "maxKernelDensityHeight": 0.8,
      "kernelDensityNumTicks": 5,
      "kernelDensityColorTop": {
        "hex": "#1F618D"
      },
      "kernelDensityColorBottom": {
        "hex": "#922B21"
      },
      "colorShapesOpacity": 0.69,
      "colorDifferenceShapesOpacity": 0.68,
      "fontSizeValues": 15,
      "fontSizeGrid": 15,
      "fontSizeHistogramBins": 15,
      "fontSizeHistogramBinHeight": 15,
      "fontSizeTitle": 25,
      "fontSizeGroupNames": 18,
      "colorLabel": {
        "hex": "#626567"
      },
      "sizeStatistic": 2
    };

    /** The actual distribution, parsed from the GUI.*/
    $scope.distributionTop = undefined;

    /** The actual distribution, parsed from the GUI.*/
    $scope.distributionBottom = undefined;

    /** All data related to uploading csv file and the result in JSON. */
    $scope.csv = {accept:'.csv', columnNames: [], separator: ','};

    /** Selected Column Index for top & bottom distribution data **/
    $scope.selectedColIndex = {};

    /** Property to watch which item in Navbar is currently selected **/
    $scope.currentNavItem = 'uploadCsv';

    /** For speed dial to download visualization**/
    $scope.downloadVizIsOpen = false;

    /** Html div id which contains the visualization **/
    $scope.vizId = '#vplotmatrix';

    /** To keep track if distribution has decimal numbers **/
    $scope.isDecimal = false;

    /** This value will be true automatically when either top or bottom distribution contains decimal**/
    $scope.continuous = false;

    /** The number of bins for the histogram (only relevant if $scope.continuous is selected. */
    $scope.numOfBins = 10;

    /** To hold the JSON file after importing. Array is required by the bower library. **/
    $scope.files = [];

    /** List of available algorithms for ordering **/
    $scope.reorderingAlgos = [
        {id: 1, name: 'Barycenter'},
        {id: 2, name: 'PCA'},
        {id: 3, name: 'Cuthill McKee'},
        {id: 4, name: 'Breadth First'}
    ];

    $scope.selectedReorderingAlgo = undefined;
    /** used for reordering **/
    $scope.defaultMatrix = [];

     /**
     * Parse the given string into a valid JS array of numbers.
     *
     * @param distributionString the input string
     * @return a valid array of numbers.
     */
    function parseDistribution(distributionString) {
       let intFormat = /^\s*([-]{0,1}\d+(\s*,\s*[-]{0,1}\d+)*)?\s*$/;
       let decimalFormat = /^\s*([-]{0,1}\d+(\.\d+)?(\s*,\s*[-]{0,1}\d+(\.\d+)?)*)?\s*$/;

       if(intFormat.test(distributionString)) {
           $scope.isDecimal = false;
         return JSON.parse("[" + distributionString + "]");

       }else if(decimalFormat.test(distributionString)) {
           $scope.isDecimal = true;
           $scope.continuous = true;
         return JSON.parse("[" + distributionString + "]");

       } else
         $scope.showSimpleToast('Distribution data contains non-numerical characters.');
    }

    /**
     * Check if the variable is JSON or not.
     * @param item the variable to check for correctness.
     * @returns {boolean} true - if JSON, false otherwise
     */
    function isJson(item) {
      item = typeof item !== "string" ? JSON.stringify(item) : item;
      try {
        item = JSON.parse(item);
      } catch (e) {
        return false;
      }
      return typeof item === "object" && item !== null;
    }

    /**
     * Loads and reads the JSON file from the data url passed by the lf-ng-md-file-input
     */
    $scope.importFileSelected = function() {
      if($scope.files.length > 0) {
        //Use XHR request to fetch the blob url and convert into readable text.
        let xhr = new XMLHttpRequest;
        xhr.responseType = 'blob';

        xhr.onload = function() {
          let recoveredBlob = xhr.response;
          let reader = new FileReader();
          //Convert Blob to plain text
          reader.onload = function(e) {
            if(isJson(e.target.result))
              $scope.propertiesVPlots = angular.fromJson(e.target.result);
            else
              $scope.showSimpleToast('Invalid JSON!');
          };
          reader.readAsText(recoveredBlob);
        };
        xhr.open('GET', $scope.files[0].lfDataUrl);
        xhr.send();
      }
    };

    /**
     * Loads and reads the JSON file from the data url passed by the lf-ng-md-file-input
     */
    $scope.importFileLowerTriangleSelected = function() {
      if($scope.files.length > 0) {
        //Use XHR request to fetch the blob url and convert into readable text.
        let xhr = new XMLHttpRequest;
        xhr.responseType = 'blob';

        xhr.onload = function() {
          let recoveredBlob = xhr.response;
          let reader = new FileReader();
          //Convert Blob to plain text
          reader.onload = function(e) {
            if(isJson(e.target.result))
              $scope.propertiesLowerVPlots = angular.fromJson(e.target.result);
            else
              $scope.showSimpleToast('Invalid JSON!');
          };
          reader.readAsText(recoveredBlob);
        };
        xhr.open('GET', $scope.files[0].lfDataUrl);
        xhr.send();
      }
    };

    /**
     * For showing any messages via toast
     */
    $scope.showSimpleToast = function(message) {
      $scope.toastPromise = $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('top right')
          .action('Close')
          .hideDelay(0)
          .parent(document.getElementById('toast-container'))
          .theme('error-toast')
      ).then(function() {
        $mdToast.hide();
      });
    };

    /**
     * Function to toggle side nav with component id of the side nav.
     */
    $scope.toggleSideNav = function(componentId) {
      return $mdSidenav(componentId).toggle();
    };

    /**
     * Scroll to particular element on page. Used to get to top of side nav when opened.
     * @param id the id of HTML element
     */
    $scope.scrollTo = function(id) {
      $anchorScroll(id);
    };

    /**
     * Filename for saving the visualization. Removes all special characters from title of plot and replaces space with underscore.
     * If title of plot is empty, returns predefined file name.
     * @returns {string} Formatted filename
     */
    $scope.filename = function() {
      return $scope.titleOfThePlot.length > 0 ? $scope.titleOfThePlot.replace(/[^a-zA-Z0-9 ]/gi, '').replace(/[ ]/gi, '_') : 'Histogram_Visualization';
    };

    /**
     * Callback function after the uploaded csv file has been parsed to JSON.
     */
    $scope.fileParsed = function() {
      //actual file content: $scope.csv.content
      //json parsed result: $scope.csv.result
      //column names: csv.columnNames
      $scope.csv.columnNames = [];
      Object.keys($scope.csv.result[0]).forEach(function(val) {
        if($scope.csv.result[0][val] !== undefined && $scope.csv.result[0][val].length > 0)
          $scope.csv.columnNames.push($scope.csv.result[0][val]);
      });
      $scope.$digest();

      // Parse the csv file and extract all the distributions.

      //Extract values from csv.result and parse in comma separated integers for that column

      let distributionsForMatrix = new Map();
      $scope.distributions = '';
      $scope.distributionsValCount = {};

      /**
       * while computing a default matrix for reordering, we replace missingValues
       * with zero. It is required to have a square matrix for reordering,
       * and hence necessary.
      **/
      for(var a = 1; a < $scope.csv.result.length; a++) {
        let row = [];
        for(var key in $scope.csv.result[a]) {
          if($scope.csv.result[a].hasOwnProperty(key)) {
              $scope.csv.result[a][key] ? row.push($scope.csv.result[a][key]) : row.push(0);
          }
        }
        $scope.defaultMatrix.push(row);
      }

      // iterate over the columns of the csv file.
      for(let col = 0; col < $scope.csv.columnNames.length; col++){
        let parsedData = '';
        let counter = 0;
        let valCount = {
          totalValues: 0,
          missingValues: 0
        };

        for(let i = 1; i < $scope.csv.result.length - 1; i++) {

          if($scope.csv.result[i][col]) {
            parsedData += $scope.csv.result[i][col] + ',';
            valCount.totalValues += counter + 1;
            valCount.missingValues += counter;
            counter = 0;
          } else {
            counter++;
          }
        }


        //Trim the last character if it is comma
        if(parsedData.slice(-1) === ',')
          parsedData = parsedData.slice(0, -1);

        let k = parseDistribution(parsedData);
        if(k !== undefined && k.length > 0) {
          distributionsForMatrix.set($scope.csv.columnNames[col], k);
          $scope.distributionsValCount[$scope.csv.columnNames[col]] = valCount;
        }
      }

      $scope.order = $scope.csv.columnNames;
      $scope.distributions = distributionsForMatrix;
      $scope.$digest();
    };

    /**
     * Performs reordering of the data and updates the visualization
     * For now, implemented only Barycenter reordering.
     **/
    $scope.reorderAndUpdate = function() {
      switch($scope.selectedReorderingAlgo) {
        case 1:
          let graph = reorder.mat2graph($scope.defaultMatrix, true);
          let perms = reorder.barycenter_order(graph);
          let newColOrder = [];
          let newDistribution = new Map();
          for(let i = 0; i < perms[0].length; i++) {
            newColOrder[i] = $scope.csv.columnNames[perms[0][i]];
            newDistribution.set(newColOrder[i], $scope.distributions.get(newColOrder[i]));
          }
          $scope.order = newColOrder;
          $scope.distributions = newDistribution;
          break;
        case 2:
          break;
        case 3:
          break;
        case 4:
          break;
      }
    }

    $scope.$watch('distributions', function(newVal, oldVal){
      console.log("#### distributions changed.");
    }, true);

    $mdExpansionPanel().waitFor('matrixProperties').then(function(instance) {
      instance.expand();
    });

    /**
     * Download the example dataset in data/example-data/example-data-v-plot-matrix.csv
     */
    $scope.downloadExampleDataset = function () {
      window.location.href = "data/example-data/example-data-v-plot-matrix.csv";
    }


  });
