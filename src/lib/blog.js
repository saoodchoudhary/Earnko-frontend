import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

function safeSlug(input) {
  return String(input || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '');
}

function toArrayTags(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  // allow: "seo, affiliate, earnko"
  return String(v)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export function getAllPostsMeta({ limit = null } = {}) {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

  const posts = files
    .map((file) => {
      const fullPath = path.join(BLOG_DIR, file);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(raw);

      const slugFromFile = file.replace(/\.mdx?$/, '');
      const slug = safeSlug(data.slug || slugFromFile);

      return {
        title: String(data.title || ''),
        slug,
        excerpt: String(data.excerpt || ''),
        date: String(data.date || ''),
        coverImage: String(data.coverImage || ''),
        author: String(data.author || 'Earnko'),
        tags: toArrayTags(data.tags),
      };
    })
    .filter((p) => p.slug && p.title);

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (Number.isFinite(limit) && limit > 0) return posts.slice(0, limit);
  return posts;
}

export function getPostBySlug(slug) {
  const s = safeSlug(slug);
  if (!s) return null;

  const mdxPath = path.join(BLOG_DIR, `${s}.mdx`);
  const mdPath = path.join(BLOG_DIR, `${s}.md`);

  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  return {
    meta: {
      title: String(data.title || s),
      slug: safeSlug(data.slug || s),
      excerpt: String(data.excerpt || ''),
      date: String(data.date || ''),
      coverImage: String(data.coverImage || ''),
      author: String(data.author || 'Earnko'),
      tags: toArrayTags(data.tags),
    },
    content,
  };
}

export function getRecentPosts({ limit = 6, excludeSlug = null } = {}) {
  const all = getAllPostsMeta();
  const ex = excludeSlug ? safeSlug(excludeSlug) : null;
  const filtered = ex ? all.filter(p => p.slug !== ex) : all;
  return filtered.slice(0, Math.max(1, limit));
}

export function getRelatedPosts({ post, limit = 6 } = {}) {
  if (!post?.meta?.slug) return [];
  const slug = safeSlug(post.meta.slug);
  const tags = Array.isArray(post.meta.tags) ? post.meta.tags : [];

  const all = getAllPostsMeta();
  const others = all.filter(p => p.slug !== slug);

  if (!tags.length) return others.slice(0, Math.max(1, limit));

  const scored = others
    .map((p) => {
      const overlap = (p.tags || []).filter(t => tags.includes(t)).length;
      return { p, score: overlap };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.p.date).getTime() - new Date(a.p.date).getTime())
    .map(x => x.p);

  // fallback fill with recent
  const out = scored.slice(0, limit);
  if (out.length < limit) {
    const fill = others.filter(p => !out.some(x => x.slug === p.slug)).slice(0, limit - out.length);
    out.push(...fill);
  }
  return out;
}