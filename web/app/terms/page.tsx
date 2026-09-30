export const metadata = { title: "Terms of Service" };

export default function Terms() {
  return (
    <main className="mx-auto max-w-2xl p-8 space-y-4 text-sm leading-relaxed">
      <p className="border p-3 text-xs opacity-80">
        DRAFT: pending legal review. Do not rely on this as legal advice.
      </p>
      <h1 className="text-2xl font-bold">Terms of Service</h1>
      <p>Last updated: September 30, 2026</p>

      <h2 className="text-lg font-semibold">1. What this service is</h2>
      <p>
        This service is operated by Faiz Rabbani. It collects public building permit
        records published by the City of Columbus, Ohio, sorts them by trade, and lets
        subscribers claim leads to see the project address and the applicant name, and
        to look up a business phone number and website.
      </p>

      <h2 className="text-lg font-semibold">2. Accounts and subscriptions</h2>
      <p>
        You need an account to claim leads. Subscriptions are billed monthly through
        Stripe. Each plan sets how soon you see new leads, how many leads you can claim
        per month, and how many phone lookups you can make per month. Limits reset at the
        start of each calendar month. You can change or cancel your plan at any time from
        Manage subscription. Cancellation takes effect as shown in the billing portal.
        Fees already paid are not refunded unless required by law.
      </p>

      <h2 className="text-lg font-semibold">3. Data sources and accuracy</h2>
      <p>
        Permit information comes from public records and may be late, incomplete, or
        wrong. Phone numbers and websites come from third-party business listings and may
        be missing, outdated, or belong to a different business with a similar name. We
        do not guarantee that any lead is available, open for bidding, or will result in
        work.
      </p>

      <h2 className="text-lg font-semibold">4. Your responsibilities</h2>
      <p>
        You agree to use leads only to offer your own trade services. You are responsible
        for following all laws that apply to your outreach, including telemarketing,
        Do-Not-Call, text message, and email rules. You must check the National Do Not
        Call Registry and any state lists before calling numbers, and you must honor
        opt-out requests. We do not check your outreach for you.
      </p>

      <h2 className="text-lg font-semibold">5. Not allowed</h2>
      <p>
        You may not resell, share, or publish leads or contact details, scrape the
        service, share your account, try to bypass plan limits, or use the service to
        harass anyone or to break the law.
      </p>

      <h2 className="text-lg font-semibold">6. Suspension</h2>
      <p>
        We may suspend or close accounts that break these terms or put the service at
        risk. We may change or end the service at any time.
      </p>

      <h2 className="text-lg font-semibold">7. Disclaimer and liability</h2>
      <p>
        The service is provided as is, without warranties. To the extent allowed by law,
        our total liability to you is limited to the fees you paid in the three months
        before the claim, and we are not liable for lost profits or indirect damages.
      </p>

      <h2 className="text-lg font-semibold">8. Governing law</h2>
      <p>These terms are governed by the laws of the State of Ohio.</p>

      <h2 className="text-lg font-semibold">9. Contact</h2>
      <p>Faiz Rabbani: faizrabbani.035@gmail.com</p>

      <p>
        <a className="underline" href="/privacy">Privacy Policy</a>
      </p>
    </main>
  );
}
