# ZELZAL CHAT Android

هذا المشروع يحول موقع ZELZAL CHAT إلى تطبيق Android WebView.

## الرابط المدمج
https://zziis.github.io/Z/

## أسرع طريقة للحصول على APK من الهاتف فقط
1. أنشئ مستودع GitHub جديدًا، مثل: `ZELZAL-CHAT-Android`.
2. ارفع محتويات هذا المجلد إلى المستودع (بما فيها مجلد `.github`).
3. افتح تبويب **Actions** في GitHub.
4. اختر **Build ZELZAL CHAT APK** ثم **Run workflow**، أو انتظر التشغيل التلقائي بعد الرفع.
5. بعد نجاح البناء افتح الـ workflow ثم قسم **Artifacts**.
6. نزّل `ZELZAL-CHAT-APK`، وفك الضغط لتحصل على `app-debug.apk`.
7. ثبّت APK على Android (قد تحتاج السماح بالتثبيت من هذا المصدر).

## المزايا
- اسم التطبيق: ZELZAL CHAT
- يفتح الموقع مباشرة داخل التطبيق
- JavaScript وDOM Storage مفعّلان للعمل مع تطبيق الويب/Supabase
- حفظ الكوكيز والجلسة
- زر الرجوع يتنقل داخل الموقع قبل إغلاق التطبيق
- اختيار الملفات من الهاتف مدعوم
- الروابط الخارجية تفتح في تطبيق/متصفح خارجي
- يمنع HTTP غير المشفر وMixed Content

## تعديل رابط الموقع
افتح:
`app/src/main/java/com/zelzal/chat/MainActivity.java`
وعدّل `START_URL` و `ALLOWED_HOST`.

## ملاحظة مهمة
هذا WebView؛ سرعة تحميل البيانات تعتمد على سرعة موقع GitHub Pages وSupabase والإنترنت. الميزة الأساسية هي تجربة التطبيق المثبت، وليس تحويل الموقع إلى تطبيق Native كامل.
