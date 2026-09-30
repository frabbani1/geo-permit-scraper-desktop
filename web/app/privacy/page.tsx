export const metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl p-8 space-y-4 text-sm leading-relaxed">
      <p className="border p-3 text-xs opacity-80">
        DRAFT: pending legal review. Do not rely on this as legal advice.
      </p>
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p>Last updated: September 30, 2026</p>

      <h2 className="text-lg font-semibold">1. Who we are</h2>
      <p>This service is operated by Faiz Rabbani.</p>

      <h2 className="text-lg font-semibold">2. What we collect from you</h2>
      <p>
        Your email address and login details, your plan and subscription status, which
        leads you claimed, and which phone lookups you made and when. Payments are handled
        by Stripe. We do not see or store your full card number.
      </p>

      <h2 className="text-lg font-semibold">3. Public record data</h2>
      <p>
        The permit data shown in the service (addresses, descriptions, values, and
        applicant names) comes from public records published by the City of Columbus.
        Business phone numbers and websites come from a third-party business listings
        service, and we store each result so the same lookup is not repeated.
      </p>

      <h2 className="text-lg font-semibold">4. How we use it</h2>
      <p>
        To run your account, enforce plan limits, process billing, keep the service secure,
        and fix problems. We do not sell your personal information.
      </p>

      <h2 className="text-lg font-semibold">5. Services we use</h2>
      <p>
        Supabase (database and login), Stripe (payments), Google (business listings
        lookup), and the company hosting the website. These providers process data on our
        behalf under their own terms.
      </p>

      <h2 className="text-lg font-semibold">6. Cookies</h2>
      <p>We use cookies only to keep you signed in.</p>

      <h2 className="text-lg font-semibold">7. Keeping and deleting data</h2>
      <p>
        We keep account data while your account is open. You can ask us to delete your
        account and your data by emailing the address below. We may keep billing records
        as the law requires.
      </p>

      <h2 className="text-lg font-semibold">8. Businesses listed in the data</h2>
      <p>
        If you are listed as an applicant or contractor and want a contact detail removed
        from the service, email us with the permit number and we will review the request.
      </p>

      <h2 className="text-lg font-semibold">9. Changes</h2>
      <p>We may update this policy and will change the date above when we do.</p>

      <h2 className="text-lg font-semibold">10. Contact</h2>
      <p>Faiz Rabbani: faizrabbani.035@gmail.com</p>

      <p>
        <a className="underline" href="/terms">Terms of Service</a>
      </p>
    </main>
  );
}
