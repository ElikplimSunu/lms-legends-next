import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lmslegends.com";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/dashboard/", "/admin/", "/learn/", "/api/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
