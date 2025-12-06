// src/pages/Confirm.jsx
import { Link } from "react-router-dom";

export default function Confirm() {
  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <h1 className="text-3xl font-bold mb-6 text-harc-orange">
        Order Submitted!
      </h1>

      <p className="text-lg mb-8 text-gray-700">
        Your cooler order has been received. A HaRC team member can now view it
        in the system.
      </p>

      <Link
        to="/"
        className="inline-block bg-harc-green text-white px-6 py-3 rounded-xl text-lg font-medium hover:opacity-90 transition"
      >
        Return to Home
      </Link>
    </div>
  );
}
