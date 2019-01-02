
from functools import wraps

from flask import session, redirect, url_for


def login_check(func):

    @wraps(func)
    def inner(*args, **kwargs):
        user_id = session.get('user_id', None)
        if user_id:
            return func(*args, **kwargs)
        else:
            return redirect(url_for('user.login'))

    return inner


