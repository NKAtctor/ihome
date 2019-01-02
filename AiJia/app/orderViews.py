
from datetime import datetime

from flask import Blueprint, request, redirect, render_template, url_for, jsonify, session
from app.models import House, Order, User
from utils.StatusCode import REQUEST_SUCCESS, REQUEST_FAIL, NOT_LOGIN, IS_SELF
from utils.decorators import login_check


blue_order = Blueprint('order', __name__)


# 获取我的客户所有订单
@blue_order.route('/lorder/', methods=['GET'])
@login_check
def lorder():

    if request.method == 'GET':
        user_id = session.get('user_id')
        user = User.query.filter(User.id == user_id).first()
        house_id = [i.id for i in user.houses]

        cous_order = Order.query.filter(Order.house_id.in_(house_id), Order.user_id != user_id)

        # 获取未接单的订单
        data = [i.to_dict() for i in cous_order]

        return render_template('lorders.html', data=data)


@blue_order.route('/lorder/<int:id>', methods=['POST'])
@login_check
def my_lorder(id):
    # 接单
    if request.method == 'POST':

        order = Order.query.filter(Order.id == id).first()

        if not order:

            return jsonify(REQUEST_FAIL)

        order.status = 'WAIT_PAYMENT'
        order.house.order_count += 1
        order.save()

        return jsonify(REQUEST_SUCCESS)


@blue_order.route('/reject/<int:id>', methods=['POST'])
@login_check
def reject(id):
    # 拒绝接单
    if request.method == 'POST':

        order = Order.query.filter(Order.id == id).first()

        if not order:

            return jsonify(REQUEST_FAIL)

        res = request.form.get('reason')

        if not res:

            return jsonify(REQUEST_FAIL)

        order.status = 'REJECTED'

        order.reason = res
        order.save()

        return jsonify(REQUEST_SUCCESS)


# 我的所有订单
@blue_order.route('/orders/', methods=['GET'])
@login_check
def orders():

    if request.method == 'GET':

        return render_template('orders.html')


# 获取我的所有订单
@blue_order.route('/list_orders/', methods=['GET'])
@login_check
def list_orders():

    if request.method == 'GET':
        user_id = session.get('user_id')
        user_order = Order.query.filter(Order.user_id == user_id).all()

        data = [i.to_dict() for i in user_order]

        REQUEST_SUCCESS['result'] = data

        return jsonify(REQUEST_SUCCESS)


@blue_order.route('/booking/', methods=['GET'])
@login_check
def booking():
    # 预定房间
    if request.method == 'GET':

        return render_template('booking.html')


# 预定房间post
@blue_order.route('/booking/<int:id>', methods=['POST'])
@login_check
def my_booking(id):

    if request.method == 'POST':

        day = session.get('day')
        if not day:
            REQUEST_FAIL['msg'] = '请选择居住时间！'
            return jsonify(REQUEST_FAIL)

        # 获取时间
        min_day = session.get('begin_date')
        max_day = session.get('end_date')

        min_day = datetime.strptime(min_day, '%Y-%m-%d').date()
        max_day = datetime.strptime(max_day, '%Y-%m-%d').date()

        house = House.query.filter(House.id == id).first()

        if not house:
            REQUEST_FAIL['msg'] = '预定失败！'
            return jsonify(REQUEST_FAIL)

        amount = house.price * int(day)

        # 获取一个order对象列表
        order = Order()

        order.user_id = session.get('user_id')
        order.house_id = house.id
        order.begin_date = min_day
        order.end_date = max_day
        order.days = day
        order.house_price = house.price
        order.amount = amount

        order.save()

        return jsonify(REQUEST_SUCCESS)


# 获取房间信息
@blue_order.route('/get_price/<int:id>', methods=['POST'])
# @login_check
def get_price(id):
    # 获取居住时间（天）和总金额
    if request.method == 'POST':

        house = House.query.filter(House.id == id).first()
        # 获取房间信息
        min_days = house.min_days
        max_days = house.max_days
        price = house.price
        # 获取前端传递的时间
        min_day = request.form.get('min_days')
        max_day = request.form.get('max_days')

        # 判断当前用户是否是房间主人
        user_id = session.get('user_id', '')

        if not all([min_day, max_day]):
            REQUEST_FAIL['msg'] = '日期有误，请重新选择！'
            return jsonify(REQUEST_FAIL)

        day = (datetime.strptime(max_day, '%Y-%m-%d') - datetime.strptime(min_day, '%Y-%m-%d')).days
        if day < 0:
            REQUEST_FAIL['msg'] = '日期有误，请重新选择！'
            return jsonify(REQUEST_FAIL)

        # 房间的最大限制
        if max_days == 0:
            # 缓存时间
            session['begin_date'] = min_day
            session['end_date'] = max_day
        else:
            if not ((day >= min_days) and (day <= max_days)):
                REQUEST_FAIL['msg'] = '日期有误，请重新选择！'
                return jsonify(REQUEST_FAIL)

            session['begin_date'] = min_day
            session['end_date'] = max_day

        amount = day * price
        REQUEST_SUCCESS['amount'] = amount
        REQUEST_SUCCESS['day'] = day if day + 1 else 1

        session['day'] = day

        return jsonify(REQUEST_SUCCESS)
