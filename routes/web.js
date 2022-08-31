const router = require("express").Router();
var csrf = require('csurf');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const TransactionController = require('../controller/TransactionController');
const AuthController = require('../controller/AuthController');
const RichMenuController = require("../controller/RichMenuController");
const LiffController = require("../controller/LiffController");
const ExportController = require("../controller/ExportController");

// setup route middlewares
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })

router.get('/', csrfProtection, TransactionController.show_daily);
router.get('/auth', csrfProtection, AuthController.show);
router.post('/auth', parseForm, csrfProtection, AuthController.authenticate);
router.post('/logout', parseForm, csrfProtection, AuthController.logout);
router.get('/send-id', LiffController.liff_id);
router.get('/postmenu', RichMenuController.postMenu);
router.get('/export', csrfProtection, ExportController.index);
router.post('/export', parseForm, csrfProtection, [
    check('email', "invalid Type").isEmail(),
    // check('date-start', "invalid Date").isISO8601().toDate(),
    // check('date-end', "invalid Category").isISO8601().toDate(),
], ExportController.export);

router.get('/transaction/:transId', csrfProtection, TransactionController.edit_page);
router.post('/transaction/:transId', 
    parseForm, csrfProtection, [
        check('type', "invalid Type").isIn([ 1, 2 ]),
        check('date', "invalid Date").isISO8601().toDate(),
        check('category', "invalid Category").isInt( { gt: 1 } ),
        check('amount', "invalid Amount").isInt( { gt: 0 } ),
        check('note', "invalid Note").isLength({ min: 1 }),
    ],
    TransactionController.edit_store);
router.delete('/transaction/:transId', 
    parseForm, csrfProtection,
    TransactionController.delete_record);
module.exports = router;
