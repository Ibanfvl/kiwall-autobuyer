const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function respond(response, status, body) {
  response.writeHead(status, headers);
  response.end(JSON.stringify(body));
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return { url, key };
}

async function readBody(request) {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON body.");
  }
}

function validateReview(review) {
  const name = typeof review.name === "string" ? review.name.trim() : "";
  const plan = typeof review.plan === "string" ? review.plan.trim() : "";
  const message = typeof review.message === "string" ? review.message.trim() : "";
  const rating = Number(review.rating);

  if (!name || name.length > 40 || !plan || !message || message.length > 280) {
    throw new Error("Invalid review fields.");
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }
  return { name, plan, message, rating };
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${details}`);
  }
  return response.status === 204 ? [] : response.json();
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, headers);
    response.end();
    return;
  }

  try {
    if (request.method === "GET") {
      const reviews = await supabaseRequest(
        "reviews?select=id,name,plan,rating,message,created_at&order=created_at.desc&limit=100",
      );
      respond(response, 200, reviews);
      return;
    }

    if (request.method === "POST") {
      const review = validateReview(await readBody(request));
      const [createdReview] = await supabaseRequest("reviews", {
        method: "POST",
        body: JSON.stringify(review),
      });
      respond(response, 201, createdReview);
      return;
    }

    respond(response, 405, { error: "Method not allowed." });
  } catch (error) {
    console.error(error);
    respond(response, 500, { error: "Unable to process the review request." });
  }
};
