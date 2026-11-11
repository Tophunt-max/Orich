# ORich — Vue 3 app + real-data API + admin panel

A fresh, from-scratch build modelled on **ORich 2.1.4** (`com.orich.orichrelease`) — a
group-buy / lucky-draw ("duobao") commerce app with wallet, finance, referrals, daily
tasks, VIP membership and winners. The original is a DCloud **uni-app (Vue)** hybrid app;
this is a clean, readable re-implementation with its own backend and admin panel.

| Folder | Stack | What it is |
|--------|-------|------------|
| `app/`    | Vue 3 + Vite + vue-router + Pinia + vue-i18n | user app (mobile-width H5), English + Hindi |
| `server/` | Node (dependency-free `http`) | real REST API with **persistent data** (`data/state.json`) |
| `admin/`  | Vue 3 + Vite | admin panel to manage everything |

> Built by reverse-engineering the uploaded `ORich_2.1.4_APKPure.xapk` (routes, ~78
> `/index/*` endpoints, brand colours and the app's own icons). The original's remote
> hosts (`api.orich.in`), payment-gateway/push keys and signing secrets are **not** reused;
> this backend is entirely new and self-contained.

## Run

```bash
# 1. backend  →  http://localhost:8788   (persists to server/data/state.json)
cd server && node index.js

# 2. user app →  http://localhost:5188   (/api proxied to :8788)
cd app && npm install && npm run dev

# 3. admin    →  http://localhost:5173   (/admin/api proxied to :8788)
cd admin && npm install && npm run dev    # sign in: admin / admin123
```

Sign in on the app with any phone: tap **Send code**, the demo backend shows the OTP.
Recharge the wallet, then join a group-buy, claim daily tasks, buy VIP, or invest in finance.
Anything you change in the **admin panel** (products, winners, prices, tasks, VIP tiers,
lucky draws, the home notice, user balances) is saved to `state.json` and shows up live in
the app.

## User screens

Home (hot picks + group-buy list + winners + quick entries), Goods detail (join N shares,
live progress), Winners (all / mine), Account (wallet + menu), Recharge, Orders, Finance
(list + detail with projected return), **Daily Tasks**, **VIP membership**, Invitation,
Help. Bottom tabs: Home / Winner / Account. Brand `#de6436`, Hindi + English.

## Admin panel

Dashboard (users, products, orders, revenue by type), CRUD for Products / Winners /
Finance / Tasks / VIP tiers / Lucky draws, a one-click **Draw winner** on a product, Users
(view + adjust balance), Orders (filter by type), and Settings (app name, home notice,
support URL, tab-bar colours). Session-based login (`admin / admin123`).

## API contract (matches the original's shape)

`POST /api/index/<name>`, JSON body, response `{ code, msg, data }` (`code === 1` =
success), bearer `token` header after `/index/login` (phone + OTP). Endpoints mirror the
originals, including 2.1.4 additions: `taskList`/`taskReceive`, `vip`/`vipBuy`,
`luckyList`/`luckyBuy`/`luckyOrderList`, plus `index`, `duobaoitemlist`, `duobaoitemdetail`,
`addorder`, `winnerlist`, `useraccount`, `userbalance`, `rechargelist`, `addrechargepay2`,
`financeList`/`financeDetail`/`financeBuy`, `myteam`, `userinvitelist`.

Screens are in [`docs/screens/`](./docs/screens).

## Not included / notes

- Payments are simulated (wallet top-up is instant); wire a real gateway for production.
- Admin product thumbnails use the app's `/static` paths, so they only render when admin
  and app share an origin (expected in a real deploy).
- Not yet run on a device/emulator; verified via `vite build`, the live API, and headless screenshots.
