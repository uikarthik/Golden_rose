const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');

//Model

const Coupon = require('../../../../../db/models/coupon');

//Middlewares and Core files

const verifyAdmin = require('../../middlewares/verifyAdmin');
const LogFile = require('../../../../../core/log/index.js');

module.exports = router;

router.post('/create', verifyAdmin, async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            title: 'required',
            couponcode: 'required',
            validitydays: 'required',
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
        let { title, couponcode, validitydays, percentage, description } = req.body;
        let coupon = new Coupon({
            title,
            couponcode,
            validitydays,
            percentage,
            description
        });
        await coupon.save();
        return res.status(200).json({ success: true, message: 'Coupon Added Success', data: coupon });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);


        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/list', verifyAdmin, async (req, res) => {
    try {
        let doc = await Coupon.find({ deleted: false }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: 'Coupon Details Fetch Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/update', verifyAdmin, async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            title: 'required',
            couponcode: 'required',
            validitydays: 'required',
            id: 'required',
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
        let { id, title, couponcode, validitydays, percentage, description } = req.body;
        let doc = await Coupon.findOne({ _id: id, deleted: false });
        if (!doc) {
            return res.status(400).json({ success: false, message: 'Coupon doesnot exist' });
        }
        doc.title = title;
        doc.couponcode = couponcode;
        doc.validitydays = validitydays;
        doc.percentage = percentage;
        doc.description = description;
        await doc.save();

        return res.status(200).json({ success: true, message: 'Coupon Detail Update Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/delete', verifyAdmin, async (req, res) => {
    try {
        let id = req.query.id;
        let doc = await Coupon.findOne({ _id: id, deleted: false });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Coupon doesnot exist' });
        }
        doc.deleted = true;
        await doc.save();
        return res.status(200).json({ success: true, message: 'Coupon Delete Success' });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/status', verifyAdmin, async (req, res) => {

    try {
        let coupon = await Coupon.findOne({ _id: req.query.id, deleted: false });
        if (coupon) {
            if (coupon.status == true) {
                coupon.status = false;
            } else {
                coupon.status = true;
            }
            await coupon.save();
        } else {
            return res.status(404).json({ success: false, message: 'Coupon Details Not Found !' });
        }
        return res.status(200).json({ success: true, message: 'Coupon Details Status Changed !', data: coupon });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});