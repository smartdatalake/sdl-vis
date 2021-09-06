import json
import pickle

import redis as r
import zlib

redis = r.Redis(host="redis", port=6379, db=1)


def set_df(alias, df):
    df_compressed = zlib.compress(pickle.dumps(df))
    return redis.set(alias, df_compressed)


def get_df(alias):
    return pickle.loads(zlib.decompress(redis.get(alias)))


def set_dict(alias, dictionary):
    ser = json.dumps(dictionary)
    return redis.set(alias, ser)


def get_dict(alias):
    return json.loads(redis.get(alias))
