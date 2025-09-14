document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    const file = el.getAttribute("data-include");

    fetch(file)
      .then(res => res.text())
      .then(data => {
        el.outerHTML = data;

        const eventName =
          file.includes("header") ? "headerLoaded" :
          file.includes("footer") ? "footerLoaded" :
          "includeLoaded";

        document.dispatchEvent(new CustomEvent(eventName, { detail: { file } }));
        console.log(`✅ ${file} đã load (${eventName})`);
      })
      .catch(err => console.error("Include load error:", err));
  });
});
