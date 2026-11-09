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
  const data = new FormData(purchaseForm);
  const plan = selectedPlan.textContent;
  const subject = encodeURIComponent(`Demande d'accès — ${plan}`);
  const body = encodeURIComponent(
    `Bonjour,\n\nJe souhaite obtenir : ${plan}.\nMon contact : ${data.get("contact")}\n\n${data.get("message") || ""}`,
  );
  window.location.href = `mailto:contact@ibanfvl-buyer.example?subject=${subject}&body=${body}`;
  dialog.close();
});

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
const reviewsStorageKey = "ibanfvl-buyer-reviews";

function renderReviews() {
  const reviews = JSON.parse(localStorage.getItem(reviewsStorageKey) || "[]");
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
  const data = new FormData(reviewForm);
  const reviews = JSON.parse(localStorage.getItem(reviewsStorageKey) || "[]");
  reviews.unshift({
    name: data.get("name"),
    plan: data.get("plan"),
    rating: Number(data.get("rating")),
    message: data.get("message"),
  });
  localStorage.setItem(reviewsStorageKey, JSON.stringify(reviews));
  reviewForm.reset();
  renderReviews();
});

renderReviews();
