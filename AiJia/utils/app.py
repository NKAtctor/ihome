

from flask import Flask
from flask_session import Session

from app.houseViews import blue_house
from app.models import db
from app.orderViews import blue_order
from app.userViews import blue_user
from utils.config import Conf
from utils.setting import STATIC_PATH, TEMPLATE_PATH


def create_app():

    app = Flask(__name__, static_folder=STATIC_PATH, template_folder=TEMPLATE_PATH)
    se = Session()
    # 加载配置信息
    app.config.from_object(Conf)
    # 注册蓝图
    app.register_blueprint(blueprint=blue_user, url_prefix='/user')
    app.register_blueprint(blueprint=blue_order, url_prefix='/order')
    app.register_blueprint(blueprint=blue_house, url_prefix='/house')

    se.init_app(app)
    # 初始化
    db.init_app(app)

    return app









