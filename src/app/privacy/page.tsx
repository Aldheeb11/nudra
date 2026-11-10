import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/layout/LegalPage'
import { contactEmail, pageMetadata } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title:       'سياسة الخصوصية',
  description: 'ما البيانات التي يعالجها موقع Nudra وكيف تُستخدم.',
  path:        '/privacy',
})

export default function PrivacyPage() {
  const email = contactEmail()
  return (
    <LegalPage title="سياسة الخصوصية" updated="نوفمبر 2026">
      <p>نوضح هنا ما البيانات التي يعالجها Nudra عند زيارتك للموقع.</p>

      <h2>ما لا نجمعه</h2>
      <ul>
        <li>لا يوجد تسجيل حسابات، ولا نطلب اسمك أو بريدك أو رقم هاتفك.</li>
        <li>لا نعالج أي مدفوعات؛ الشراء يتم على AliExpress.</li>
        <li>لا نضع ملفات تعريف ارتباط للإعلانات أو التتبع.</li>
      </ul>

      <h2>ما يُعالَج تلقائياً</h2>
      <ul>
        <li>
          سجلات الخادم: مزوّد الاستضافة يسجّل بيانات تقنية مثل عنوان IP ونوع المتصفح ووقت الطلب
          لأغراض التشغيل والأمان.
        </li>
        <li>كلمات البحث التي تكتبها تُرسل إلى خادمنا لعرض النتائج ولا تُربط بهويتك.</li>
      </ul>

      <h2>الروابط الخارجية</h2>
      <p>
        عند الضغط على رابط منتج تنتقل إلى AliExpress، وهو موقع مستقل له سياسة خصوصية وملفات تعريف ارتباط خاصة به،
        ومنها ما يُستخدم لنسب عملية الشراء إلى رابط الإحالة. راجع{' '}
        <Link href="/affiliate-disclosure">إفصاح الإحالة</Link>.
      </p>

      <h2>تعديل السياسة</h2>
      <p>قد نحدّث هذه السياسة عند تغيّر طريقة عمل الموقع، ويظهر تاريخ آخر تحديث أعلى الصفحة.</p>

      {email && (
        <>
          <h2>التواصل</h2>
          <p>لأي استفسار عن الخصوصية: <a href={`mailto:${email}`} dir="ltr">{email}</a></p>
        </>
      )}
    </LegalPage>
  )
}
