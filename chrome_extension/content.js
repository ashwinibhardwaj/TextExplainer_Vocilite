document.addEventListener("mouseup", () => {
  chrome.storage.local.get("isActive", (data) => {
    if (!data.isActive) return;

    const selectedText = window.getSelection().toString();
    if (selectedText.length > 0) {
      chrome.runtime.sendMessage({ action: "showUI", text: selectedText });
    }
  });
});
