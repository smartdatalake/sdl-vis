#use scipy instead
FROM jupyter/minimal-notebook:latest

COPY notebooks/dbprofiling.ipynb /home/jovyan/notebooks/
COPY notebooks/helpers.py /home/jovyan/notebooks/

#copy config to allow embedding
COPY jupyter_notebook_config.py /home/jovyan/.jupyter/
#use single-tab mode
COPY custom.js /home/jovyan/.jupyter/custom/

COPY requirements.txt /tmp/

#install required packages
RUN pip install --upgrade pip
RUN pip install -r /tmp/requirements.txt
