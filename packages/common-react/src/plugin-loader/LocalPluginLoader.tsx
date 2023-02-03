import React, { useRef, useEffect, useCallback } from 'react';

const LocalPluginLoader = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const onLoad = useCallback(() => {
        iframeRef.current?.contentWindow?.postMessage({hello: "from parent"}, "*");
    }, [])

    useEffect(() => {
        window.addEventListener("message", (event) => {
            console.log("RECEIVED EVENT", event)
        }, true);
    }, []);


    return (
        <div
            onLoad={onLoad}
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden"
            }}
        >
            <iframe 
            sandbox="allow-scripts"
            ref={iframeRef}
            style={{
                width: "100%",
                height: "100%",
                border: 0
            }}
            seamless
            src={"http://localhost:63403/plugins/palette/dev"}/>
        </div>

    );
};

export default React.memo(LocalPluginLoader);