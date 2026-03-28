"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "briefforge-anonymous-id";

export function useAnonymousId(): { anonymousId: string; isReady: boolean } {
  const [anonymousId, setAnonymousId] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }

    setAnonymousId(id);
    setIsReady(true);
  }, []);

  return { anonymousId, isReady };
}
