export async function POST(req) {
  try {
    const body = await req.json();

    const { items, total, cooler_id } = body;

    if (!items || !cooler_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          items,
          total,
          cooler_id,
          source: "harc-app"
        }
      ])
      .select();

    if (error) {
      console.error("Order insert error:", error);
      return new Response(JSON.stringify({ error }), { status: 400 });
    }

    return Response.json({ success: true, data });
  } catch (e) {
    console.error("Server error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
