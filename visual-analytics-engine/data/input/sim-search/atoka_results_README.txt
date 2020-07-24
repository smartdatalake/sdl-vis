------------------------------------------------------------
Project: SmartDataLake (https://smartdatalake.eu/)
Task 3.1: Similarity search and exploration
Subtask: Similarity Search for Multi-faceted Entities
Topic: Preliminary results from similarity search queries on ATOKA dataset.
Prepared by: Kostas Patroumpas, Dimitris Skoutas
Date: 20/2/2020
------------------------------------------------------------

We consider a query that enables multi-criteria similarity search for data exploration of the ATOKA dataset offered by SpazioDati.

This query involves similarity search against the following ATOKA attributes:

q1) Keywords. The query searches for companies that are most similar with the following keywords: "Computer+science,Electronics,Software,E-commerce".
 
q2) Revenue. The query searches for companies that have annual revenues similar (i.e., closest to) 100000 euros.

q3) Number of employees. The query searches for companies employing around 5 persons (may be equal, below, or above this number).

The output of this combined search is top-k results across all examined attributes. Each result is ranked by an aggregate, weighted score over the individual scores on the three attributes. 

Parametrization of each query is fixed, but the weights (w1, w2, w3) on the individual scores may be flexible. Weight w1 is applied on scores regarding query attribute q1 (keywords), w2 refers to scores on attribute q2 (revenue), and w3 for scores on attribute q3 (numEmployees).

In this preliminary example, we have specified different combinations of weights per query attribute, always adding up to 1. Results of these query executions are contained in CSV files named according to the applied weights, as follows: 

* atoka_results_w0.2_0.1_0.7 -> w1:0.2, w2:0.1, w3:0.7.

* atoka_results_w0.2_0.7_0.1 -> w1:0.2, w2:0.7, w3:0.1.

* atoka_results_w0.7_0.2_0.1 -> w1:0.7, w2:0.2, w3:0.1.

* atoka_results_w0.3_0.2_0.5 -> w1:0.3, w2:0.2, w3:0.5.

* atoka_results_w0.3_0.5_0.2 -> w1:0.3, w2:0.5, w3:0.2.

* atoka_results_w0.5_0.3_0.2 -> w1:0.5, w2:0.3, w3:0.2.

* atoka_results_w0.5_0.25_0.25 -> w1:0.5, w2:0.25, w3:0.25.

* atoka_results_w0.25_0.5_0.25 -> w1:0.25, w2:0.5, w3:0.25.

* atoka_results_w0.25_0.25_0.5 -> w1:0.25, w2:0.25, w3:0.5.

* atoka_results_w0.33_0.33_0.33 -> w1:0.334, w2:0.333, w3:0.333.

Each CSV file contains the 20 companies most similar to the query specification and has the same format (columns) :

* top: ranking of the result;
* id: UUID of the original ATOKA identifier (acheneID) of the company;
* keywords: keywords available for the company; 
* keywordsSimScore: estimated score concerning the keywords only based on Jaccard similarity with the query keywords;
* revenue: the revenue of the company;
* revenueSimScore: estimated score (based on the exponential decay similarity) of the company revevue with the query revenue;
* numEmployees: the number of employees in the company;
* employeesSimScore: estimated score (based on proportional similarity) of the number of employees in the company with the number specified in the query.
* totalScore: weighted, aggregated score over all three attributes using weights w1, w2, w3.
