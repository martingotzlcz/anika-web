import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image, Calendar, Music, User, BarChart2, LogOut } from 'lucide-react';
import GalleryAdminPanel from '@/components/admin/GalleryAdminPanel';
import EventsAdminPanel from '@/components/admin/EventsAdminPanel';
import MusicAdminPanel from '@/components/admin/MusicAdminPanel';
import AboutAdminPanel from '@/components/admin/AboutAdminPanel';
import AnalyticsPanel from '@/components/admin/AnalyticsPanel';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(() => { setIsAdmin(true); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); setErr(''); setSubmitting(true);
    try { await base44.auth.login(email.trim(), password); setIsAdmin(true); }
    catch { setErr('Přihlášení se nezdařilo. Zkontroluj e-mail a heslo.'); }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="pt-24 pb-16 min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Načítám...</div></div>;
  }

  if (!isAdmin) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white rounded-xl shadow-sm p-8 space-y-4">
          <h1 className="text-2xl font-light text-[#1e3a5f] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Administrace</h1>
          <p className="text-sm text-gray-500 mb-4">Přihlaš se pro správu webu.</p>
          <div><label className="text-sm font-medium text-gray-700">E-mail</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label className="text-sm font-medium text-gray-700">Heslo</label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          {err && <div className="text-sm text-[#c94a4a]">{err}</div>}
          <Button type="submit" disabled={submitting} className="w-full bg-[#1e3a5f] hover:bg-[#15294a]">{submitting ? 'Přihlašuji…' : 'Přihlásit'}</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light text-[#1e3a5f]" style={{ fontFamily: "'Playfair Display', serif" }}>Administrace</h1>
          <Button variant="outline" onClick={() => base44.auth.logout()} className="gap-2"><LogOut className="w-4 h-4" />Odhlásit</Button>
        </div>
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="gallery" className="gap-2"><Image className="w-4 h-4" />Galerie</TabsTrigger>
            <TabsTrigger value="events" className="gap-2"><Calendar className="w-4 h-4" />Termíny</TabsTrigger>
            <TabsTrigger value="music" className="gap-2"><Music className="w-4 h-4" />Hudba</TabsTrigger>
            <TabsTrigger value="about" className="gap-2"><User className="w-4 h-4" />O mně</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2"><BarChart2 className="w-4 h-4" />Analýzy</TabsTrigger>
          </TabsList>
          <TabsContent value="gallery"><GalleryAdminPanel /></TabsContent>
          <TabsContent value="events"><EventsAdminPanel /></TabsContent>
          <TabsContent value="music"><MusicAdminPanel /></TabsContent>
          <TabsContent value="about"><AboutAdminPanel /></TabsContent>
          <TabsContent value="analytics"><AnalyticsPanel /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
