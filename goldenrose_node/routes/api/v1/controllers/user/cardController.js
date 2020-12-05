const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');
const multer = require('multer');

// Model

const User = require('../../../../../db/models/user');
const Card = require('../../../../../db/models/card');
const LogFile = require('../../../../../core/log/index');

// Middleware

const verifyUser = require('../../middlewares/verifyUser');
const Language = require('../../../../../core/language/index');
const Stripe = require('../../../../../core/stripe/index');
const Crypto = require('../../../../../utils/crypto');


module.exports = router;

router.get('/list', verifyUser, async (req, res) => {
    try {

        var user = await User.findOne({ email: req.email });
        if (user) {
            var cards = await Card.find({ user_id: user._id, deleted: false });

            return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'card_list'), data: cards });
        } else {

            return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'user_not_found') });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(500).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.post('/add', verifyUser, async (req, res) => {
    try {

        let validator = new Validator(req.body, {
            number: 'required',
            month: 'required',
            year: 'required',
            cvc: 'required',
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

        var user = await User.findOne({ email: req.email });
        if (user) {
            var cards = await Stripe.addCard(req.body.number, req.body.month, req.body.year, req.body.cvc, user.card_customer_id);
            if (cards == null) {
                return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'invalid_card_details'), error: "Stripe Error" });
            }

            let last4 = parseInt(cards.last4);
            let getFingerPrint = await Card.findOne({
                user_id: user._id,
                fingerprint: cards.fingerprint,
                month: cards.exp_month,
                year: cards.exp_year,
                number: last4,
                deleted: false
            });

            if (getFingerPrint) {
                await Stripe.deleteCard(cards.customer, cards.id);
                return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'card_dup') });
            }

            let newCard = new Card({
                user_id: user._id,
                name:req.body.name,
                customer_id: cards.customer,
                fingerprint: cards.fingerprint,
                brand: cards.brand,
                country: cards.country,
                card_id: cards.id,
                number: cards.last4,
                month: cards.exp_month,
                year: cards.exp_year,
                cvc:Crypto.encrypt(req.body.cvc),
            });

            await newCard.save();

            return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'card_added'), data: newCard });
        } else {

            return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'user_not_found') });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'invalid_card_details'), error: err.message });
    }
});

router.get('/delete', verifyUser, async (req, res) => {
    try {

        var user = await User.findOne({ email: req.email });
        if (user) {
            var cards = await Card.findOne({ user_id: user._id, _id: req.query.id, deleted: false });
            if (cards) {
                await Stripe.deleteCard(cards.customer_id, cards.card_id);
                cards.deleted = true;
                await cards.save();
            } else {
                return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'card_not_found') });
            }
            return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'card_deleted') });
        } else {

            return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'user_not_found') });
        }
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

