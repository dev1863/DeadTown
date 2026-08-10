# 🤖 DeadTown Bot — الرفع المجاني 24/7
البوت بدون أي مكتبات خارجية (يستخدم WebSocket المدمج في Node)، لذلك يعمل على أي استضافة
تدعم Node.js 18+ فوراً.

## الخطوات (استضافة bot-hosting.net — مجانية 24/7 بدون بطاقة)

1. افتح https://bot-hosting.net وأنشئ حساباً مجانياً.
2. من لوحة التحكم أنشئ server جديد:
   - **Image/Runtime:** Node.js
   - **SRV Type:** Discord Bot
   - **RAM:** خطة free (500MB تكفي)
3. اضغط **File Manager** وارفع الملفين كاملين من مجلد `bot-deploy`:
   - `bot-presence.js`
   - `package.json`
4. من تبويب **Startup / Variables** أضف متغيّر البيئة:
   - الاسم: `DISCORD_BOT_TOKEN`
   - القيمة: توكن البوت (من https://discord.com/developers/applications)
5. اضغط **Install** (يقوم بتشغيل npm install — سريع جداً لأنه لا توجد تبعيات)
   أو اكتب في الكونسول: `npm i` ثم أعد تشغيل السيرفر.
6. فعّل **Auto Restart** إذا وُجد، وشغّل السيرفر.

## بدائل مجانية أخرى 24/7
- **Kerit Cloud** (kerit.cloud) — نفس الفكرة بلا بطاقة.
- **Wispbyte** — بلا بطاقة.
- **Oracle Cloud Always Free** — VPS حقيقي 24/7، لكنه يحتاج إعداد يدوي.

## ملاحظات
- لا تضع التوكن داخل الكود — دائماً عبر متغيّرات البيئة فقط.
- إذا ضاع التوكن جلب من Developer Portal → Bot → Reset Token.
- البوت يرسل نبضاً كل ~41 ثانية ويتصل تلقائياً عند أي قطع + Watchdog فوري.