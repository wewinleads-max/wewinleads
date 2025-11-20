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

    // Create the payload for webhook
    const webhookPayload = {
      fullName,
      email,
      phone,
      companyName,
      website: website || 'Not provided',
      challenge,
      timeline,
      submittedAt: new Date().toISOString(),
      formattedSubmission: `
New Lead Qualification Form Submission

Full Name: ${fullName}
Email: ${email}
Phone: ${phone}
Company: ${companyName}
Website: ${website || 'Not provided'}

Lead Generation Challenge: ${challenge}
Preferred Start Timeline: ${timeline}

Submitted on: ${new Date().toLocaleString()}
      `
    };

    // If you have a webhook URL (from Zapier, Make.com, etc.), use it
    const webhookUrl = process.env.WEBHOOK_URL;

    if (webhookUrl) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }
    }

    // Log the submission (you can see this in Vercel logs)
    console.log('New form submission:', webhookPayload);

    res.status(200).json({ success: true, message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error processing form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}