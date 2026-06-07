# Renove AI — Mise en production

## URL en ligne

- **Production Vercel :** https://renove-ai.vercel.app
- **Domaine cible :** https://renoveai.com (à connecter)

Chaque push sur `main` redéploie automatiquement via GitHub.

---

## 1. Domaine renoveai.com (Vercel)

1. [vercel.com](https://vercel.com) → projet **renove-ai** → **Settings** → **Domains**
2. Ajoute `renoveai.com` et `www.renoveai.com`
3. Configure les DNS chez ton registrar (records indiqués par Vercel)
4. Une fois actif, mets à jour sur Vercel :
   ```
   NEXT_PUBLIC_APP_URL=https://renoveai.com
   ```
5. Redéploie (ou push un commit)

---

## 2. Supabase (obligatoire)

### SQL déjà à exécuter si pas fait
- `supabase/schema.sql` — tables profiles + generations
- `supabase/storage.sql` — buckets originals + generated

### Auth — URLs de redirection
Dashboard Supabase → **Authentication** → **URL Configuration** :

| Champ | Valeur |
|-------|--------|
| Site URL | `https://renoveai.com` |
| Redirect URLs | `https://renoveai.com/**` |
| | `https://renove-ai.vercel.app/**` |

### Google OAuth (optionnel)
Callback Google : `https://zokolrnfpajsmawmlpry.supabase.co/auth/v1/callback`

---

## 3. Stripe Webhook (obligatoire pour les abonnements)

1. [dashboard.stripe.com](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. **Add endpoint** : `https://renoveai.com/api/stripe/webhook`
   (ou `https://renove-ai.vercel.app/api/stripe/webhook` en attendant le domaine)
3. Événements à écouter :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copie le **Signing secret** (`whsec_...`)
5. Mets à jour sur Vercel :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
6. Redéploie

---

## 4. Variables d'environnement Vercel

Déjà configurées en production :

| Variable | Statut |
|----------|--------|
| `KIE_API_KEY` | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ |
| `STRIPE_SECRET_KEY` | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ |
| `STRIPE_PRICE_WEEKLY` | ✅ |
| `STRIPE_PRICE_MONTHLY` | ✅ |
| `NEXT_PUBLIC_APP_URL` | ✅ → `https://renoveai.com` |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ À mettre à jour après création du webhook |

Gérer sur : Vercel → renove-ai → **Settings** → **Environment Variables**

---

## 5. Tester le funnel en production

1. https://renove-ai.vercel.app/upload → upload photo + style
2. Génération IA → preview flouté
3. Pricing → signup → Stripe checkout
4. Dashboard → créations sauvegardées

---

## Repo GitHub

https://github.com/Milo-adonos/RenoveAI
