import { useState } from "react";
import ItemContainer from "./ItemContainer";
import { ItineraryItemProps, MapLocation } from "./ItineraryItem";

export interface ItineraryDayProps {
  date: Date;
  items: ItineraryItemProps[];
  onItemCreate?: (location: MapLocation, containerId: number) => void;
  onItemDelete?: (id: number) => void;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function getItineraryDayId(date: Date) {
  return date.toLocaleDateString().replaceAll("/", "-");
}

export default function ItineraryDay(props: ItineraryDayProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  function collapseContainer() {
    setIsCollapsed((prev) => !prev);
  }

  return (
    <div>
      <hr className="mb-3"></hr>
      <div className="flex mb-1">
        <button onClick={collapseContainer} className="w-10 cursor-pointer">
          <img
            src={
              isCollapsed
                ? "/collapse_icon-closed.svg"
                : "/collapse_icon-open.svg"
            }
          />
        </button>
        <h3 className="m-0">{dateFormatter.format(props.date)}</h3>
      </div>
      <div hidden={isCollapsed}>
        <ItemContainer
          id={getItineraryDayId(props.date)}
          wishlist={false}
          items={props.items}
          onItemCreate={props.onItemCreate}
          onItemDelete={props.onItemDelete}
        />
      </div>
    </div>
  );
}
