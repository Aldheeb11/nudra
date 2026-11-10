import type { Metadata } from 'next'
import { LegalPage } from '@/components/layout/LegalPage'

export const metadata: Metadata = {
  title: 'إفصاح الإحالة',
  description: 'كيف يحصل Nudra على عمولات من روابط الإحالة إلى AliExpress.',
}

export default function AffiliateDisclosurePage() {
  return (
    <LegalPage title="إفصاح الإحالة" updated="نوفمبر 2026">
      <p>
        Nudra مشارك في برنامج الإحالة الخاص بـ AliExpress. جميع أزرار «اشترِ من AliExpress» في الموقع روابط إحالة.
      </p>
      <h2>ماذا يعني ذلك</h2>
      <ul>
        <li>إذا اشتريت بعد الضغط على أحد روابطنا فقد نحصل على عمولة من AliExpress.</li>
        <li>السعر الذي تدفعه لا يزيد بسبب العمولة.</li>
        <li>AliExpress قد يستخدم ملفات تعريف ارتباط على موقعه لنسب عملية الشراء إلينا.</li>
      </ul>
      <h2>الأسعار والمعلومات</h2>
      <p>
        الأسعار والتقييمات وأعداد المبيعات المعروضة مصدرها AliExpress وتُحدَّث يومياً، وقد تتغير بين تحديث وآخر.
        السعر النهائي وتكلفة الشحن وتوفّر المنتج هي ما يظهر على AliExpress وقت الشراء.
      </p>
      <h2>ترتيب المنتجات</h2>
      <p>تُرتَّب المنتجات حسب عدد المبيعات على AliExpress، ولا ندرج منتجات مقابل مبالغ مدفوعة من البائعين.</p>
    </LegalPage>
  )
}
