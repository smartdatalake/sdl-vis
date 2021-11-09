# The Visual Analytics Layer of SmartDataLake

This repository contains the SDL-Vis implementation of the SmartDataLake project.
It consists of two major components:
1. The **Visual Explorer** provides an interactive web interface where the different visual analytics applications of SDL-Vis are implemented as tabs.
2. The **Visual Analytics Engine** implements the backend functionality of SDL-Vis, interfacing between the mining components of the SmartDataLake pipeline and the visual frontend.

## Starting the Project

### Adding Credentials

Before starting the project, you have to add your personal credentials to connect to the EPFL VPN and services requiring authentication.
The credentials are supplied via the `.env` files in the `./config` folder.
Create a copy of each `env.example` file, delete the `.example` part of the filename, and enter your credentials in the respective environment variables.

### Starting the Containers

The project is fully dockerized. Type `docker-compose up` to start all services.
As soon as all containers are running, the interface of the Visual Explorer will be available under `http://127.0.0.1:3000`.
The REST API of the Visual Analytics Engine will be available under `http://127.0.0.1:3001`.
