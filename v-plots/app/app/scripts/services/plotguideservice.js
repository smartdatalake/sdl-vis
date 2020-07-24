'use strict';

/**
 * Service to select a plot based on the results of the survey
 * (ignoring the v-plot here)
 *
 * FIXME: Part of this code is duplicated from comparison.js
 *
 */
angular.module('codeApp')
  .service('plotguideservice', function () {

    const SELF = this;

    this.datasets = [
      {'id' : 'G1', 'survey' : 'G1', 'file': 'data/survey/G1.csv', 'caption': 'G1: Describing the type and shape of the distribution'},
      {'id' : 'G2', 'survey' : 'G2', 'file': 'data/survey/G2.csv', 'caption': 'G2: Skewness of distribution'},
      {'id' : 'G3', 'survey' : 'G4', 'file': 'data/survey/G4.csv', 'caption': 'G4: Similarity of distributions in general'},
      {'id' : 'G4', 'survey' : 'G5', 'file': 'data/survey/G5.csv', 'caption': 'G5: Comparing Skewness'},
      {'id' : 'G5', 'survey' : 'G6', 'file': 'data/survey/G6.csv', 'caption': 'G6: Identify Differences'},
      {'id' : 'A1', 'survey' : 'G3', 'file': 'data/survey/G3.csv', 'caption': 'G3: Identify mean or median'},
      {'id' : 'A2', 'survey' : 'G3', 'file': 'data/survey/G3.csv', 'caption': 'G3: Identify mean or median'},
      {'id' : 'L1', 'survey' : 'L7', 'file': 'data/survey/L7.csv', 'caption': 'L7: Reading exact values'},
      {'id' : 'L2', 'survey' : 'L9', 'file': 'data/survey/L9.csv', 'caption': 'L9: Identifying values'},
      {'id' : 'L3', 'survey' : 'L8', 'file': 'data/survey/L8.csv', 'caption': 'L8: Comparing values within a distribution'},
      {'id' : 'L4', 'survey' : 'L10', 'file': 'data/survey/L10.csv', 'caption': 'L10: Comparing values across two distributions'},
      {'id' : 'L5', 'survey' : 'L11', 'file': 'data/survey/L11.csv', 'caption': 'L11: Identifying largest / smallest differences'}
    ];

    this.ordering = [
      {'chart': 'Bar Chart', 'group' : 'H'},
      {'chart': 'Broken Line Graph I', 'group' : 'H'},
      {'chart': 'Grouped Bar Charts', 'group' : 'H'},
      {'chart': 'Mirrored Bar Chart I', 'group' : 'H'},
      {'chart': 'Mirrored Bar Charts II', 'group' : 'H'},
      {'chart': 'Stacked Bar Charts', 'group' : 'H'},
      {'chart': 'Cumulative Bar Charts', 'group' : 'H'},
      {'chart': 'Density Distribution I', 'group' : 'S'},
      {'chart': 'Density Distribution III', 'group' : 'S'},
      {'chart': 'Density Distribution II', 'group' : 'S'},
      {'chart': 'Cumulative Distribution', 'group' : 'S'},
      {'chart': 'Violin Plot', 'group' : 'S'},
      {'chart': 'Beanplot', 'group' : 'S'},
      {'chart': 'Split Violin Plot', 'group' : 'S'},
      {'chart': 'Asymmetric Beanplot', 'group' : 'S'},
      {'chart': 'Broken Line Graph II', 'group' : 'H'},
      {'chart': 'Gradient Plot', 'group' : 'O'},
      {'chart': 'Box Plot', 'group' : 'ST'},
      {'chart': 'Error Bars I', 'group' : 'ST'},
      {'chart': 'Error Bars II', 'group' : 'ST'}
    ];

    this.scores = {};

    /**
     * Add a new comparison chart.
     * @param dataset the path to the datafile and the caption (see $scope.datasets).
     */
    function computeUsefulness(dataset){

      // initialize counts with 0
      let counts = {};
      _.each(SELF.ordering, function(d){

        d = d['chart'];
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
          _.each(SELF.ordering, function(vis){

            vis = vis['chart'];

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
        _.each(SELF.ordering, function(d){

          d = d['chart'];

          let v = counts[d];
          v['--'] = v['--'] / v['count'];
          v['-'] = v['-'] / v['count'];
          v['+'] = v['+'] / v['count'];
          v['++'] = v['++'] / v['count'];

          // this is the score which we use to select the appropriate technique
          v['score'] = (-1.5 * v['--']) - v['-'] + v['+'] + (1.5 * v['++']);

        });

        SELF.scores[dataset['id']] = counts;

      });

    }

    function precomputeUsefulnessOfAllTasks(){

      // compute the usefulness of all charts for each analysis tasks.
      _.each(SELF.datasets,computeUsefulness);

    }

    precomputeUsefulnessOfAllTasks();

    /**
     * Get a list of ranked visualizations (ordered occording to their rank)
     * @param tasks an array of tasks; should fit the ids in this.datasets.
     * @return an array of objects
     *  [
     *    {rank:1, visualization:name, group:histogram}
     *  ]
     */
    this.getRankedVisualizationsForTasks = function (tasks) {

      console.log(SELF.scores);

      // init the array
      let result = [];
      _.each(SELF.ordering, function(vis){
        result.push(
          {'rank': 0, 'visualization' : vis['chart'], 'group' : vis['group'], 'score' : 0}
        );
      });

      // iterate over the different tasks
      _.each(tasks, function(task){

        // get the element with the task
        let t = SELF.scores[task['task']];

        // iterate through the different orderings and update the score
        let i = 0;
        _.each(SELF.ordering, function (vis) {
          result[i].score += t[vis['chart']].score * task['weight'];
          i++;
        })

      });

      // sort the result (reverse -> index 0 = highest rank)
      result = _.sortBy(result, function(r){
        return (-1) * r['score'];
      });

      // set the ranking and normalize the score based on the number of tasks
      let i = 1;
      _.each(result, function(r){
        r['score'] = r['score'] / tasks.length;
        r['rank'] = i++;
      });


      return result;


    }

  });
