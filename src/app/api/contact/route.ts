import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY");
      return NextResponse.redirect(new URL("/?error=submit-failed", request.url), 303);
    }

    const resend = new Resend(apiKey);
    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      return NextResponse.redirect(new URL("/?error=missing-fields", request.url), 303);
    }

    await resend.emails.send({
      from: "ReturnLab Logistics <onboarding@resend.dev>",
      to: ["info@returnlablogistics.com"],
      replyTo: email,
      subject: "New ReturnLab Logistics contact form submission",
      text: [
        `Name: ${name}`,
        `Company: ${company || "N/A"}`,
        `Email: ${email}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    return NextResponse.redirect(new URL("/thank-you", request.url), 303);
  } catch (error) {
    console.error("Contact form error", error);
    return NextResponse.redirect(new URL("/?error=submit-failed", request.url), 303);
  }
}
