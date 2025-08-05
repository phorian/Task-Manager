const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/jwt');
const userController = require('../controller/user')


router.route('/signup').post(userController.register);
router.route('/login').post(userController.userLogin);
router.route('/listUsers').get(authMiddleware.verifyAuth, authMiddleware.verifyRole(['admin', 'manager']), userController.getAllUsers)
router.route('/updateUserRole').put(authMiddleware.verifyAuth, authMiddleware.verifyRole(['admin', 'manager']), userController.updateUserrole);