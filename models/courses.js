import mongoose from "mongoose";

const courseSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter course title"],
    minLength: [5, "Title must be atleast 5 charecters"],
    maxLength: [30, "Title cannot exceed 20 charecters"],
  },
  description: {
    type: String,
    required: [true, "Please enter course description"],
    minLength: [5, "Course description must be atleast 5 charecters"],
    maxLength: [100, "Description cannot exceed 100 charecters"],
  },
  lectures: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      video: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    },
  ],
  poster: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  views: {
    type: Number,
    default: 0,
  },
  numOfVideos: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: [true, "Please enter course creator name"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  price: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        requried: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    requried: true,
  },
  ratings:{
    type:Number,
    default:0
},
});

export const Course = mongoose.model("courses", courseSchema);
