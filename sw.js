const CACHE_NAME = "ai-food-trainer-pwa-v16";
const ASSETS = [
  "/index.html",
  "/disclaimer.html",
  "/styles.css?v=20260705-phase-close-v1",
  "/app.js?v=20260705-phase-close-v1",
  "/manifest.webmanifest?v=20260705-phase-close-v1",
  "/assets/trainer-previews/01_mina_onboarding_preview.webp",
  "/assets/trainer-previews/02_rei_onboarding_preview.webp",
  "/assets/trainer-previews/03_kana_onboarding_preview.webp",
  "/assets/trainer-previews/04_sou_onboarding_preview.webp",
  "/assets/trainer-previews/05_haru_onboarding_preview.webp",
  "/assets/trainer-previews/06_ao_onboarding_preview.webp",
  "/assets/icon.svg",
  "/assets/oshi-avatar.svg",
  "/assets/character-sheets/01_miku_motif_character_sheet.png",
  "/assets/character-sheets/02_yui_aragaki_motif_character_sheet.png",
  "/assets/character-sheets/03_asuna_motif_character_sheet.png",
  "/assets/character-sheets/04_isagi_motif_character_sheet.png",
  "/assets/character-sheets/05_meguro_ren_motif_character_sheet.png",
  "/assets/character-sheets/06_gojo_motif_character_sheet.png"
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
    event.respondWith(fetch(event.request).catch(() => caches.match("/index.html")));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
