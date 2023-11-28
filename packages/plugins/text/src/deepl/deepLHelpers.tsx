import { useState, useEffect, useCallback, useRef } from "react";

interface DeepLTranslationBody {
    tsvEntries: string,
    deepLKey: string,
    sourceLang: string,
    targetLang: string,
    text: string,
    isFreePlan: boolean
}

export const sendTranslationRequest = async (
  params: DeepLTranslationBody
): Promise<{ translation: string }> => {
  const body = {
    tsv_entries: params.tsvEntries,
    deep_l_key: params.deepLKey,
    source_lang: params.sourceLang,
    target_lang: params.targetLang,
    text: params.text,
    is_free_plan: params.isFreePlan,
  };

  const xhr = new XMLHttpRequest();
  let promise = new Promise<{translation: string}>((resolve, reject) => {
    xhr.responseType = "json";
    xhr.open("POST", "https://floro.io/proxy/deepL/translate/richText");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    let didError = false;
    xhr.onerror = function (e) {
        if (didError) {
            return;
        }
        didError = true;
        reject(e);
    };
    xhr.onreadystatechange = function (e) {
        if (didError) {
            return;
        }
      if (xhr.readyState === XMLHttpRequest.DONE) {
        const status = xhr.status;
        if ((status >= 200 && status < 400)) {
          resolve(xhr.response);
        } else {
          didError = true;
          reject(e);
        }
      }
    };
    xhr.send(JSON.stringify(body));
  });
  return promise;
};

export const useDeepLFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<{translation: string}|null>(null);
  const promise = useRef<Promise<{translation: string}>|null>(null);
  const isInProgress = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () =>{
      isMounted.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    if (isInProgress.current) {
      return;
    }
    promise.current = null;
    setData(null);
    setIsLoading(false);
    setIsError(false);
  }, [])

  const sendRequest = useCallback((body: DeepLTranslationBody) => {
    if (isInProgress.current) {
      return;
    }
    setIsLoading(true);
    setIsError(false);
    promise.current = sendTranslationRequest(body);
    isInProgress.current = true;
    promise.current
    .then((response) => {
      if (isMounted.current) {
        setIsLoading(false);
        setIsError(false);
        setData(response);
        isInProgress.current = false;
      }
    })
    .catch(() => {
      if (isMounted.current) {
        setIsLoading(false);
        setIsError(true);
        setData(null);
        isInProgress.current = false;
      }
    });
  }, []);

  return {
    isLoading,
    isError,
    data,
    sendRequest,
    reset
  }
}