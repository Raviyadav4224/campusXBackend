import express from "express";
import {
  addToPlayList,
  changePassword,
  deleteMyProfile,
  deleteUser,
  forgetPassword,
  getAllUsers,
  getMyProfile,
  login,
  logout,
  register,
  removeFromPlayList,
  resetPassword,
  updateProfile,
  updateProfilePicture,
  updateUserRole,
} from "../controllers/userRoute.js";
import singleUpload from "../middlewares/multer.js";
import {
  isAuthenticated,
  authorizeRole,
} from "../middlewares/isAuthenticated.js";
const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(isAuthenticated, getMyProfile);
router.route("/me").delete(isAuthenticated, deleteMyProfile);
router.route("/changePassword").put(isAuthenticated, changePassword);
router.route("/updateProfile").put(isAuthenticated, updateProfile);
router
  .route("/updateProfilePicture")
  .put(isAuthenticated, singleUpload, updateProfilePicture);
router.route("/forgetPassword").post(forgetPassword);
router.route("/resetPassword/:token").put(resetPassword);
router.route("/addToPlayList").post(isAuthenticated, addToPlayList);
router.route("/removeFromPlayList").delete(isAuthenticated, removeFromPlayList);

//admin routes
router.route("/admin/users").get(isAuthenticated, authorizeRole, getAllUsers);
router
  .route("/admin/user/:id")
  .put(isAuthenticated, authorizeRole, updateUserRole);
router
  .route("/admin/user/:id")
  .delete(isAuthenticated, authorizeRole, deleteUser);

export default router;
