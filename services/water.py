import random

def get_water(province):
    return {
        "province": province,
        "level": random.randint(20, 100)
    }