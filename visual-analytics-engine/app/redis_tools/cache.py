import hashlib
import json

from aiocache import caches, cached as cached_original

cache_initialized = False

if not cache_initialized:
    caches.set_config({
        'default': {
            'cache': "aiocache.RedisCache",
            'endpoint': "redis",
            'port': 6379,
            'timeout': 10,
            'ttl': "31536000",
            "namespace": "vae",
            'serializer': {
                'class': "aiocache.serializers.PickleSerializer"
            },
        }
    })
    cache_initialized = True

# Make sure that the aiocache.cached annotator is always imported from this file, ensuring that the default
# cache is correctly initialized to use the Redis backend.
cached = cached_original


def hash_args(*args):
    """
    Convert a list of (serializable) arguments into a hash key.
    :param args: List of serializable arguments.
    :return: A SHA256 hash key.
    """
    args_str = json.dumps(*args, sort_keys=True)
    args_hash_str = str(hashlib.sha256(args_str.encode("utf-8")).hexdigest())
    print("[DEBUG] hash_args", *args, args_str, args_hash_str)
    return args_hash_str
