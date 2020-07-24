'use strict';

/**
 * Service for data generation (different distributions).
 * Used for examples + probably also to create the datasets for the evaluation.
 */
angular.module('codeApp')
  .service('datagenerationservice', function () {

    /** Number of bins, used for the example distributions. */
    const NUM_BINS_DISTRIBUTIONS = 9;

    /** Number of values sampled for each sample distribution. */
    const NUM_VALUES_EXAMPLE_DISTRIBUTION = 1000;

    /** Reference to the service. */
    const self = this;

    /**
     * Returns a sample distribution, following an equal distribution.
     * Number of bins is defined in NUM_BINS_DISTRIBUTIONS.
     * Number of result values describing the distribution is defined in NUM_VALUES_EXAMPLE_DISTRIBUTION.
     * @return {Array}
     */
    this.getEqualDistribution = function (){

      let result = [];
      let numValuesPerBin = NUM_VALUES_EXAMPLE_DISTRIBUTION / NUM_BINS_DISTRIBUTIONS;
      for(let i=1; i<=NUM_BINS_DISTRIBUTIONS; i++){
        for(let j=0; j<numValuesPerBin; j++){
          result.push(i);
        }
      }

      return result;
    };

    /**
     * Returns a normal distribution with the following parameters:
     * @param mu mean value
     * @param sigma standard deviation sigma
     * Number of bins is defined in NUM_BINS_DISTRIBUTIONS.
     * Number of result values describing the distribution is defined in NUM_VALUES_EXAMPLE_DISTRIBUTION.
     * @return {Array}
     */
    this.getNormalDistribution = function (mu, sigma){

      // Probability Density Function (PDF) Normal distribution.
      // Formula taken from: https://en.wikipedia.org/wiki/Normal_distribution
      function norm_pdf(x, mu, sigma){
        return (1.0 / Math.sqrt(2.0 * Math.PI * Math.pow(sigma,2))) * Math.exp((-1) * ((Math.pow((x - mu), 2)) / (2 * Math.pow(sigma,2))));
      }


      let result = [];
      for(let i=1; i<=NUM_BINS_DISTRIBUTIONS; i++){

        let density = NUM_VALUES_EXAMPLE_DISTRIBUTION * norm_pdf(i, mu, sigma);
        for(let j=0; j<density; j++){
          result.push(i);
        }

      }

      return result;
    };

    /**
     * Returns a cumulative normal distribution with the following parameters:
     * @param mu mean value
     * @param sigma standard deviation sigma
     * Number of bins is defined in NUM_BINS_DISTRIBUTIONS.
     * Number of result values describing the distribution is defined in NUM_VALUES_EXAMPLE_DISTRIBUTION.
     * @return {Array}
     */
    this.getCumulativeNormalDistribution = function (mu, sigma){

      // Error function
      // Taken from: https://stackoverflow.com/questions/14846767/std-normal-cdf-normal-cdf-or-error-function
      // Source of function: Handbook of Mathematical Functions, formula 7.1.26.
      function erf(x) {
        // save the sign of x
        let sign = (x >= 0) ? 1 : -1;
        x = Math.abs(x);

        // constants
        let a1 =  0.254829592;
        let a2 = -0.284496736;
        let a3 =  1.421413741;
        let a4 = -1.453152027;
        let a5 =  1.061405429;
        let p  =  0.3275911;

        // A&S formula 7.1.26
        let t = 1.0/(1.0 + p*x);
        let y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return sign * y; // erf(-x) = -erf(x);
      }

      // Cumulative Density Function (CDF) Normal distribution.
      // Formula taken from: https://en.wikipedia.org/wiki/Normal_distribution
      function cum_norm_pdf(x, mu, sigma){
        return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2.0))));
      }


      let result = [];
      for(let i=1; i<=NUM_BINS_DISTRIBUTIONS; i++){

        let density = NUM_VALUES_EXAMPLE_DISTRIBUTION * cum_norm_pdf(i, mu, sigma);
        for(let j=0; j<density; j++){
          result.push(i);
        }

      }

      return result;

    };

    /**
     * Returns an exponential distribution with the following parameters:
     * @param lambda (rate parameter, higher value -> stronger exponential curve)
     * @param left (boolean, true -> exponential at small values, false -> exponential at high values)
     * Number of bins is defined in NUM_BINS_DISTRIBUTIONS.
     * Number of result values describing the distribution is defined in NUM_VALUES_EXAMPLE_DISTRIBUTION.
     * @return {Array}
     */
    this.getExponentialDistribution = function (lambda, left){

      // Probability Density Function (PDF) for exponential distribution
      // Formula taken from: https://en.wikipedia.org/wiki/Exponential_distribution
      function exp_pdf(x, lambda){
        if(x < 0) return 0;
        return lambda * Math.exp((-1) * lambda * x);
      }


      let result = [];
      for(let i=1; i<=NUM_BINS_DISTRIBUTIONS; i++){

        let density = NUM_VALUES_EXAMPLE_DISTRIBUTION * exp_pdf(i, lambda);

        for(let j=0; j<density; j++){

          if(left){
            result.push(i);
          }else{
            result.push(NUM_BINS_DISTRIBUTIONS + 1 - i);
          }
        }
      }

      return result;
    };

    /**
     * Returns a log normal distribution with the following parameters:
     * @param mu mean value
     * @param sigma standard deviation sigma
     * @param left (boolean, true -> exponential at small values, false -> exponential at high values)
     * Number of bins is defined in NUM_BINS_DISTRIBUTIONS.
     * Number of result values describing the distribution is defined in NUM_VALUES_EXAMPLE_DISTRIBUTION.
     * @return {Array}
     */
    this.getLogNormalDistribution = function (mu, sigma, left){

      // Probability Density Function (PDF) for log-normal distributions
      // Formula taken from: https://en.wikipedia.org/wiki/Log-normal_distribution
      function logn_pdf(x, mu, sigma){
        return (1 / (x * sigma * Math.sqrt(2 * Math.PI))) * Math.exp((-1)* (Math.pow((Math.log(x) - mu),2)) / (2 * Math.pow(sigma, 2)));
      }

      let result = [];
      for(let i=1; i<=NUM_BINS_DISTRIBUTIONS; i++){

        let density = 0;
        density = NUM_VALUES_EXAMPLE_DISTRIBUTION * logn_pdf(i, mu, sigma);

        for(let j=0; j<density; j++){

          if(left){
            result.push(i);
          }else{
            result.push(NUM_BINS_DISTRIBUTIONS + 1 - i);
          }
        }
      }

      return result;

    };

    /**
     * Returns a multimodal distribution with below parameters.
     * A multimodal distribution is a combination of multiple normal distributions.
     * The number of peaks / modes is given by the length of the paramter peak.
     * @param peaks array of values with the following form: [ {'mu' : 3, 'sigma' : 1.0}, {...}, ...]
     * Number of bins is defined in NUM_BINS_DISTRIBUTIONS.
     * Number of result values describing the distribution is defined in NUM_VALUES_EXAMPLE_DISTRIBUTION.
     * @return {Array}
     */
    this.getMultimodalDistribution = function (peaks){

      let result = [];
      peaks.map(function(p){
        let normalDistribution = self.getNormalDistribution(p.mu, p.sigma);
        result = result.concat(normalDistribution);
      });
      return result;

    };


    /**
     * Returns a skewed normal distribution. with the following parameters.
     * @param location_mu corresponds to mu, for alpha == 0
     * @param scale_sigma corresponds to sigma, for alpha == 0
     * @param alpha value [- / +] defining the degree of skewness. Not the skewness value itself. Check  https://en.wikipedia.org/wiki/Skew_normal_distribution.
     * Number of bins is defined in NUM_BINS_DISTRIBUTIONS.
     * Number of result values describing the distribution is defined in NUM_VALUES_EXAMPLE_DISTRIBUTION.
     * @return {Array}
     */
    this.getSkewedNormalDistribution = function (location_mu, scale_sigma, alpha){

      // Error function
      // Taken from: https://stackoverflow.com/questions/14846767/std-normal-cdf-normal-cdf-or-error-function
      // Source of function: Handbook of Mathematical Functions, formula 7.1.26.
      function erf(x) {
        // save the sign of x
        let sign = (x >= 0) ? 1 : -1;
        x = Math.abs(x);

        // constants
        let a1 =  0.254829592;
        let a2 = -0.284496736;
        let a3 =  1.421413741;
        let a4 = -1.453152027;
        let a5 =  1.061405429;
        let p  =  0.3275911;

        // A&S formula 7.1.26
        let t = 1.0/(1.0 + p*x);
        let y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return sign * y; // erf(-x) = -erf(x);
      }

      // Cumulative Density Function (CDF) Normal distribution.
      // !!! General form, different to self.getCumulativeNormalDistribution
      // Formula taken from: https://en.wikipedia.org/wiki/Skew_normal_distribution
      function general_cum_norm_pdf(x){
        return 0.5 * (1 + erf(x / Math.sqrt(2.0)));
      }


      // Probability Density Function (PDF) Normal distribution.
      // !!! General form, different to self.getNormalDistribution
      // Formula taken from: https://en.wikipedia.org/wiki/Skew_normal_distribution
      function general_norm_pdf(x){
        return (1.0 / Math.sqrt(2.0 * Math.PI)) * Math.exp((-1) * ((Math.pow((x), 2)) / (2)));
      }

      // Probability Density Function (PDF) for skewed normal distribution
      // Formula taken from: https://en.wikipedia.org/wiki/Skew_normal_distribution
      // Including location, scale, and alpha value.
      function skewed_norm_pdf(x, location, scale, alpha){
        return (2.0 / scale) * general_norm_pdf((x - location) / scale) * general_cum_norm_pdf(alpha * ((x - location) / scale));
      }

      let result = [];
      for(let i=1; i<=NUM_BINS_DISTRIBUTIONS; i++){

        let density = NUM_VALUES_EXAMPLE_DISTRIBUTION * skewed_norm_pdf(i, location_mu, scale_sigma, alpha);

        for(let j=0; j<density; j++){
          result.push(i);
        }
      }

      return result;
    }

  });
