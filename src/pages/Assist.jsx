import { useState } from "react";
import { Link } from "react-router-dom";

export default function Assist() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    zip: "",
    helpType: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSubmitted(false);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Submission failed. Try again.");
      }

      // Success
      setSubmitted(true);
      setForm({
        name: "",
        phone: "",
        zip: "",
        helpType: "",
        notes: "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-orange-700">
        Help with Coverage & Care
      </h1>

      <p className="text-gray-700">
        The HaRC program can connect you with community health workers and
        partners who help with:
      </p>

      <ul className="list-disc list-inside text-gray-700 space-y-1">
        <li>Finding a primary care doctor or clinic</li>
        <li>Medicaid or Medicare questions</li>
        <li>Insurance and coverage navigation</li>
        <li>Local food, housing, and support resources</li>
      </ul>

      {submitted && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          Thank you! Your request was submitted. A HaRC team member or community
          partner will follow up using the contact information you shared.
        </div>
      )}

      {error && !submitted && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white border border-gray-200 rounded-lg p-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="First and last name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="(###) ###-####"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              ZIP code
            </label>
            <input
              name="zip"
              value={form.zip}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="48214"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              What do you need help with?
            </label>
            <select
              name="helpType"
              value={form.helpType}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            >
              <option value="">Select an option</option>
              <option value="doctor">Finding a doctor/clinic</option>
              <option value="medicaid">Medicaid questions</option>
              <option value="medicare">Medicare questions</option>
              <option value="food">Food or basic needs</option>
              <option value="other">Something else</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Anything else you want us to know? (optional)
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            placeholder="Tell us a little more about your situation."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-orange-700 disabled:bg-gray-300 disabled:text-gray-600"
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      <div className="text-xs text-gray-500">
        By submitting, you agree that a HaRC team member or partner can contact
        you by phone. Your information is kept confidential and only used to
        help connect you to services.
      </div>

      <div className="pt-2">
        <Link
          to="/"
          className="text-sm text-blue-700 underline hover:text-blue-900"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
