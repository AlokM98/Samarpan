// Adapter only: the animation app remains independent and only accepts a
// normalized scroll value from its host page.
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== "samarpan-scroll") return;
  const progress = Number(event.data.progress);
  if (!Number.isFinite(progress)) return;
  // Drive the animation directly instead of scrolling the iframe itself.
  // Scrolling here created a second scroll loop that could fight the host page
  // and made mobile interaction intermittently unresponsive.
  window.dispatchEvent(new CustomEvent("samarpan-scroll", {
    detail: Math.max(0, Math.min(1, progress)),
  }));
});
