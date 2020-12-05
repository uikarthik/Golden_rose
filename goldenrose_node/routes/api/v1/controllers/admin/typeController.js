const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');
const multer = require("multer");

//Model

const Types = require('../../../../../db/models/type');

//Middlewares and Core files

const verifyAdmin = require('../../middlewares/verifyAdmin');
const LogFile = require('../../../../../core/log/index.js');

module.exports = router;

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./uploads/type/");
    },
    filename: function (req, file, callback) {
        callback(
            null,
            req.body.name 
        );
    },
});
var upload = multer({ storage: storage });
var cpUpload = upload.fields([{ name: "file", maxCount: 10 }]);

router.post('/create', verifyAdmin, cpUpload,async (req, res) => {
    try {

        let validator = new Validator(req.body, {
            name: 'required',
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
        let { name } = req.body;
        var files;
            if (req.files && req.files.file) {
                files = req.files.file;
            }
        let new_type = new Types({
            name,
            file:files
        });
        await new_type.save();
        return res.status(200).json({ success: true, message: 'Types Added Success', data: new_type });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/list/all', verifyAdmin, async (req, res) => {
    try {
        let doc = await Types.find({ deleted: false }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: 'Types Details Fetch Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/list', async (req, res) => {
    try {
        let doc = await Types.find({ status:true,deleted: false }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: 'Types Details Fetch Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/update', verifyAdmin, cpUpload,async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            name: 'required',
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
        let { id, name } = req.body;
        let doc = await Types.findOne({ _id: id, deleted: false });
        if (!doc) {
            return res.status(400).json({ success: false, message: 'Types doesnot exist' });
        }
        doc.name = name;
        if (req.files) {
                if (req.files.file && req.files.file[0]) {
                    doc.file = req.files.file;
                }
            }
        await doc.save();

        return res.status(200).json({ success: true, message: 'Types Detail Update Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/delete', verifyAdmin, async (req, res) => {
    try {
        let id = req.query.id;
        let doc = await Types.findOne({ _id: id, deleted: false });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Types doesnot exist' });
        }
        doc.deleted = true;
        await doc.save();
        return res.status(200).json({ success: true, message: 'Types Delete Success' });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/status', verifyAdmin, async (req, res) => {

    try {
        let doc = await Types.findOne({ _id: req.query.id, deleted: false });
        if (doc) {
            if (doc.status == true) {
                doc.status = false;
            } else {
                doc.status = true;
            }
            await doc.save();
        } else {
            return res.status(404).json({ success: false, message: 'Types Details Not Found !' });
        }
        return res.status(200).json({ success: true, message: 'Types Details Status Changed !', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});