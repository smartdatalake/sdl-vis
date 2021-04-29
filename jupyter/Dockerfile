FROM jupyter/scipy-notebook:332db3db9ebb

#######################
# Install OS Packages #
#######################

# Switch to root to install packages
USER root

# See: https://github.com/phusion/baseimage-docker/issues/319
ARG DEBIAN_FRONTEND=noninteractive

# Create man dir, needed for DPKG of some packages
RUN mkdir -p /usr/share/man/man1

# Update package sources and install OS requirements
RUN apt-get update
RUN apt-get install -y --no-install-recommends \
  apt-utils
RUN apt-get install -y \
  default-jre-headless

# Switch back to Jupyter user
USER $NB_UID


###########################################
# Install Python Requirements & Configure #
###########################################

# Install python requirements
COPY requirements.txt /tmp/

RUN pip install --upgrade pip
RUN pip install -r /tmp/requirements.txt

# Copy config to allow embedding
COPY jupyter_notebook_config.py /home/jovyan/.jupyter/
# Copy config to use single-tab mode
COPY custom.js /home/jovyan/.jupyter/custom/

# Install plotly extension
RUN jupyter labextension install jupyterlab-plotly@4.9.0
RUN jupyter labextension install @jupyter-widgets/jupyterlab-manager plotlywidget@4.9.0

# Copy avatica client
COPY ./avatica-1.7.1.jar /tmp/avatica.jar
ENV AVATICA_JAR=/tmp/avatica.jar
