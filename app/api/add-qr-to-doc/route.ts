// app/api/add-qr-to-doc/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { writeFile, unlink } from "fs/promises";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// Python script content (inline or external file)
// Bu yerda oddiy Python script inline sifatida saqlaymiz, lekin realda alohida fayl bo'lishi mumkin
const PYTHON_SCRIPT = `
import sys
import json
from docx import Document
from docx.shared import Inches
from io import BytesIO
import base64

def add_qr_to_doc(doc_path, output_path, qr_data_list):
    doc = Document(doc_path)
    for qr_data in qr_data_list:
        url = qr_data['url']
        x = qr_data['position']['x'] / 96.0  # px to inches (approx)
        y = qr_data['position']['y'] / 96.0
        width = qr_data['size']['width'] / 96.0
        height = qr_data['size']['height'] / 96.0
        
        # Generate QR base64
        import qrcode
        from io import BytesIO
        qr = qrcode.QRCode()
        qr.add_data(url)
        qr.make()
        f = BytesIO()
        qr.make_image().save(f, 'PNG')
        f.seek(0)
        
        # Add to paragraph with positioning (approximate, docx doesn't support absolute perfect)
        p = doc.add_paragraph()
        r = p.add_run()
        # Use inline picture with offset (limited support)
        # Better to use tables or sections, but for simplicity
        picture = r.add_picture(f, width=Inches(width))
        # Positioning not direct, but we can use sections or something
        
    doc.save(output_path)

if __name__ == "__main__":
    doc_path = sys.argv[1]
    output_path = sys.argv[2]
    qr_json = sys.argv[3]
    qr_data_list = json.loads(qr_json)
    add_qr_to_doc(doc_path, output_path, qr_data_list)
`;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const document = formData.get("document") as File;
  const qrDataStr = formData.get("qrData") as string;

  if (!document || !qrDataStr) {
    return NextResponse.json(
      { error: "Ma'lumotlar yetishmayapti" },
      { status: 400 },
    );
  }

  try {
    const qrData = JSON.parse(qrDataStr) as Array<{
      url: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
    }>;

    // Temp files
    const inputPath = join(tmpdir(), `${uuidv4()}-input.docx`);
    const outputPath = join(tmpdir(), `${uuidv4()}-output.docx`);
    const scriptPath = join(tmpdir(), `${uuidv4()}-script.py`);

    // Write files
    const docBuffer = Buffer.from(await document.arrayBuffer());
    await writeFile(inputPath, docBuffer);
    await writeFile(scriptPath, PYTHON_SCRIPT);

    // Exec Python
    await execFileAsync("python", [
      scriptPath,
      inputPath,
      outputPath,
      JSON.stringify(qrData),
    ]);

    // Read output
    const outputBuffer = readFileSync(outputPath);

    // Cleanup
    await unlink(inputPath);
    await unlink(outputPath);
    await unlink(scriptPath);

    return new NextResponse(outputBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="updated.docx"',
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}
