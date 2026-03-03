import { createServerClient } from "@/lib/supabase/server";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createServerClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lmslegends.com";

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
        { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
        { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ];

    // Dynamic course pages
    const { data: courses } = await supabase
        .from("courses")
        .select("id, updated_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(500);

    const coursePages: MetadataRoute.Sitemap = (courses || []).map((course) => ({
        url: `${baseUrl}/courses/${course.id}`,
        lastModified: new Date(course.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    return [...staticPages, ...coursePages];
}
