const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');

// Model

const User = require('../../../../../db/models/user');
const LogFile = require('../../../../../core/log/index');
const Product = require('../../../../../db/models/product');

// Middleware

const verifyUser = require('../../middlewares/verifyUser');
const Language = require('../../../../../core/language/index');

module.exports = router;


router.get('/list', verifyUser, async (req, res) => {
    try {

        var user = await User.findOne({ email: req.email }).populate('wishlist');
        if (user) {

            return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'wishlist_listed'),data:user.wishlist });
        } else {

            return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'user_not_found') });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/add', verifyUser, async (req, res) => {
    try {

        var user = await User.findOne({ email: req.email });
        if (user) {
        	user.wishlist.pull(req.query.id);
            user.wishlist.push(req.query.id);
            await user.save();
            
            let  product = await Product.findOne({_id:req.query.id});
            if(product){
                product.wishlist.pull(user._id);
                product.wishlist.push(user._id);
                await product.save();
            }

            return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'wishlist_added') });
        } else {

            return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'user_not_found') });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/remove', verifyUser, async (req, res) => {
    try {

        var user = await User.findOne({ email: req.email });
        if (user) {
            user.wishlist.pull(req.query.id);
            await user.save();
            
            let  product = await Product.findOne({_id:req.query.id});
            if(product){
                product.wishlist.pull(user._id);
                await product.save();
            }
            
            return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'wishlist_removed') });
        } else {

            return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'user_not_found') });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});