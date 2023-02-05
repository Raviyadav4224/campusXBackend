import express from 'express'
import { getAllCourses,addLecture, createCourse, deleteCourse, deleteLecture, getCourseLectures, createReview, deleteReview, getAllReviews, getCourseDetails } from '../controllers/courseRoutes.js'
import { authorizeRole, authorizeSubscribers, isAuthenticated } from '../middlewares/isAuthenticated.js'
import singleUpload from '../middlewares/multer.js'

const router=express.Router()

router.route('/courses').get(getAllCourses)

router.route('/createCourse').post(isAuthenticated,authorizeRole,singleUpload,createCourse)

router.route('/course/:id').post(isAuthenticated,authorizeRole,singleUpload,addLecture)

router.route('/lecture').delete(isAuthenticated,authorizeRole,deleteLecture)

router.route('/course/:id').get(isAuthenticated,authorizeSubscribers,getCourseLectures)
router.route('/courseDetails/:id').get(isAuthenticated,authorizeSubscribers,getCourseDetails)

router.route('/course/:id').delete(isAuthenticated,authorizeRole,deleteCourse)


router.route('/courseReviews/:id').post(isAuthenticated,createReview)
router.route('/courseReviews/:id').delete(isAuthenticated,deleteReview)
router.route('/courseReviews/:id').get(getAllReviews)




export default router