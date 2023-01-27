import { User } from "../models/users.js";
import errorResponse from "../utils/errorHandler.js";
import { Course } from "../models/courses.js";
import getDataUri from "../utils/dataURI.js";
import cloudinary from "cloudinary";
import { sendMail } from "../utils/sendMail.js";
import crypto from "crypto";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const file = req.file;
    let user = await User.findOne({ email });
    if (user) {
      return next(new errorResponse("User already exists", 409));
    }
    if (!name || !email || !password || !file) {
      return next(new errorResponse("Please enter all fields", 400));
    }

    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: mycloud.public_id,
        url: mycloud.url,
      },
    });

    sendToken(res, user, "Registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new errorResponse("Please enter all fields", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(
        new errorResponse("Please enter a valid email or password", 401)
      );
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(
        new errorResponse("Please enter a valid email or password", 401)
      );
    }
    sendToken(res, user, `Welcome ${user.name}`, 201);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res
      .status(201)
      .cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: true,
        sameSite: "none",
      })
      .json({
        success: true,
        message: "Logout successfully",
      });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
try {
	  res.status(201).json({
	    success: true,
	    user: req.user,
	  });
} catch (error) {
	next(error)
}
};

export const deleteMyProfile = async (req, res, next) => {
 try {
	 const user = await User.findById(req.user._id);
	  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
	  await user.remove();
	
	  res
	    .status(201)
	    .cookie("token", null, {
	      expiresIn: new Date(Date.now()),
	    })
	    .json({
	      success: true,
	      message: "User deleted successfully",
	    });
} catch (error) {
	next(error)
}
};

export const changePassword = async (req, res, next) => {
  try {
	const { oldPassword, newPassword } = req.body;
	  if (!oldPassword || !newPassword) {
	    return next(new errorResponse("Please enter all fields", 400));
	  }
	
	  const user = await User.findById(req.user._id).select("+password");
	
	  const isMatch = await user.comparePassword(oldPassword);
	  if (!isMatch) {
	    return next(new errorResponse("Old Password didn't match", 400));
	  }
	  user.password = newPassword;
	  await user.save();
	
	  res.status(200).json({
	    success: true,
	    message: "Password changed successfully",
	  });
} catch (error) {
	next(error)
}
};

export const updateProfile = async (req, res, next) => {
  try {
	const { name, email } = req.body;
	  if (!name || !email) {
	    return next(new errorResponse("Please enter all fields", 400));
	  }
	
	  const user = await User.findById(req.user._id);
	
	  user.email = email;
	  user.name = name;
	  await user.save();
	
	  res.status(200).json({
	    success: true,
	    message: "Profile updated successfully",
	  });
} catch (error) {
	next(error)
}
};

export const updateProfilePicture = async (req, res, next) => {
 try {
	 const file = req.file;
	  if (!file) {
	    return next(new errorResponse("Please select a file"));
	  }
	  const user = await User.findById(req.user._id);
	  const fileUri = getDataUri(file);
	  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
	
	  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
	
	  user.avatar = {
	    public_id: mycloud.public_id,
	    url: mycloud.secure_url,
	  };
	  await user.save();
	  res.status(200).json({
	    success: true,
	    message: "Profile picture updated successfully",
	  });
} catch (error) {
	next(error)
}
};

export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new errorResponse("User not found", 400));
    }
    const resetToken = await user.getResetToken();
    await user.save();
    console.log(`reset token of user is ${user.resetPasswordToken}`);
    const url = `${process.env.FRONTEND_URL}/resetPassword/:${resetToken}`;
    const message = `Click on the link to reset your password.<a href=" ${url}"> Click Here </a> If you have not requested then please ignore`;

    sendMail(user.email, "Password reset request", message);
    res.status(200).json({
      success: true,
      message: `Reset token has been sent to ${user.email}`,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
 try {
	 const token = req.params.token;
	  const resetPasswordToken = crypto
	    .createHash("sha256")
	    .update(token)
	    .digest("hex");
	
	  const user = await User.findOne({
	    resetPasswordToken,
	    resetPasswordTokenExpire: {
	      $gt: Date.now(),
	    },
	  });
	  if (!user) {
	    return next(new errorResponse("Token expired", 401));
	  }
	  user.password = req.body.password;
	  user.resetPassword = undefined;
	  user.resetPasswordTokenExpire = undefined;
	  await user.save();
	
	  res.status(200).json({
	    success: true,
	    message: `Password changed successfully`,
	  });
} catch (error) {
	next(error)
}
};

export const addToPlayList = async (req, res, next) => {
 try {
	 const user = await User.findById(req.user._id);
	  const course = await Course.findById(req.body.id);
	  if (!course) {
	    return next(new errorResponse("Course not found", 404));
	  }
	
	  const isExist = user.playlist.find((item) => {
	    if (item.courseId.toString() === course._id.toString()) return true;
	  });
	  if (isExist) {
	    return next(new errorResponse("course already exists", 409));
	  }
	  user.playlist.push({
	    courseId: course._id,
	    poster: course.poster.url,
	  });
	  await user.save();
	  res.status(200).json({
	    success: true,
	    message: `Added to playlist`,
	  });
} catch (error) {
	next(error)
}
};

export const removeFromPlayList = async (req, res, next) => {
 try {
	 const user = await User.findById(req.user._id);
	  const course = await Course.findById(req.body.id);
	  if (!course) {
	    return next(new errorResponse("Course not found", 404));
	  }
	
	  const newPlaylist = user.playlist.filter(
	    (item) => item.courseId.toString() != course._id.toString()
	  );
	
	  user.playlist = newPlaylist;
	  await user.save();
	  res.status(200).json({
	    success: true,
	    message: `Course removed successfully`,
	  });
} catch (error) {
	next(error)
}
};

//admin routes

export const getAllUsers = async (req, res, next) => {
  try {
	const users = await User.find({});
	  res.status(200).json({
	    success: true,
	    users,
	  });
} catch (error) {
	next(error)
}
};
export const updateUserRole = async (req, res, next) => {
  try {
	const user = await User.findById(req.params.id);
	  if (!user) {
	    return next(new errorResponse("User not found", 404));
	  }
	  if (user.role === "user") {
	    user.role = "admin";
	  } else {
	    user.role = "user";
	  }
	  await user.save();
	  res.status(200).json({
	    success: true,
	    message: `Role updated successfully`,
	  });
} catch (error) {
	next(error)
}
};
export const deleteUser = async (req, res, next) => {
  try {
	const user = await User.findById(req.params.id);
	  if (!user) {
	    return next(new errorResponse("User not found", 404));
	  }
	  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
	  await user.remove();
	  res.status(200).json({
	    success: true,
	    message: `User deleted successfully`,
	  });
} catch (error) {
	next(error)
}
};
const sendToken = (res, user, message, statusCode) => {
  try {
	const token = user.getSignedToken();
	  res
	    .status(statusCode)
	    .cookie("token", token, {
	      httpOnly: true,
	      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
	      secure: true,
	      sameSite: "none",
	    })
	    .json({
	      success: true,
	      message,
	      user,
	    });
} catch (error) {
	next(error)
}
};
