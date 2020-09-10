import json
import os
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import plotly.express as px
import requests

def print_region_map(df, column_name):
    df = df.rename(index={'Valle d\'Aosta/Vallée d\'Aoste': 'Valle d\'Aosta',
                          'Trentino-Alto Adige/Südtirol': 'Trentino-Alto Adige',
                          'Friuli-Venezia Giulia': 'Friuli Venezia Giulia'})
    df = df.reset_index().rename(columns={'region': 'NOME_REG'})

    # Read the geojson data with Italy's regional borders from github
    repo_url = 'https://gist.githubusercontent.com/datajournalism-it/48e29e7c87dca7eb1d29/raw/2636aeef92ba0770a073424853f37690064eb0ea/regioni.geojson'
    italy_regions_geo = requests.get(repo_url).json()

    # Choropleth representing the length of region names
    fig = px.choropleth(data_frame=df, 
                        geojson=italy_regions_geo, 
                        locations='NOME_REG', # name of dataframe column
                        featureidkey='properties.NOME_REG',  # path to field in GeoJSON feature object with which to match the values passed in to locations
                        color=column_name,
                        color_continuous_scale="sunset",
                        scope="europe",
                       )
    fig.update_geos(showcountries=False, showcoastlines=False, showland=False, fitbounds="locations")
    fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})
    fig.show()