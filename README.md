# Nudra

منصة عربية لاكتشاف منتجات AliExpress الأكثر مبيعاً. الموقع يعرض المنتجات فقط؛ الشراء يتم على AliExpress عبر روابط إحالة.

مبني على Next.js 16 (App Router) و React 19 و Tailwind 4 و Postgres.

## كيف يعمل

```
AliExpress Affiliate API ──(/api/sync يومياً)──▶ Postgres ──▶ الصفحات
```

- **المزامنة**: Vercel Cron يستدعي `/api/sync` يومياً الساعة 03:00 UTC (`vercel.json`). لكل تصنيف تُجلب المنتجات الأكثر مبيعاً وتُحفظ في جدول `products`، وتُحذف المنتجات التي لم تظهر منذ 7 أيام.
- **القراءة**: الصفحات تقرأ من Postgres عبر `src/lib/products.ts` مع كاش لمدة ساعة يُمسح بعد كل مزامنة.
- **بدون `DATABASE_URL`**: يعرض الموقع كتالوجاً تجريبياً من 6 منتجات (للتطوير المحلي فقط).

## التشغيل محلياً

يتطلب Node.js 22 أو أحدث.

```bash
npm install
cp .env.example .env.local   # اختياري: بدونه يعمل الموقع على الكتالوج التجريبي
npm run dev
```

ثم افتح http://localhost:3000

## متغيرات البيئة

| المتغير | مطلوب | الوصف |
| --- | --- | --- |
| `DATABASE_URL` | للإنتاج | رابط Postgres (النسخة pooled في Neon أو Supabase) |
| `ALIEXPRESS_APP_KEY` | للمزامنة | مفتاح التطبيق من AliExpress Open Platform |
| `ALIEXPRESS_APP_SECRET` | للمزامنة | السر المستخدم لتوقيع الطلبات |
| `ALIEXPRESS_TRACKING_ID` | للمزامنة | معرّف التتبع لروابط الإحالة |
| `CRON_SECRET` | للمزامنة | يحمي `/api/sync`؛ بدونه يرفض المسار كل الطلبات |
| `ALIEXPRESS_LANGUAGE` | لا | لغة العناوين، الافتراضي `AR` |
| `ALIEXPRESS_SHIP_TO` | لا | بلد الشحن، الافتراضي `AE` |
| `ALIEXPRESS_PAGES_PER_CATEGORY` | لا | عدد الصفحات (50 منتجاً) لكل تصنيف، الافتراضي `2` |
| `NEXT_PUBLIC_SITE_URL` | لا | دومين الموقع لوسوم SEO؛ يُكتشف تلقائياً على Vercel |
| `CONTACT_EMAIL` | لا | يفعّل صفحة «تواصل معنا» ورابطها في التذييل |

## تشغيل المزامنة يدوياً

الجدول يُنشأ تلقائياً عند أول مزامنة.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-domain>/api/sync
```

الرد يعرض عدد المنتجات المحفوظة لكل تصنيف وأي خطأ أرجعه AliExpress.

## الأوامر

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | خادم التطوير |
| `npm run build` | بناء الإنتاج |
| `npm run lint` | ESLint |
| `npm test` | الاختبارات (Vitest) |
| `npm run typecheck` | فحص الأنواع (بعد `build` أو `dev` لتوليد أنواع المسارات) |

## بنية المشروع

```
src/app/                  الصفحات ومسارات الـAPI
  api/products/           صفحات المنتجات للتمرير اللانهائي
  api/sync/               مزامنة AliExpress (cron)
  category/[slug]/        صفحة التصنيف
  products/               كل المنتجات والبحث، و [id] لصفحة المنتج
src/components/           الشريط العلوي، التذييل، بطاقة وشبكة المنتجات
src/lib/
  aliexpress.ts           عميل الـAPI الموقّع وربط التصنيفات
  sync.ts                 منطق المزامنة
  db.ts                   اتصال Postgres وإنشاء الجدول
  products.ts             طبقة القراءة والكاش
  catalog.ts              التصنيفات والكتالوج التجريبي
  site.ts                 إعدادات الموقع ووسوم SEO
tests/                    اختبارات Vitest
```

## إضافة تصنيف

1. أضف التصنيف إلى `CATEGORIES` في `src/lib/catalog.ts`.
2. أضف أرقام تصنيفات AliExpress المقابلة له إلى `ALI_CATEGORY_IDS` في `src/lib/aliexpress.ts`.
