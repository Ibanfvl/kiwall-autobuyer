const dialog = document.querySelector("#purchase-dialog");
const selectedPlan = document.querySelector("#selected-plan");
const purchaseForm = document.querySelector("#purchase-form");

document.querySelectorAll(".purchase-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedPlan.textContent = button.dataset.plan;
    dialog.showModal();
  });
});

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());

purchaseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAccessRequest(new FormData(purchaseForm)).catch((error) => {
    console.error(error);
    alert("Impossible d’envoyer ta demande pour le moment. Réessaie plus tard ou contacte-moi sur Discord.");
  });
});

async function submitAccessRequest(data) {
  const response = await fetch("/api/access-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      plan: selectedPlan.textContent.startsWith("Lifetime") ? "Lifetime" : "Mensuel",
      contact: data.get("contact"),
      message: data.get("message"),
    }),
  });
  if (!response.ok) throw new Error("Access request failed.");
  purchaseForm.reset();
  dialog.close();
  alert("Demande envoyée. Je te recontacterai avec les instructions d’accès.");
}

document.querySelectorAll("[data-gallery-input]").forEach((input) => {
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) return;
    const item = input.closest(".gallery-item");
    const image = item.querySelector("img");
    image.src = URL.createObjectURL(file);
    item.classList.add("has-image");
  });
});

const reviewForm = document.querySelector("#review-form");
const reviewsList = document.querySelector("#reviews-list");

function renderReviews(reviews) {
  reviewsList.innerHTML = "";
  if (!reviews.length) {
    reviewsList.innerHTML = '<div class="empty-reviews">Les premiers avis apparaîtront ici.</div>';
    return;
  }
  reviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "review-card";
    const stars = document.createElement("div");
    stars.className = "review-stars";
    stars.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;
    const quote = document.createElement("blockquote");
    quote.textContent = `« ${review.message} »`;
    const author = document.createElement("div");
    author.className = "review-author";
    const avatar = document.createElement("span");
    avatar.className = "review-avatar";
    avatar.textContent = review.name.charAt(0).toUpperCase();
    const details = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = review.name;
    const plan = document.createElement("small");
    plan.textContent = `Utilisateur ${review.plan}`;
    details.append(name, plan);
    author.append(avatar, details);
    card.append(stars, quote, author);
    reviewsList.appendChild(card);
  });
}

reviewForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitReview(new FormData(reviewForm)).catch((error) => {
    console.error(error);
    reviewsList.innerHTML = '<div class="empty-reviews">Impossible d’enregistrer ton avis pour le moment.</div>';
  });
});

async function loadReviews() {
  const response = await fetch("/api/reviews");
  if (!response.ok) throw new Error("Impossible de charger les avis.");
  renderReviews(await response.json());
}

async function submitReview(data) {
  const review = {
    name: data.get("name"),
    plan: data.get("plan"),
    rating: Number(data.get("rating")),
    message: data.get("message"),
  };
  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
  if (!response.ok) throw new Error("Impossible d’enregistrer ton avis.");
  reviewForm.reset();
  await loadReviews();
}

loadReviews().catch((error) => {
  console.error(error);
  reviewsList.innerHTML = '<div class="empty-reviews">Les avis sont temporairement indisponibles.</div>';
});
