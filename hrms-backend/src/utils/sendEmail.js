import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})


transporter.verify((error, success) => {
    if (error) console.error("SMTP Connection Failed:", error)
    else console.log("SMTP Ready ✓", process.env.SMTP_USER)
})

const sendEmail = async ({ to, subject, html }) => {
    const info = await transporter.sendMail({
        from: `"HRMS" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
    })
    console.log("Email sent:", info.messageId)
    return true
}

export { sendEmail }