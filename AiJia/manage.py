
from flask_script import Manager
from utils.app import create_app
from flask import url_for, redirect

# 创建一个flask的app对象
app = create_app()

@app.route('/')
def home_index():
    return redirect(url_for('house.house_index'))

manage = Manager(app)

if __name__ == '__main__':
    manage.run()

