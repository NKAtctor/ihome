import random
import time

from app.models import Area

import uuid


def get_sqlalchemy_uri(DATABASE):
    name = DATABASE['NAME']
    user = DATABASE['USER']
    password = DATABASE['PASSWORD']
    host = DATABASE['HOST']
    port = DATABASE['PORT']
    engine = DATABASE['ENGINE']
    driver = DATABASE['DRIVER']

    return f'{engine}+{driver}://{user}:{password}@{host}:{port}/{name}'


def allowed_file(filename):

    ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif']

    if '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS:

        ext = filename.rsplit('.', 1)[1]
        filename = str(uuid.uuid4()) + f'.{ext}'
        return filename
    else:
        return None


def public_house_check(data):

    title = data.get('title')
    price = data.get('price')
    area_id = data.get('area_id')
    address = data.get('address')
    room_count = data.get('room_count')
    acreage = data.get('acreage')
    unit = data.get('unit')
    capacity = data.get('capacity')
    beds = data.get('beds')
    deposit = data.get('deposit')
    min_days = data.get('min_days')
    max_days = data.get('max_days')
    facility = data.getlist('facility')

    if not all(list(data.values())):

        return '请在完善一下其他信息在发布！'

    if not all(facility):

        return '请填写一些基础信息！'

    area = Area.query.filter(Area.id == area_id).first()
    if not area:
        return '不存在的区域！'

    try:
        float(price)
        float(deposit)
        room_count.isdigit()
        capacity.isdigit()
        min_days.isdigit()
        max_days.isdigit()

        if int(max_days) > 0:
            if int(min_days) > int(max_days):
                raise ValueError
    except:

        return '输入的信息有误，请重新填写！'

    return 'True'


def my_sort(data, sort_key):
    # 排序处理
    if sort_key == 'new':
        data = sorted(data, key=lambda house: house['id'], reverse=True)
    # 入住人最多
    elif sort_key == 'booking':
        data = sorted(data, key=lambda house: house['order_count'], reverse=True)
    # 价格升序
    elif sort_key == 'price-inc':
        data = sorted(data, key=lambda house: house['price'], reverse=False)
    # 价格降序
    elif sort_key == 'price-des':
        data = sorted(data, key=lambda house: house['price'], reverse=True)
    else:
        pass

    return data