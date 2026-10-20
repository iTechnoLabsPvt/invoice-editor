import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();
    const invoice = db.get(id);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error('Error getting invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();
    const deleted = db.delete(id);

    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
