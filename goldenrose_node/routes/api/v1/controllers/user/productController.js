const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');

// Model

const User = require('../../../../../db/models/user');
const Product = require('../../../../../db/models/product');
const Order = require('../../../../../db/models/order');
const LogFile = require('../../../../../core/log/index');

// Middleware

const verifyUser = require('../../middlewares/verifyUser');
const Language = require('../../../../../core/language/index');

module.exports = router;

router.get('/list', async (req, res) => {
    try {

        let products = await Product.find({ stock_available:true,status:true,deleted: false }).sort({ _id: -1 })

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'products_listed'), data: products });

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/list/category', async (req, res) => {
    try {

        let products = await Product.find({ category_id: req.query.id, stock_available:true,status:true,deleted: false });

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'products_listed'), data: products });

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/get/product', async (req, res) => {
    try {
        let validator = new Validator(req.query, {
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
        let products = await Product.findOne({ _id: req.query.id, deleted: false });

        let rel_prod = await Product.find({ _id: {$ne:req.query.id},sub_type:products.sub_type,status:true,stock_available:true, deleted: false }).limit(10);
        if(rel_prod.length == 0){
            rel_prod = await Product.find({ _id: {$ne:req.query.id},status:true,stock_available:true, deleted: false }).limit(10).sort({ _id: -1 });
        }

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'products_listed'), data: products,related:rel_prod });

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/list/type', async (req, res) => {
    try {

        let products = await Product.find({ type: req.query.type, stock_available:true,status:true,deleted: false });

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'products_listed'), data: products });

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/list/productbycategory_id', async (req, res) => {
    try {
        let doc = await Product.find({ category_id: req.query.category_id, type: req.query.type, stock_available:true,status:true,deleted: false });

        return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'products_listed'), data: doc });


    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/list/gender', async (req, res) => {
    try {

        let products = await Product.find({ gender: req.query.type, stock_available:true,status:true,deleted: false });

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'products_listed'), data: products });

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/search', async (req, res) => {
    try {

        let products = await Product.find({ name: { $regex: req.query.key, $options: "i" }, stock_available:true,status:true,deleted: false });
        // let products = await Product.find({ name:{ $regex: new RegExp("^" + req.query.key, "i") },deleted: false });

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'products_listed'), data: products });

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.post('/rating', verifyUser, async (req, res) => {
    try {

        let validator = new Validator(req.body, {
            id: 'required',
            rating: 'required',
            review: 'required',
        });

        let { id, rating, review } = req.body;

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

        let order = await Order.findOne({ user_id: user._id, "product.product_id": id,order_status:'DELIVERED' });
        if (order) {
            let products = await Product.findOne({ _id: id, "review.user_id": user._id });
            if (products) {
                for (review of products.review) {
                    if (review.user_id.toString() == user._id.toString()) {
                        review.rating = rating;
                        review.review = req.body.review;
                    }
                }
                await products.save();
            } else {
                products = await Product.findOne({ _id: id });

                products.review.push({
                    user_id: user._id,
                    rating: rating,
                    review: review,
                });
                await products.save();
            }

            let overall_rating = await Product.findOne({ _id: id });
            let len = overall_rating.review.length;
            let rat = 0;
            for (rates of overall_rating.review) {
                rat += rates.rating;
            }
            overall_rating.ratings = rat / len;
            await overall_rating.save();

            return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'rated_success'), data: products });
        } else {
            return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'not_purchased_yet') });
        }
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.post('/list/filter', async (req, res) => {
    try {

        let products = await Product.find({ category_id: req.body.category_id,type: req.body.type,sub_type: req.body.sub_type, stock_available:true,status:true,deleted: false });

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'products_listed'), data: products });

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});





