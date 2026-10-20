import { NextRequest, NextResponse } from 'next/server';
import { sendInvoiceEmail } from '@/lib/email';
import { SendEmailPayload } from '@/types/invoice';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SendEmailPayload;

    if (!body || !body.recipientEmail || !body.invoice) {
      return NextResponse.json(
        { success: false, error: 'Recipient email and invoice data are required.' },
        { status: 400 }
      );
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.recipientEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid recipient email address.' },
        { status: 400 }
      );
    }

    const result = await sendInvoiceEmail({
      recipientEmail: body.recipientEmail,
      subject: body.subject,
      customMessage: body.message,
      invoice: body.invoice,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send invoice email.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      previewUrl: result.previewUrl,
      provider: result.provider,
    });
  } catch (error: any) {
    console.error('Error in send-email API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error while sending email' },
      { status: 500 }
    );
  }
}
