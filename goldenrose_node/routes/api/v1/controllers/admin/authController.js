const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
let qrcode = require('qrcode');
let speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');
const { Validator } = require('node-input-validator');

// Model

const Activity = require('../../../../../db/models/adminactivity');
const Admin = require('../../../../../db/models/admin');

//Middlewares and Core files

const verifyAdmin = require('../../middlewares/verifyAdmin');
const sendgrid = require('../../../../../utils/sendgrid');
const LogFile = require('../../../../../core/log/index.js');

module.exports = router;


router.post('/login', async (req, res) => {

    try {

        let validator = new Validator(req.body, {
            email: 'required|email',
            password: 'required',
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach(key => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res.status(422).send({ success: false, inputValid: true, errors: errorMessage });
        }

        let { email, password } = req.body;
        let admin = await Admin.findOne({ email: email }).select('+password');
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Incorrect Credentials' });
        }
        let passwordCheck = await bcrypt.compareSync(password, admin.password);

        if (!passwordCheck) {

            return res.status(400).json({ success: false, message: 'Incorrect Credentials' });
        }

        if (admin.tfa_active) {
            return res.status(200).json({ success: true, message: 'Enter your google 2fa', g2fa: true });
        } else {
            let activity = new Activity({
                user_id: admin._id,
                type: 'AUTH',
                text: 'Logged in',
                ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                location: req.ipInfo.city + ', ' + req.ipInfo.country,
            });

            activity.save();
            var token = jwt.sign({ email: email }, process.env.admin_jwt_secret, { expiresIn: '24h' });
            return res.status(200).json({ success: true, message: 'Login Success', data: token, admin: admin });
        }

    } catch (err) {
        LogFile.addLog('catch', req.body.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/g2f/get', verifyAdmin, async (req, res) => {
    try {
        var secret = speakeasy.generateSecret({ length: 20 });
        var url = speakeasy.otpauthURL({ secret: secret.ascii, label: 'GoldenRose-Admin ' + req.email });
        qrcode.toDataURL(url, async function(err, image_data) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Something went wrong, Try again later !', error: err.message });
            }
            const body = {
                secret: secret.base32,
                img: image_data,
            };

            let admin = await Admin.findOne({ email: req.email });
            admin.tfa_temp = secret.base32;

            let doc = await admin.save();

            if (doc) {
                return res.status(200).json({ success: true, message: 'Google 2FA', data: body });
            }
        });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/g2f/enable', verifyAdmin, async (req, res) => {
    try {


        let validator = new Validator(req.body, {
            otp: 'required',
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach(key => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res.status(422).send({ success: false, inputValid: true, errors: errorMessage });
        }

        let { otp } = req.body;

        let user = await Admin.findOne({ email: req.email });
        var userToken = otp;
        var secret = user.tfa_temp;
        var verified = speakeasy.totp.verify({ secret: secret, encoding: 'base32', token: userToken });

        if (verified === true) {
            user.tfa = user.tfa_temp;
            user.tfa_active = true;
            user.tfa_temp = null;

            await user.save();
            return res.status(200).json({ success: true, message: 'G2F Enabled successfully !' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/g2f/verify', async (req, res) => {
    try {

        let validator = new Validator(req.body, {
            otp: 'required',
            email: 'required|email',
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach(key => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res.status(422).send({ success: false, inputValid: true, errors: errorMessage });
        }

        let { otp, email } = req.body;

        let admin = await Admin.findOne({ email: email });

        var secret = admin.tfa;
        var verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: otp,
        });

        if (verified === true) {
            var token = jwt.sign({ email: admin.email }, process.env.admin_jwt_secret, { expiresIn: '24h' });
            return res.status(200).json({ success: true, message: 'loggedin successfully', data: token, admin: admin });
        } else {
            return res.status(400).json({ success: false, message: 'Otp is incorrect' });
        }
    } catch (err) {
        LogFile.addLog('catch', req.body.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/g2f/disable', verifyAdmin, async (req, res) => {
    try {


        let validator = new Validator(req.body, {
            otp: 'required',
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach(key => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res.status(422).send({ success: false, inputValid: true, errors: errorMessage });
        }

        let otp = req.body.otp;

        let user = await Admin.findOne({ email: req.email });

        var secret = user.tfa;
        var verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: otp,
        });

        if (verified === true) {

            user.tfa = null;
            user.tfa_temp = null;
            user.tfa_active = false;
            let doc = await user.save();
            if (doc) {
                return res.status(200).json({ success: true, message: 'Google Two Factor Disabled Successfully' });
            } else {
                return res.status(400).json({ success: false, message: '2FA disable failed !' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Invalid OTP !' });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/activity', verifyAdmin, async (req, res) => {
    try {

        let admin = await Admin.findOne({ email: req.email });

        if (!admin) {
            return res.status(400).json({ success: false, message: 'Activity Fetch Failed' });
        }

        let doc = await Activity.find({ user_id: admin._id }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, message: 'Activity Fetch Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/forgotpassword', async (req, res) => {
    try {

        let validator = new Validator(req.body, {
            email: 'required|email',
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach(key => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res.status(422).send({ success: false, inputValid: true, errors: errorMessage });
        }

        var email = req.body.email;

        var admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Please register' });
        }



        var token = jwt.sign({ email: admin.email }, process.env.admin_jwt_secret, { expiresIn: 900 });
        var redirectUrl = process.env.admin_reset_password_url + '/' + token;

        var replacements = {
            url: process.env.admin_home_url,
            redirectUrl: redirectUrl,
            username: admin.user_name,
            emailImages: process.env.email_images,
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        };

        let email_array = [];
        email_array.push(email);

        let send = await sendgrid.sendMail(email_array,process.env.from_email,process.env.forgot_password_template, replacements);

        if (send) {

            let activity = new Activity({
                user_id: admin._id,
                type: 'AUTH',
                text: 'Forgot password email sent',
                ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                location: req.ipInfo.city + ', ' + req.ipInfo.country,
            });

            await activity.save();

            return res.status(200).json({ success: true, message: 'Link to reset your password has been sent to your Email.' });
        }

    } catch (err) {
        LogFile.addLog('catch', req.body.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/resetpassword', verifyAdmin, async (req, res) => {
    try {

        let validator = new Validator(req.body, {
            password: 'required',
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach(key => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res.status(422).send({ success: false, inputValid: true, errors: errorMessage });
        }

        let email = req.email;
        let { password } = req.body;

        var admin = await Admin.findOne({ email: email }).select('+password');
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Kindly Register' });
        }
        var old_password = admin.password;

        let passwordCheck = await bcrypt.compareSync(password, old_password);
        if (passwordCheck) {
            return res.status(400).json({ success: false, message: 'Please enter a diffrent password' });
        } else {
            var genSalt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, genSalt);

            admin.password = hash;
            await admin.save();

            let activity = new Activity({
                user_id: admin._id,
                type: 'AUTH',
                text: 'Password changed',
                ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                location: req.ipInfo.city + ', ' + req.ipInfo.country,
            });

            activity.save();

            return res.status(200).json({ success: true, message: 'Password Change Successful' });

        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/changepassword', verifyAdmin, async (req, res) => {

    try {

        let validator = new Validator(req.body, {
            old_password: 'required',
            password: 'required',
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach(key => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res.status(422).send({ success: false, inputValid: true, errors: errorMessage });
        }

        let email = req.email;

        let { old_password, password } = req.body;


        let doc = await Admin.findOne({ email: email }).select('+password');

        let passwordCheck = await bcrypt.compareSync(old_password, doc.password);
        if (!passwordCheck) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }

        if (old_password === password) {
            return res.status(400).json({ success: false, message: 'Old Password and New Password Should not be same !' });
        }

        var genSalt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, genSalt);
        doc.password = hash;

        await doc.save();

        return res.status(200).json({ success: true, message: 'Password Change Successful', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/getprofile', verifyAdmin, async (req, res) => {
    try {

        var admin = await Admin.findOne({ email: req.email });
        if (admin) {
            return res.status(200).json({ success: true, message: 'Profile Fetched successfully !', data: admin });
        } else {
            return res.status(404).json({ success: false, message: 'Not Found !' });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});