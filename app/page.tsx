'use client';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import {
  LineChart,
  ArrowUpRight,
  Users,
  PieChart,
  DollarSign,
  BarChart,
  Menu,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="border-b border-gray-800 backdrop-blur-lg bg-gray-950/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image src="/salex-logo.png" alt="logo" width={90} height={90} />
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Testimonials
              </Link>
              <Link
                href="#faq"
                className="text-gray-300 hover:text-white transition-colors"
              >
                FAQ
              </Link>
              <div className="hidden md:block">
                <AuthButtons />
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <div className="sm:hidden">
              <AuthButtons />
            </div>
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="#features"
              className="block text-gray-300 hover:text-white transition-colors py-2"
              onClick={toggleMenu}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="block text-gray-300 hover:text-white transition-colors py-2"
              onClick={toggleMenu}
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="block text-gray-300 hover:text-white transition-colors py-2"
              onClick={toggleMenu}
            >
              Testimonials
            </Link>
            <Link
              href="#faq"
              className="block text-gray-300 hover:text-white transition-colors py-2"
              onClick={toggleMenu}
            >
              FAQ
            </Link>
            <div className="hidden xs:block sm:hidden pt-2">
              <AuthButtons />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function AuthButtons() {
  const { userId } = useAuth();

  if (userId) {
    return (
      <Link href="/dashboard" className="inline-block">
        <button className="border border-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-2 rounded-md text-white font-medium transition-colors text-sm sm:text-base">
          Access Dashboard
        </button>
      </Link>
    );
  }

  return (
    <div className="flex flex-row gap-2 sm:gap-4">
      <Link href="/sign-in" className="inline-block">
        <button className="bg-blue-600 hover:bg-blue-700 px-3 sm:px-6 py-2 rounded-lg text-white font-medium transition-colors text-sm sm:text-base">
          Sign In
        </button>
      </Link>
      <Link href="/sign-up" className="inline-block">
        <button className="border-2 border-blue-600 hover:bg-blue-600 hover:text-white px-3 sm:px-6 py-2 rounded-lg text-blue-600 font-medium transition-colors text-sm sm:text-base">
          Sign Up
        </button>
      </Link>
    </div>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              Supercharge Your Sales Management
            </h1>
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl">
              Salex helps you track deals, analyze performance, and close more
              sales with our intuitive dashboard and powerful analytics.
            </p>
            <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <button className="w-full px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                  Get Started Free
                </button>
              </Link>
              <Link href="#demo" className="w-full sm:w-auto">
                <button className="w-full px-6 sm:px-8 py-3 border border-gray-700 hover:border-gray-500 rounded-lg font-medium transition-colors">
                  View Demo
                </button>
              </Link>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center text-gray-400 text-sm sm:text-base">
              <span className="flex items-center">
                <svg
                  className="h-5 w-5 text-blue-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                No credit card required
              </span>
              <span className="hidden sm:inline-block mx-4">•</span>
              <span className="mt-2 sm:mt-0">14-day free trial</span>
            </div>
          </div>
          <div className="mt-8 lg:mt-0 rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-900">
            <Image
              width={500}
              height={500}
              src="/dashboard-preview.png"
              alt="Salex Dashboard"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Features() {
  const features = [
    {
      title: 'Deal Tracking',
      description:
        'Monitor all your deals in one place with status updates and priority levels.',
      icon: <ArrowUpRight className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />,
    },
    {
      title: 'Performance Analytics',
      description:
        "Track your team's performance with detailed conversion metrics and reports.",
      icon: <LineChart className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />,
    },
    {
      title: 'Sales Pipeline',
      description:
        'Visualize your entire sales funnel from lead generation to closed deals.',
      icon: <BarChart className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />,
    },
    {
      title: 'Team Management',
      description:
        'Assign deals to team members and track individual performance.',
      icon: <Users className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />,
    },
    {
      title: 'Revenue Forecasting',
      description:
        'Predict future revenue based on your current pipeline and historical data.',
      icon: <PieChart className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />,
    },
    {
      title: 'Commission Tracking',
      description:
        'Automatically calculate and track commissions for your sales team.',
      icon: <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />,
    },
  ];

  return (
    <div id="features" className="py-12 sm:py-16 lg:py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Powerful Features to Boost Your Sales
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to manage and grow your sales pipeline
            efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl p-6 sm:p-8 hover:bg-gray-750 transition-colors border border-gray-700"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  const testimonials = [
    {
      quote:
        'Salex transformed how we track our sales pipeline. Our close rate increased by 32% in just two months.',
      author: 'Sarah Johnson',
      title: 'Sales Director, TechCorp',
      avatar: '/avatar1.png', // Would need actual images
    },
    {
      quote:
        'The analytics and forecasting features helped us predict our quarterly revenue with 95% accuracy.',
      author: 'Michael Chen',
      title: 'CEO, GrowthFinance',
      avatar: '/avatar2.png',
    },
    {
      quote:
        'My team loves the intuitive interface. Onboarding was smooth and adoption was immediate.',
      author: 'Laura Smith',
      title: 'Sales Manager, Innovate Inc',
      avatar: '/avatar3.png',
    },
  ];

  return (
    <div id="testimonials" className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            What Our Customers Say
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of sales teams who&apos;ve improved their processes
            with Salex.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-700"
            >
              <p className="text-gray-300 mb-6 text-sm sm:text-base">
                {testimonial.quote}
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-600 mr-4"></div>
                <div>
                  <h4 className="font-medium text-sm sm:text-base">
                    {testimonial.author}
                  </h4>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: 'per month',
      description: 'Perfect for small sales teams getting started',
      features: [
        'Up to 5 team members',
        '1,000 deals',
        'Basic analytics',
        'Email support',
        'CSV exports',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      description: 'For growing teams with advanced needs',
      features: [
        'Up to 15 team members',
        '10,000 deals',
        'Advanced analytics',
        'Priority support',
        'API access',
        'Custom dashboard',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: 'per month',
      description: 'For large organizations with complex requirements',
      features: [
        'Unlimited team members',
        'Unlimited deals',
        'Custom reporting',
        'Dedicated account manager',
        'SSO integration',
        'Data retention policy',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div id="pricing" className="py-12 sm:py-16 lg:py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the plan that works best for your team. All plans include a
            14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-gray-800 rounded-xl p-6 sm:p-8 border ${
                plan.popular ? 'border-blue-500' : 'border-gray-700'
              } relative`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl sm:text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-3xl sm:text-4xl font-bold">
                  {plan.price}
                </span>
                <span className="text-gray-400 ml-2 text-sm sm:text-base">
                  {plan.period}
                </span>
              </div>
              <p className="mt-4 text-gray-400 text-sm sm:text-base">
                {plan.description}
              </p>
              <ul className="mt-6 space-y-3 sm:space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2 flex-shrink-0"
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
                    <span className="text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 sm:mt-8">
                <button
                  className={`w-full py-2 sm:py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  const faqs = [
    {
      question: 'How does the 14-day trial work?',
      answer:
        'You can sign up for Salex and use all features of the Professional plan for 14 days without entering any payment information. At the end of the trial, you can choose the plan that works best for you.',
    },
    {
      question: 'Can I export my data from Salex?',
      answer:
        'Yes, Salex allows you to export your data in CSV format at any time. Enterprise plans also support additional export options and API access.',
    },
    {
      question: 'How secure is my sales data?',
      answer:
        'Salex uses industry-standard encryption and security practices to keep your data safe. We are SOC 2 compliant and perform regular security audits.',
    },
    {
      question: 'Can I integrate Salex with my CRM?',
      answer:
        'Yes, Salex integrates with popular CRM platforms including Salesforce, HubSpot, and Pipedrive. Custom integrations are available for Enterprise plans.',
    },
  ];

  return (
    <div id="faq" className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-gray-400">
            Got questions? We&apos;ve got answers.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-gray-400 mb-4 text-sm sm:text-base">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link href="/contact">
            <button className="bg-gray-800 hover:bg-gray-700 py-2 px-4 sm:px-6 rounded-lg border border-gray-700 transition-colors text-sm sm:text-base">
              Contact Support
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-blue-500">
              Salex
            </Link>
            <p className="mt-4 text-gray-400 text-sm sm:text-base">
              Modern sales management platform for teams of all sizes.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">X</span>
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations"
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Integrations
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4">
              Resources
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/blog"
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/documentation"
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/guides"
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/webinars"
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Webinars
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm sm:text-base">
            © 2025 Salex, Inc. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4 sm:space-x-6">
            <Link
              href="/terms"
              className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
