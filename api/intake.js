export async function POST(req) {
  try {
    const body = await req.json();

    const { cooler_id, phone, notes, needs_primary_care } = body;

    if (!cooler_id || !phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("intake_requests")
      .insert([
        {
          cooler_id,
          phone,
          notes,
          needs_primary_care,
          source: "harc-app"
        }
      ])
      .select();

    if (error) {
      console.error("Intake insert error:", error);
      return new Response(JSON.stringify({ error }), { status: 400 });
    }

    return Response.json({ success: true, data });
  } catch (e) {
    console.error("Server error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
