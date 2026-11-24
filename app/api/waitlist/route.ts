import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 })
    }

    // Validate required environment variables
    if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD || !process.env.FROM_EMAIL) {
      console.error("Missing required SMTP environment variables")
      return NextResponse.json(
        {
          success: false,
          error: "Email service configuration error. Please contact support.",
        },
        { status: 500 },
      )
    }

    // Send email using Nodemailer with AWS SES SMTP
    const result = await sendEmailViaNodemailer(email)

    if (result.success) {
      console.log("Email sent successfully:", result.messageId)
      return NextResponse.json({
        success: true,
        message: "Welcome email sent successfully!",
        messageId: result.messageId,
      })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error("Error sending email:", error)

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()

      // Handle specific SMTP/SES errors
      if (errorMessage.includes("invalid login") || errorMessage.includes("authentication failed")) {
        return NextResponse.json(
          {
            success: false,
            error: "Email service authentication error. Please contact support.",
          },
          { status: 500 },
        )
      }

      if (errorMessage.includes("message rejected") || errorMessage.includes("not verified")) {
        return NextResponse.json(
          {
            success: false,
            error: "The sender email address needs to be verified in AWS SES. Please contact support.",
          },
          { status: 500 },
        )
      }

      if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
        return NextResponse.json(
          {
            success: false,
            error: "Daily sending quota exceeded. Please try again tomorrow.",
          },
          { status: 429 },
        )
      }

      if (errorMessage.includes("throttling") || errorMessage.includes("rate")) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many requests. Please try again in a moment.",
          },
          { status: 429 },
        )
      }

      if (errorMessage.includes("connection") || errorMessage.includes("timeout")) {
        return NextResponse.json(
          {
            success: false,
            error: "Email service temporarily unavailable. Please try again.",
          },
          { status: 503 },
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send welcome email. Please try again.",
      },
      { status: 500 },
    )
  }
}

async function sendEmailViaNodemailer(email: string) {
  try {
    // Create transporter using AWS SES SMTP
    const transporter = nodemailer.createTransport({
      host: "email-smtp.ap-south-1.amazonaws.com", // Use your correct AWS region
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USERNAME!, // Use SMTP credentials, not AWS Access Keys
        pass: process.env.SMTP_PASSWORD!, // Use SMTP password, not Secret Access Key
      },
      tls: {
        rejectUnauthorized: true, // Set to true for production security
      },
    })

    // Verify connection configuration
    await transporter.verify()
    console.log("SMTP connection verified successfully")

    // Define email options
    const mailOptions = {
      from: {
        name: "PixRay Team",
        address: process.env.FROM_EMAIL!,
      },
      to: email,
      subject: "Welcome to PixRay - You're on the list! 🎮",
      html: generateWelcomeEmail(email),
      text: generatePlainTextEmail(email),
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", info.messageId)

    return {
      success: true,
      messageId: info.messageId || "unknown",
    }
  } catch (error) {
    console.error("Nodemailer Error:", error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "Unknown error occurred while sending email",
    }
  }
}

function generateWelcomeEmail(email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to PixRay</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Courier New', Courier, monospace, Arial, sans-serif;
            background: #000;
            color: #00ffff;
            overflow-x: hidden;
        }
        
        .email-wrapper {
            background: 
                radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 0, 128, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
                linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 25%, #0a1a2e 50%, #2a0a3a 75%, #0a0a0a 100%);
            min-height: 100vh;
            padding: 20px;
            position: relative;
        }
        
        .email-wrapper::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 2px,
                    rgba(0, 255, 255, 0.03) 2px,
                    rgba(0, 255, 255, 0.03) 4px
                ),
                repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 0, 128, 0.02) 2px,
                    rgba(255, 0, 128, 0.02) 4px
                );
            pointer-events: none;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: 
                linear-gradient(145deg, rgba(10, 10, 10, 0.95) 0%, rgba(20, 0, 30, 0.95) 100%);
            border: 2px solid;
            border-image: linear-gradient(45deg, #00ffff, #ff0080, #00ffff) 1;
            position: relative;
            box-shadow: 
                0 0 50px rgba(0, 255, 255, 0.3),
                inset 0 0 50px rgba(0, 255, 255, 0.05);
            overflow: hidden;
        }
        
        .container::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #00ffff, #ff0080, #00ffff, #ff0080);
            background-size: 400% 400%;
            z-index: -1;
            animation: borderGlow 4s ease-in-out infinite;
        }
        
        @keyframes borderGlow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .glitch-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                linear-gradient(90deg, transparent 0%, rgba(0, 255, 255, 0.1) 50%, transparent 100%);
            animation: glitchSweep 3s linear infinite;
            pointer-events: none;
        }
        
        @keyframes glitchSweep {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .header {
            background: 
                linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 128, 0.1) 100%);
            padding: 50px 40px;
            text-align: center;
            position: relative;
            border-bottom: 1px solid rgba(0, 255, 255, 0.3);
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, #00ffff, #ff0080, #00ffff, transparent);
            animation: linePulse 2s ease-in-out infinite;
        }
        
        @keyframes linePulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }
        
        .logo {
            font-family: 'Courier New', Courier, monospace, Arial, sans-serif;
            font-size: 42px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #00ffff;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            position: relative;
            display: inline-block;
        }
        
        .logo::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            color: rgba(255, 0, 128, 0.3);
            z-index: -1;
        }
        
        .tagline {
            font-size: 18px;
            color: #00ffff;
            text-transform: uppercase;
            letter-spacing: 3px;
            font-weight: 500;
            opacity: 0.9;
        }
        
        .content {
            padding: 50px 40px;
        }
        
        .welcome-title {
            font-family: 'Courier New', Courier, monospace, Arial, sans-serif;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 30px;
            color: #00ffff;
            text-align: center;
            position: relative;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .welcome-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #00ffff, transparent);
        }
        
        .message {
            font-size: 18px;
            line-height: 1.8;
            margin-bottom: 35px;
            color: rgba(255, 255, 255, 0.9);
            text-align: center;
        }
        
        .email-highlight {
            background: linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 128, 0.2));
            padding: 4px 12px;
            border-radius: 6px;
            color: #00ffff;
            border: 1px solid rgba(0, 255, 255, 0.3);
            font-weight: 600;
        }
        
        .features {
            background: 
                linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(255, 0, 128, 0.05) 100%);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 12px;
            padding: 35px;
            margin: 40px 0;
            position: relative;
            overflow: hidden;
        }
        
        .features::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        
        .features h3 {
            font-family: 'Courier New', Courier, monospace, Arial, sans-serif;
            margin: 0 0 25px 0;
            color: #00ffff;
            font-size: 20px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: bold;
        }
        
        .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .feature-list li {
            padding: 12px 0;
            position: relative;
            padding-left: 40px;
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            border-bottom: 1px solid rgba(0, 255, 255, 0.1);
        }
        
        .feature-list li:last-child {
            border-bottom: none;
        }
        
        .feature-list li::before {
            content: '▶';
            position: absolute;
            left: 0;
            top: 12px;
            color: #ff0080;
            font-size: 14px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .cta-section {
            text-align: center;
            margin: 50px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #00ffff, #ff0080);
            color: #000000;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 18px;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            border: 2px solid #00ffff;
            font-family: 'Courier New', Courier, monospace, Arial, sans-serif;
        }
        
        .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
        }
        
        .cta-button:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 0 50px rgba(0, 255, 255, 0.6);
            border-color: #00ffff;
        }
        
        .cta-button:hover::before {
            left: 100%;
        }
        
        .social-links {
            text-align: center;
            margin: 40px 0;
            padding: 20px;
            border-top: 1px solid rgba(0, 255, 255, 0.2);
            border-bottom: 1px solid rgba(0, 255, 255, 0.2);
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 15px;
            color: #00ffff;
            text-decoration: none;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .social-links a::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #00ffff, #ff0080);
            transition: width 0.3s ease;
        }
        
        .social-links a:hover {
            color: #ff0080;
            transform: translateY(-2px);
        }
        
        .social-links a:hover::after {
            width: 100%;
        }
        
        .footer {
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(20, 0, 30, 0.8) 100%);
            padding: 40px;
            text-align: center;
            border-top: 1px solid rgba(0, 255, 255, 0.3);
            position: relative;
        }
        
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, #00ffff, #ff0080, #00ffff, transparent);
        }
        
        .footer p {
            margin: 8px 0;
            color: rgba(255, 255, 255, 0.7);
            font-size: 16px;
        }
        
        .footer .brand {
            font-family: 'Courier New', Courier, monospace, Arial, sans-serif;
            font-weight: bold;
            color: #00ffff;
            font-size: 18px;
        }
        
        .footer .tagline-footer {
            color: #ff0080;
            font-style: italic;
            margin-bottom: 25px;
        }
        
        .disclaimer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(0, 255, 255, 0.1);
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            line-height: 1.6;
        }
        
        /* Responsive design */
        @media (max-width: 600px) {
            .email-wrapper {
                padding: 10px;
            }
            .container {
                margin: 0;
            }
            .header {
                padding: 40px 25px;
            }
            .content {
                padding: 40px 25px;
            }
            .footer {
                padding: 30px 25px;
            }
            .logo {
                font-size: 32px;
            }
            .welcome-title {
                font-size: 26px;
            }
            .message {
                font-size: 16px;
            }
            .cta-button {
                padding: 15px 30px;
                font-size: 16px;
            }
            .features {
                padding: 25px;
            }
        }
        
        /* Remove complex animations that Gmail doesn't support */
        .container::before,
        .glitch-overlay,
        .header::after,
        .features::before {
            display: none;
        }
        
        /* Simplify glitch effects */
        .glitch::before,
        .glitch::after {
            display: none;
        }
        
        @keyframes glitch-1 {
            0%, 14%, 15%, 49%, 50%, 99%, 100% {
                transform: translate(0);
            }
            15%, 49% {
                transform: translate(-2px, 2px);
            }
        }
        
        @keyframes glitch-2 {
            0%, 20%, 21%, 62%, 63%, 99%, 100% {
                transform: translate(0);
            }
            21%, 62% {
                transform: translate(2px, -2px);
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="glitch-overlay"></div>
            
            <div class="header">
                <div class="logo glitch" data-text="🎮 PixRay">🎮 PixRay</div>
                <div class="tagline">The Future of Cloud Gaming</div>
            </div>
            
            <div class="content">
                <h1 class="welcome-title">WELCOME TO THE REVOLUTION! 🚀</h1>
                
                <p class="message">
                    <strong>GREETINGS, FUTURE GAMER!</strong> 👋<br><br>
                    
                    Thank you for joining the PixRay waitlist with <span class="email-highlight">${email}</span>. 
                    You're now part of an <strong>EXCLUSIVE COMMUNITY</strong> that will experience the future of gaming before anyone else!
                </p>
                
                <div class="features">
                    <h3>🌟 INCOMING TRANSMISSIONS:</h3>
                    <ul class="feature-list">
                        <li>Early access to our alpha platform</li>
                        <li>Exclusive behind-the-scenes updates</li>
                        <li>Special launch pricing (up to 50% off)</li>
                        <li>Direct feedback channel to our dev team</li>
                        <li>Priority support when we launch</li>
                    </ul>
                </div>
                
                <p class="message">
                    We're working <strong>AROUND THE CLOCK</strong> to bring you the most revolutionary cloud gaming experience. 
                    Imagine playing AAA games like <em>Red Dead Redemption 2</em>, <em>Cyberpunk 2077</em>, and <em>GTA V</em> on your phone, 
                    tablet, or any device with the same quality as a high-end gaming PC. <strong>That's the PixRay promise!</strong> ⚡
                </p>
                
                <div class="cta-section">
                    <a href="https://youtu.be/mWqUfYHqhdc" class="cta-button">
                        🎬 WATCH DEMO
                    </a>
                </div>
                
                <p class="message">
                    Stay tuned for more updates, and feel free to reply to this email if you have any questions. 
                    Our team loves hearing from our <strong>CYBER-COMMUNITY</strong>!
                </p>
                
                <div class="social-links">
                    <a href="#">FOLLOW ON TWITTER</a> • 
                    <a href="#">JOIN DISCORD</a> • 
                    <a href="#">VISIT WEBSITE</a>
                </div>
            </div>
            
            <div class="footer">
                <p class="brand">PixRay Team</p>
                <p class="tagline-footer">Building the future of gaming, one stream at a time</p>
                <div class="disclaimer">
                    You received this transmission because you signed up for the PixRay waitlist.<br>
                    If you didn't sign up, you can safely ignore this email.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `
}

function generatePlainTextEmail(email: string): string {
  return `
Welcome to PixRay - The Future of Cloud Gaming! 🎮

Hey there, future gamer! 👋

Thank you for joining the PixRay waitlist with ${email}. You're now part of an exclusive community that will experience the future of gaming before anyone else!

🌟 What's Coming Your Way:
• Early access to our alpha platform
• Exclusive behind-the-scenes updates  
• Special launch pricing (up to 50% off)
• Direct feedback channel to our dev team
• Priority support when we launch

We're working around the clock to bring you the most revolutionary cloud gaming experience. Imagine playing AAA games like Red Dead Redemption 2, Cyberpunk 2077, and GTA V on your phone, tablet, or any device with the same quality as a high-end gaming PC. That's the PixRay promise! ⚡

🎬 Watch Our Demo: https://youtube.com

Stay tuned for more updates, and feel free to reply to this email if you have any questions. Our team loves hearing from our community!

---
PixRay Team
Building the future of gaming, one stream at a time

You received this email because you signed up for the PixRay waitlist.
If you didn't sign up, you can safely ignore this email.
  `
}

export async function GET() {
  return NextResponse.json({
    status: "Waitlist API with Nodemailer is running",
    timestamp: new Date().toISOString(),
  })
}