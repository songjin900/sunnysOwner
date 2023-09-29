import nodemailer from "nodemailer";
import client from "@libs/server/client";

export const sendEmail = async (to: string, subject: string, ebody: string) => {
  try {
    // Create a Nodemailer transporter using the provided email service credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVICE,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail email address
        pass: process.env.EMAIL_PASS, // Your Gmail password or an application-specific password if you have 2-Step Verification enabled
      },
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: "orders.sunnysflowers@gmail.com",
      to,
      subject,
      html: ebody, 
    });

    const emailLog = await client.emailLog.create({
      data: {
        to,
        from: "orders.sunnysflowers@gmail.com",
        subject,
        body: ebody,
        response: info.response
      },
    });    
  } catch (err: any) {
    console.error("Error sending email:", err);
    const errorLog = await client.errorLog.create({
      data: {
        errorPage: "libs/client/sendEmail",
        errorMessage: err.message ?? "",
      },
    });
  }
};
