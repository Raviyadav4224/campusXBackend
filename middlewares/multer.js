import multer from "multer";

const storage=multer.memoryStorage()
const singleUplaod=multer({storage}).single('file')

export default singleUplaod