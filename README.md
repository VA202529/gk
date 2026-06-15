# Glans & Klasse website

TanStack Start website voor Glans & Klasse, een schoonmaakbedrijf in Amsterdam. De huidige site bevat publieke pagina's voor home, diensten, over ons, reviews en contact/offerte.

## Huidige techniek

- TanStack Start
- TanStack Router
- React
- TypeScript
- Tailwind CSS
- shadcn/Radix UI componenten
- Lucide icons
- Google Sheets + Google Apps Script voor leads, berichten, offertes en reviews
- Supabase integratie is nog aanwezig in de codebase, maar de publieke reviewflow is nu voorbereid op Google Sheets
- Vite build/dev tooling

## Belangrijke scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

## Huidige paginas

| Route       | Bestand                   | Doel                                                        |
| ----------- | ------------------------- | ----------------------------------------------------------- |
| `/`         | `src/routes/index.tsx`    | Homepage met hero, diensten-preview, werkgebied en CTA      |
| `/diensten` | `src/routes/diensten.tsx` | Overzicht van schoonmaakdiensten                            |
| `/over-ons` | `src/routes/over-ons.tsx` | Bedrijfsverhaal, quote en kernwaarden                       |
| `/reviews`  | `src/routes/reviews.tsx`  | Publieke goedgekeurde reviews uit Google Sheets             |
| `/contact`  | `src/routes/contact.tsx`  | Contactgegevens, offerteformulier, bericht/review-formulier |

De gedeelde header, footer en layout staan in `src/components/Layout.tsx`.

## Huidige dynamische data

De nieuwe backoffice bestaat uit:

- `public/admin/`
- `public/admin/index.html`
- `public/admin/style.css`
- `public/admin/app.js`
- `public/admin.html` als redirect naar `/admin/`
- `google-apps-script/Code.gs`
- `src/lib/google-sheets.ts`

De publieke site gebruikt `VITE_GOOGLE_APPS_SCRIPT_URL` om met de Google Apps Script Web App te praten.

```env
VITE_GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/DEPLOYMENT_ID/exec"
```

Reviews, contactberichten en offerteaanvragen zijn voorbereid op Google Sheets.

Supabase bestaat nog in het project, inclusief oude migratie:

Database:

- Tabel: `reviews`
- Migratie: `supabase/migrations/20260608214106_28b3716c-14b4-4773-82c8-b35b08b5d2a8.sql`

Velden:

- `id`
- `name`
- `rating`
- `message`
- `approved`
- `created_at`

De reviews-pagina leest alleen goedgekeurde reviews:

```ts
.from("reviews")
.select("id, name, rating, message, created_at")
.eq("approved", true)
```

De nieuwe reviewflow schrijft reviews naar Google Sheets met `approved = FALSE`, zodat ze eerst via `admin.html` gecontroleerd kunnen worden.

## Huidige formulieren

Er staan twee formuliergebieden op de contactpagina.

### Offerteformulier

Het formulier "Offerte aanvragen" schrijft nu naar de Apps Script backend. De backend slaat de aanvraag op in `QuoteRequests` en maakt ook een record in `Leads`.

### Bericht/review-formulier

Dit formulier heeft twee standen:

- Prive bericht
- Openbare review

Reviews en prive berichten worden nu naar de Apps Script backend gestuurd. Reviews komen in `Reviews`; prive berichten komen in `ContactMessages` en maken ook een `Leads` record.

## Google Sheets backoffice

Er is een apart admin-dashboard aangemaakt met alleen:

- HTML
- CSS
- JavaScript
- Google Sheets
- Google Apps Script Web App als backend

De TanStack-site blijft de publieke website. Het admin-dashboard is een losse statische pagina:

```text
public/admin/index.html
```

Google Apps Script fungeert als API-laag tussen het dashboard/de website en Google Sheets.

```text
admin.html / website
  -> fetch()
Google Apps Script Web App
  -> SpreadsheetApp
Google Sheets
```

## Mappenstructuur backoffice

```text
public/
  admin.html
  admin/
    index.html
    style.css
    app.js

google-apps-script/
  Code.gs
```

## Aanbevolen Google Sheets tabbladen

De Apps Script-backend moet bij eerste setup automatisch deze tabs en kolommen aanmaken. Bestaande tabbladen mogen niet worden gewist of overschreven.

### Reviews

| Kolom         | Doel                             |
| ------------- | -------------------------------- |
| id            | Unieke ID                        |
| created_at    | Aanmaakdatum                     |
| updated_at    | Laatste wijziging                |
| name          | Publieke naam                    |
| email         | Prive e-mail, niet publiek tonen |
| rating        | Score 1-5                        |
| message       | Reviewtekst                      |
| approved      | TRUE/FALSE                       |
| featured      | TRUE/FALSE                       |
| source        | website/admin                    |
| status        | new/approved/rejected            |
| internal_note | Interne notitie                  |

### ContactMessages

| Kolom         | Doel                      |
| ------------- | ------------------------- |
| id            | Unieke ID                 |
| created_at    | Aanmaakdatum              |
| updated_at    | Laatste wijziging         |
| name          | Naam                      |
| email         | E-mail                    |
| phone         | Telefoon                  |
| subject       | Onderwerp                 |
| message       | Bericht                   |
| consent       | AVG-toestemming           |
| status        | new/read/replied/archived |
| assigned_to   | Verantwoordelijke         |
| internal_note | Interne notitie           |

### QuoteRequests

| Kolom          | Doel                                         |
| -------------- | -------------------------------------------- |
| id             | Unieke ID                                    |
| created_at     | Aanmaakdatum                                 |
| updated_at     | Laatste wijziging                            |
| name           | Naam                                         |
| email          | E-mail                                       |
| phone          | Telefoon                                     |
| space_type     | woning/kantoor/horeca/anders                 |
| frequency      | eenmalig/wekelijks/tweewekelijks/maandelijks |
| address_area   | Buurt of plaats                              |
| size           | Omvang, kamers of m2                         |
| preferred_date | Voorkeursdatum                               |
| message        | Aanvraagtekst                                |
| status         | new/contacted/quoted/won/lost                |
| quote_amount   | Intern offertebedrag                         |
| follow_up_date | Opvolgdatum                                  |
| internal_note  | Interne notitie                              |

### Leads

| Kolom              | Doel                                   |
| ------------------ | -------------------------------------- |
| id                 | Unieke ID                              |
| created_at         | Aanmaakdatum                           |
| updated_at         | Laatste wijziging                      |
| name               | Naam                                   |
| email              | E-mail                                 |
| phone              | Telefoon                               |
| source             | website/admin                          |
| lead_type          | quote/message/manual                   |
| status             | new/contacted/quoted/won/lost/archived |
| priority           | normal/high/low                        |
| next_follow_up     | Opvolgdatum                            |
| last_contact_at    | Laatste contactmoment                  |
| quote_request_id   | Koppeling naar offerteaanvraag         |
| contact_message_id | Koppeling naar contactbericht          |
| review_id          | Koppeling naar review                  |
| value              | Potentiele waarde                      |
| internal_note      | Interne notitie                        |

### Services

| Kolom       | Doel                                   |
| ----------- | -------------------------------------- |
| id          | Unieke ID                              |
| created_at  | Aanmaakdatum                           |
| updated_at  | Laatste wijziging                      |
| title       | Dienstnaam                             |
| subtitle    | Korte intro                            |
| description | Lange omschrijving                     |
| bullets     | Bullets, gescheiden door nieuwe regels |
| icon        | Icon-sleutel                           |
| sort_order  | Volgorde                               |
| active      | TRUE/FALSE                             |
| featured    | TRUE/FALSE                             |

### WebsiteContent

| Kolom      | Doel                                       |
| ---------- | ------------------------------------------ |
| id         | Unieke ID                                  |
| page       | Pagina, bijvoorbeeld home/contact/diensten |
| section    | Sectie, bijvoorbeeld hero/cta/footer       |
| key        | title/subtitle/body/cta_label              |
| value      | Waarde                                     |
| active     | TRUE/FALSE                                 |
| updated_at | Laatste wijziging                          |

### Portfolio

| Kolom            | Doel              |
| ---------------- | ----------------- |
| id               | Unieke ID         |
| created_at       | Aanmaakdatum      |
| updated_at       | Laatste wijziging |
| title            | Projecttitel      |
| category         | Categorie         |
| location         | Locatie           |
| description      | Omschrijving      |
| image_url        | Afbeelding        |
| before_image_url | Voor-afbeelding   |
| after_image_url  | Na-afbeelding     |
| featured         | TRUE/FALSE        |
| active           | TRUE/FALSE        |
| sort_order       | Volgorde          |

### Settings

| Kolom      | Doel                        |
| ---------- | --------------------------- |
| key        | Instellingnaam              |
| value      | Waarde                      |
| type       | text/email/url/boolean/json |
| public     | TRUE/FALSE                  |
| group      | contact/social/seo/etc.     |
| updated_at | Laatste wijziging           |

### Admins

| Kolom         | Doel                  |
| ------------- | --------------------- |
| id            | Unieke ID             |
| username      | Gebruikersnaam        |
| passcode_hash | Gehashte toegangscode |
| role          | owner/editor/viewer   |
| active        | TRUE/FALSE            |
| last_login_at | Laatste login         |
| created_at    | Aanmaakdatum          |

### ActivityLogs

| Kolom      | Doel                       |
| ---------- | -------------------------- |
| id         | Unieke ID                  |
| created_at | Datum                      |
| actor      | admin/user/system          |
| action     | create/update/delete/login |
| table      | Tabblad                    |
| record_id  | Gekoppelde rij             |
| details    | Details als tekst of JSON  |
| result     | success/error              |

## Benodigde Apps Script acties

De backend moet minimaal deze acties ondersteunen:

- `setup`
- `login`
- `list`
- `get`
- `create`
- `update`
- `delete`
- `export`
- `submitContact`
- `submitQuote`
- `submitReview`
- `publicReviews`
- `publicServices`
- `publicSettings`

Belangrijke functies in Apps Script:

```js
doGet(e);
doPost(e);
setupSpreadsheet();
ensureSheet(name, columns);
ensureColumns(sheet, columns);
jsonResponse(data);
errorResponse(message, code);
authenticate(payload);
requireAuth(payload);
listRecords(sheetName, options);
getRecord(sheetName, id);
createRecord(sheetName, data);
updateRecord(sheetName, id, data);
deleteRecord(sheetName, id);
appendLog(action, table, recordId, details);
generateId(prefix);
```

## Admin-dashboard onderdelen

Het toekomstige `admin.html` dashboard krijgt:

- Login met toegangscode
- Dashboard-overzicht
- Reviews beheer
- Contactberichten beheer
- Offerteaanvragen beheer
- Diensten beheer
- Website content beheer
- Portfolio beheer
- Instellingen beheer
- Admin gebruikers
- Activiteiten/logs

Per onderdeel zijn nodig:

- Tabelweergave
- Zoeken/filteren
- Nieuw item toevoegen
- Item bewerken
- Opslaan
- Verwijderen of archiveren
- Verversen
- Exporteren naar CSV
- Loading/error states

## Datastromen

### Review plaatsen

```text
Website formulier
-> Apps Script submitReview
-> Reviews tab
-> Admin keurt goed
-> Website haalt publicReviews op
-> Alleen approved reviews worden getoond
```

### Offerte aanvragen

```text
Website offerteformulier
-> Apps Script submitQuote
-> QuoteRequests tab
-> E-mailmelding naar bedrijf
-> Admin past status aan
-> ActivityLogs schrijft update
```

### Admin bewerking

```text
admin.html
-> login
-> token ontvangen
-> list/create/update/delete
-> Apps Script valideert token en data
-> Google Sheet wordt bijgewerkt
-> ActivityLogs schrijft wijziging
-> JSON response terug naar admin.html
```

## Beveiligingsnotities

- Prive data zoals e-mail, telefoon, adressen en interne notities mag nooit via publieke endpoints worden teruggegeven.
- Reviews mogen pas publiek zichtbaar zijn bij `approved = TRUE`.
- Offerteaanvragen en contactberichten zijn altijd prive.
- Delete bij voorkeur als soft delete of archive-status uitvoeren.
- Alle admin-acties moeten gelogd worden.
- Voeg honeypot/spamcontrole toe aan publieke formulieren.
- Gebruik een sessietoken na login en sla die tijdelijk op in `sessionStorage`.

## Bouwvolgorde

1. Apps Script `setupSpreadsheet()` maken.
2. Automatisch tabs en kolommen laten aanmaken.
3. JSON API met `doGet` en `doPost` maken.
4. CRUD-acties voor toegestane tabs maken.
5. Login/toegangscode toevoegen.
6. `public/admin.html` maken.
7. Admin navigatie en tabelweergave bouwen.
8. Reviews beheren.
9. Offerteaanvragen beheren.
10. Contactberichten beheren.
11. Diensten en instellingen beheren.
12. Logs toevoegen.
13. Website-formulieren koppelen aan Apps Script.
14. Publieke data uit Sheets koppelen aan de TanStack-site.

## Status

Huidig:

- Publieke TanStack-site bestaat.
- `google-apps-script/Code.gs` is aangemaakt.
- `public/admin.html` is aangemaakt.
- `src/lib/google-sheets.ts` is aangemaakt.
- Offerteaanvragen schrijven naar Google Sheets zodra `VITE_GOOGLE_APPS_SCRIPT_URL` is ingesteld.
- Prive berichten schrijven naar Google Sheets zodra `VITE_GOOGLE_APPS_SCRIPT_URL` is ingesteld.
- Reviews schrijven naar Google Sheets en worden pas publiek getoond na goedkeuring.

## Setup stappen

1. Maak een nieuwe Google Sheet.
2. Open `Extensies > Apps Script`.
3. Plak de inhoud van `google-apps-script/Code.gs` in Apps Script.
4. Sla het script op.
5. Deploy als Web App.
6. Zet toegang op de gewenste doelgroep, meestal "Iedereen met de link" voor publieke formulierinzendingen.
7. Open de Web App URL met `?action=setup`.
8. Vul de Web App URL in bij `VITE_GOOGLE_APPS_SCRIPT_URL` in `.env`.
9. Open `/admin.html`.
10. Log in met de eerste standaardgegevens: `admin` / `123456`.
11. Wijzig de standaard toegangscode direct via de `Admins` tab.

Na wijzigingen in `google-apps-script/Code.gs` moet de Apps Script Web App opnieuw gedeployed worden. De huidige code doet de zware Sheet-setup alleen nog bij eerste initialisatie of bij `?action=setup`, zodat formulierinzendingen sneller reageren.
