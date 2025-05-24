'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // In a real implementation here
      // For now, simulating a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('There was an error submitting your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <Image
            src="/salex-logo.png"
            alt="SaleX Logo"
            width={150}
            height={150}
            className="mx-auto mb-8"
          />
          <h1 className="text-3xl font-bold mb-6">Thank You!</h1>
          <p className="text-lg text-gray-300 mb-8">
            We&apos;ve received your enterprise inquiry and will get back to you
            within 24 hours.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-gray-300 mb-8">
              Interested in SaleX Enterprise? Fill out this form and our team
              will get back to you within 24 hours.
            </p>

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Enterprise Features
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-blue-500 mr-3 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Unlimited team members</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-blue-500 mr-3 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Unlimited deals</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-blue-500 mr-3 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Custom reporting and dashboards</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-blue-500 mr-3 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-blue-500 mr-3 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>SSO integration</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-blue-500 mr-3 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Custom data retention policies</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-800">
              <h3 className="text-lg font-medium mb-2">
                Not ready for Enterprise?
              </h3>
              <p className="text-gray-300 mb-4">
                Check out our Starter and Professional plans which might better
                suit your current needs.
              </p>
              <Link
                href="/#pricing"
                className="inline-block border border-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-blue-300 hover:text-white font-medium transition-colors"
              >
                View All Plans
              </Link>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-6">Enterprise Inquiry</h2>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 mb-4 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company"
                  id="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="teamSize"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Team Size <span className="text-red-500">*</span>
                </label>
                <select
                  name="teamSize"
                  id="teamSize"
                  required
                  value={formData.teamSize}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                >
                  <option value="">Select team size</option>
                  <option value="16-25">16-25</option>
                  <option value="26-50">26-50</option>
                  <option value="51-100">51-100</option>
                  <option value="101-250">101-250</option>
                  <option value="251-500">251-500</option>
                  <option value="501+">501+</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  placeholder="Tell us about your specific requirements..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed px-4 py-3 rounded-md font-medium transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Sending...
                  </span>
                ) : (
                  'Submit Inquiry'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="border-b border-gray-800 backdrop-blur-lg bg-gray-950/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image src="/salex-logo.png" alt="logo" width={90} height={90} />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#pricing"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
