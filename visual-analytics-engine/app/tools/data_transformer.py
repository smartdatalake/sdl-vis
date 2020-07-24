import pandas as pd
import numpy as np

def transform(df, transformation_spec):
    for ts in transformation_spec:
        if ts["type"] == "bin":
            df = binning(df, ts["bins"], ts["field"])
        if ts["type"] == "aggregate":
            df = aggregation(df, ts["op"], ts["field"], ts["as"])
        if ts["type"] == "filter":
            df = filtering(df, ts["query"])
        if ts["type"] == "sample":
            df = sampling(df, ts["count"])

    return df


def binning(df, bins, field):
    col = df[field].values
    count, division = np.histogram(col, bins=bins)

    df = pd.DataFrame({'x0': division[0:-1], 'x1': division[1:], 'count': count})
    return df


def aggregation(df, op, field, as_field):
    val = None

    if op == "min":
        val = df.min()
    elif op == "max":
        val = df.max()
    elif op == "mean":
        val = df.mean()
    elif op == "median":
        val = df.median()
    elif op == "sum":
        val = df.sum()
    elif op == "product":
        val = df.product()
    elif op == "variance":
        val = df.var()
    elif op == "stddev":
        val = df.std()

    if val is not None:
        df[as_field] = val[field]

    return df


def filtering(df, query):
    return df.query(query)


def sampling(df, sample_count):
    return df.sample(sample_count)
