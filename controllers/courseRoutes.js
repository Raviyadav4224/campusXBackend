import errorResponse from "../utils/errorHandler.js";
import getDataUri from "../utils/dataURI.js";
import cloudinary from "cloudinary";
import { Course } from "../models/courses.js";
export const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, createdBy } = req.body;
    const file = req.file;
    if (!title || !description || !category || !createdBy) {
      return next(new errorResponse("Please enter all fields", 401));
    }

    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await Course.create({
      title,
      description,
      category,
      createdBy,
      poster: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
    });
    res.status(200).json({
      success: true,
      message: "Course created successfully, You can add lectures now",
    });
  } catch (error) {
    next(error);
  }
};

export const addLecture = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const course = await Course.findById(id);
    if (!course) {
      return next(new errorResponse("Course not found", 404));
    }

    const file = req.file;
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      resource_type: "video",
    });
    course.lectures.push({
      title,
      description,
      video: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
    });
    course.numOfVideos = course.lectures.length;
    await course.save();

    res.status(200).json({
      success: true,
      message: "Lecture added successfully in course",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLecture = async (req, res, next) => {
  try {
    const { courseId, lectureId } = req.query;
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new errorResponse("Course not found", 404));
    }
    const lecture = course.lectures.find((item) => {
      if (item._id.toString() === lectureId.toString()) {
        return item;
      }
    });
    // if (!lecture) {
    //   return next(new errorResponse("No Lectures available", 404));
    // }
    await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
      resource_type: "video",
    });

    course.lectures = course.lectures.filter((item) => {
      if (item._id.toString() !== lectureId.toString()) {
        return item;
      }
    });
    course.numOfVideos = course.lectures.length;
    await course.save();
    res.status(200).json({
      success: true,
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseLectures = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new errorResponse("Course not found", 404));
    }
    course.views += 1;
    await course.save();
    res.status(200).json({
      success: true,
      lectures: course.lectures,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new errorResponse("Course not found", 404));
    }

    await cloudinary.v2.uploader.destroy(course.poster.public_id);
    course.lectures.map(async (item) => {
      await cloudinary.v2.uploader.destroy(item.video.public_id, {
        resource_type: "video",
      });
    });

    await course.remove();
    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCourses = async (req, res, next) => {
  try {
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";

    const courses = await Course.find({
      title: {
        $regex: keyword,
        $options: "i",
      },
      category: {
        $regex: category,
        $options: "i",
      },
    }).select("-lectures");
    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    next(error);
  }
};
export const createReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    let course = await Course.findById(id);
    let review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
    if (!course) {
      return next(new errorResponse("Course not found", 404));
    }

    const isReviewed = course.reviews.find((item) => {
      if (item.user.toString() === req.user._id.toString()) {
        return true;
      }
    });
    if (!isReviewed) {
      course.reviews.push(review);
    } else {
      course.reviews.forEach((item) => {
        if (item.user.toString() === req.user._id.toString()) {
          item.rating = rating;
          item.comment = comment;
        }
      });
    }
    let avg = 0;
    const noOfReviews = course.reviews.length;
    course.reviews.forEach((item) => {
      avg += item.rating;
    });
    course.ratings = avg / noOfReviews;
    await course.save();
    res.status(201).json({
      success: true,
      message: "Review added successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    let course = await Course.findById(id);
    if (!course) {
      return next(new errorResponse("Course not found", 404));
    }
    course.reviews = course.reviews.filter((item) => {
      return item.user.toString() !== req.user._id.toString();
    });
    await course.save();
    res.status(201).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const getAllReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    let course = await Course.findById(id);
    if (!course) {
      return next(new errorResponse("Course not found", 404));
    }
    res.status(201).json({
      success: true,
      reviews: course.reviews,
    });
  } catch (error) {
    next(error);
  }
};
