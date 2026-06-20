# Web Anika Menclová — nasazení (po migraci z Base44)

Web běží na **Supabase** (projekt `anika-web`, eu-central-1) místo Base44.
Frontend je původní (vzhled 1:1), jen datová vrstva je přepojená.

## Nasazení na Vercel
1. Import projektu (tato složka) do Vercelu — framework **Vite**.
2. Environment Variables (Production i Preview):
   - `VITE_SUPABASE_URL` = https://noglyqwmkhezadvbtsiu.supabase.co
   - `VITE_SUPABASE_ANON_KEY` = sb_publishable_00R27sMZzZfssy8MvMaK6A_vPmLTC_0
   - `VITE_WEB3FORMS_KEY` = (až bude) — pro odesílání kontaktního formuláře na e-mail
3. Build command `npm run build`, output `dist`. vercel.json řeší SPA routing.
4. Po ověření: doména anikamenclova.cz → přepnout DNS na Wedosu na Vercel, pak zrušit Base44.

## Admin (Anika)
- /Admin → přihlášení e-mailem + heslem (Supabase Auth).
- Uživatele vytvořit v Supabase dashboardu: Authentication → Users → Add user.

## Co spravuje Anika sama
Galerie (fotky), termíny, hudba, text O mně, zprávy z formuláře — vše v /Admin.

## Kontaktní formulář
Zprávy se ukládají do DB (vidí je admin) a posílají na e-mail přes Web3Forms
(zdarma, založit access key na web3forms.com → vložit do VITE_WEB3FORMS_KEY).
