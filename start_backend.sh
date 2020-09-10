#!/bin/bash

docker-compose up -d visual-analytics-engine
docker-compose up -d jupyter-lab
docker-compose up -d v-plots
docker-compose up -d test-db
