import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

const Survey = () => {
  const navigate = useNavigate();

  const [feeling, setFeeling] = useState("");
  const [speed, setSpeed] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feeling && !speed && !comment.trim()) {
      alert("You can skip, but please choose at least one answer or leave a comment.");
      return;
    }

    setIsSubmitting(true);

    try {
      // expects a "surveys" table in Supabase with
      // feeling (text), speed (text), comment (text), created_at (timestamp)
      const payload = {
        feeling: feeling || null,
        speed: speed || null,
        comment: comment.trim() || null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("surveys").insert([payload]);

      if (error) {
        console.error("Supabase survey insert error:", error);
        alert(
          `Feedback save failed. ${
            error.message || "You can still continue to the home screen."
          }`
        );
        setIsSubmitting(false);
        return;
      }

      navigate("/", { state: { feedbackComplete: true } });
    } catch (err) {
      console.error("Unexpected survey submit error:", err);
      alert("Something went wrong saving your feedback, but you can still continue.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-orange-400">
            HaRC Healthy Coolers
          </p>
          <h1 className="text-xl font-semibold mt-1">Quick feedback</h1>
          <p className="text-[11px] text-slate-400 mt-1">
            30 seconds. Your answers help Authority Health improve this cooler.
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-xs border border-slate-700 px-3 py-1 rounded-full"
        >
          Skip
        </button>
      </header>

      {/* Form */}
      <main className="flex-1 px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          {/* Q1 */}
          <div>
            <p className="text-sm font-medium mb-2">
              Overall, how satisfied are you with the items in this cooler?
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { value: "very_satisfied", label: "Very satisfied" },
                { value: "okay", label: "It was okay" },
                { value: "not_satisfied", label: "Not satisfied" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFeeling(opt.value)}
                  className={`border rounded-full px-3 py-2 ${
                    feeling === opt.value
                      ? "bg-orange-500 text-black border-orange-500"
                      : "border-slate-700 text-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q2 */}
          <div>
            <p className="text-sm font-medium mb-2">
              How was the speed and ease of using this screen?
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { value: "very_easy", label: "Very easy" },
                { value: "fine", label: "Fine" },
                { value: "confusing", label: "Confusing" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSpeed(opt.value)}
                  className={`border rounded-full px-3 py-2 ${
                    speed === opt.value
                      ? "bg-orange-500 text-black border-orange-500"
                      : "border-slate-700 text-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q3 */}
          <div>
            <p className="text-sm font-medium mb-2">
              Anything we should add, change, or fix?
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              placeholder="Optional — type your feedback here."
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-black font-semibold py-3 rounded-full text-sm disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Submit feedback"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full border border-slate-700 text-slate-100 font-medium py-3 rounded-full text-sm"
            >
              Skip for now
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Survey;
