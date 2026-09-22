// Adapter only: the animation app remains independent and only accepts a
// normalized scroll value from its host page.
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== "samarpan-scroll") return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo(0, Math.max(0, Math.min(1, event.data.progress)) * Math.max(0, scrollable));
});
