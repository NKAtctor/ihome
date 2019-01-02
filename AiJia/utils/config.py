import redis

from utils.functions import get_sqlalchemy_uri
from utils.setting import DATABASE


class Conf():
    # 配置连接数据库uri
    SQLALCHEMY_DATABASE_URI = get_sqlalchemy_uri(DATABASE)
    # 解决连接数据库时出现的一个警告
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # 配置执行teardown_request
    PRESERVE_CONTEXT_ON_EXCEPTION = False
    SECRET_KEY = 'QAZXSW123EDC456'

    # 配置连接Redis,用于存储session数据
    SESSION_TYPE = 'redis'
    # 配置Redis连接地址
    SESSION_REDIS = redis.Redis(host='172.18.152.165', password='1qazxsw2', port=6379)











