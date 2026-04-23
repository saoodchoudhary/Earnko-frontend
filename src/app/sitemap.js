import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Next.js Metadata Route for sitemap: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
export default async function sitemap() {
  const baseUrl = 'https://www.earnko.com';
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  // ✅ Static routes
  const staticRoutes = [
    { url: `${baseUrl}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/stores`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/products`, changeFrequency: 'daily', priority: 0.9 },

    // ✅ Blog listing for SEO
    { url: `${baseUrl}/blog`, changeFrequency: 'weekly', priority: 0.9 },

    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/register`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/dashboard`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ].map((r) => ({ ...r, lastModified: new Date() }));

  let dynamicRoutes = [];

  // ✅ Blog post routes (read from src/content/blog)
  try {
    const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
    if (fs.existsSync(blogDir)) {
      const files = fs
        .readdirSync(blogDir)
        .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

      const blogRoutes = files
        .map((file) => {
          const fullPath = path.join(blogDir, file);
          const raw = fs.readFileSync(fullPath, 'utf8');
          const { data } = matter(raw);

          const slugFromFile = file.replace(/\.mdx?$/, '');
          const slug = String(data?.slug || slugFromFile).trim();

          // date for lastModified (fallback: now)
          const d = data?.date ? new Date(String(data.date)) : new Date();
          const lastModified = Number.isNaN(d.getTime()) ? new Date() : d;

          return {
            url: `${baseUrl}/blog/${encodeURIComponent(slug)}`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
          };
        })
        .filter((r) => r.url && !r.url.endsWith('/blog/'));

      dynamicRoutes.push(...blogRoutes);
    }
  } catch (_) {
    // ignore blog sitemap errors
  }

  // Fetch dynamic products
  try {
    if (apiBase) {
      const prodRes = await fetch(`${apiBase}/api/products?limit=1000`, { next: { revalidate: 3600 } });
      if (prodRes.ok) {
        const prodData = await prodRes.json().catch(() => null);
        const products = Array.isArray(prodData?.data?.items)
          ? prodData.data.items
          : Array.isArray(prodData?.data)
          ? prodData.data
          : Array.isArray(prodData?.items)
          ? prodData.items
          : Array.isArray(prodData)
          ? prodData
          : [];

        dynamicRoutes.push(
          ...products.map((p) => ({
            url: `${baseUrl}/products/${p._id || p.id}`,
            lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          }))
        );
      }
    }
  } catch (_) {
    // ignore
  }

  // Fetch dynamic stores
  try {
    if (apiBase) {
      const storeRes = await fetch(`${apiBase}/api/stores`, { next: { revalidate: 86400 } });
      if (storeRes.ok) {
        const storeData = await storeRes.json().catch(() => null);
        const stores = Array.isArray(storeData?.data?.stores)
          ? storeData.data.stores
          : Array.isArray(storeData?.data)
          ? storeData.data
          : Array.isArray(storeData?.items)
          ? storeData.items
          : Array.isArray(storeData)
          ? storeData
          : [];

        dynamicRoutes.push(
          ...stores.map((s) => ({
            url: `${baseUrl}/stores/${s._id || s.id}`,
            lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          }))
        );
      }
    }
  } catch (_) {
    // ignore
  }

  return [...staticRoutes, ...dynamicRoutes];
}