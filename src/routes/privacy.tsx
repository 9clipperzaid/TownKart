import { createFileRoute } from "@tanstack/react-router";
import { Shield, Lock, Trash2, MapPin, Phone, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF5] text-[#263D34] py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="bg-white border border-[#DEDFD8] rounded-2xl p-6 sm:p-8 shadow-sm">
          <a
            href="/home"
            className="inline-flex items-center text-sm font-semibold text-[#168A58] hover:underline mb-4 gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </a>
          <div className="inline-block bg-[#E7F4EC] text-[#168A58] font-bold text-xs px-3 py-1 rounded-full mb-3">
            Official Legal Documentation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263D34]">
            TownKart Privacy Policy &amp; Terms of Service
          </h1>
          <p className="text-sm text-[#68776F] mt-1">
            Effective Date: January 1, 2025 | Last Revised: January 2025
          </p>
        </header>

        <section className="bg-white border border-[#DEDFD8] rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-[#117347] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#168A58]" /> 1. Introduction &amp; Overview
          </h2>
          <p className="text-sm leading-relaxed text-[#263D34]">
            TownKart (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the TownKart hyperlocal marketplace mobile application and web services (townkart.store), serving customers in Nehtaur and surrounding regions.
          </p>
          <p className="text-sm leading-relaxed text-[#263D34]">
            We are dedicated to safeguarding your personal privacy and maintaining strict confidentiality over your information. This document outlines what data we collect, how it is handled, and how your rights are protected.
          </p>
        </section>

        <section className="bg-white border border-[#DEDFD8] rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-[#117347] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#168A58]" /> 2. Information We Collect
          </h2>
          <p className="text-sm leading-relaxed text-[#263D34]">
            To enable fast, doorstep hyperlocal delivery services, we collect the following limited information:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-2 text-[#263D34]">
            <li><strong>Account &amp; Contact:</strong> Your name and mobile phone number, verified via secure One-Time Password (OTP).</li>
            <li><strong>Delivery Addresses:</strong> Complete street address, landmark, area, and city provided by you for order deliveries.</li>
            <li><strong>Location Data (GPS):</strong> When permitted, we collect your device&apos;s geographical location solely to calculate accurate delivery radius from nearby neighborhood stores and assist delivery riders in locating your doorstep. Location data is never used or sold for advertising.</li>
            <li><strong>Order Records:</strong> Items ordered, store names, quantities, billing totals, and preferred payment mode (e.g. Cash on Delivery).</li>
          </ul>
        </section>

        <section className="bg-white border border-[#DEDFD8] rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-[#117347] flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#168A58]" /> 3. How We Use &amp; Share Data
          </h2>
          <p className="text-sm leading-relaxed text-[#263D34]">
            Your data is used strictly for legitimate fulfillment operations:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-2 text-[#263D34]">
            <li><strong>Store Fulfillment:</strong> Order items, customer name, and delivery address are shared strictly with the specific store fulfilling your order.</li>
            <li><strong>Delivery Dispatch:</strong> Assigned delivery riders are provided the destination address and phone number exclusively to complete delivery.</li>
            <li><strong>Zero Data Selling:</strong> We do NOT sell, rent, monetize, or trade your personal data to any external advertising agencies, brokers, or third parties.</li>
          </ul>
        </section>

        <section className="bg-white border border-[#DEDFD8] rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-[#117347] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#168A58]" /> 4. Security &amp; Storage
          </h2>
          <p className="text-sm leading-relaxed text-[#263D34]">
            All communication between the TownKart mobile application, website, and our servers is secured using TLS/HTTPS encryption. Personal records are stored in enterprise cloud databases with strict Row-Level Security (RLS), restricting access strictly to authorized transactions.
          </p>
        </section>

        <section className="bg-white border border-[#DEDFD8] rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-[#117347] flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-[#168A58]" /> 5. Account Deletion &amp; User Rights (Google Play Policy)
          </h2>
          <p className="text-sm leading-relaxed text-[#263D34]">
            In full compliance with Google Play Store User Data policies, every TownKart user retains full ownership and control over their account and data:
          </p>
          <div className="bg-[#E7F4EC] border-l-4 border-[#168A58] p-4 rounded-r-lg text-sm text-[#263D34]">
            <strong>How to Delete Your Account:</strong><br />
            You can permanently delete your TownKart account and all associated personal data directly within the app by going to:<br />
            <strong>My account &rarr; Account privacy &rarr; Request to delete account</strong>.
          </div>
          <p className="text-sm leading-relaxed text-[#263D34]">
            Upon confirmation, your profile data, delivery addresses, and active cart items are immediately and permanently erased from our production databases.
          </p>
        </section>

        <section className="bg-white border border-[#DEDFD8] rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-[#117347]">6. Terms of Service &amp; Cash on Delivery</h2>
          <ul className="list-disc pl-5 text-sm space-y-2 text-[#263D34]">
            <li><strong>Product Pricing:</strong> Prices and stock availability are managed by individual partner stores in Nehtaur.</li>
            <li><strong>Cash on Delivery (COD):</strong> For COD orders, the customer agrees to provide exact payment in cash or accepted local digital payments upon delivery.</li>
            <li><strong>Cancellations:</strong> Orders may only be cancelled prior to store packing and dispatch.</li>
          </ul>
        </section>

        <section className="bg-white border border-[#DEDFD8] rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-[#117347]">7. Contact &amp; Grievance</h2>
          <p className="text-sm leading-relaxed text-[#263D34]">
            If you have any questions, feedback, or requests regarding this Privacy Policy, please contact our support team:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1 text-[#263D34]">
            <li><strong>Email:</strong> support@townkart.store</li>
            <li><strong>Service Location:</strong> Nehtaur, District Bijnor, Uttar Pradesh, India - 246733</li>
            <li><strong>Website:</strong> https://www.townkart.store</li>
          </ul>
        </section>

        <footer className="text-center text-xs text-[#68776F] pt-6 pb-12">
          &copy; 2025 TownKart Hyperlocal Marketplace. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
