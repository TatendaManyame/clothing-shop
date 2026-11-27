import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const topics = [
  "Order question",
  "Shipping & delivery",
  "Returns & exchanges",
  "Product or sizing",
  "Wholesale & collabs",
  "Something else",
];

function cleanString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const toEmail = process.env.RESEND_TO_EMAIL;

    if (!apiKey || !fromEmail || !toEmail) {
      console.error("Contact email configuration is incomplete.");

      return NextResponse.json(
        { error: "Contact email service is not configured." },
        { status: 503 }
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    const name = cleanString(body.name, 100);
    const email = cleanString(body.email, 254).toLowerCase();
    const topic = cleanString(body.topic, 100);
    const message = cleanString(body.message, 5000);

    if (!name || !email || !topic || !message) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!topics.includes(topic)) {
      return NextResponse.json(
        { error: "Please select a valid contact topic." },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Your message must be at least 10 characters." },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `VICWAV Contact: ${topic}`,
      text: [
        "New customer enquiry from the VICWAV website",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Topic: ${topic}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend email error:", error);

      return NextResponse.json(
        { error: "We couldn't send your message. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Your message has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
