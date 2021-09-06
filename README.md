# The Visual Analytics Layer of SmartDataLake

## Disclaimer

This project is currently under development. Do not expect all functionalities to work without any issues!

## Starting the Project

### Adding Credentials

Before starting the project, you have to add your personal credentials to connect to the EPFL VPN and services requiring authentication.
The credentials are supplied via the `.env` files in the `./config` folder.
Create a copy of each `env.example` file, delete the `.example` part of the filename, and enter your credentials in the respective environment variables.

### Starting the Containers

The project is fully dockerized. Type `docker-compose up` to start all services.
As soon as all containers are running, the interface of the Visual Explorer will be available under `http://127.0.0.1:3000`.
The REST API of the Visual Analytics Engine will be available under `http://127.0.0.1:3001`.
