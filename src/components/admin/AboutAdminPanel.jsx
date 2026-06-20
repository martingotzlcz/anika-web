import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, Loader2, Bold, Italic, Type } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DEFAULT_BIO = `DIVADLO
2025 Jihočeské divadlo – Café Groll (Růžena)
2025 Jihočeské divadlo – Poslední víkend (zpěvačka)
2025 Divadlo Hybernia – Divotvorný hrnec (company)
2025 Jihočeské divadlo – Evita (company)
2022 Jihočeské divadlo – Hej Mistře (Anna Rybová, Madona)
2022 Divadlo Lucie Bílé – Karol a Kvído (Lůca)
2020 Divadlo Na Fidlovačce – Sugar (Barbara)

FILM
Poslední mejdan (2025) – role Simony
Holka od vedle (2025) – role Evy

SERIÁLY
Štěstíčku naproti – hosteska
ZOO Nové začátky – Tamara Skalická
Slunečná – role Vendulky Holé
Krejzovi – role Kláry Čechové
Polda III. – role studentky

DABING
Harry Potter 20 let filmové magie (Bonnie Wright)
Elvis (sbory)
Harley Quinn (Queen of Fables, Batgirl, Nora)
Autoparta (Bridget, Aimee)

VOICEOVERY
Lejaan, Bioderma, Vekra

TELEVIZE
ProSieben – Rockin' Prag

REKLAMY
Honor – 2025
Nice to fit you – 2025
Lékárna.cz – 2023
Briliantina – 2012

ROZHLAS
Hovory s mámou
Slečny Brontëovy

VZDĚLÁNÍ
FF Univerzity Karlovy, katedra divadelní vědy
Pražská konzervatoř, obor hudebně dramatický

JAZYKY
Anglický jazyk B2
Německý jazyk B2

ZÁJMY
herectví, zpěv, tanec, dabing, housle, gymnastika, plavání, snowboarding, cestování, moderování`;

export default function AboutAdminPanel() {
  const [bioText, setBioText] = useState(DEFAULT_BIO);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const list = await base44.entities.SiteSettings.list();
      return list[0] || null;
    },
  });

  useEffect(() => {
    if (settings?.bio_text) {
      setBioText(settings.bio_text);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    if (settings) {
      await base44.entities.SiteSettings.update(settings.id, { bio_text: bioText });
    } else {
      await base44.entities.SiteSettings.create({ artist_name: 'Anika Menclová', bio_text: bioText });
    }
    queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
    setSaving(false);
  };

  const applyFormat = (tag) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = bioText.substring(start, end);
    
    if (selectedText) {
      const before = bioText.substring(0, start);
      const after = bioText.substring(end);
      const formatted = `<${tag}>${selectedText}</${tag}>`;
      setBioText(before + formatted + after);
    }
  };

  const applyFontSize = (size) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = bioText.substring(start, end);
    
    if (selectedText) {
      const before = bioText.substring(0, start);
      const after = bioText.substring(end);
      const formatted = `<span class="text-${size}">${selectedText}</span>`;
      setBioText(before + formatted + after);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Načítám...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-[#1e3a5f]">Správa stránky O mně</h2>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="gap-2 bg-[#1e3a5f] hover:bg-[#2a4a6f]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Uložit
        </Button>
      </div>

      <Card className="p-4">
        <p className="text-sm text-gray-500 mb-3">
          Označte text a použijte tlačítka pro formátování. Podporované tagy: &lt;b&gt;tučné&lt;/b&gt;, &lt;i&gt;kurzíva&lt;/i&gt;, &lt;span class="text-lg"&gt;velikost&lt;/span&gt;
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormat('b')}
            className="gap-1"
          >
            <Bold className="w-4 h-4" />
            Tučné
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormat('i')}
            className="gap-1"
          >
            <Italic className="w-4 h-4" />
            Kurzíva
          </Button>
          <Select onValueChange={applyFontSize}>
            <SelectTrigger className="w-32 h-9">
              <Type className="w-4 h-4 mr-1" />
              <SelectValue placeholder="Velikost" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">Velmi malé</SelectItem>
              <SelectItem value="sm">Malé</SelectItem>
              <SelectItem value="base">Normální</SelectItem>
              <SelectItem value="lg">Velké</SelectItem>
              <SelectItem value="xl">Velmi velké</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <textarea
          ref={editorRef}
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          placeholder="Zadejte text pro stránku O mně..."
          rows={25}
          className="w-full font-mono text-sm p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
        />
      </Card>
    </div>
  );
}