import { getCertificateAction } from "@/actions/certificates";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Certificate Verification | LMS Legends",
};

interface Props {
  params: Promise<{ certNumber: string }>;
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { certNumber } = await params;
  const certificate = await getCertificateAction(certNumber);

  if (!certificate) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Verified badge */}
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>

        <div>
          <p className="text-sm font-semibold text-emerald-400 tracking-widest uppercase mb-2">
            Verified Certificate
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">
            {certificate.userName}
          </h1>
          <p className="text-zinc-400 mt-2">
            has successfully completed
          </p>
          <p className="text-xl font-semibold text-white mt-1">
            {certificate.courseTitle}
          </p>
        </div>

        {/* Details */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4 text-left">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Issued
            </span>
            <span className="text-sm font-medium">
              {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-500 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Certificate ID
            </span>
            <span className="text-sm font-mono font-medium text-indigo-400">
              {certificate.certificateNumber}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {certificate.courseSlug && (
            <Link href={`/courses/${certificate.courseSlug}`}>
              <Button variant="outline" className="rounded-xl border-white/10 text-zinc-300 hover:text-white hover:bg-white/5">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Course
              </Button>
            </Link>
          )}
          <Link href="/">
            <Button className="rounded-xl bg-white text-zinc-950 hover:bg-zinc-200">
              Explore LMS Legends
            </Button>
          </Link>
        </div>

        <p className="text-xs text-zinc-600">
          This certificate was issued by LMS Legends and can be independently verified at this URL.
        </p>
      </div>
    </div>
  );
}
