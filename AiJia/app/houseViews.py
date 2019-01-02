from _datetime import datetime
import os

from flask import Blueprint, request, render_template, session, jsonify

from app.models import Area, House, Facility, HouseImage, User, Order
from utils.StatusCode import REQUEST_SUCCESS, REQUEST_FAIL, NOT_ALLOWED_FILES, SEARCH_INVALID
from utils.decorators import login_check
from utils.functions import public_house_check, allowed_file, my_sort
from utils.setting import MEDIA_PATH

blue_house = Blueprint('house', __name__)


@blue_house.route('/index/', methods=['GET', 'POST'])
def house_index():
    # 首页
    if request.method == 'GET':

        return render_template('index.html')


@blue_house.route('/detail/', methods=['GET'])
def detail():

    if request.method == 'GET':

        return render_template('detail.html')


@blue_house.route('/detail/<int:h>/', methods=['GET'])
def get_detail(h):

    if request.method == 'GET':

        house = House.query.filter(House.id == h).first()

        if not house:
            REQUEST_FAIL['results'] = '不存在该房屋'
            return jsonify(REQUEST_FAIL)

        user_id = session.get('user_id')

        if not user_id:

            REQUEST_SUCCESS['not_login'] = True

        if user_id == house.user_id:

            REQUEST_SUCCESS['is_self'] = True
        else:
            REQUEST_SUCCESS['is_self'] = False

        REQUEST_SUCCESS['result'] = house.to_full_dict()

        return jsonify(REQUEST_SUCCESS)


@blue_house.route('/myhouse/', methods=['GET'])
@login_check
def myhouse():

    if request.method == 'GET':

        return render_template('myhouse.html')


# 这是用于用户登陆后获取自己发布的房源信息
@blue_house.route('/get_house_info/', methods=['GET'])
@login_check
def get_house_info():

    if request.method == 'GET':
        # 获取用户id
        user_id = session.get('user_id')
        user = User.query.filter(User.id == user_id).first()
        data = []
        for house in user.houses:
            data.append(house.to_dict())

        REQUEST_SUCCESS['result'] = data

        return jsonify(REQUEST_SUCCESS)


@blue_house.route('/newhouse/', methods=['GET'])
@login_check
def newhouse():

    if request.method == 'GET':

        return render_template('newhouse.html')


@blue_house.route('/newhouse/', methods=['POST'])
@login_check
def public_house():

    if request.method == 'POST':
        # 校验字段
        results = public_house_check(request.form)

        if results == 'True':
            title = request.form.get('title')
            price = request.form.get('price')
            area_id = request.form.get('area_id')
            address = request.form.get('address')
            room_count = request.form.get('room_count')
            acreage = request.form.get('acreage')
            unit = request.form.get('unit')
            capacity = request.form.get('capacity')
            beds = request.form.get('beds')
            deposit = request.form.get('deposit')
            min_days = request.form.get('min_days')
            max_days = request.form.get('max_days')
            facilitys = request.form.getlist('facility')

            user_id = session.get('user_id')

            house = House()
            house.user_id = user_id
            house.title = title
            house.area_id = area_id
            house.price = price
            house.address = address
            house.room_count = room_count
            house.acreage = acreage
            house.unit = unit
            house.capacity = capacity
            house.beds = beds
            house.deposit = deposit
            house.min_days = min_days
            house.max_days = max_days
            # 存储设施第三张表

            # 获取到设施对象列表
            facility = house.facilities

            # 向第三张表中添加数据
            for a_id in facilitys:
                fac = Facility.query.filter(Facility.id == int(a_id)).first()
                facility.append(fac)

            house.save()

            session['house_id'] = house.id

            return jsonify(REQUEST_SUCCESS)
        else:
            REQUEST_FAIL['results'] = results
            return jsonify(REQUEST_FAIL)


@blue_house.route('/upload_house_image/', methods=['POST'])
@login_check
def upload_house_image():

    if request.method == 'POST':
        image = request.files.get('house_image')
        if not image:
            REQUEST_FAIL['results'] = '请选择图片！'

        PATH = os.path.join(MEDIA_PATH, 'ihomeimge')

        filename = allowed_file(image.filename)

        if not filename:
            return jsonify(NOT_ALLOWED_FILES)

        path = os.path.join(PATH, filename)

        image.save(path)

        house_id = session.get('house_id', '')
        if not house_id:
            return jsonify(REQUEST_FAIL)

        filename = f'ihomeimge/{filename}'

        house = House.query.filter(House.id == house_id).first()

        house_img = HouseImage()
        house_img.house_id = house_id
        house_img.url = filename
        if not house.index_image_url:
            house.index_image_url = filename
        house_img.save()
        REQUEST_SUCCESS['result'] = filename
        return jsonify(REQUEST_SUCCESS)


# 搜索功能
@blue_house.route('/search/', methods=['GET'])
def search():

    if request.method == 'GET':

        # session['aid'] = request.args.get('aid')

        return render_template('search.html')


@blue_house.route('/my_search/', methods=['POST'])
def my_search():
    if request.method == 'POST':

        # 获取查询条件
        area_id = request.form.get('aid', '')
        begin_date = request.form.get('sd', '')
        end_date = request.form.get('ed', '')
        sort_key = request.form.get('sk', '')

        if not all([area_id, begin_date, end_date]):

            return jsonify(SEARCH_INVALID)

        begin_date = datetime.strptime(begin_date, '%Y-%m-%d')
        end_date = datetime.strptime(end_date, '%Y-%m-%d')

        days = end_date - begin_date

        if days.days <= 0:

            return jsonify(SEARCH_INVALID)

        # 获取该区的所有房屋
        house_in_area = House.query.filter(House.area_id == int(area_id)).all()
        # 获取区域内所有房间id
        house_id = [i.id for i in house_in_area]

        # 拿到所有的该区的订单对象
        orders = Order.query.filter(Order.house_id.in_(house_id)).all()

        # 该区房屋没有任何订单直接返回该区全部房屋信息
        if not orders:
            data = [i.to_full_dict() for i in house_in_area]
            data = my_sort(data, sort_key)
            REQUEST_SUCCESS['result'] = data
            return jsonify(REQUEST_SUCCESS)

        # 获取在该区域内所有有订单的房间id
        house_order = [i.house_id for i in orders]
        order_ids = [i.id for i in orders]

        # 在该区域但是没有订单的房间
        not_order_house_id = list(set(house_id) - set(house_order))

        # 返回的数据集
        data = []
        if not_order_house_id:
            # 没有订单的房间
            not_order_house = House.query.filter(House.id.in_(not_order_house_id)).all()
            for h in not_order_house:
                data.append(h.to_full_dict())

        # 在从有订单的房间中筛选出可用的房间订单对象
        house_order_obj = Order.query.filter(Order.id.in_(order_ids)).all()

        for obj in house_order_obj:
            if (begin_date > obj.end_date) or (obj.begin_date > end_date):
                data.append(obj.house.to_full_dict())

        data = my_sort(data, sort_key)

        REQUEST_SUCCESS['result'] = data

        return jsonify(REQUEST_SUCCESS)


@blue_house.route('/get_facility/', methods=['GET'])
# @login_check
def get_facility():

    if request.method == 'GET':

        facility = Facility.query.all()

        data = {}
        for fac in facility:
            data[fac.id] = fac.name

        REQUEST_SUCCESS['result'] = data

        return jsonify(REQUEST_SUCCESS)


@blue_house.route('/get_area/', methods=['GET'])
# @login_check
def get_area():

    if request.method == 'GET':

        areas = Area.query.all()

        data = {}
        for area in areas:
            data[area.id] = area.name

        REQUEST_SUCCESS['result'] = data

        return jsonify(REQUEST_SUCCESS)


@blue_house.route('/get_houses/', methods=['GET'])
def get_houses():

    if request.method == 'GET':
        # 获取用户
        houses = House.query.all()

        data = []
        for house in houses:
            data.append(house.to_dict())

        REQUEST_SUCCESS['result'] = data

        return jsonify(REQUEST_SUCCESS)




