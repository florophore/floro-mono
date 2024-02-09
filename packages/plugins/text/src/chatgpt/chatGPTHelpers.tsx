import { useState, useEffect, useCallback, useRef } from "react";

interface SourcePromptRequest {
  targetText: string;
  sourceText: string;
  prompt: string;
  openAIKey: string;
  targetLang: string;
  sourceLang: string;
  includeSource: boolean;
  termBase: string;
  messages: Array<{
    prompt: string;
    includeSource: boolean;
    promptResponse: string;
  }>;
}

export const sendPromptRequest = async (body: {
  targetText: string;
  sourceText: string;
  prompt: string;
  openAIKey: string;
  targetLang: string;
  sourceLang: string;
  includeSource: boolean;
  termBase: string;
  messages: Array<{
    prompt: string;
    includeSource: boolean;
    promptResponse: string;
  }>;
}): Promise<{
  prompt: string;
  includeSource: boolean;
  promptResponse: string;
}> => {
  const xhr = new XMLHttpRequest();
  let promise = new Promise<{
    prompt: string;
    includeSource: boolean;
    promptResponse: string;
  }>((resolve, reject) => {
    xhr.responseType = "json";
    xhr.open("POST", "https://floro.io/proxy/chatgpt/prompt");
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
        if (status >= 200 && status < 400) {
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

interface TermRequest {
  localeCode: string;
  plainText: string;
  openAIKey: string;
}

export const sendTermSearchRequest = async (body: {
  localeCode: string;
  plainText: string;
  openAIKey: string;
}): Promise<Array<string>> => {
  const xhr = new XMLHttpRequest();
  let promise = new Promise<Array<string>>((resolve, reject) => {
    xhr.responseType = "json";
    xhr.open("POST", "https://floro.io/proxy/chatgpt/terms");
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
        if (status >= 200 && status < 400) {
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

interface PluralizeRequest {
  localeCode: string;
  richText: string;
  varName: string;
  varType: string;
  openAIKey: string;
  isGenderized: boolean;
}

export const sendPluralizationRequest = async (body: {
  localeCode: string;
  richText: string;
  varName: string;
  varType: string;
  openAIKey: string;
  isGenderized: boolean;
}): Promise<Array<ConditionalStatement>> => {
  const xhr = new XMLHttpRequest();
  let promise = new Promise<Array<ConditionalStatement>>((resolve, reject) => {
    xhr.responseType = "json";
    xhr.open("POST", "https://floro.io/proxy/chatgpt/pluralize");
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
        if (status >= 200 && status < 400) {
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

export interface ConditionalStatement {
  translation: string;
  condition?: number;
  operator: string;
  subconditions: Array<{
    condition: number|string;
    operator: string;
  }>;
}


interface GenderizeRequest {
  localeCode: string;
  richText: string;
  openAIKey: string;
}

export interface GenderCondition {
  translation: string;
  condition: "male"|"female"|"neutral";
}

export const sendGenderizationRequest = async (body: {
  localeCode: string;
  richText: string;
  openAIKey: string;
}): Promise<Array<GenderCondition>> => {
  const xhr = new XMLHttpRequest();
  let promise = new Promise<Array<GenderCondition>>((resolve, reject) => {
    xhr.responseType = "json";
    xhr.open("POST", "https://floro.io/proxy/chatgpt/genderize");
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
        if (status >= 200 && status < 400) {
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

export const useChatGPTFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] =
    useState<{
      prompt: string;
      includeSource: boolean;
      promptResponse: string;
    } | null>(null);
  const promise =
    useRef<Promise<{
      prompt: string;
      includeSource: boolean;
      promptResponse: string;
    }> | null>(null);
  const isInProgress = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    if (isInProgress.current) {
      return;
    }
    promise.current = null;
    setData(null);
    setIsLoading(false);
    setIsError(false);
  }, []);

  const sendRequest = useCallback((body: SourcePromptRequest) => {
    if (isInProgress.current) {
      return;
    }
    setIsLoading(true);
    setIsError(false);
    promise.current = sendPromptRequest(body);
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
    reset,
  };
};

export const useChatGPTTermSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<Array<string> | null>(null);
  const promise = useRef<Promise<Array<string>> | null>(null);
  const isInProgress = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    if (isInProgress.current) {
      return;
    }
    promise.current = null;
    setData(null);
    setIsLoading(false);
    setIsError(false);
  }, []);

  const sendRequest = useCallback((body: TermRequest) => {
    if (isInProgress.current) {
      return;
    }
    setIsLoading(true);
    setIsError(false);
    promise.current = sendTermSearchRequest(body);
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
    reset,
  };
};

export const useChatGPTPluralizationRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<Array<ConditionalStatement> | null>(null);
  const promise = useRef<Promise<Array<ConditionalStatement>> | null>(null);
  const isInProgress = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    if (isInProgress.current) {
      return;
    }
    promise.current = null;
    setData(null);
    setIsLoading(false);
    setIsError(false);
  }, []);

  const sendRequest = useCallback((body: PluralizeRequest) => {
    if (isInProgress.current) {
      return;
    }
    setIsLoading(true);
    setIsError(false);
    promise.current = sendPluralizationRequest(body);
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
    reset,
  };
};


export const useChatGPTGenderizationRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<Array<GenderCondition> | null>(null);
  const promise = useRef<Promise<Array<GenderCondition>> | null>(null);
  const isInProgress = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    if (isInProgress.current) {
      return;
    }
    promise.current = null;
    setData(null);
    setIsLoading(false);
    setIsError(false);
  }, []);

  const sendRequest = useCallback((body: GenderizeRequest) => {
    if (isInProgress.current) {
      return;
    }
    setIsLoading(true);
    setIsError(false);
    promise.current = sendGenderizationRequest(body);
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
    reset,
  };
};
