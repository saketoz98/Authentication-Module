const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/user');

const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key:
          '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'
      }
    })
  );

exports.getLogin = (req,res)=>{
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });
}

exports.getSignup = (req,res)=>{
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: message
    });
}

exports.postSignup = (req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email:email})
        .then(user=>{
            
            if(user){
                req.flash('error','This email already exists');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password,12)
                .then(hashedPassword=>{
                    const user = new User({
                        email : email,
                        password : hashedPassword
                    })
                    return user.save()
                })
                .then(result=>{
                    console.log(result);
                    console.log(email);
                    
                    res.redirect('/login');
                    return transporter.sendMail({
                        to: email,
                        from: 'saketoz98@gmail.com',
                        subject: 'Signup succeeded!',
                        html: '<h1>You successfully signed up!</h1>'
                    });
                })
                .catch(err=>{
                    console.log(err);
                    
                })
        })
        .catch(err=>{
            console.log(error);
        })

}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email);
    
    User.findOne({ email: email })
      .then(user => {
        console.log(user);

        if (!user) {
          req.flash('error', 'Invalid email or password.');
          return res.redirect('/login');
        }
        bcrypt
          .compare(password, user.password)
          .then(doMatch => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {
                console.log(err);
                res.redirect('/');
              });
            }
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
          })
          .catch(err => {
            console.log(err);
            res.redirect('/login');
          });
      })
      .catch(err => console.log(err));
  };
exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
      console.log(err);
      res.redirect('/');
    });
  };

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/reset', {
      path: '/reset',
      pageTitle: 'Reset Password',
      errorMessage: message
    });
  };