import React, { useEffect, useRef, useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import CustomModal from "./CustomModal";

declare global {
  interface Window {
    google: any;
  }
}

type Concert = {
  name: string;
  location: string;
  type: string;
  durationMinutes: number;
  date: string[];
  startTime: string;
  artists: string[];
  ticketLink: string;
  poster: string;
  lat: string;
  lng: string;
  ticketOpen?: any;
};

interface GoogleMapProps {
  globalConcerts: Concert[];
  setShowPastConcertsGlobal: (show: boolean) => void;
  selectedGlobalConcert: Concert | null;
  setSelectedGlobalConcert: (concert: Concert) => void;
}

const GoogleMap = ({
  globalConcerts,
  setShowPastConcertsGlobal,
  selectedGlobalConcert,
  setSelectedGlobalConcert,
}: GoogleMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const markersRef = useRef<any[]>([]);
  const [currentInfoWindow, setCurrentInfoWindow] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (mapContainerRef.current && !map) {
      if (!window.google || !window.google.maps) {
        return;
      }
      const initializedMap = new window.google.maps.Map(
        mapContainerRef.current,
        {
          center: { lat: 37.5665, lng: 126.978 },
          zoom: 4,
          disableDefaultUI: true,
        }
      );

      setMap(initializedMap);
    }
  }, [mapContainerRef, map]);

  useEffect(() => {
    if (!map || !globalConcerts.length) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    globalConcerts.forEach((concert) => {
      const today = new Date();
      let isPast = false;

      // Check if the concert is in the past
      concert.date.forEach((dateString) => {
        const concertDate = new Date(dateString.split("(")[0]);
        if (concertDate < today) {
          isPast = true;
        }
      });

      const position = {
        lat: parseFloat(concert.lat),
        lng: parseFloat(concert.lng),
      };
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: concert.name,
        icon: {
          url: isPast ? "/image/nfimap_darkened.png" : "/image/nfimap.png",
          scaledSize: new window.google.maps.Size(30, 30),
        },
      });

      const infoWindowContent = `
        <div style="width: 320px; max-width: 320px; font-family: Arial, sans-serif; padding: 10px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 4px; box-sizing: border-box;">
          <div style="display: flex; align-items: center;">
            <div style="width: 70px; height: 70px; min-width: 70px; min-height: 70px; margin-right: 15px; border-radius: 4px; overflow: hidden;">
              <img src="${concert.poster}" alt="${concert.name}" 
                  style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
            </div>
            <div style="flex-grow: 1;">
              <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #333;">${concert.name}</h3>
              <p style="margin: 5px 0 0; font-size: 14px; color: #666;">${concert.location}</p>
            </div>
          </div>
          <button class="detailBtn" style="margin-top: 5px; padding: 4px 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; background-color: #0597F2; color: white; cursor: pointer; transition: background-color 0.3s, color 0.3s;">
            상세보기
          </button>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoWindowContent,
      });

      marker.addListener("click", () => {
        if (currentInfoWindow) {
          currentInfoWindow.close();
        }
        infoWindow.open(map, marker);
        setCurrentInfoWindow(infoWindow);
        setSelectedGlobalConcert(concert);
        map.setCenter(position);
        map.setZoom(14);

        setTimeout(() => {
          const button = document.querySelector(".detailBtn");
          if (button) {
            button.addEventListener("click", () => {
              onOpen();
            });
          }
        }, 100);
      });

      markersRef.current.push(marker);
    });
    const style = document.createElement("style");
    style.textContent = `
      .gm-style-iw-c {
        padding: 0 !important;
      }
      .gm-style-iw-d {
        overflow: hidden !important;
      }
      .gm-style-iw-t::after {
        display: none !important;
      }
      .gm-style-iw-chr {
        display: none !important;
      }
      .gm-style-iw {
        padding: 0 !important;
      }
    `;
    document.head.appendChild(style);

    // Add click listener to map to close InfoWindow
    window.google.maps.event.addListener(map, "click", () => {
      if (currentInfoWindow) {
        currentInfoWindow.close();
        setCurrentInfoWindow(null);
      }
    });
  }, [map, globalConcerts]);

  useEffect(() => {
    if (!selectedGlobalConcert || !map) return;

    const marker = markersRef.current.find(
      (marker) => marker.getTitle() === selectedGlobalConcert.name
    );

    if (marker) {
      window.google.maps.event.trigger(marker, "click");
    }
  }, [selectedGlobalConcert]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "calc(100vh - 120px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        item={selectedGlobalConcert}
      />
    </div>
  );
};

export default GoogleMap;