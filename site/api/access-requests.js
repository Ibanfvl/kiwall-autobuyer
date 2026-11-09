const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function respond(response, status, body) {
  response.writeHead(status, headers);
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  return JSON.parse(raw);
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, headers);
    response.end();
    return;
  }

  if (request.method !== "POST") {
    respond(response, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const body = await readBody(request);
    const plan = typeof body.plan === "string" ? body.plan.trim() : "";
    const contact = typeof body.contact === "string" ? body.contact.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!["Lifetime", "Mensuel"].includes(plan) || !contact || contact.length > 120 || message.length > 500) {
      respond(response, 400, { error: "Invalid access request." });
      return;
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase environment variables are not configured.");

    const supabaseResponse = await fetch(`${url}/rest/v1/access_requests`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ plan, contact, message }),
    });

    if (!supabaseResponse.ok) {
      throw new Error(`Supabase request failed (${supabaseResponse.status}): ${await supabaseResponse.text()}`);
    }

    respond(response, 201, { ok: true });
  } catch (error) {
    console.error(error);
    respond(response, 500, { error: "Unable to save the access request." });
  }
};
