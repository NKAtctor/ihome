import os
import random
import re

from flask import Blueprint, request, render_template, jsonify, session

from app.models import User
from utils.StatusCode import USER_INFO_INVALID, REQUEST_SUCCESS, \
    USER_LOGIN_INFO_INVALID_OR_DISABLE, VCODE_INVALID, TWO_PASSWORD_DIFFERENT, USERNAME_INVALID, NOT_ALLOWED_FILES, \
    USER_LOGIN_USERNAME_ERROR, USER_LOGIN_PW_ERROR, REQUEST_FAIL, NOT_AUTH
from utils.decorators import login_check
from utils.functions import allowed_file
from utils.setting import MEDIA_PATH

blue_user = Blueprint('user', __name__)


@blue_user.route('/login/', methods=['GET'])
def login():

    if request.method == 'GET':

        return render_template('login.html')


@blue_user.route('/login/', methods=['POST'])
def my_login():
    if request.method == 'POST':
        # 获取信息
        mobile = request.form.get('mobile')
        password = request.form.get('password')

        user = User.query.filter(User.phone == mobile).first()

        if not user:
            return jsonify(USER_LOGIN_USERNAME_ERROR)

        if not user.check_pwd(password):
            return jsonify(USER_LOGIN_PW_ERROR)

        session.pop('vcode', '')
        session['user_id'] = user.id

        return jsonify(REQUEST_SUCCESS)


@blue_user.route('/is_login/', methods=['GET'])
def is_login():

    if request.method == 'GET':

        user_id = session.get('user_id', '')

        if not user_id:

            return jsonify(REQUEST_FAIL)

        user = User.query.filter(User.id == user_id).first()
        user = user.to_basic_dict()
        REQUEST_SUCCESS['user'] = user
        return jsonify(REQUEST_SUCCESS)


@blue_user.route('/get_code/', methods=['GET'])
def get_code():
    if request.method == 'GET':
        vcode = session.get('vcode')
        if vcode:
            session.pop('vcode')
        # 获取验证码
        s = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
        # code_key = request.args.get('vcode')
        vcode = ''
        for _ in range(4):
            vcode += random.choice(s)
        # 将验证码绑定在上
        session['vcode'] = vcode
        data = {}
        data['code'] = vcode

        REQUEST_SUCCESS['results'] = data
        return jsonify(REQUEST_SUCCESS)


@blue_user.route('/register/', methods=['GET'])
def register():
    if request.method == 'GET':

        return render_template('register.html')


@blue_user.route('/register/', methods=['POST'])
def my_register():
    if request.method == 'POST':

        # 获取用户信息
        mobile = request.form.get('mobile')
        phonecode = request.form.get('phonecode')
        vcode = request.form.get('vcode')
        password = request.form.get('password')
        password2 = request.form.get('password2')
        # 获取验证码
        se_vcode = session.get('vcode', None)

        # 手机号验证
        if len(mobile) != 11:

            return jsonify(REQUEST_FAIL)

        if se_vcode.lower() != vcode.lower():
            session.pop('vcode', '')
            return jsonify(VCODE_INVALID)

        if not all([mobile, phonecode, password, password2]):

            return jsonify(USER_LOGIN_INFO_INVALID_OR_DISABLE)

        if password != password2:
            return jsonify(TWO_PASSWORD_DIFFERENT)

        user = User.query.filter(User.phone == mobile).first()
        if user:
            return jsonify(USER_INFO_INVALID)

        user = User()
        user.name = mobile
        user.phone = mobile
        user.password = password
        user.save()

        return jsonify(REQUEST_SUCCESS)


@blue_user.route('/logout/', methods=['GET'])
@login_check
def logout():

    if request.method == 'GET':
        user_id = session.get('user_id')

        session.clear()

        return jsonify(REQUEST_SUCCESS)


@blue_user.route('/auth/', methods=['GET'])
@login_check
def auth():

    if request.method == 'GET':

        return render_template('auth.html')


@blue_user.route('/auth/', methods=['POST'])
@login_check
def my_auth():

    if request.method == 'POST':

        id_name = request.form.get('id_name')
        id_card = request.form.get('id_card')

        if not all([id_card, id_name]):

            return jsonify(REQUEST_FAIL)

        res = r'^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$'

        if not (re.fullmatch(res, id_card) and re.fullmatch(r'[\u4E00-\u9FFF]+', id_name)):

            return jsonify(REQUEST_FAIL)

        user_id = session.get('user_id')
        user = User.query.filter(User.id == user_id).first()

        real_user = user.to_auth_dict()
        if all([real_user['id_card'], real_user['id_name']]):

            return jsonify(REQUEST_SUCCESS)

        user.id_name = id_name
        user.id_card = id_card
        user.save()

        return jsonify(REQUEST_SUCCESS)


@blue_user.route('/is_auth/', methods=['GET'])
@login_check
def is_auth():

    if request.method == 'GET':

        user_id = session.get('user_id')
        user = User.query.filter(User.id == user_id).first()

        real_user = user.to_auth_dict()

        if not all([real_user.get('id_name'), real_user.get('id_card')]):
            return jsonify(NOT_AUTH)

        REQUEST_SUCCESS['user'] = real_user

        return jsonify(REQUEST_SUCCESS)


@blue_user.route('/myhouse/', methods=['GET'])
@login_check
def my():
    if request.method == 'GET':

        return render_template('my.html')


@blue_user.route('/getinfo/', methods=['GET'])
@login_check
def getinfo():
    if request.method == 'GET':
        # 获取用户id
        user_id = session.get('user_id')
        # 获取该用户对象
        user = User.query.filter(User.id == user_id).first()
        # 组装数据返回json数据
        return jsonify({'code': 200, 'msg': '请求成功', 'results': user.to_basic_dict()})


@blue_user.route('/userinfo/', methods=['GET'])
@login_check
def editinfo():
    if request.method == 'GET':

        return render_template('profile.html')


@blue_user.route('/pre_icon/', methods=['POST'])
@login_check
def pre_icon():
    if request.method == 'POST':
        # 获取图片
        icon = request.files.get('icon')
        PATH = os.path.join(MEDIA_PATH, 'usericon')
        filename = allowed_file(icon.filename)
        if not filename:
            return jsonify(NOT_ALLOWED_FILES)

        path = os.path.join(PATH, filename)
        # 保存图片
        icon.save(path)

        # 修改字段
        user_id = session.get('user_id')
        user = User.query.filter(User.id == user_id).first()
        filename = f'usericon/{filename}'
        user.avatar = filename
        user.save()

        return jsonify(REQUEST_SUCCESS)


@blue_user.route('/pre_usename/', methods=['POST'])
@login_check
def pre_usename():
    if request.method == 'POST':
        user_id = session.get('user_id')
        username = request.form.get('username')
        is_valid = User.query.filter(User.name == username).first()
        if is_valid:
            return jsonify(USERNAME_INVALID)
        user = User.query.filter(User.id == user_id).first()
        user.name = username
        user.save()

        return jsonify(REQUEST_SUCCESS)


@blue_user.route('/get_icon/', methods=['GET'])
@login_check
def get_icon():
    if request.method == 'GET':
        user_id = session.get('user_id')
        # 获取图片
        user = User.query.filter(User.id == user_id).first()
        REQUEST_SUCCESS['user'] = user.to_basic_dict()
        return jsonify(REQUEST_SUCCESS)
