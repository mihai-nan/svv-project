from flask import Flask, render_template as render,\
    request, redirect, url_for,\
    session as s
from flask import flash as hriks, session, flash
from logging import Formatter, FileHandler
from functools import wraps
from forms import *
import logging
from app import app
from app import db
from app.models import User, Post
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from werkzeug.security import generate_password_hash, \
     check_password_hash

engine = create_engine('sqlite:///app.db', echo=True)


def login_requied(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in s:
            return f(*args, **kwargs)
        else:
            flash('Sorry! You Need to Login to view this page!', category='login_message')
            return redirect(url_for('login'))
    return wrap


def logout_requied(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in s:
            return redirect(url_for('home'))
        else:
            return f(*args, **kwargs)
    return wrap


def auth_requied(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if s['role'] == 'admin':
            return f(*args, **kwargs)
        else:
            hriks(
                ' Sorry! You dont have any permission to perform such action')
            return redirect(url_for('home'))
    return wrap


@app.route('/')
def hello_world():
    return render('pages/home.html')


@app.route('/home')
def home():
    return render('pages/home.html')


@app.route('/contact', methods=['GET', 'POST'])
def contact():
    form = ContactForm(request.form)
    return render('pages/contact.html', form=form)


@app.route('/about')
def about():
    return render('pages/about.html')


@app.route('/dashboard')
@login_requied
def dashboard():
    return render('pages/dashboard.html')


@app.route('/login', methods=['GET', 'POST'])
@logout_requied
def login():
    form = LoginForm(request.form)
    if request.method == 'POST':
        username = form.name.data
        password = form.password.data
        Session = sessionmaker(bind=engine)
        s = Session()
        query = s.query(User).filter(User.username.in_([username]))
        result = query.first()
        print("Result: ", result)
        if result:
            if check_password_hash(result.password_hash, password):
                session['logged_in'] = True
                return redirect(url_for('dashboard'))
            else:
                flash('Wrong password!', category='login_message')
        else:
            flash('Account does not exist!', category='login_message')
    return render('pages/login.html', form=form)


@app.route('/registration', methods=['GET', 'POST'])
@logout_requied
def registration():
    form = RegistrationForm(request.form)
    if request.method == 'POST':
        password = form.password.data
        conf_password = form.conf_password.data
        if password != conf_password:
            flash('Password does not match the confirm password.', category='registration_message')
        else:
            user = User(username=form.userid.data, email=form.email.data, password_hash=generate_password_hash(password),
                        fullname=form.name.data, type=form.role.data)
            db.session.add(user)
            db.session.commit()
            print(user, user.id)
            return redirect(url_for('home'))
    return render('pages/registration.html', form=form)


@app.route('/logout')
@login_requied
def logout():
    session.clear()
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run(debug=True)
