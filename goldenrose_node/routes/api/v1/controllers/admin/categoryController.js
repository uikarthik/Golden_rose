const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');
const multer = require("multer");

//Model

const Category = require('../../../../../db/models/category');

//Middlewares and Core files

const verifyAdmin = require('../../middlewares/verifyAdmin');
const LogFile = require('../../../../../core/log/index.js');

module.exports = router;

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./uploads/category/");
    },
    filename: function (req, file, callback) {
        callback(
            null,
            file.fieldname + "-" + req.body.name + "-" + Date.now() + file.originalname
        );
    },
});
var upload = multer({ storage: storage });
var cpUpload = upload.fields([{ name: "file", maxCount: 10 }]);

router.post('/create', verifyAdmin, cpUpload,async (req, res) => {
    try {

        let validator = new Validator(req.body, {
            name: 'required',
            type: 'required',
            sub_type: 'required',
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
        let { name, type, sub_type} = req.body;
        var files;
            if (req.files && req.files.file) {
                files = req.files.file;
            }
        let new_category = new Category({
            name,
            type,
            sub_type,
            file:files
        });
        await new_category.save();
        return res.status(200).json({ success: true, message: 'Category Added Success', data: new_category });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);


        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/list/all', verifyAdmin, async (req, res) => {
    try {
        let doc = await Category.find({ deleted: false }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: 'Category Details Fetch Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/list', verifyAdmin, async (req, res) => {
    try {
        let doc = await Category.find({ status:true,deleted: false }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: 'Category Details Fetch Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});


router.post('/update', verifyAdmin, cpUpload,async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            name: 'required',
            type: 'required',
            sub_type: 'required',
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
        let { id, name, type, sub_type } = req.body;
        let doc = await Category.findOne({ _id: id, deleted: false });
        if (!doc) {
            return res.status(400).json({ success: false, message: 'Category doesnot exist' });
        }
        doc.name = name;
        doc.type = type;
        doc.sub_type = sub_type;
        if (req.files) {
                if (req.files.file && req.files.file[0]) {
                    doc.file = req.files.file;
                }
            }
        await doc.save();

        return res.status(200).json({ success: true, message: 'Category Detail Update Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/delete', verifyAdmin, async (req, res) => {
    try {
        let id = req.query.id;
        let doc = await Category.findOne({ _id: id, deleted: false });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Category doesnot exist' });
        }
        doc.deleted = true;
        await doc.save();
        return res.status(200).json({ success: true, message: 'Category Delete Success' });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/status', verifyAdmin, async (req, res) => {

    try {
        let category = await Category.findOne({ _id: req.query.id, deleted: false });
        if (category) {
            if (category.status == true) {
                category.status = false;
            } else {
                category.status = true;
            }
            await category.save();
        } else {
            return res.status(404).json({ success: false, message: 'Category Details Not Found !' });
        }
        return res.status(200).json({ success: true, message: 'Category Details Status Changed !', data: category });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});