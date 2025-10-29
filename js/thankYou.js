// Same posting logic as the old website
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzh3Ox4_82AJX_S8GpfOJYRaWutoV3GZsRYP7xpIn2M4YeMh1Ct1spet80z4xJzNqaqBw/exec";

async function sendFormData() {
  const saved = localStorage.getItem("FormData");
  if (!saved) return;

  const data = JSON.parse(saved);

  try {
    const res = await fetch(SHEET_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const text = await res.text();
    if (text === "OK") {
      localStorage.removeItem("FormData");
    }
  } catch (e) {
    // quietly ignore; you can add retry/logging if needed
    console.warn("Lead send failed:", e);
  }
}
sendFormData();
