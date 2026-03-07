import { Map, MapCameraChangedEvent } from "@vis.gl/react-google-maps";

interface MapViewProps {
  lat: number;
  lon: number;
}

export default function TripMap({ lat, lon }: MapViewProps) {
  return (
    <Map
      defaultZoom={13}
      defaultCenter={{ lat: lat, lng: lon }}
      onCameraChanged={(ev: MapCameraChangedEvent) =>
        console.log(
          "camera changed:",
          ev.detail.center,
          "zoom:",
          ev.detail.zoom,
        )
      }
    ></Map>
  );
}
