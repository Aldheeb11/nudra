import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/layout/LegalPage'
import { pageMetadata } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title:       'من نحن',
  description: 'Nudra منصة عربية لاكتشاف منتجات AliExpress الأكثر مبيعاً.',
  path:        '/about',
})

export default function AboutPage() {
  return (
    <LegalPage title="من نحن">
      <p>
        Nudra منصة عربية تساعدك على اكتشاف المنتجات الأكثر مبيعاً على AliExpress دون التنقل بين آلاف الصفحات.
        نعرض المنتجات مرتبة في تصنيفات واضحة مع السعر والتقييم وعدد المبيعات.
      </p>
      <h2>كيف يعمل الموقع</h2>
      <ul>
        <li>نجلب بيانات المنتجات من AliExpress ونحدّثها يومياً.</li>
        <li>عند الضغط على «اشترِ من AliExpress» تنتقل إلى صفحة المنتج هناك.</li>
        <li>الطلب والدفع والشحن والإرجاع تتم كلها عبر AliExpress والبائع، وليس عبر Nudra.</li>
      </ul>
      <h2>كيف نموّل الموقع</h2>
      <p>
        روابط المنتجات روابط إحالة، وقد نحصل على عمولة عند الشراء عبرها دون أي تكلفة إضافية عليك.
        التفاصيل في <Link href="/affiliate-disclosure">إفصاح الإحالة</Link>.
      </p>
      <h2>الاستقلالية</h2>
      <p>Nudra موقع مستقل وغير تابع لـ AliExpress أو مجموعة علي بابا.</p>
    </LegalPage>
  )
}
