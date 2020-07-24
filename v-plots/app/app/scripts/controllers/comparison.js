'use strict';

/**
 * @ngdoc function
 * @name codeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the codeApp
 */
angular.module('codeApp')
  .controller('ComparisonCtrl', function ($scope,propertyservice) {

    // Number of participants to normalize the top vis
    const NUM_PARTICIPANTS = 18;

    // 1 MANUAL ORDERING
    $scope.ordering = [
      'Bar Chart',
      'Broken Line Graph I',
      'Grouped Bar Charts',
      'Mirrored Bar Chart I',
      'Mirrored Bar Charts II',
      'Stacked Bar Charts',
      'Cumulative Bar Charts',
      '--',
      'Density Distribution I',
      'Density Distribution III',
      'Density Distribution II',
      'Cumulative Distribution',
      '--',
      'Violin Plot',
      'Beanplot',
      'Split Violin Plot',
      'Asymmetric Beanplot',
      '--',
      'Broken Line Graph II',
      'Gradient Plot',
      '--',
      'Box Plot',
      'Error Bars I',
      'Error Bars II'
    ];

    $scope.datasets = [
      {'id' : 'all-tasks', 'file': 'data/survey/all-tasks.csv', 'caption': 'ALL TASKS'},
      {'id' : 'global-tasks', 'file': 'data/survey/global-tasks.csv', 'caption': 'GLOBAL TASKS'},
      {'id' : 'local-tasks', 'file': 'data/survey/local-tasks.csv', 'caption': 'LOCAL TASKS'},
      {'id' : 'aggregated-tasks', 'file': 'data/survey/aggregated-tasks.csv', 'caption': 'AGGREGATED TASKS'},
      {'id' : 'G1', 'survey' : 'G1', 'file': 'data/survey/G1.csv', 'caption': 'G1. Describing the type and shape of one distribution'},
      {'id' : 'G2', 'survey' : 'G2', 'file': 'data/survey/G2.csv', 'caption': 'G2. Describing the skewness and kurtosis of one distribution'},
      {'id' : 'G3', 'survey' : 'G4', 'file': 'data/survey/G4.csv', 'caption': 'G3. Compare the similarity and type of multiple distributions'},
      {'id' : 'G4', 'survey' : 'G5', 'file': 'data/survey/G5.csv', 'caption': 'G4. Compare the skewness and kurtosis of multiple distributions'},
      {'id' : 'G5', 'survey' : 'G6', 'file': 'data/survey/G6.csv', 'caption': 'G5. Identify the value ranges with the largest/smallest difference'},
      {'id' : 'A1', 'survey' : 'G3', 'file': 'data/survey/G3.csv', 'caption': 'A1. Identify mean of one distribution'},
      {'id' : 'A2', 'survey' : 'G3', 'file': 'data/survey/G3.csv', 'caption': 'A2. Identify median of one distribution'},
      {'id' : 'A3', 'survey' : 'G3', 'file': 'data/survey/G3.csv', 'caption': 'A3. Identify quartiles of one distribution'},
      {'id' : 'A4', 'survey' : 'G3', 'file': 'data/survey/G3.csv', 'caption': 'A4. Identify standard deviation of one distribution'},
      {'id' : 'A5', 'survey' : 'G3', 'file': 'data/survey/G3.csv', 'caption': 'A5. Identify standard error of one distribution'},
      {'id' : 'A6', 'survey' : 'G3', 'file': 'data/survey/G3.csv', 'caption': 'A6. Compare the means of multiple distributions.'},
      {'id' : 'A7', 'survey' : 'G3', 'file': 'data/survey/G3.csv', 'caption': 'A7. Compare the medians of multiple distributions.'},
      {'id' : 'A8', 'survey' : 'G3', 'file': 'data/survey/G3.csv', 'caption': 'A8. Compare the quartiles of multiple distributions.'},
      {'id' : 'A9', 'survey' : 'G3', 'file': 'data/survey/G3.csv', 'caption': 'A9. Compare the standard errors of multiple distributions.'},
      {'id' : 'A10', 'survey' : 'G3', 'file': 'data/survey/G3.csv', 'caption': 'A10. Compare the standard deviations of multiple distributions.'},
      {'id' : 'L1', 'survey' : 'L7', 'file': 'data/survey/L7.csv', 'caption': 'L1. Identify the frequency of one value'},
      {'id' : 'L2', 'survey' : 'L9', 'file': 'data/survey/L9.csv', 'caption': 'L2. Identify the most and least frequent value(s)'},
      {'id' : 'L3', 'survey' : 'L8', 'file': 'data/survey/L8.csv', 'caption': 'L3: Compare frequencies within one distribution'},
      {'id' : 'L4', 'survey' : 'L10', 'file': 'data/survey/L10.csv', 'caption': 'L4: Compare frequencies within one distribution'},
      {'id' : 'L5', 'survey' : 'L11', 'file': 'data/survey/L11.csv', 'caption': 'L5: Identify the values with the largest and smallest difference'}
    ];


    $scope.charts = [
      {'id' : 'Bar Chart', 'file' : 'data/charts/bar-chart.csv', 'caption' : 'BAR CHART'},
      {'id' : 'Broken Lİne Graph I', 'file' : 'data/charts/broken-line-graph-I.csv', 'caption' : 'BROKEN LINE GRAPH I'},
      {'id' : 'Grouped Bar Charts', 'file' : 'data/charts/grouped-bar-charts.csv', 'caption' : 'GROUPED BAR CHARTS'},
      {'id' : 'Mirrored Bar Chart I', 'file' : 'data/charts/mirrored-bar-chart-I.csv', 'caption' : 'MIRRORED BAR CHART I'},
      {'id' : 'Mirrored Bar Chart II', 'file' : 'data/charts/mirrored-bar-chart-II.csv', 'caption' : 'MIRRORED BAR CHART II'},
      {'id' : 'Stacked Bar Chart', 'file' : 'data/charts/stacked-bar.csv', 'caption' : 'STACKED BAR CHART'},
      {'id' : 'Cumulative Bar Charts', 'file' : 'data/charts/cumulative-bar-charts.csv', 'caption' : 'CUMULATIVE BAR CHARTS'},
      {'id' : 'Density Distribution I', 'file' : 'data/charts/density-dist-I.csv', 'caption' : 'DENSITY DISTRIBUTION I'},
      {'id' : 'Density Distribution III', 'file' : 'data/charts/density-dist-III.csv', 'caption' : 'DENSITY DISTRIBUTION III'},
      {'id' : 'Density Distribution II', 'file' : 'data/charts/density-dist-II.csv', 'caption' : 'DENSITY-DISTRIBUTION II'},
      {'id' : 'Cumulative Distribution', 'file' : 'data/charts/cumulative-dist.csv', 'caption' : 'CUMULATIVE DISTRIBUTION'},
      {'id' : 'Violin Plot', 'file' : 'data/charts/violin-plot.csv', 'caption' : 'VIOLIN PLOT'},
      {'id' : 'Bean Plot', 'file' : 'data/charts/bean-plot.csv', 'caption' : 'BEAN PLOT'},
      {'id' : 'Split Violin Plot', 'file' : 'data/charts/split-violin-plot.csv', 'caption' : 'SPLIT VIOLIN PLOT'},
      {'id' : 'Asymmetric Beanplot', 'file' : 'data/charts/asymmetric-bean-plot.csv', 'caption' : 'ASYMMETRIC BEAN PLOT'},
      {'id' : 'Broken Line Graph II', 'file' : 'data/charts/broken-line-graph-II.csv', 'caption' : 'BROKEN LINE GRAPH II'},
      {'id' : 'Gradient Plot', 'file' : 'data/charts/gradient-plot.csv', 'caption' : 'GRADIENT PLOT'},
      {'id' : 'Box Plot', 'file' : 'data/charts/box-plot.csv', 'caption' : 'BOX PLOT'},
      {'id' : 'Error Bars I', 'file' : 'data/charts/error-bars-I.csv', 'caption' : 'ERROR BARS I'},
      {'id' : 'Error Bars II', 'file' : 'data/charts/error-bars-II.csv', 'caption' : 'ERROR BARS II'},
    ];

    $scope.topVis = {};

    /**
     * Add a new comparison chart.
     * @param dataset the path to the datafile and the caption (see $scope.datasets).
     */

    function addComparisonChart(dataset){

      // initialize counts with 0
      let counts = {};
      _.each($scope.ordering, function(d){
        counts[d] = {
          '--' : 0,
          '-' : 0,
          '+' : 0,
          '++' : 0,
          'count' : 0   // count ignoring N/A
        }
      });

      // parse the dataset and count the number of '++', '+', ...
      let lineNumber = 0;
      d3.csv(dataset['file'], function(data){

        _.each(data, function(line){
          lineNumber++;
          _.each($scope.ordering, function(vis){

            let value = line[vis];
            if(vis === '--' || value === '--' || value === '-' || value === '+' || value === '++'){

              let v = counts[vis];

              v['count']++;
              v[value]++;

            }else if(value === 'N/A'){
              // console.log("missing value in line", line);
            }else{
              console.error("ERROR: non-parseable entry in the following dataset: " + dataset['file'] + ".", value, "in line: ", lineNumber, line, " for vis type", vis);
            }

          })

        });

        // convert absolute counts into relative
        _.each($scope.ordering, function(d){

          let v = counts[d];
          v['--'] = v['--'] / v['count'];
          v['-'] = v['-'] / v['count'];
          v['+'] = v['+'] / v['count'];
          v['++'] = v['++'] / v['count'];

        });

        let divElement = d3.select('#survey-results').append("div")
          .attr("class","survey-chart-div");

        let idForSVG = dataset['file'].replace(".csv","").split("/").join("-");
        // console.log("id", idForSVG);

        let element = divElement
          .append("svg")
          .attr("id", idForSVG)
          .attr("width", 500)
          .attr("height", 500);

        new SurveyComparisonChart(element, dataset['caption'], $scope.ordering, counts, $scope.topVis[dataset['id']]);

        // Add a download button to each chart.
        // divElement.append("button")
        //   .attr("svg-download", '#' + idForSVG)
        //   .attr("title", idForSVG)
        //   .attr("type", "png")
        //   .text("download chart");
        // // <button svg-download="#chart" title="mysvg">Download as SVG</button>

      });

    }

   function addComparisonTask(dataset){

      let settings=propertyservice.getWizardSettings();

      let tasks =[];

      if(settings.aggregation === true) tasks.push('aggregated');
      if(settings.l1 === 'relevant' || settings.l1 === 'very-relevant') tasks.push('L1');
      if(settings.l2 === 'relevant' || settings.l2 === 'very-relevant') tasks.push('L2');
      if(settings.l3 === 'relevant' || settings.l3 === 'very-relevant') tasks.push('L3');
      if(settings.l4 === 'relevant' || settings.l4 === 'very-relevant') tasks.push('L4');
      if(settings.l5 === 'relevant' || settings.l5 === 'very-relevant') tasks.push('L5');
      if(settings.g1 === 'relevant' || settings.g1 === 'very-relevant') tasks.push('G1');
      if(settings.g2 === 'relevant' || settings.g2 === 'very-relevant') tasks.push('G2');
      if(settings.g3 === 'relevant' || settings.g3 === 'very-relevant') tasks.push('G3');
      if(settings.g4 === 'relevant' || settings.g4 === 'very-relevant') tasks.push('G4');
      if(settings.g5 === 'relevant' || settings.g5 === 'very-relevant') tasks.push('G5');

        // initialize counts with 0
      let counts = {};
      _.each(tasks, function(d){
        counts[d] = {
          '--' : 0,
          '-' : 0,
          '+' : 0,
          '++' : 0,
          'count' : 0   // count ignoring N/A
        }
      });


      // parse the dataset and count the number of '++', '+', ...
      let lineNumber = 0;
      d3.csv(dataset['file'], function(data){

        _.each(data, function(line){
          lineNumber++;
          _.each(tasks, function(vis){

            let value = line[vis];
            if(vis === '--' || value === '--' || value === '-' || value === '+' || value === '++'){

              let v = counts[vis];

              v['count']++;
              v[value]++;

            }else if(value === 'N/A'){
              // console.log("missing value in line", line);
            }else{
              console.error("ERROR: non-parseable entry in the following dataset: " + dataset['file'] + ".", value, "in line: ", lineNumber, line, " for vis type", vis);
            }

          })

        });

        // convert absolute counts into relative
        _.each(tasks, function(d){

          let v = counts[d];
          v['--'] = v['--'] / v['count'];
          v['-'] = v['-'] / v['count'];
          v['+'] = v['+'] / v['count'];
          v['++'] = v['++'] / v['count'];

        });

        let divElement = d3.select('#charts-task').append("div")
          .attr("class","survey-chart-div");

        let idForSVG = dataset['file'].replace(".csv","").split("/").join("-");
        // console.log("id", idForSVG);

        let element = divElement
          .append("svg")
          .attr("id", idForSVG)
          .attr("width", 500)
          .attr("height", 500);

        new SurveyComparisonChart(element, dataset['caption'], tasks, counts, $scope.topVis[dataset['id']]);

        // Add a download button to each chart.
        // divElement.append("button")
        //   .attr("svg-download", '#' + idForSVG)
        //   .attr("title", idForSVG)
        //   .attr("type", "png")
        //   .text("download chart");
        // // <button svg-download="#chart" title="mysvg">Download as SVG</button>

      });

    }

    // for each dataset, add a comparison chart.
    function addAllComparisonTasks() {
      _.each($scope.charts, addComparisonTask);
    }

    function removeChart(id) {
      d3.select("#data-survey-"+id).selectAll("*").remove();
    }

    function removeAllCharts() {
      _.each($scope.datasets,function(data)
      {
        d3.select("#data-survey-"+data['id']).selectAll("*").remove();
      });

      _.each($scope.charts,function(data)
      {
        d3.select("#data-survey-"+data['id']).selectAll("*").remove();
      });
    }

    function mergeCSVFiles(contents, callback){
      var lineNumber = 0;
      let counts = {};
      _.each($scope.ordering, function(d){
        counts[d] = {
          '--' : 0,
          '-' : 0,
          '+' : 0,
          '++' : 0,
          'count' : 0   // count ignoring N/A
        }
      });

      var index=contents.length;

      _.each(contents,function(dataset){

        d3.csv(dataset['file'],function(data){

          _.each(data, function(line){
            lineNumber++;
            _.each($scope.ordering, function(vis){

              let value = line[vis];
              if(vis === '--' || value === '--' || value === '-' || value === '+' || value === '++'){

                let v = counts[vis];

                v['count']++;
                v[value]++;

              }else if(value === 'N/A'){
                // console.log("missing value in line", line);
              }else{
                console.error("ERROR: non-parseable entry in the following dataset: " + dataset['file'] + ".", value, "in line: ", lineNumber, line, " for vis type", vis);
              }

            })
          });


          index--;

          if(index===0) //Create visualization with the latest data
          {
            _.each($scope.ordering, function(d){

            let v = counts[d];
            v['--'] = v['--'] / v['count'];
            v['-'] = v['-'] / v['count'];
            v['+'] = v['+'] / v['count'];
            v['++'] = v['++'] / v['count'];

           });

            let divElement = d3.select('#survey-results').append("div")
              .attr("class","survey-chart-div");

            let idForSVG = 'data-survey-all-tasks';
              // console.log("id", idForSVG);

            let element = divElement
                .append("svg")
                .attr("id", idForSVG)
                .attr("width", 500)
                .attr("height", 500);

            new SurveyComparisonChart(element, 'Overview of *ALL SELECTED* tasks', $scope.ordering, counts);
          }
        }); //close dataset['file']
      });//each-contents


    }//finish mergeCSVFiles

    function createAllTasksVis(settings,dataset) {
      //Merge csv files based on settings
      let csvContents=[];

      // if(settings.local === true) csvContents.push(dataset[2]);
      // if(settings.global === true) csvContents.push(dataset[1]);
      // if(settings.aggregation === true) csvContents.push(dataset[3]);
      if(settings.l1 === 'relevant' || settings.l1 === 'very-relevant') csvContents.push(dataset[19]);
      if(settings.l2 === 'relevant' || settings.l2 === 'very-relevant') csvContents.push(dataset[20]);
      if(settings.l3 === 'relevant' || settings.l3 === 'very-relevant') csvContents.push(dataset[21]);
      if(settings.l4 === 'relevant' || settings.l4 === 'very-relevant') csvContents.push(dataset[22]);
      if(settings.l5 === 'relevant' || settings.l5 === 'very-relevant') csvContents.push(dataset[23]);
      if(settings.g1 === 'relevant' || settings.g1 === 'very-relevant') csvContents.push(dataset[4]);
      if(settings.g2 === 'relevant' || settings.g2 === 'very-relevant') csvContents.push(dataset[5]);
      if(settings.g3 === 'relevant' || settings.g3 === 'very-relevant') csvContents.push(dataset[6]);
      if(settings.g4 === 'relevant' || settings.g4 === 'very-relevant') csvContents.push(dataset[7]);
      if(settings.g5 === 'relevant' || settings.g5 === 'very-relevant') csvContents.push(dataset[8]);
      if(settings.a1 === 'relevant' || settings.a1 === 'very-relevant') csvContents.push(dataset[9]);
      if(settings.a2 === 'relevant' || settings.a2 === 'very-relevant') csvContents.push(dataset[10]);
      if(settings.a3 === 'relevant' || settings.a3 === 'very-relevant') csvContents.push(dataset[11]);

      mergeCSVFiles(csvContents);


    }

    function createIndependentTasks(settings,dataset)
    {
      if(settings.l1 === 'relevant' || settings.l1 === 'very-relevant') addComparisonChart(dataset[19]);
      if(settings.l2 === 'relevant' || settings.l2 === 'very-relevant') addComparisonChart(dataset[20]);
      if(settings.l3 === 'relevant' || settings.l3 === 'very-relevant') addComparisonChart(dataset[21]);
      if(settings.l4 === 'relevant' || settings.l4 === 'very-relevant') addComparisonChart(dataset[22]);
      if(settings.l5 === 'relevant' || settings.l5 === 'very-relevant') addComparisonChart(dataset[23]);
      if(settings.g1 === 'relevant' || settings.g1 === 'very-relevant') addComparisonChart(dataset[4]);
      if(settings.g2 === 'relevant' || settings.g2 === 'very-relevant') addComparisonChart(dataset[5]);
      if(settings.g3 === 'relevant' || settings.g3 === 'very-relevant') addComparisonChart(dataset[6]);
      if(settings.g4 === 'relevant' || settings.g4 === 'very-relevant') addComparisonChart(dataset[7]);
      if(settings.g5 === 'relevant' || settings.g5 === 'very-relevant') addComparisonChart(dataset[8]);
      if(settings.a1 === 'relevant' || settings.a1 === 'very-relevant') addComparisonChart(dataset[9]);
      if(settings.a2 === 'relevant' || settings.a2 === 'very-relevant') addComparisonChart(dataset[10]);
      if(settings.a3 === 'relevant' || settings.a3 === 'very-relevant') addComparisonChart(dataset[11]);
    }

    function addChartsBasedWizardSettings(settings) {
      removeAllCharts();


      /*
        if((settings.global === true && settings.local === true && settings.aggregation === true) && (settings.l1 === 'relevant' || settings.l1 === 'very-relevant') && (settings.l2 === 'relevant' || settings.l2 === 'very-relevant') &&
          (settings.l3 === 'relevant' || settings.l3 === 'very-relevant') && (settings.l4 === 'relevant' || settings.l4 === 'very-relevant') &&
          (settings.l5 === 'relevant' || settings.l5 === 'very-relevant') && (settings.g1 === 'relevant' || settings.g1 === 'very-relevant') && (settings.g2 === 'relevant' || settings.g2 === 'very-relevant') &&
          (settings.g3 === 'relevant' || settings.g3 === 'very-relevant') && (settings.g4 === 'relevant' || settings.g4 === 'very-relevant') &&
          (settings.g5 === 'relevant' || settings.g5 === 'very-relevant') && (settings.a1 === 'relevant' || settings.a1 === 'very-relevant') && (settings.a2 === 'relevant' || settings.a2 === 'very-relevant') &&
          (settings.a3 === 'relevant' || settings.a3 === 'very-relevant'))
        {
            addComparisonChart($scope.datasets[0]);
        }
        else if((settings.l1 === 'relevant' || settings.l1 === 'very-relevant') && (settings.l2 === 'relevant' || settings.l2 === 'very-relevant') &&
          (settings.l3 === 'relevant' || settings.l3 === 'very-relevant') && (settings.l4 === 'relevant' || settings.l4 === 'very-relevant') &&
          (settings.l5 === 'relevant' || settings.l5 === 'very-relevant'))
        {
            addComparisonChart($scope.datasets[2]);
        }
        else if((settings.g1 === 'relevant' || settings.g1 === 'very-relevant') && (settings.g2 === 'relevant' || settings.g2 === 'very-relevant') &&
          (settings.g3 === 'relevant' || settings.g3 === 'very-relevant') && (settings.g4 === 'relevant' || settings.g4 === 'very-relevant') &&
          (settings.g5 === 'relevant' || settings.g5 === 'very-relevant'))
        {
            addComparisonChart($scope.datasets[1]);
        }
        else
        {
          createAllTasksVis(settings,$scope.datasets);
          createIndependentTasks(settings,$scope.datasets);
        }
        */

      createAllTasksVis(settings,$scope.datasets);
      createIndependentTasks(settings,$scope.datasets);

      //Create all tasks visualization based on settings
      // headline: Charts based on Tasks
      addAllComparisonTasks();
    }

    // read in the top-vis markings
    function readTopVis(){

     d3.csv('data/survey/top-vis.csv', function(data){

        _.each(data, function(line){

          // iterate over all vis types and normalize the counts of the top vis.
          _.each($scope.ordering, function(vis){
            line[vis] = (+line[vis]) / NUM_PARTICIPANTS;
          });

          let id = line['id'];
          $scope.topVis[id] = line;

        });

        // Done with the pre-processing. Start drawing the actual plots
        //Add charts based on wizard settings
        let wizardSettings=propertyservice.getWizardSettings();
        addChartsBasedWizardSettings(wizardSettings);

      });
    }
    readTopVis();
  });
