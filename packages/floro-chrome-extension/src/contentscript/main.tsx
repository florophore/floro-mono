const id = "empnjkpfmappocpjaalffbbiceagepol";
const port = chrome.runtime.connect(id);
chrome.runtime.onMessage.addListener((msg) => {
    const event = new CustomEvent("floro_event", { detail: msg});
    window.dispatchEvent(event)
})