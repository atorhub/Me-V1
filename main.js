console.log("MAIN JS LOADED");

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("app-header");
  const main = document.getElementById("app-main");
  const footer = document.getElementById("app-footer");

  if (header) header.textContent = "ME — Core Online";
  if (main) main.textContent = "System stable. Ready.";
  if (footer) footer.textContent = "© ME";
});
