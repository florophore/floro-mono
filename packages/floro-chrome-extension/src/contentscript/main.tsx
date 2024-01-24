document.addEventListener("readystatechange", () => {
    window.addEventListener("floro:module:register", (event: CustomEvent) => {
        chrome.runtime.sendMessage({type: "register-module", metaFile: event?.detail});
    });

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type == 'update:state') {
            const updateEvent = new CustomEvent("floro:update-state", {detail: msg.update});
            window.dispatchEvent(updateEvent);
        }
        if (msg.type == 'toggle:edit_mode') {
            const updateEvent = new CustomEvent("floro:toggle-edit-mode", {detail: msg.isEditMode});
            window.dispatchEvent(updateEvent);
        }
        if (msg.type == 'toggle:debug_mode') {
            const updateEvent = new CustomEvent("floro:toggle-debug-mode", {detail: msg.isDebugMode});
            window.dispatchEvent(updateEvent);
        }
        return false;
    });

    chrome.runtime.sendMessage({type: "get-tab-state"}, (msg) => {
        if (msg.type == "get-tab-state-response") {
            const updateEditEvent = new CustomEvent("floro:toggle-edit-mode", {detail: msg.tabState.isEditMode});
            window.dispatchEvent(updateEditEvent);
            const updateDebugEvent = new CustomEvent("floro:toggle-debug-mode", {detail: msg.tabState.isDebugMode});
            window.dispatchEvent(updateDebugEvent);
        }
        return false;
    });

    window.addEventListener("floro:ready", () => {
        const launchEvent = new CustomEvent("floro:content-script:launched");
        window.dispatchEvent(launchEvent);

        chrome.runtime.sendMessage({type: "get-tab-state"}, (msg) => {
            if (msg.type == "get-tab-state-response") {
                const initEvent = new CustomEvent("floro:init", {
                  detail: {
                    isDebugMode: msg.tabState.isDebugMode,
                    isEditMode: msg.tabState.isEditMode,
                  },
                });
                window.dispatchEvent(initEvent);
            }
            return false;
        });
    });

    const onPluginMessage = (args) => {
        chrome.runtime.sendMessage({type: "plugin:message", data: args.data});
    }
    const channel = new BroadcastChannel("floro:plugin:message")
    channel.onmessage = onPluginMessage;
    const launchEvent = new CustomEvent("floro:content-script:launched");
    window.dispatchEvent(launchEvent);
})