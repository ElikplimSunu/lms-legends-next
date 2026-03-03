import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ certNumber: string }> }
) {
    const { certNumber } = await params;
    const supabase = await createServerClient();

    const { data: cert } = await supabase
        .from("certificates")
        .select("*, profiles!user_id(full_name), courses!course_id(title)")
        .eq("certificate_number", certNumber)
        .single();

    if (!cert) {
        return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    const userName = (cert.profiles as unknown)?.full_name || "Student";
    const courseTitle = (cert.courses as unknown)?.title || "Course";
    const issuedDate = new Date(cert.issued_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Generate a certificate as a styled HTML page that renders as PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', sans-serif;
      background: #0a0a0a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 40px;
    }

    .certificate {
      width: 800px;
      min-height: 560px;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 24px;
      padding: 64px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .certificate::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 24px;
      padding: 2px;
      background: linear-gradient(135deg, rgba(99,102,241,0.3), transparent 50%, rgba(168,85,247,0.3));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }

    .logo {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
      margin-bottom: 40px;
    }

    .badge {
      display: inline-block;
      background: rgba(16,185,129,0.1);
      color: #34d399;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      padding: 6px 16px;
      border-radius: 100px;
      border: 1px solid rgba(16,185,129,0.2);
      margin-bottom: 32px;
    }

    h1 {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }

    .subtitle {
      font-size: 16px;
      color: rgba(255,255,255,0.5);
      margin-bottom: 8px;
    }

    .course-title {
      font-size: 22px;
      font-weight: 700;
      background: linear-gradient(110deg, #6366f1, #a78bfa, #818cf8);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 40px;
    }

    .meta {
      display: flex;
      justify-content: center;
      gap: 40px;
      font-size: 13px;
      color: rgba(255,255,255,0.4);
    }

    .meta span { color: rgba(255,255,255,0.7); font-weight: 600; }

    .cert-id {
      margin-top: 32px;
      font-size: 11px;
      color: rgba(255,255,255,0.25);
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="logo">✦ LMS Legends</div>
    <div class="badge">Certificate of Completion</div>
    <h1>${userName}</h1>
    <p class="subtitle">has successfully completed</p>
    <p class="course-title">${courseTitle}</p>
    <div class="meta">
      <div>Issued: <span>${issuedDate}</span></div>
      <div>ID: <span>${certNumber}</span></div>
    </div>
    <p class="cert-id">Verify at ${process.env.NEXT_PUBLIC_APP_URL || 'https://lmslegends.com'}/verify/${certNumber}</p>
  </div>
</body>
</html>
  `.trim();

    return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
        },
    });
}
