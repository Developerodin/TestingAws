import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "woodpeelsocial@gmail.com",
    pass: "nnlsgpriveniyomx"
  }
});

const sendEmail = async options => {
  // 1) Create a transporter
  


  // 2) Define the email options
  // const mailOptions = {
  //   from: 'Jonas Schmedtmann <chargeSoul@jonas.io>',
  //   to: options.email,
  //   subject: options.subject,
  //   text: options.message
  // };
  try{
    const info = await transporter.sendMail({
      from: 'Jonas Schmedtmann <chargeSoul@jonas.io>', // sender address
      to: options.email, // list of receivers
      subject: options.subject, // Subject line
      text: options.message, // plain text body
      html: `<div>
      <h2> ${options.subject}</h2>
      <p style={{color:"grey",fontSize:"16px",fontWeight:"bold"}}>${options.message}</p>
      <a href=${options.resetURL}>Reset Password</a>
      </div>`, // html body
    });
    console.log("Message sent: %s", info.messageId);
  }
  catch(err){
  console.log("Error Send Mail: %s", err)
  }
 
  // 3) Actually send the email
  // await transporter.sendMail(mailOptions);
};

export default sendEmail;
