export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Pricing Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="border rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">Starter</h3>
            <p className="text-3xl font-bold mb-4">Free</p>
            <ul className="text-sm space-y-2 mb-6">
              <li>✓ Basic market analysis</li>
              <li>✓ Up to 5 locations</li>
              <li>✓ Community support</li>
            </ul>
          </div>
          <div className="border rounded-lg p-6 text-center border-primary">
            <h3 className="text-xl font-semibold mb-4">Professional</h3>
            <p className="text-3xl font-bold mb-4">$29/mo</p>
            <ul className="text-sm space-y-2 mb-6">
              <li>✓ Advanced analytics</li>
              <li>✓ Unlimited locations</li>
              <li>✓ AI-powered insights</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
          <div className="border rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
            <p className="text-3xl font-bold mb-4">Custom</p>
            <ul className="text-sm space-y-2 mb-6">
              <li>✓ Custom integrations</li>
              <li>✓ Dedicated support</li>
              <li>✓ White-label options</li>
              <li>✓ SLA guarantees</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}