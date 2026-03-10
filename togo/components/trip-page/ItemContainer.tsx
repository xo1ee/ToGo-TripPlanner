import { Droppable } from "@hello-pangea/dnd";
import ItineraryItem, {
  ItineraryItemProps
} from "./ItineraryItem";

interface ItemContainerProps {
  id: string;
  wishlist: boolean;
  items: ItineraryItemProps[];
  onDisplayAddItemModal: (originatingContainerId: string) => void;
  onItemDelete?: (id: number) => void;
}

export default function ItemContainer(props: ItemContainerProps) {
  function displayAddItemModalPressed() {
    props.onDisplayAddItemModal(props.id);
  }
  return (
    <>
      <Droppable
        droppableId={props.id}
        direction={props.wishlist ? "horizontal" : "vertical"}
      >
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <div
              id={props.id}
              className={`flex gap-5 overflow-hidden w-full ${props.wishlist ? "flex-row" : "flex-col"}`}
            >
              {props.items.map((item, index) => (
                <ItineraryItem
                  key={item.id}
                  {...item}
                  index={index}
                  wishlistItem={props.wishlist}
                  onDelete={props.onItemDelete}
                />
              ))}
              {provided.placeholder}
            </div>
            {/* drag and drop / add button card */}
            <button
              onClick={displayAddItemModalPressed}
              className="group w-full h-20 cursor-pointer border border-1 border-dashed rounded-lg mt-5 select-none flex items-center justify-center bg-gray-50"
            >
              <h5 className="m-0 text-gray-400 group-hover:text-black font-normal">
                + Drop/Add Places Here
              </h5>
            </button>
          </div>
        )}
      </Droppable>
    </>
  );
}
