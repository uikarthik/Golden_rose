const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');

// Model

const User = require('../../../../../db/models/user');
const Category = require('../../../../../db/models/category');
const SubTypes = require('../../../../../db/models/subtype');
const LogFile = require('../../../../../core/log/index');

// Middleware

const verifyUser = require('../../middlewares/verifyUser');
const Language = require('../../../../../core/language/index');

module.exports = router;


router.get('/list', async (req, res) => {
    try {

        let category = await Category.find({status:true,deleted:false});

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'category_listed'),data:category });

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/listbytype', async (req, res) => {
    try {


        let MEN = await Category.find({ type:'MEN',status:true,deleted: false },['_id', 'name','file']);
        let WOMEN = await Category.find({ type:'WOMEN',status:true,deleted: false },['_id', 'name','file']);
        let BABYBORN = await Category.find({ type:'BABYBORN',status:true,deleted: false },['_id', 'name','file']);
        let COMMUNION = await Category.find({ type:'COMMUNION',status:true,deleted: false },['_id', 'name','file']);

        let types = {
            MEN,
            WOMEN,
            BABYBORN,
            COMMUNION
        }

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'category_listed'),data:types });

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/listbysubtype', async (req, res) => {
    try {

        let main_types = ['MEN','WOMEN','BABYBORN','COMMUNION']

        let subtypes = await SubTypes.find({status:true,deleted:false});
        let MEN = [];
        let WOMEN = [];
        let BABYBORN = [];
        let COMMUNION = [];
            
        for(main of main_types){
            let temp = [];
            for(stypes of subtypes){
                    let temp_data = await Category.find({ type:main,sub_type:stypes.name,status:true,deleted: false },['_id','sub_type','name','file']);
                    let data = {
                        sub_type:stypes.name,
                        data:temp_data
                    }
                    temp.push(data);
            }

            if(main == 'MEN'){
                MEN = temp;
            }else if(main == 'WOMEN'){
                WOMEN = temp;
            }else if(main == 'BABYBORN'){
                BABYBORN = temp;
            }else if(main == 'COMMUNION'){
                COMMUNION = temp;
            }
        }

        let types = {
            MEN,
            WOMEN,
            BABYBORN,
            COMMUNION,
            subtypes
        }

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'category_listed'),data:types });

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/types', async (req, res) => {
    try {

        let types = ['MEN','WOMEN','BABYBORN','COMMUNION'];

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'types_listed'),data:types });

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

