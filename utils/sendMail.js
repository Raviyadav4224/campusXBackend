import { createTransport } from "nodemailer";
import errorResponse from "./errorHandler.js";

export const sendMail = async (to, subject, message) => {
 try {
	 const transporter = createTransport({
	    host: process.env.SMTP_HOST,
	    port: process.env.SMTP_PORT,
	    auth: {
	      user: process.env.SMTP_USER,
	      pass: process.env.SMTP_PASS,
	    },
	  });
	
	  await transporter.sendMail({
	    from:"mymail@gmail.com",
	    to,
	    subject,
	    html:message,
	  });
} catch (error) {
	console.log(error);
}
};