export interface TripCardProps {
  tripId: string,
  tripName: string,
  tripImgUrl?: string
}

export default function TripCard(props: TripCardProps) {
  return (
    <a
      href={`/trip/${props.tripId}`}
      className="relative block h-full w-full overflow-hidden rounded-xl bg-gray-200 shadow-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xl"
    >
      <img
        src={props.tripImgUrl || "/img_placeholder.svg"}
        alt={props.tripName}
        className="block h-full w-full object-cover"
      />
      <h5 className="absolute bottom-2 left-2 right-2 m-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg bg-white/70 px-2.5 py-2 font-bold leading-tight text-gray-800 backdrop-blur-sm">
        {props.tripName || `Fun Trip`}
      </h5>
    </a>
  );
}