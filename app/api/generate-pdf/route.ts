import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File;
    const documentUrl = formData.get("documentUrl") as string;
    const qrPosition = formData.get("qrPosition") as string;

    if (!pdfFile) {
      return NextResponse.json(
        { error: "PDF fayl topilmadi" },
        { status: 400 },
      );
    }

    console.log("PDF file received:", pdfFile.name, pdfFile.size);
    console.log("Document URL:", documentUrl);
    console.log("QR Position:", qrPosition);

    // PDF faylni saqlash
    const bytes = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Fayl nomini yaratish
    const fileName = `document-${Date.now()}.pdf`;
    const filePath = join(process.cwd(), "public", "uploads", fileName);

    // Faylni saqlash (production'da S3, Cloudinary, yoki boshqa storage ishlatish kerak)
    await writeFile(filePath, buffer);

    console.log("PDF saved to:", filePath);

    // Bu yerda ma'lumotlar bazasiga saqlash mumkin
    // await db.documents.create({
    //   originalUrl: documentUrl,
    //   pdfPath: `/uploads/${fileName}`,
    //   qrPosition: JSON.parse(qrPosition || 'null'),
    //   createdAt: new Date(),
    // });

    return NextResponse.json({
      success: true,
      pdfUrl: `/uploads/${fileName}`,
      message: "PDF muvaffaqiyatli saqlandi",
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    return NextResponse.json(
      { error: "PDF yuklashda xatolik yuz berdi" },
      { status: 500 },
    );
  }
}
