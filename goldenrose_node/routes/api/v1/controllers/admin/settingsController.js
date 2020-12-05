const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
let qrcode = require('qrcode');
let speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');
const { Validator } = require('node-input-validator');
const multer = require('multer');
const pm2 = require('pm2');
// Model

const Admin = require('../../../../../db/models/admin');
const Settings = require('../../../../../db/models/settings');

// Middleware

const verifyAdmin = require('../../middlewares/verifyAdmin');
const sendgrid = require('../../../../../utils/sendgrid');

const envFile = require('../../../../../config/index.js');

const LogFile = require('../../../../../core/log/index.js');


module.exports = router;

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads/settings/');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + ".png");
    }
});
var upload = multer({ storage: storage });

var cpUpload = upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }])

router.post('/update', verifyAdmin, cpUpload, async (req, res) => {
    try {

        let validator = new Validator(req.body, {
            support_email: 'required',
            site_name: 'required',
            terms: 'required',
            privacy: 'required',
            user_site_maintainence: 'required',
            copy_rights: 'required',
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
        let setting = await Settings.findOne({ type: 'SITE' });
        if (setting) {
            if (req.files.favicon && req.files.favicon[0]) {
                setting.fav_icon = req.files.favicon ? req.files.favicon[0].path : '';
            }
            if (req.files.logo && req.files.logo[0]) {
                setting.site_logo = req.files.logo ? req.files.logo[0].path : '';
            }
            setting.support_email = req.body.support_email;
            setting.site_name = req.body.site_name;
            setting.terms = req.body.terms;
            setting.privacy = req.body.privacy;
            setting.user_site_maintainence = req.body.user_site_maintainence;
            setting.copy_rights = req.body.copy_rights;
            setting.twitter = req.body.twitter;
            setting.telegram = req.body.telegram;
            setting.youtube = req.body.youtube;
            setting.facebook = req.body.facebook;
            setting.linkedin = req.body.linkedin;
            setting.blog = req.body.blog;
            setting.instagram = req.body.instagram;
            setting.whats_new = req.body.whats_new;
            setting.android_link = req.body.android_link;
            setting.ios_link = req.body.ios_link;
            setting.android_version = req.body.android_version;
            setting.ios_version = req.body.ios_version;
            setting.site_tracker_code = req.body.site_tracker_code;
            setting.currency = req.body.currency;
            setting.language = req.body.language;
            setting.delivery_fee = req.body.delivery_fee;
            setting.order_price = req.body.order_price;
            setting.delivery_fee_above_min = req.body.delivery_fee_above_min;
            setting.delivery_fee_below_min = req.body.delivery_fee_below_min;
            setting.delivery_fee_above_max = req.body.delivery_fee_above_max;
            setting.delivery_fee_below_max = req.body.delivery_fee_below_max;
            setting.save();
            return res.status(200).json({ success: true, message: 'Site Settings Updated !', data: setting });
        } else {
            let site = new Settings({
                site_logo: req.files.logo ? req.files.logo[0].path : '',
                fav_icon: req.files.favicon ? req.files.favicon[0].path : '',
                type: 'SITE',
                support_email: req.body.support_email,
                site_name: req.body.site_name,
                terms: req.body.terms,
                privacy: req.body.privacy,
                user_site_maintainence: req.body.user_site_maintainence,
                copy_rights: req.body.copy_rights,
                twitter: req.body.twitter,
                telegram: req.body.telegram,
                youtube: req.body.youtube,
                facebook: req.body.facebook,
                linkedin: req.body.linkedin,
                blog: req.body.blog,
                instagram: req.body.instagram,
                whats_new: req.body.whats_new,
                android_version: req.body.android_version,
                android_link: req.body.android_link,
                ios_version: req.body.ios_version,
                ios_link: req.body.ios_link,
                site_tracker_code: req.body.site_tracker_code,
                currency: req.body.currency,
                language: req.body.language,
                delivery_fee:req.body.delivery_fee,
                order_price:req.body.order_price,
                delivery_fee_above_min:req.body.delivery_fee_above_min,
                delivery_fee_below_min:req.body.delivery_fee_below_min,
                delivery_fee_above_max:req.body.delivery_fee_above_max,
                delivery_fee_below_max:req.body.delivery_fee_below_max,
            });

            await site.save();
            return res.status(200).json({ success: true, message: 'Site Settings Updated !', data: site });
        }


    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});


router.get('/get', async (req, res) => {

    try {

        let setting = await Settings.findOne({ type: 'SITE' });
        if (setting) {

            return res.status(200).json({ success: true, message: 'Settings Details Fetch Success', data: setting });
        } else {
            return res.status(400).json({ success: false, message: 'Settings Details Fetch Failed' });

        }

    } catch (err) {
        LogFile.addLog('catch', '-', req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});
router.get('/termandcondtions', async (req, res) => {

    try {

        let terms = await Settings.findOne({ type: 'SITE' }).populate('terms');
        if (terms) {

            return res.status(200).json({ success: true, message: 'Settings Details Fetch Success', data: terms });
        } else {
            return res.status(400).json({ success: false, message: 'Settings Details Fetch Failed' });

        }

    } catch (err) {
        LogFile.addLog('catch', '-', req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});
router.get('/ios_version', async (req, res) => {

    try {

        let terms = await Settings.findOne({ type: 'SITE' }).populate('ios_version').populate('ios_link').populate('copy_rights');
        if (terms) {

            return res.status(200).json({ success: true, message: 'Settings Details Fetch Success', data: terms });
        } else {
            return res.status(400).json({ success: false, message: 'Settings Details Fetch Failed' });

        }

    } catch (err) {
        LogFile.addLog('catch', '-', req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});
router.get('/android_version', async (req, res) => {

    try {

        let terms = await Settings.findOne({ type: 'SITE' }).populate('android_version').populate('android_link').populate('copy_rights');
        if (terms) {

            return res.status(200).json({ success: true, message: 'Settings Details Fetch Success', data: terms });
        } else {
            return res.status(400).json({ success: false, message: 'Settings Details Fetch Failed' });

        }

    } catch (err) {
        LogFile.addLog('catch', '-', req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});
router.get('/privacyandpolicy', async (req, res) => {

    try {

        let privacy = await Settings.findOne({ type: 'SITE' }).populate('privacy');
        if (privacy) {

            return res.status(200).json({ success: true, message: 'Settings Details Fetch Success', data: privacy });
        } else {
            return res.status(400).json({ success: false, message: 'Settings Details Fetch Failed' });

        }

    } catch (err) {
        LogFile.addLog('catch', '-', req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/getenv', verifyAdmin, async (req, res) => {

    try {

        let mode = process.env.NODE_ENV;

        let doc = await envFile.getFile(mode);


        let data = [];

        Object.keys(doc).forEach(async key => {
            let res = {
                key: key,
                word: doc[key]
            }
            await data.push(res);
        });


        return res.status(200).json({ success: true, message: 'Env Settings Details Fetch Success', data: data, mode: mode });


    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);
        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err.message });
    }
});


router.post('/updateenv', verifyAdmin, async (req, res) => {

    try {

        let validator = new Validator(req.body, {
            key: 'required',
            word: 'required',
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

        let { key, word } = req.body;

        let mode = process.env.NODE_ENV;

        let doc = await envFile.update(mode, key, word);

        if (doc == true) {
            return res.status(200).json({ success: true, message: 'Env Updated Success' });

        } else {
            return res.status(400).json({ success: true, message: 'Env not updated' });

        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/changeenv', verifyAdmin, async (req, res) => {

    try {

        let validator = new Validator(req.body, {
            mode: 'required',
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

        let { key, word } = req.body;

        let mode = req.body.mode;

        let doc = await envFile.changeMode(mode);

        if (doc == true) {

            return res.status(200).json({ success: true, message: 'Env Mode Changed Success' });

        } else {
            return res.status(400).json({ success: true, message: 'Env not updated' });

        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);
        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/restart', verifyAdmin, async (req, res) => {

    try {

        pm2.connect(function(err) {
            if (err) {
                console.error(err);
                process.exit(2);
            }

            pm2.restart('GoldernRose-Api', (err, proc) => {})

        });

        return res.status(200).json({ success: true, message: 'Restart Success' });


    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);
        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});


router.get('/getlog', verifyAdmin, async (req, res) => {

    try {

        let log = await LogFile.getLog('catch');

        return res.status(200).json({ message: 'Log fetch', success: true, data: log })

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);
        return res.status(400).json({ message: 'Something went wrong !', success: false, error: err.message });
    }

});


router.get('/deletelog', verifyAdmin, async (req, res) => {

    try {

        let log = await LogFile.deleteLog('catch', req.query.key);

        return res.status(200).json({ message: 'Log Deleted', success: true, data: log })

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);
        return res.status(400).json({ message: 'Something went wrong !', success: false, error: err.message });
    }

});

router.get('/deletealllog', verifyAdmin, async (req, res) => {

    try {

        let log = await LogFile.deleteallLog('catch');

        return res.status(200).json({ message: 'Log Deleted', success: true, data: log })

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);
        return res.status(400).json({ message: 'Something went wrong !', success: false, error: err.message });
    }

});