import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(url, key);

const TABLE = {
  Event: 'events', GalleryImage: 'gallery_images', EventGallery: 'event_gallery',
  SiteSettings: 'site_settings', Song: 'songs', ContactMessage: 'contact_messages',
  PageVisit: 'page_visits',
};
const mapField = (f) => (f === 'created_date' ? 'created_at' : f);
const enrich = (r) => (r ? { ...r, created_date: r.created_at } : r);
const strip = (o) => { if (!o) return o; const { created_date, id, ...rest } = o; return rest; };

function applyOrder(q, order) {
  if (!order) return q;
  const desc = order.startsWith('-');
  return q.order(mapField(desc ? order.slice(1) : order), { ascending: !desc });
}

function makeEntity(name) {
  const table = TABLE[name] || name.toLowerCase();
  return {
    async list(order, limit) {
      let q = supabase.from(table).select('*');
      q = applyOrder(q, order);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(enrich);
    },
    async filter(criteria = {}, order, limit) {
      let q = supabase.from(table).select('*');
      for (const [k, v] of Object.entries(criteria)) q = q.eq(mapField(k), v);
      q = applyOrder(q, order);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(enrich);
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return enrich(data);
    },
    async create(payload) {
      const { data, error } = await supabase.from(table).insert(strip(payload)).select().single();
      if (error) throw error;
      return enrich(data);
    },
    async update(id, payload) {
      const { data, error } = await supabase.from(table).update(strip(payload)).eq('id', id).select().single();
      if (error) throw error;
      return enrich(data);
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };
}

const entities = new Proxy({}, { get: (_, prop) => makeEntity(String(prop)) });

const auth = {
  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('not authenticated'), { status: 401 });
    return { ...user, role: 'admin', email: user.email };
  },
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },
  async logout() { await supabase.auth.signOut(); if (typeof window !== 'undefined') window.location.href = '/'; },
  redirectToLogin() { if (typeof window !== 'undefined') window.location.href = '/Admin'; },
};

async function UploadFile({ file }) {
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return { file_url: data.publicUrl };
}

async function SendEmail({ to, subject, body }) {
  const wkey = import.meta.env.VITE_WEB3FORMS_KEY;
  if (!wkey) { console.warn('VITE_WEB3FORMS_KEY chybí — e-mail se neodešle (zpráva je ale uložená v databázi).'); return { success: false }; }
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_key: wkey, subject, from_name: 'Web Anika Menclová', email: to, message: body }),
  });
  return { success: res.ok };
}

const integrations = { Core: {
  UploadFile, SendEmail,
  InvokeLLM: async () => ({}), SendSMS: async () => ({}),
  GenerateImage: async () => ({}), ExtractDataFromUploadedFile: async () => ({}),
} };

const functions = { async invoke() { return { data: { success: true }, success: true }; } };

export const base44 = { entities, auth, integrations, functions };
