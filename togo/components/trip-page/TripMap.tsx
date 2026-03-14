import {
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { ItineraryDayProps } from "./ItineraryDay";

const DAY_COLORS: Record<number, string> = {
  0:  "#e6194b", 1:  "#3cb44b", 2:  "#4363d8", 3:  "#f58231",
  4:  "#911eb4", 5:  "#42d4f4", 6:  "#f032e6", 7:  "#bfef45",
  8:  "#fabed4", 9:  "#469990", 10: "#dcbeff", 11: "#9a6324",
  12: "#fffac8", 13: "#800000", 14: "#aaffc3", 15: "#808000",
  16: "#ffd8b1", 17: "#000075", 18: "#a9a9a9", 19: "#e6beff",
  20: "#ff4500", 21: "#2e8b57", 22: "#1e90ff", 23: "#ffd700",
  24: "#dc143c", 25: "#00ced1", 26: "#ff69b4", 27: "#8b4513",
  28: "#7fff00", 29: "#4b0082", 30: "#ff8c00", 31: "#00fa9a",
};

interface MapViewProps {
  lat: number;
  lon: number;
  itinerary: ItineraryDayProps[];
  selectedItemId?: string | null;
}

export default function TripMap({ lat, lon, itinerary, selectedItemId }: MapViewProps) {
  const map = useMap();

  // pan to marker when ItineraryItem is expanded
  useEffect(() => {
    if (!selectedItemId) return;
    if (!map) return;

    // get itinerary item location
    const item = itinerary.flatMap((d) => d.items).find((i) => i.firestoreId === selectedItemId);
    if (item?.location) {
      const target = {
        lat: item.location.locationLat,
        lng: item.location.locationLon,
      };
      // get map bounds
      const bounds = map.getBounds();
      if (!bounds || !bounds.contains(target)) {
        // only pans if not in view
        map.panTo(target);
      }
    }
  }, [selectedItemId, map, itinerary]);

  return (
    <Map
      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
      defaultZoom={13}
      defaultCenter={{ lat: lat, lng: lon }}
    >
      {itinerary?.flatMap((days) =>
        days.items.map((location) => (
          <AdvancedMarker
            key={location.firestoreId}
            position={{
              lat: location.location?.locationLat ?? 0,
              lng: location.location?.locationLon ?? 0,
            }}
          >
            <Pin
              background={DAY_COLORS[days.dayIndex % 32]}
              borderColor={DAY_COLORS[days.dayIndex % 32]}
              glyphColor="white"
            />
          </AdvancedMarker>
        ))
      )}
    </Map>
  );
}
