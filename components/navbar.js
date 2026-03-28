// navbar.js
// Call initNavbar() after the navbar HTML is injected into the DOM:
//   loadComponent('navbar', '/components/navbar.html', initNavbar);
// navbar.js — top of file
function updateCartBadge() {
  const token = localStorage.getItem("token");
  if (!token) return;
  fetch("https://ecommerce.routemisr.com/api/v1/cart", { headers: { token } })
    .then((r) => r.json())
    .then((data) => {
      const count = data.data?.products?.length || 0;
      const badge = document.getElementById("cartBadge");
      if (!badge) return;
      if (count > 0) {
        badge.textContent = count > 99 ? "99+" : count;
        badge.classList.remove("d-none");
      } else {
        badge.classList.add("d-none");
      }
    })
    .catch(() => {});
}

function updateWishlistBadge() {
  const token = localStorage.getItem("token");
  if (!token) return;
  fetch("https://ecommerce.routemisr.com/api/v1/wishlist", {
    headers: { token },
  })
    .then((r) => r.json())
    .then((data) => {
      const count = (data.data || []).length;
      const badge = document.getElementById("wishlistBadge");
      if (!badge) return;
      if (count > 0) {
        badge.textContent = count > 99 ? "99+" : count;
        badge.classList.remove("d-none");
      } else {
        badge.classList.add("d-none");
      }
    })
    .catch(() => {});
}
function initNavbar() {
  const API_BASE = "https://ecommerce.routemisr.com/api/v1";
  const token = () => localStorage.getItem("token") || "";

  // ── 1. Active nav link with underline indicator ────────────────────────
  const currentPath = window.location.pathname;
  document.querySelectorAll("#navLinks .nav-link").forEach((link) => {
    try {
      const linkPath = new URL(link.href, window.location.origin).pathname;
      const isActive =
        linkPath === currentPath ||
        (currentPath === "/" && linkPath === "/home.html");
      link.classList.toggle("active", isActive);
      isActive
        ? link.setAttribute("aria-current", "page")
        : link.removeAttribute("aria-current");
    } catch {}
  });

  // ── 2. Auth guard: show toast then redirect after delay ────────────────
  function showNavToast(title, msg, redirectTo) {
    const toastEl = document.getElementById("navToast");
    if (!toastEl) return;
    document.getElementById("navToastTitle").textContent = title;
    document.getElementById("navToastMsg").textContent = msg;
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2500 });
    toast.show();
    // Redirect after toast finishes
    setTimeout(() => {
      window.location.href = `/login-signup.html?redirect=${encodeURIComponent(redirectTo)}`;
    }, 2600);
  }

  function guardLink(linkId, targetHref, label) {
    const link = document.getElementById(linkId);
    if (!link || token()) return;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showNavToast(
        "Login Required",
        `Please login to access your ${label}.`,
        targetHref,
      );
    });
  }

  guardLink("cartLink", "/cart.html", "Cart");
  guardLink("wishlistLink", "/wishlist.html", "Wishlist");

  // ── 3. Show/hide auth icons ────────────────────────────────────────────
  const isLoggedIn = !!token();
  document
    .getElementById("loginIconWrap")
    ?.classList.toggle("d-none", isLoggedIn);
  document
    .getElementById("logoutIconWrap")
    ?.classList.toggle("d-none", !isLoggedIn);
  document
    .getElementById("userIconWrap")
    ?.classList.toggle("d-none", !isLoggedIn);

  // ── 4. User tooltip ────────────────────────────────────────────────────
  if (isLoggedIn) {
    const name = localStorage.getItem("userName") || "";
    const email = localStorage.getItem("userEmail") || "";
    const userIcon = document.getElementById("userIcon");
    if (userIcon) {
      const tip =
        [
          name ? `<strong>${name}</strong>` : "",
          email ? `<span class="small opacity-75">${email}</span>` : "",
        ]
          .filter(Boolean)
          .join("<br>") || "My Account";
      userIcon.setAttribute("title", tip);
      new bootstrap.Tooltip(userIcon, { html: true, placement: "bottom" });
    }
  }

  // ── 5. Logout ──────────────────────────────────────────────────────────
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    ["token", "userName", "userEmail"].forEach((k) =>
      localStorage.removeItem(k),
    );
    window.location.href = "/login-signup.html";
  });

  // ── 6. Live badge counts (only when logged in) ─────────────────────────
  if (!isLoggedIn) return;

  function setBadge(id, count) {
    const badge = document.getElementById(id);
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 99 ? "99+" : count;
      badge.classList.remove("d-none");
    } else {
      badge.classList.add("d-none");
    }
  }

  async function fetchCartCount() {
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        headers: { token: token() },
      });
      const data = await res.json();
      if (res.ok) setBadge("cartBadge", data.data?.products?.length || 0);
    } catch {}
  }

  async function fetchWishlistCount() {
    try {
      const res = await fetch(`${API_BASE}/wishlist`, {
        headers: { token: token() },
      });
      const data = await res.json();
      if (res.ok) setBadge("wishlistBadge", (data.data || []).length);
    } catch {}
  }

  fetchCartCount();
  fetchWishlistCount();
}
