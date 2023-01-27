import errorResponse from '../utils/errorHandler.js'


const errorHandler=(error,req,res,next)=>{

    error.message=error.message || "Internal Server down"
    if(error.code===11000){
        const message="Duplicate field values"
        error=new errorResponse(message,400)
    }
    if(error.name==='validation error'){
        const message=Object.values(error.error).map((val)=>val.message)
        error=new errorResponse(message,400)
    }
    res.status(error.statusCode || 500).json({
        success:false,
        message:`${error.name} : ${error.message}` || "Server down"
    })
}

export default errorHandler