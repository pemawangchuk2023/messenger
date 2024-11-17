import { NextRequest, NextResponse } from 'next/server';
import { getCloudinaryConfig } from '@/lib/cloudinary';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const config = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);

    // Generate signature
    const signatureString = `timestamp=${timestamp}${config.apiSecret}`;
    const signature = crypto
      .createHash('sha256')
      .update(signatureString)
      .digest('hex');

    const formDataForCloudinary = new FormData();
    formDataForCloudinary.append('file', file);
    formDataForCloudinary.append('api_key', config.apiKey);
    formDataForCloudinary.append('timestamp', timestamp.toString());
    formDataForCloudinary.append('signature', signature);

    const response = await fetch(`${config.apiBaseUrl}/upload`, {
      method: 'POST',
      body: formDataForCloudinary,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Cloudinary upload error:', error);
      return NextResponse.json(
        { error: 'Cloudinary upload failed' },
        { status: 500 }
      );
    }
    const data = await response.json();
    return NextResponse.json({ url: data.secure_url });
  } catch (error) {
    console.error('Internal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
