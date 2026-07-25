import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      phone,
      subject,
      message,
    } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: settings, error } = await supabase
      .from("settings")
      .select("whatsapp")
      .single();

    if (error) throw error;

    if (!settings?.whatsapp) {
      return NextResponse.json(
        { error: "WhatsApp number not configured" },
        { status: 400 }
      );
    }

    const whatsappMessage = encodeURIComponent(
      `Hello Mekfidel Communication

New Contact Message

Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Subject: ${subject || "N/A"}

Message:
${message}`
    );

    const whatsappUrl =
      `https://wa.me/${settings.whatsapp}?text=${whatsappMessage}`;

    return NextResponse.json({
      success: true,
      whatsappUrl,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
