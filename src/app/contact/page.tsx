import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalPage } from '@/components/layout/LegalPage'
import { contactEmail } from '@/lib/site'

export const metadata: Metadata = { title: 'تواصل معنا' }
export const dynamic = 'force-dynamic' // reads CONTACT_EMAIL at request time

export default function ContactPage() {
  const email = contactEmail()
  if (!email) notFound()

  return (
    <LegalPage title="تواصل معنا">
      <p>للاقتراحات أو الإبلاغ عن خطأ في الموقع راسلنا على:</p>
      <p><a href={`mailto:${email}`} dir="ltr">{email}</a></p>
      <p>
        لاستفسارات الطلبات والشحن والاسترجاع يُرجى التواصل مع البائع أو خدمة عملاء AliExpress مباشرة،
        فنحن لا نعالج الطلبات.
      </p>
    </LegalPage>
  )
}
