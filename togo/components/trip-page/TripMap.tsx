import {
  Map,
  MapCameraChangedEvent,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { ItineraryDayProps } from "./ItineraryDay";
import {
  ItineraryItemProps
} from "@/components/trip-page/ItineraryItem";

interface MapViewProps {
  lat: number;
  lon: number;
  itinerary: ItineraryDayProps[];
}

export default function TripMap({ lat, lon, itinerary }: MapViewProps) {
  return (
    <Map
      mapId={"d324cbd014b8ccf5e5e023e5"}
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
          ></AdvancedMarker>
        )),
      )}
    </Map>
  );
}
