const CACHE_NAME = "ai-food-trainer-pwa-v20";
const scopeUrl = (path) => new URL(path, self.registration.scope).toString();
const ASSETS = [
  scopeUrl("index.html"),
  scopeUrl("disclaimer.html"),
  scopeUrl("styles.css?v=20260705-g3-n1-v2"),
  scopeUrl("app.js?v=20260705-g3-n1-v2"),
  scopeUrl("manifest.webmanifest?v=20260705-g3-n1-v2"),
  scopeUrl("assets/trainer-previews/01_mina_onboarding_preview.webp"),
  scopeUrl("assets/trainer-previews/02_rei_onboarding_preview.webp"),
  scopeUrl("assets/trainer-previews/03_kana_onboarding_preview.webp"),
  scopeUrl("assets/trainer-previews/04_sou_onboarding_preview.webp"),
  scopeUrl("assets/trainer-previews/05_haru_onboarding_preview.webp"),
  scopeUrl("assets/trainer-previews/06_ao_onboarding_preview.webp"),
  scopeUrl("assets/icon.svg"),
  scopeUrl("assets/oshi-avatar.svg"),
  scopeUrl("assets/character-sheets/01_miku_motif_character_sheet.png"),
  scopeUrl("assets/character-sheets/02_yui_aragaki_motif_character_sheet.png"),
  scopeUrl("assets/character-sheets/03_asuna_motif_character_sheet.png"),
  scopeUrl("assets/character-sheets/04_isagi_motif_character_sheet.png"),
  scopeUrl("assets/character-sheets/05_meguro_ren_motif_character_sheet.png"),
  scopeUrl("assets/character-sheets/06_gojo_motif_character_sheet.png")
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const accept = event.request.headers.get("accept") || "";
  if (event.request.mode === "navigate" || accept.includes("text/html")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(scopeUrl("index.html"))));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
