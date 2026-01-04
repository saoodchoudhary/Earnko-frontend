// Next.js Metadata Route for sitemap: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
export default async function sitemap() {
  const baseUrl =  'https://www.earnko.com';
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  // Static routes (include dashboard, exclude any admin)
  const staticRoutes = [
    { url: `${baseUrl}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/stores`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/dashboard`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/register`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/about`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/terms`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'monthly', priority: 0.3 },

  ].map(r => ({ ...r, lastModified: new Date() }));

  let dynamicRoutes = [];

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
          ...products.map(p => ({
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
          ...stores.map(s => ({
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