const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { 
  getDashboard,
  getAllUsers,
  getOneUser,
  updateUser,
  deleteUser
} = require('../controllers/admin');

router.get('/dashboard', protect, adminOnly, getDashboard);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('./users/:id', protect, adminOnly, getOneUser)
router.put('./users/:id', protect, adminOnly, updateUser)
router.delete('./users/:id', protect, adminOnly, deleteUser)

module.exports = router;