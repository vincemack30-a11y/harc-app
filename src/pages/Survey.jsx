// src/pages/Survey.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.js";

export default function Survey() {
  const location = useLocation();
  const navigate = useNavigate();

  const coolerId = location.state?.coolerId || null;
  const orderId = location.state?.orderId || null;

  const [feeling, setFeeling] = useState("");
  const [speed, setSpeed] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = feeling && speed && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        cooler_id: coolerId,
        order_id: orderId,
        feeling,
        speed,
        comment: comment || null,
      };

      const { error } = await supabase
        .from("intake_requests")
        .insert([payload]);

      if (error) {
        console.error("Survey insert error:", error);
        setErrorMsg("We couldn't save your response. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Simple thank-you redirect – you can later point this to Assist/Help
      navigate("/", {
        replace: true,
        state: {
          surveyComplete: true,
        },
      });
    } catch (err) {
      console.error("Survey submit exception:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-6 pb-10">
      <div className="bg-white/95 border border-emerald-200 rounded-2xl shadow-sm p-5 mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-600 mb-1">
          Quick check-in
        </p>
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          How did this cooler work for you?
        </h1>
        <p className="text-xs text-slate-600">
          This short survey helps Authority Health improve healthy food access
          in Detroit. No personal health information is collected.
        </p>
        {coolerId && (
          <p className="text-[11px] text-slate-500 mt-2">
            Cooler: <span className="font-semibold">{String(coolerId)}</span>
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5 space-y-5"
      >
        {/* Feeling */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-2">
            Overall, how do you feel about the options in this cooler today?
          </label>
          <div className="flex items-center gap-2 text-xs">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFeeling(String(value))}
                className={`flex-1 py-2 rounded-full border ${
                  feeling === String(value)
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            1 = Not good at all • 5 = Excellent
          </p>
        </div>

        {/* Speed */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-2">
            How easy was it to grab your items and go?
          </label>
          <div className="flex items-center gap-2 text-xs">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSpeed(String(value))}
                className={`flex-1 py-2 rounded-full border ${
                  speed === String(value)
                    ? "bg-orange-500 text-black border-orange-500"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            1 = Very slow/confusing • 5 = Very quick/easy
          </p>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-2">
            Anything we should add, change, or know about this cooler?{" "}
            <span className="font-normal text-slate-500">(Optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full text-xs border border-slate-300 rounded-xl p-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            placeholder="Example: more fresh fruit, clearer labels, better drink options…"
          />
        </div>

        {errorMsg && (
          <p className="text-[11px] text-red-500">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full rounded-full px-4 py-3 text-sm font-semibold ${
            canSubmit
              ? "bg-emerald-500 text-white"
              : "bg-slate-300 text-slate-500"
          }`}
        >
          {isSubmitting ? "Sending response…" : "Submit survey"}
        </button>
      </form>

      <p className="text-[10px] text-slate-500 mt-3 px-1">
        Your answers are used for program improvement and grant reporting only.
      </p>
    </div>
  );
}
