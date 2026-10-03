import { POSTS } from "@/lib/blog";

export async function GET() {
  const items = POSTS.map(
    (post) => `    <item>
      <title>${post.title}</title>
      <link>https://www.donray.dev/blog/${post.slug}</link>
      <guid>https://www.donray.dev/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date + "T12:00:00Z").toUTCString()}</pubDate>
      <description>${post.excerpt}</description>
    </item>`,
  ).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>donray.dev | Blog</title>
    <link>https://www.donray.dev/blog</link>
    <description>Notes from Donray Williams on engineering management, frontend leadership, and shipping software.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
