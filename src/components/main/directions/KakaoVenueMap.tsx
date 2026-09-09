"use client";

import { useEffect, useRef } from "react";
import { EVENT } from "@/lib/event";

const APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

type KakaoLatLng = object;

type KakaoMap = {
  relayout: () => void;
  setCenter: (latlng: KakaoLatLng) => void;
};

type KakaoMaps = {
  load: (cb: () => void) => void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (
    el: HTMLElement,
    opts: { center: KakaoLatLng; level: number },
  ) => KakaoMap;
  Marker: new (opts: { position: KakaoLatLng; map: KakaoMap }) => object;
  InfoWindow: new (opts: { content: string }) => {
    open: (map: KakaoMap, marker: object) => void;
  };
};

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}

function loadSdk(key: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve();
      return;
    }

    const ready = () => resolve();
    const existing = document.getElementById("kakao-map-sdk");
    if (existing) {
      existing.addEventListener("load", ready, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-sdk";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
    script.async = true;
    script.onload = ready;
    script.onerror = () => reject(new Error("kakao map sdk"));
    document.head.appendChild(script);
  });
}

export function KakaoVenueMap() {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!APP_KEY) return;
    const el = boxRef.current;
    if (!el) return;

    let cancelled = false;
    let map: KakaoMap | undefined;
    const onResize = () => {
      if (!map) return;
      map.relayout();
      map.setCenter(new window.kakao!.maps.LatLng(EVENT.venueLat, EVENT.venueLng));
    };
    const ro = new ResizeObserver(onResize);

    void loadSdk(APP_KEY)
      .then(
        () =>
          new Promise<void>((resolve) => {
            window.kakao!.maps.load(() => resolve());
          }),
      )
      .then(() => {
        if (cancelled || !el) return;
        const kakao = window.kakao!.maps;
        const center = new kakao.LatLng(EVENT.venueLat, EVENT.venueLng);
        map = new kakao.Map(el, { center, level: 4 });
        const marker = new kakao.Marker({ position: center, map });
        const info = new kakao.InfoWindow({
          content: `<div class="kakao-map__pin">${EVENT.venue}</div>`,
        });
        info.open(map, marker);
        map.relayout();
        map.setCenter(center);
        ro.observe(el);
        window.addEventListener("resize", onResize);
      });

    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!APP_KEY) {
    return (
      <a
        className="kakao-map kakao-map--link"
        href={EVENT.mapUrl}
        target="_blank"
        rel="noreferrer"
      >
        카카오맵에서 보기
      </a>
    );
  }

  return (
    <div
      ref={boxRef}
      className="kakao-map"
      role="img"
      aria-label={`${EVENT.venue} 카카오맵`}
    />
  );
}
