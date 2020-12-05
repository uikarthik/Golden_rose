const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
let qrcode = require('qrcode');
let speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');
const { Validator } = require('node-input-validator');
var randomstring = require("randomstring");
// Model

const Activity = require('../../../../../db/models/activity');
const User = require('../../../../../db/models/user');
const Card = require('../../../../../db/models/card');
const Coupon = require('../../../../../db/models/coupon');



//Middlewares and Core files
const Language = require("../../../../../core/language/index");
const verifyUser = require('../../middlewares/verifyUser');
const sendgrid = require('../../../../../utils/sendgrid');
const LogFile = require('../../../../../core/log/index.js');

module.exports = router;

router.post('/profile/update', verifyUser, async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            email: 'required',
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
        let { user_name, email, mobile, date_of_birth, location, nick_name, gender } = req.body;

        var user = await User.findOne({ email: req.email });
        if (user) {
            if (mobile) {
                var userExist = await User.findOne({ _id: { $ne: user._id }, mobile });
                if (userExist) {
                    return res.status(200).json({
                        success: false,
                        message: await Language.getResponse(
                            req.session.language,
                            "mobile_number_already_found"
                        ),
                    });
                }
            }
            let activity = new Activity({
                user_id: user._id,
                type: 'AUTH',
                text: 'Update Profile',
                ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                location: req.ipInfo.city + ', ' + req.ipInfo.country,
            });

            activity.save();
            if (email) {
                var userExist = await User.findOne({ _id: { $ne: user._id }, email });
                if (userExist) {
                    return res.status(200).json({
                        success: false,
                        message: await Language.getResponse(
                            req.session.language,
                            "Email_already_found"
                        ),
                    });
                }
                user.email = email;
            }
            if (date_of_birth) {
                user.birthday = date_of_birth;
            }
            if (location) {
                user.location = location;
            }
            if (nick_name) {
                user.nick_name = nick_name;
            }
            if (user_name) {
                user.user_name = user_name;
            }
            if (mobile) {
                user.mobile = mobile;
            }
            if (gender) {
                user.gender = gender;
            }
            await user.save();
            let users = await User.findOne({ email: req.email }).select('user_name').select('email').select('mobile').select('birthday').select('location').select('nick_name').select('gender');
            return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'profile_updated'), data: users });
        } else {
            return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'user_not_found') });
        }
    } catch (err) {
        LogFile.addLog("catch", req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse('something_went_wrong'), error: err.message });
    }
});

router.post('/address/add', verifyUser, async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            mobile: 'required',
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
        let { user_name, pincode, locality, mobile, address, city, state, landmark, alt_mobile, address_type } = req.body;

        var user = await User.findOne({ email: req.email });
        let activity = new Activity({
            user_id: user._id,
            type: 'AUTH',
            text: 'New Address Added',
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            location: req.ipInfo.city + ', ' + req.ipInfo.country,
        });
        activity.save();
        if (user) {
            let val = {

                user_name: user_name,
                pincode: pincode,
                locality: locality,
                address: address,
                city: city,
                state: state,
                landmark: landmark,
                alt_mobile: alt_mobile,
                mobile: mobile,
                address_type: address_type,
            };
            user.address.push(val);
            await user.save();

            return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'address_added'), data: user });
        } else {
            return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'user_not_found') });
        }
    } catch (err) {

        LogFile.addLog("catch", req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err.message });
    }
});

router.post("/address/update", verifyUser, async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            address_id: "required",
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

        const users = [];
        const addres = await User.findOne({ email: req.email }).select("address");

        users.push(addres.address);
        var results = users.reduce((r, e) => (r.push(...e), r), []);

        let { user_name, pincode, locality, address, city, state, landmark, alt_mobile, address_type, mobile } = req.body;

        var user = await User.findOne({ email: req.email });
        let activity = new Activity({
            user_id: user._id,
            type: 'AUTH',
            text: 'Update Address',
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            location: req.ipInfo.city + ', ' + req.ipInfo.country,
        });
        activity.save();
        if (user) {
            for (let time of user.address) {
                if (time._id == req.body.address_id) {
                    time.address_type = address_type;
                    time.alt_mobile = alt_mobile;
                    time.landmark = landmark;
                    time.state = state;
                    time.city = city;
                    time.address = address;
                    time.locality = locality;
                    time.pincode = pincode;
                    time.mobile = mobile;
                    time.user_name = user_name;
                }
            }
            let val = await user.save();
            return res.status(200).json({
                success: true,
                message: await Language.getResponse(
                    req.session.language,
                    "address_updated"
                ),
                data: val,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "user_not_found"
                ),
            });
        }
    } catch (err) {
        Logger.addLog("catch", req.email, req.originalUrl, err.message || err);
        return res.status(200).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});

router.get('/address/list', verifyUser, async (req, res) => {
    try {
        const users = [];
        const addres = await User.findOne({ email: req.email }).select("address");

        users.push(addres.address);
        var results = users.reduce((r, e) => (r.push(...e), r), []);
        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'address_listed'), data: results });
    } catch (err) {
        LogFile.addLog("catch", req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/get/profile', verifyUser, async (req, res) => {
    try {
        let user = await User.findOne({ email: req.email }).select('user_name').select('email').select('mobile').select('birthday').select('location').select('nick_name').select('gender');

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'address_listed'), data: user });
    } catch (err) {
        LogFile.addLog("catch", req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.post("/address/delete", verifyUser, async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            address_id: "required",
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

        var user = await User.findOne({ email: req.email });
        let activity = new Activity({
            user_id: user._id,
            type: 'AUTH',
            text: 'Address Deleted',
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            location: req.ipInfo.city + ', ' + req.ipInfo.country,
        });
        activity.save();
        if (user) {
            user.address.pull(req.body.address_id);
            let val = await user.save();
            return res.status(200).json({
                success: true,
                message: await Language.getResponse(
                    req.session.language,
                    "address_deleted"
                ),
                data: val,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: await Language.getResponse(
                    req.session.language,
                    "user_not_found"
                ),
            });
        }
    } catch (err) {
        Logger.addLog("catch", req.email, req.originalUrl, err.message || err);
        return res.status(200).json({
            success: false,
            message: await Language.getResponse(
                req.session.language,
                "something_went_wrong"
            ),
            error: err,
        });
    }
});

router.get('/coupon/list', verifyUser, async (req, res) => {
    try {

        var user = await User.findOne({ email: req.email });
        for (coupon of user.coupon) {
            if (coupon.validitydays < Date.now()) {
                coupon.status = false
            }
        }
        await user.save();

        // let doc = await Coupon.find({ deleted: false, }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'coupon_listed'), data: user.coupon });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});