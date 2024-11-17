import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const conversationId = formData.get('conversationId') as string;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure the upload directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
    return NextResponse.json(
      { error: 'Failed to create upload directory' },
      { status: 500 }
    );
  }

  // Generate a unique filename to prevent overwriting
  const uniqueFilename = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, uniqueFilename);

  try {
    await writeFile(filePath, buffer);
  } catch (error) {
    console.error('Failed to write file:', error);
    return NextResponse.json(
      { error: 'Failed to save the file' },
      { status: 500 }
    );
  }

  // Generate the URL for the uploaded file
  const url = `/uploads/${uniqueFilename}`;

  return NextResponse.json({ url });
}
