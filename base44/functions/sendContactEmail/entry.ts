import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { Resend } from 'npm:resend@4.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  try {
    const { name, email, subject, message } = await req.json();

    const NOTIFY_EMAILS = ['anikamenclova.cz@gmail.com', 'martingotzl.cz@gmail.com'];

    await resend.emails.send({
      from: 'Kontaktní formulář <onboarding@resend.dev>',
      to: NOTIFY_EMAILS,
      reply_to: email,
      subject: `Nová zpráva z kontaktního formuláře: ${subject}`,
      text: `Nová zpráva od ${name} (${email}):\n\nPředmět: ${subject}\n\n${message}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});