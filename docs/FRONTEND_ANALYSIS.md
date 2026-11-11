# ORich 2.1.4 — Frontend Analysis

> REA se extract kiya gaya deep frontend analysis.
> Source: `ORich_2.1.4_APKPure.xapk` → `com.orich.orichrelease`
> App ID: `__UNI__F330A24` · Framework: **uni-app (Vue 2)**, compiler `3.2.16`

---

## 1. Frontend Stack

- **Framework:** uni-app (Vue 2) — hybrid app (service layer + view layer alag).
- **Bundles:**
  - `app-service.js` (~719 KB) — logic + page templates
  - `app-view.js` (~659 KB) — DOM render layer
  - `view.umd.min.js` (~374 KB) — uni runtime
- **Navigation style:** `custom` — har page apna custom navbar banata hai (system navbar nahi).
- **Entry page:** `pages/home/home`
- **App title:** ORich
- **Design base:** 750 rpx = 375px frame (scale 0.5)

---

## 2. Screens / Pages — total **43**

### Home / Index (2)
| Route | Screen |
|---|---|
| `pages/home/home` | Home — main screen (tab, pull-to-refresh) |
| `pages/index/index` | Index container (webview / empty-title host) |

### Login (2)
| Route | Screen |
|---|---|
| `pages/login/login` | Login — OTP / verification code |
| `pages/login/regist` | Register — naya account + invite code |

### Goods / Group-Buy (3)
| Route | Screen |
|---|---|
| `pages/goods/goods` | Product detail (1₹ group-buy) |
| `pages/goods/comfirm` | Confirm Order |
| `pages/goods/calculation` | Calculation (shares / amount calc) |

### Order (3)
| Route | Screen |
|---|---|
| `pages/order/record` | Order record (my orders list) |
| `pages/order/detail` | Order detail |
| `pages/order/discount` | Discount / coupons |

### Address (2)
| Route | Screen |
|---|---|
| `pages/address/address` | Address list |
| `pages/address/add` | Add / Modify Address |

### Account (8)
| Route | Screen |
|---|---|
| `pages/account/account` | Account home (tab) |
| `pages/account/setting` | Settings |
| `pages/account/aboutus` | About Us |
| `pages/account/service` | Customer service |
| `pages/account/funding` | Funding records |
| `pages/account/username` | Modify username |
| `pages/account/team` | My team |
| `pages/account/teamDetail` | Team detail (direct / indirect invitation) |

### Winner (2)
| Route | Screen |
|---|---|
| `pages/winner/winner` | Winners list (tab) |
| `pages/winner/myShare` | My wins / my share |

### Payment / Wallet (6)
| Route | Screen |
|---|---|
| `pages/payment/payment` | Payment methods / bank list |
| `pages/payment/add` | Add bank / payment method |
| `pages/payment/recharge` | Recharge |
| `pages/payment/cashOut` | Withdraw (cash out) |
| `pages/payment/payrecord` | Recharge record |
| `pages/payment/cashrecord` | Withdrawal record |

### Payform (1)
| Route | Screen |
|---|---|
| `pages/payform/payform` | Payment gateway form (webview) |

### Finance (3)
| Route | Screen |
|---|---|
| `pages/finance/flist` | Finance plans list |
| `pages/finance/fdetail` | Finance plan detail |
| `pages/finance/order` | Finance order |

### Task / VIP (2)
| Route | Screen |
|---|---|
| `pages/task/task` | Mission Rewards — daily tasks (tab) |
| `pages/task/member` | VIP membership / Invite VIP (tab) |

### Game / Lucky (1)
| Route | Screen |
|---|---|
| `pages/game/game` | Lucky Ball — PK / lottery game |

### Prize (1)
| Route | Screen |
|---|---|
| `pages/prize/prize` | More Rewards / dividing the prize |

### Invitation (1)
| Route | Screen |
|---|---|
| `pages/invitation/invitation` | My invitation / invite link |

### Help (2)
| Route | Screen |
|---|---|
| `pages/help/help` | Common Problem / FAQ |
| `pages/help/help_detail` | Help detail |

### Others (4)
| Route | Screen |
|---|---|
| `pages/bask/index` | Post a single (bask / show-off win) |
| `pages/success/index` | Success (payment success) |
| `pages/richtext/rule` | Rule (rich-text rules page) |
| `pages/intro` | Intro / onboarding guide |

---

## 3. Bottom Tab Bar — **5 tabs**

Custom `tabbar` component use hota hai (config me `list:[]` kyunki custom hai). Tabs:

**Home · Winner · Task (missions) · VIP · Account**

Colors (config):
- normal text: `#17273a`
- selected: `#de6436`
- background: `#ffffff`
- height `49px`, font `10px`, icon `20px`

---

## 4. Custom Components — **5**

| Component | Kaam |
|---|---|
| `components/navbar/navbar` | Custom top navbar (har page, navigationStyle custom) |
| `components/tabbar/tabbar` | Custom bottom 5-tab bar |
| `components/marquee/marquee` | Scrolling notice / winner ticker (home pe "rahul*** won…") |
| `components/mescroll-uni/mescroll-body` | Infinite scroll + pull-to-refresh (lists) |
| `components/sharepopup/sharepopup` | Share bottom-sheet (WhatsApp / copy-link / poster) |

---

## 5. Built-in uni-app Widgets (poore app me frequency)

| Widget | Count | Widget | Count |
|---|---|---|---|
| `view` | 1451 | `textarea` | 4 |
| `image` | 185 | `scroll-view` | 2 |
| `text` | 158 | `rich-text` | 2 |
| `input` | 26 | `web-view` | 2 |
| `video` | 9 | `form` | 2 |
| `swiper` | 6 | `button` | 2 |
| `swiper-item` | 6 | `label` | 1 |

Mostly `view` / `text` / `image` based layout; banners/carousel ke liye `swiper`; product videos ke liye `video`; rules/detail ke liye `rich-text`; payment gateway ke liye `web-view`.

---

## 6. Frontend Assets

### Images — ~240 files, 22 folders
| Folder | Count | Folder | Count |
|---|---|---|---|
| goods | 41 | home | 38 |
| account | 29 | member (VIP) | 18 |
| image (root) | 16 | networkimg | 14 |
| tab | 12 | finance | 9 |
| game | 7 | bask | 6 |
| discount | 6 | task | 6 |
| invite | 5 | pay | 4 |
| prize | 4 | share | 4 |
| address | 3 | download | 3 |
| login | 3 | record | 3 |
| faq | 1 | | |

### Fonts — 13
Poora Roboto family (Thin → Black + italics) + `PingFang-Regular`.

---

## 7. Extra frontend features (uni plugins + hybrid)

Separate JS modules jo native-frontend features indicate karte hain:

- `__uniappscan.js` → **QR / barcode scanner**
- `__uniappchooselocation.js` + `__uniappopenlocation.js` → **Map location picker** (address)
- `__uniapppicker.js` → **Picker** (dropdown / date wheel)
- `__uniappquill.js` + `__uniappquillimageresize.js` → **Rich-text editor** (Quill)
- `hybrid/html/js/`: **jQuery**, **ShareThis** (social share), **gtag** (Google Analytics) — webview pages ke andar

---

## Summary

**43 screens**, **5 custom components**, **~13 built-in widget types** (view/text/image-heavy),
**~240 images + 13 fonts**, custom navbar + 5-tab bottom bar, aur
QR-scan / map-picker / rich-text / webview-share jaise frontend features.
