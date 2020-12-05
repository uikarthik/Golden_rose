const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
let qrcode = require('qrcode');
let speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');
const { Validator } = require('node-input-validator');
var randomstring = require("randomstring");
var crypto = require("crypto");
const redis = require("redis");
var client = redis.createClient();

// Model
const Deviceauth = require("../../../../../db/models/deviceauth");
const Activity = require('../../../../../db/models/activity');
const User = require('../../../../../db/models/user');

//Middlewares and Core files
const Language = require("../../../../../core/language/index");
const verifyUser = require('../../middlewares/verifyUser');
const sendgrid = require('../../../../../utils/sendgrid');
const LogFile = require('../../../../../core/log/index.js');
const Stripe = require("../../../../../core/stripe/index");

module.exports = router;

router.post("/register", async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            email: "required|email",
            password: "required|minLength:6",
            mobile: "required",
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach((key) => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res
                .status(422)
                .send({ success: false, inputValid: true, errors: errorMessage });
        }

        let { email, password, confirm_password, mobile,user_name} = req.body;
        let language = "en";
        var emailExist = await User.findOne({ email: email });
        if (emailExist) {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "email_already_found"
                ),
            });
        }
        var mobileExist = await User.findOne({ mobile: mobile });
        if (mobileExist) {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "mobile_number_already_found"
                ),
            });
        }
        let card_customer_id = await Stripe.createCustomer(email);
        if (card_customer_id == null) {
            return res.status(400).json({
                success: false,
                message: "something_went_wrong",
                error: "Card Customer Id Not Created",
            });
        }
        var genSalt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, genSalt);



        let user = new User({
            email,
            user_name,
            nick_name:user_name,
            password: hash,
            card_customer_id,
            mobile: mobile
        });
        user.save();

        var token = jwt.sign({ email: user.email }, process.env.jwt_secret, {
            expiresIn: "24h",
        });
        var redirectUrl = process.env.email_verify_url + "/" + token;


        let replacements = {
            username: user.user_name,
            redirectUrl: redirectUrl,
            emailImages: process.env.email_images,
        };

        let email_array = [];
        email_array.push(email);


        let send = await sendgrid.sendMail(
            email_array,
            process.env.from_email,
            process.env.verify_email_template,
            replacements
        );


        if (send) {
            return res.status(200).json({
                success: true,
                message: await Language.getResponse(req.session.language,
                    "registered_success_verify_email"
                ),

                user: user,
            });

        } else {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language, "not_receive_verify_email_resend_it"
                ),
            });
        }
    } catch (err) {

        LogFile.addLog('catch', req.body.email, req.originalUrl, err.message || err);
        return res.status(500).json({
            success: false, message: await Language.getResponse(
                req.session.language, 'Something Went Wrong, Try again later !'), error: err
        });
    }
});

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
        let emailverify = await User.findOne({ email: email, verified: false });

        if (emailverify) {
            return res.status(400).json({ success: false, message: await Language.getResponse(
                req.session.language, 'kindly_verify_email') });
        }
        let user = await User.findOne({ email: email }).select('+password');

        if (!user) {
            return res.status(400).json({ success: false, message: 'Incorrect Credentials' });
        }
        let passwordCheck = await bcrypt.compareSync(password, user.password);

        if (!passwordCheck) {

            return res.status(400).json({ success: false, message: 'Incorrect Credentialss' });
        }

        if (user.tfa_active) {
            return res.status(200).json({ success: true, message: 'Enter your google 2fa', g2fa: true });
        } else {
            let activity = new Activity({
                user_id: user._id,
                type: 'AUTH',
                text: 'Logged in',
                ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                location: req.ipInfo.city + ', ' + req.ipInfo.country,
            });
            req.session.email = email;
            req.session.jwt = token;
            let time = parseInt(process.env.session_expiry, 86400000);
            req.session.sessionToken = crypto.randomBytes(16).toString("base64");
            req.session.ip =
                req.headers["x-forwarded-for"] || req.connection.remoteAddress;
            req.session.cookie.expires = new Date(Date.now() + time);
            req.session.cookie.maxAge = time;
            req.session.language = user.language;

            client.set(email, token, redis.print);

            activity.save();
            var token = jwt.sign({ email: user.email }, process.env.jwt_secret, {
                expiresIn: "24h",
            });
            let users = await User.findOne({ email: email }).select('user_name').select('email').select('mobile');

            return res.status(200).json({ success: true, message: 'Login Success', data: token, user: users });
        }

    } catch (err) {
        console.log(err)
        LogFile.addLog('catch', req.body.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get("/emailVerify", verifyUser, async (req, res) => {
    try {

        var email = req.email;
        // let device = req.useragent;
        var user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "email_not_found"
                ),
            });
        }

        user.verified = true;
        var doc = await user.save();

        if (doc) {
            let activity = new Activity({
                user_id: user._id,
                type: "AUTH",
                text: await Language.getResponse(
                    req.session.language,
                    "email_verified"
                ),
                ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                location: req.ipInfo.city + ", " + req.ipInfo.Wcountry,
            });
            activity.save();

            return res.status(200).json({
                success: true,
                message: await Language.getResponse(
                    req.session.language,
                    "email_verification_success"
                ),
            });
        } else {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "email_verification_failed"
                ),
            });
        }
    } catch (err) {

        LogFile.addLog("catch", req.email, req.originalUrl, err.message);
        return res.status(500).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});

router.post("/resendemail", async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            email: "required|email",
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach((key) => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res
                .status(422)
                .send({ success: false, inputValid: true, errors: errorMessage });
        }

        var email = req.body.email;

        var user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "kindly_signup"
                ),
            });
        }

        if (user.verified) {
            return res.status(200).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "already_verified"
                ),
                verified: user.verified,
            });
        }

        if (!user.status) {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "something_went_wrong"
                ),
            });
        }

        var token = jwt.sign({ email: user.email }, process.env.jwt_secret, {
            expiresIn: 300,
        });
        var redirectUrl = process.env.email_verify_url + "/" + token;

        var replacements = {
            username: user.user_name,
            redirectUrl: redirectUrl,
            emailImages: process.env.email_images,
        };

        let email_array = [];
        email_array.push(email);

        let send = await sendgrid.sendMail(
            email_array,
            process.env.from_email,
            process.env.verify_email_template,
            replacements
        );

        if (send) {
            let activity = new Activity({
                user_id: user._id,
                email: user.email,
                type: "AUTH",
                text: await Language.getResponse(
                    req.session.language,
                    "verification_link_send"
                ),
                ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                location: req.ipInfo.city + ", " + req.ipInfo.country,
            });

            activity.save();

            return res.status(200).json({
                success: true,
                message: await Language.getResponse(
                    req.session.language,
                    "verification_link_send"
                ),
            });
        } else {
            return res.stauts(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "something_went_wrong"
                ),
            });
        }
    } catch (err) {
        LogFile.addLog("catch", req.body.email, req.originalUrl, err.message);
        return res.status(500).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});

router.post("/forgotpassword", async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            email: "required|email",
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach((key) => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res
                .status(422)
                .send({ success: false, inputValid: true, errors: errorMessage });
        }

        var email = req.body.email;

        var user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "kindly_signup"
                ),
            });
        }
        if (!user.verified) {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "kindly_verify_email"
                ),
            });
        }

        var token = jwt.sign({ email: user.email }, process.env.jwt_secret, {
            expiresIn: 900,
        });
        var redirectUrl = process.env.reset_password_url + "/" + token;

        var replacements = {
            url: process.env.home_url,
            redirectUrl: redirectUrl,
            username: user.user_name,
            emailImages: process.env.email_images,
            ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        };

        let email_array = [];
        email_array.push(email);
        let send = await sendgrid.sendMail(
            email_array,
            process.env.from_email,
            process.env.forgot_password_template,
            replacements
        );
        if (send) {
            let activity = new Activity({
                user_id: user._id,
                email: user.email,
                type: "AUTH",
                text: await Language.getResponse(
                    req.session.language,
                    "forgot_password_email_sent"
                ),
                ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                location: req.ipInfo.city + ", " + req.ipInfo.country,
            });
            activity.save();
            return res.status(200).json({
                success: true,
                message: await Language.getResponse(
                    req.session.language,
                    "reset_password_link"
                ),
            });
        } else {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "something_went_wrong"
                ),
            });
        }
    } catch (err) {
        LogFile.addLog("catch", req.body.email, req.originalUrl, err.message);
        return res.status(500).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});

router.post("/resetpassword", verifyUser, async (req, res) => {
    try {

        let validator = new Validator(req.body, {
            password: "required",
        });
        let match = await validator.check();
        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach((key) => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res
                .status(422)
                .send({ success: false, inputValid: true, errors: errorMessage });
        }
        let email = req.email;
       
        let { password } = req.body;
        var user = await User.findOne({ email: email }).select("+password");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "kindly_signup"
                ),
            });
        }
        var old_password = user.password;
        let passwordCheck = await bcrypt.compareSync(password, old_password);
        if (passwordCheck) {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "enter_different_password"
                ),
            });
        } else {
            var genSalt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, genSalt);
            user.password = hash;

            await user.save();
            let activity = new Activity({
                user_id: user._id,
                email: user.email,
                type: "AUTH",
                text: await Language.getResponse(
                    req.session.language,
                    "change_password_success"
                ),
                ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                location: req.ipInfo.city + ", " + req.ipInfo.country,
            });
            activity.save();
            return res.status(200).json({
                success: true,
                message: await Language.getResponse(
                    req.session.language,
                    "change_password_success"
                ),
            });
        }
    } catch (err) {
        LogFile.addLog("catch", req.email, req.originalUrl, err.message);
        return res.status(500).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});

router.post("/changepassword", verifyUser, async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            old_password: "required",
            password: "required",
        });
        let match = await validator.check();
        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach((key) => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res
                .status(422)
                .send({ success: false, inputValid: true, errors: errorMessage });
        }
        let email = req.email;
        let { old_password, password } = req.body;
        let doc = await User.findOne({ email: email }).select("+password");
        let passwordCheck = await bcrypt.compareSync(old_password, doc.password);
        if (!passwordCheck) {
            return res.status(500).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "invalid_password"
                ),
            });
        }
        if (old_password === password) {
            return res.status(500).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "enter_different_password"
                ),
            });
        }
        var genSalt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, genSalt);
        doc.password = hash;
        await doc.save();
        return res.status(200).json({
            success: true,
            message: await Language.getResponse(
                req.session.language,
                "change_password_success"
            ),
            data: doc,
        });
    } catch (err) {
        LogFile.addLog("catch", req.email, req.originalUrl, err.message);
        return res.status(500).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});

router.get("/g2f/get", verifyUser, async (req, res) => {
    try {
        var secret = speakeasy.generateSecret({ length: 20 });
        var url = speakeasy.otpauthURL({
            secret: secret.ascii,
            label: "GoldenRose - " + req.email,
        });
        qrcode.toDataURL(url, async function (err, image_data) {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: await Language.getResponse(
                        req.session.language,
                        "something_went_wrong"
                    ),
                    error: err.message,
                });
            }
            const body = {
                secret: secret.base32,
                img: image_data,
            };

            let user = await User.findOne({ email: req.email });
            user.tfa_temp = secret.base32;

            let doc = await user.save();
            req.session.language = user.language;

            if (doc) {
                return res.status(200).json({
                    success: true,
                    message: await Language.getResponse(
                        req.session.language,
                        "login_sucess"
                    ),
                    data: body,
                });
            }
        });
    } catch (err) {
        LogFile.addLog("catch", req.email, req.originalUrl, err.message);
        return res.status(500).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});

router.post("/g2f/enable", verifyUser, async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            otp: "required",
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach((key) => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res
                .status(422)
                .send({ success: false, inputValid: true, errors: errorMessage });
        }

        let { otp } = req.body;

        let user = await User.findOne({ email: req.email }).select("+tfa");
        var userToken = otp;
        var secret = user.tfa_temp;
        var verified = speakeasy.totp.verify({
            secret: secret,
            encoding: "base32",
            token: userToken,
        });

        if (verified === true) {
            user.tfa = user.tfa_temp;
            user.tfa_active = true;
            user.tfa_temp = null;

            await user.save();

            let activity = new Activity({
                user_id: user._id,
                email: user.email,
                type: "G2F",
                text: await Language.getResponse(req.session.language, "g2f_enabled"),
                ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                location: req.ipInfo.city + ", " + req.ipInfo.country,
            });

            await activity.save();

            return res.status(200).json({
                success: true,
                message: await Language.getResponse(
                    req.session.language,
                    "g2f_enabled"
                ),
            });
        } else {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "invalid_g2f_code"
                ),
            });
        }
    } catch (err) {
        LogFile.addLog("catch", req.email, req.originalUrl, err.message);
        return res.status(500).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});

router.post("/g2f/verify", verifyUser, async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            otp: "required",
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach((key) => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res
                .status(422)
                .send({ success: false, inputValid: true, errors: errorMessage });
        }

        let { otp } = req.body;

        let user = await User.findOne({ email: req.email }).select("+tfa");

        var secret = user.tfa;
        var verified = speakeasy.totp.verify({
            secret: secret,
            encoding: "base32",
            token: otp,
        });

        if (verified === true) {
            var token = jwt.sign({ email: user.email }, process.env.jwt_secret, {
                expiresIn: "24h",
            });
            return res.status(200).json({
                success: true,
                message: await Language.getResponse(
                    req.session.language,
                    "g2f_verified"
                ),
                data: token,
                user: user,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "invalid_g2f_code"
                ),
            });
        }
    } catch (err) {
        LogFile.addLog("catch", req.email, req.originalUrl, err.message);
        return res.status(500).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});

router.post("/g2f/disable", verifyUser, async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            otp: "required",
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach((key) => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res
                .status(422)
                .send({ success: false, inputValid: true, errors: errorMessage });
        }

        let otp = req.body.otp;

        let user = await User.findOne({ email: req.email }).select("+tfa");

        var secret = user.tfa;
        var verified = speakeasy.totp.verify({
            secret: secret,
            encoding: "base32",
            token: otp,
        });

        if (verified === true) {
            user.tfa = null;
            user.tfa_temp = null;
            user.tfa_active = false;
            let doc = await user.save();
            if (doc) {
                let activity = new Activity({
                    user_id: user._id,
                    email: user.email,
                    type: "G2F",
                    text: await Language.getResponse(
                        req.session.language,
                        "g2f_disabled"
                    ),
                    ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                    location: req.ipInfo.city + ", " + req.ipInfo.country,
                });

                activity.save();

                return res.status(200).json({
                    success: true,
                    message: await Language.getResponse(
                        req.session.language,
                        "g2f_disabled"
                    ),
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: await Language.getResponse(
                        req.session.language,
                        "g2f_disabled_failed"
                    ),
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "invalid_g2f_code"
                ),
            });
        }
    } catch (err) {
        LogFile.addLog("catch", req.email, req.originalUrl, err.message);
        return res.status(500).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});

router.post("/g2f/auth", async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            otp: "required",
            email: "required|email",
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach((key) => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res
                .status(422)
                .send({ success: false, inputValid: true, errors: errorMessage });
        }

        let { otp, email } = req.body;

        let user = await User.findOne({ email: email }).select("+tfa");

        var secret = user.tfa;
        var verified = speakeasy.totp.verify({
            secret: secret,
            encoding: "base32",
            token: otp,
        });

        if (verified === true) {
            let activity = new Activity({
                user_id: user._id,
                email: user.email,
                type: "AUTH",
                text: await Language.getResponse(req.session.language, "logged_in"),
                ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                location: req.ipInfo.city + ", " + req.ipInfo.country,
            });

            await activity.save();
            var token = jwt.sign({ email: user.email }, process.env.jwt_secret, {
                expiresIn: "24h",
            });

            req.session.email = email;
            req.session.jwt = token;
            let time = parseInt(process.env.session_expiry, 86400000);
            req.session.sessionToken = crypto.randomBytes(16).toString("base64");
            req.session.ip =
                req.headers["x-forwarded-for"] || req.connection.remoteAddress;
            req.session.cookie.expires = new Date(Date.now() + time);
            req.session.cookie.maxAge = time;
            req.session.language = user.language;

            return res.status(200).json({
                success: true,
                message: await Language.getResponse(
                    req.session.language,
                    "login_sucess"
                ),
                data: token,
                g2fa: true,
                user: user,
                verified_device: false,
            });

            // let u = req.useragent;

            // let device = await Deviceauth.findOne({ email: email, user_type: 'USER', os: (u.isAndroid ? u.platform : u.os), browser: u.browser, version: u.version, deleted: false });
            // if (!device) {
            //     let deviceauth = new Deviceauth({
            //         user_type: 'USER',
            //         email: email,
            //         os: (u.isAndroid ? u.platform : u.os),
            //         browser: u.browser,
            //         version: u.version,
            //         status: false,
            //     });

            //     let temp = await deviceauth.save();

            //     let redirectUrl = process.env.device_verify_url + '/' + temp._id;

            //     let replacements = {
            //         username: user.user_name,
            //         redirectUrl,
            //         emailImages: process.env.email_images,
            //         ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            //         browser: temp.browser,
            //         os: temp.os,
            //     };
            //     let email_array = [];
            //     email_array.push(email);
            //     await sendgrid.sendMail(email_array, process.env.authorize_device_template, replacements);
            //     return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'authorize_device_by_link'), device: temp._id, verified_device: true });
            // } else {

            //     if (!device.status) {

            //         let redirectUrl = process.env.device_verify_url + '/' + device._id;

            //         let replacements = {
            //             username: user.user_name,
            //             redirectUrl,
            //             emailImages: process.env.email_images,
            //             ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            //             browser: device.browser,
            //             os: device.os,
            //         };
            //         let email_array = [];
            //         email_array.push(email);
            //         await sendgrid.sendMail(email_array, process.env.authorize_device_template, replacements);
            //         return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'authorize_device_by_link'), device: device._id, verified_device: true });
            //     } else {
            //         let activity = new Activity({
            //             user_id: user._id,
            //             email: user.email,
            //             type: 'AUTH',
            //             text: 'Logged in',
            //             ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            //             location: req.ipInfo.city + ', ' + req.ipInfo.country,
            //         });

            //         activity.save();
            //         var token = jwt.sign({ email: user.email }, process.env.jwt_secret, { expiresIn: '24h' });

            //         req.session.email = email;
            //         req.session.jwt = token;
            //         let time = parseInt((process.env.session_expiry), 86400000);
            //         req.session.sessionToken = crypto.randomBytes(16).toString('base64');
            //         req.session.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            //         req.session.cookie.expires = new Date(Date.now() + time);
            //         req.session.cookie.maxAge = time;
            //         req.session.language = user.language;

            //         return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'login_sucess'), data: token, g2fa: true, user: user, verified_device: false });
            //     }
            // }
        } else {
            return res.status(400).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "invalid_g2f_code"
                ),
            });
        }
    } catch (err) {
        LogFile.addLog("catch", req.body.email, req.originalUrl, err.message);
        return res.status(500).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});

router.get("/logout", verifyUser, async (req, res) => {
    try {
        req.session.destroy();

        client.del(req.email, function (err, response) {
            if (response == 1) {

            } else {

            }
        });

        return res.status(200).json({
            success: true,
            message: "Logged Out",
        });
    } catch (err) {
        LogFile.addLog("catch", req.email, req.originalUrl, err.message);
        return res.status(500).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});