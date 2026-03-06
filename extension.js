(() => {
  if (window.__pinokioComfyDomInstalled) return
  window.__pinokioComfyDomInstalled = true
  const parseDownloadContext = (button) => {
    const url = (button.getAttribute("title") || "").trim()
    if (!/^https?:\/\//i.test(url)) return null

    const row = button.closest('li[role="option"], [data-pc-section="option"], .p-listbox-option')
    if (!row) return null

    const span = Array.from(row.querySelectorAll("span")).find((node) => /\s\/\s/.test((node.textContent || "").trim()))
    if (!span) return null

    const label = (span.textContent || "").trim()
    const sep = label.indexOf(" / ")
    if (sep <= 0) return null

    const savePath = label.slice(0, sep).trim()
    if (!savePath) return null

    const urlPath = new URL(url).pathname
    const filename = decodeURIComponent(urlPath.split("/").pop() || "").trim()
    if (!filename) return null

    return { url, savePath, filename, label }
  }

  document.addEventListener("click", (event) => {
    const button = event.target && typeof event.target.closest === "function"
      ? event.target.closest("button")
      : null
    if (!button) return

    const text = (button.textContent || "").trim().toLowerCase()
    if (!text.includes("download")) return

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()

    const payload = parseDownloadContext(button)
    if (!payload) {
      return
    }

    const api = window.$pinokio
    if (!api || typeof api.emit !== "function") {
      return
    }

    api.emit("trigger-download", payload, { source: "extension.js" })
  }, true)
})()
