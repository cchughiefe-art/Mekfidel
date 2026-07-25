import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log the contact submission
    console.log('Contact form submission:', { name, email, phone, subject, message });

    // Send notification via WhatsApp
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000';
    const whatsappMessage = encodeURIComponent(
      `📬 NEW CONTACT FORM\n\nFrom: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject}\n\nMessage:\n${message}`
    );

    try {
      await fetch(`https://api.callmebot.com/whatsapp.php?phone=${whatsappNumber}&text=${whatsappMessage}&apikey=12345`);
    } catch {
      // Best effort
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

