const express = require('express');
const router = express.Router();
const Locale = require('../../../../../db/models/locale');
const verifyAdmin = require('../../middlewares/verifyAdmin');
const { Validator } = require('node-input-validator');
const LogFile = require('../../../../../core/log/index.js');

const languages = require('../../../../../core/language/index.js');

module.exports = router;

router.post('/create', verifyAdmin, async (req, res) => {

    try {

        let validator = new Validator(req.body, {
            language: 'required',
            symbol: 'required',
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


        let { language, symbol } = req.body;
        let checkEx = await Locale.findOne({ language: language, symbol: symbol, deleted: false });
        if (checkEx) {
            return res.status(400).json({ success: false, message: 'Locale Already Found !' });
        }

        let locale = new Locale({
            language,
            symbol,
        });

        let lang = await languages.createFile(req.body.language, req.body.symbol);
        if (lang == true) {
            await locale.save();
            return res.status(200).json({ success: true, message: 'Locale Success', data: locale });
        } else {
            return res.status(400).json({ success: false, message: 'Locale Failed' });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);


        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/getall', verifyAdmin, async (req, res) => {

    try {

        let doc = await Locale.find({ deleted: false }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, message: 'Locale Details Fetch Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/update', verifyAdmin, async (req, res) => {

    try {


        let validator = new Validator(req.body, {
            language: 'required',
            symbol: 'required',
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

        let { id, language, symbol } = req.body;

        let checkEx = await Locale.findOne({ language: language, symbol: symbol, deleted: false });
        if (checkEx && checkEx._id != id) {
            return res.status(400).json({ success: false, message: 'Locale Already Found !' });
        }

        let doc = await Locale.findOne({ _id: id });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Locale Not Found' });
        }

        let original_symbol = doc.symbol;


        doc.language = language;
        doc.symbol = symbol;
        await doc.save();

        // if (doc.symbol != symbol) {
        let lang = await languages.renameFile(original_symbol, symbol);
        // }


        return res.status(200).json({ success: true, message: 'Locale Detail Update Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/delete', verifyAdmin, async (req, res) => {

    try {

        let validator = new Validator(req.body, {
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

        let id = req.body.id;

        let doc = await Locale.findOne({ _id: id });
        if (!doc) {
            return res.status(400).json({ success: false, message: 'Locale doesnot exist' });
        }

        doc.deleted = true;

        await doc.save();

        return res.status(200).json({ success: true, message: 'Locale Delete Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/addnewkey', verifyAdmin, async (req, res) => {

    try {

        let validator = new Validator(req.body, {
            symbol: 'required',
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

        let { symbol, key, word } = req.body;

        let doc = await languages.addNewKey(symbol, key, word);

        return res.status(200).json({ success: true, message: 'New Key Added Success' });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/getFile', verifyAdmin, async (req, res) => {

    try {

        let doc = await languages.getFile(req.query.symbol);

        let data = [];

        Object.keys(doc).forEach(async key => {
            let res = {
                key: key,
                word: doc[key]
            }
            await data.push(res);
        });

        return res.status(200).json({ success: true, message: 'Locale Details Fetch Success', data: data });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/status', verifyAdmin, async (req, res) => {

    try {
        let doc = await Locale.findOne({ _id: req.query.id, deleted: false });
        if (doc) {
            if (doc.status == true) {
                doc.status = false;
            } else {
                doc.status = true;
            }
            await doc.save();
        } else {
            return res.status(404).json({ success: false, message: 'Locale Not Found !' });
        }
        return res.status(200).json({ success: true, message: 'Locale Status Changed !', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});