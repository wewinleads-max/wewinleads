export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fullName, email, phone, companyName, website, challenge, timeline } = req.body;

    // Basic validation
    if (!fullName || !email || !phone || !companyName || !challenge || !timeline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create email content
    const emailContent = `
New Lead Qualification Form Submission

Full Name: ${fullName}
Email: ${email}
Phone: ${phone}
Company: ${companyName}
Website: ${website || 'Not provided'}

Lead Generation Challenge: ${challenge}
Preferred Start Timeline: ${timeline}

Submitted on: ${new Date().toLocaleString()}
    `;

    // For now, we'll use a simple email service
    // You'll need to configure this with your email service
    const nodemailer = require('nodemailer');

    // Configure your email transporter
    // You'll need to set environment variables in Vercel
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'hello@wewinleads.com',
      subject: `New Lead Qualification - ${fullName}`,
      text: emailContent,
    });

    res.status(200).json({ success: true, message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error processing form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}