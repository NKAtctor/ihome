

import os

# 配置基础路径（工程路径）
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 配置静态文件
STATIC_PATH = os.path.join(BASE_DIR, 'static')

# 配置模板文件路径
TEMPLATE_PATH = os.path.join(BASE_DIR, 'templates')

# 配置媒体文件路径
MEDIA_PATH = os.path.join(STATIC_PATH, 'media')

# 配置数据库连接
DATABASE = {
    'NAME': 'ihomedb',
    'USER': 'root',
    'PASSWORD': '123456',
    'HOST': '120.79.179.43',
    'PORT': '3306',
    'ENGINE': 'mysql',
    'DRIVER': 'pymysql'
}



