import { Draggable } from "@hello-pangea/dnd";
import { useRef, useState } from "react";

export interface MapLocation {
  locationId: string;
  displayName: string;
  locationLat: number;
  locationLon: number;
}

export interface ItineraryItemProps {
  id: number;
  index: number; // position in ItemContainer
  wishlistItem?: boolean; // passed in through ItemContainer
  itemName: string;
  itemDesc: string;
  location?: MapLocation;
  destImg?: string;
  itemNote?: string;
  onDelete?: (id: number) => void;
}

export default function ItineraryItem(props: ItineraryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  function expandItem() {
    setIsExpanded((prev) => !prev);
  }

  function handleDelete() {
    if (props.onDelete) {
      props.onDelete(props.id);
    } else {
      console.error(
        `Delete function missing on ItinearyItem with id ${props.id}`,
      );
    }
  }

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [originalNote, setOriginalNote] = useState(props.itemNote || "");
  const noteRef = useRef<HTMLTextAreaElement>(null);
  function editNote() {
    setIsEditingNote(true);
  }
  function saveNote() {
    setOriginalNote(noteRef.current?.value || "");
    setIsEditingNote(false);
    // TODO: update database
  }
  function cancelNoteChanges() {
    if (noteRef.current) {
      noteRef.current.value = originalNote;
    }
    setIsEditingNote(false);
  }

  return (
    <Draggable draggableId={props.id.toString()} index={props.index}>
      {(provided, snapshot) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="itinerary-item flex flex-row items-center"
          >
            <div
              className={`shrink ${snapshot.isDragging ? "bg-gray-100 itinerary-item-dragging" : "bg-gray-50"} rounded-lg border-1 border-dashed overflow-hidden ${props.wishlistItem ? "w-55 h-18 flex-none" : "w-full min-h-20"}`}
            >
              {/* main destination details */}
              <div className="flex flex-nowrap justify-between items-center h-full">
                <img
                  src={props.destImg ? props.destImg : "img_placeholder.svg"}
                  className="h-20 w-20 object-cover grow-0 shrink-0"
                />
                <button
                  onClick={expandItem}
                  className={`grow text-start select-text ${props.wishlistItem ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="ml-2 min-w-0 flex-1">
                    <h5 className="m-0 line-clamp-3">{props.itemName}</h5>
                    <p
                      className="text-xs line-clamp-3"
                      hidden={props.wishlistItem}
                    >
                      {props.itemDesc}
                    </p>
                  </div>
                </button>
                {/* move handle */}
                <div {...provided.dragHandleProps}>
                  <svg
                    className="move-icon w-10 grow-0 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.14285 8.57144H18.8571M5.14056 12H18.8514M5.14285 15.4286H18.8514"
                      stroke={`${snapshot.isDragging ? "black" : "gray"}`}
                    />
                  </svg>
                </div>
              </div>

              {/* notes container */}
              <div
                className="border-t-1 border-dashed overflow-hidden mx-2"
                hidden={
                  isExpanded ? false : props.wishlistItem || !props.itemNote
                }
              >
                <div className="flex gap-2 my-1">
                  <img
                    className="self-start py-2 pt-2.5"
                    src="/note_icon.svg"
                    alt="Note icon"
                  ></img>
                  <textarea
                    ref={noteRef}
                    readOnly={!isEditingNote}
                    onClick={editNote}
                    className={`self-center bg-gray-100 px-3 py-1 rounded-lg field-sizing-content resize-none text-md/5 ${isEditingNote ? "w-full" : "truncate"}`}
                    defaultValue={originalNote}
                  />
                  <button
                    hidden={!isEditingNote}
                    onClick={saveNote}
                    className="save-note-button self-end p-2 bg-blue-100 rounded-lg"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        fill="gray"
                        d="M18.1716 1C18.702 1 19.2107 1.21071 19.5858 1.58579L22.4142 4.41421C22.7893 4.78929 23 5.29799 23 5.82843V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H18.1716ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21L5 21L5 15C5 13.3431 6.34315 12 8 12L16 12C17.6569 12 19 13.3431 19 15V21H20C20.5523 21 21 20.5523 21 20V6.82843C21 6.29799 20.7893 5.78929 20.4142 5.41421L18.5858 3.58579C18.2107 3.21071 17.702 3 17.1716 3H17V5C17 6.65685 15.6569 8 14 8H10C8.34315 8 7 6.65685 7 5V3H4ZM17 21V15C17 14.4477 16.5523 14 16 14L8 14C7.44772 14 7 14.4477 7 15L7 21L17 21ZM9 3H15V5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5V3Z"
                      />
                    </svg>
                  </button>
                  <button
                    hidden={!isEditingNote}
                    onClick={cancelNoteChanges}
                    className="cancel-note-button self-end p-2 bg-gray-100 rounded-lg"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 64 64"
                      xmlns="http://www.w3.org/2000/svg"
                      strokeWidth="3"
                      stroke="#7d3d3d"
                      fill="none"
                    >
                      <line x1="8.06" y1="8.06" x2="55.41" y2="55.94" />
                      <line x1="55.94" y1="8.06" x2="8.59" y2="55.94" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* extra details */}
              <div
                className="border-t-1 border-dashed overflow-hidden px-2 py-1"
                hidden={!isExpanded}
              >
                <p>one day there will be details here</p>
              </div>
            </div>
            {/* delete button */}
            <button
              className="delete-button p-2 cursor-pointer"
              onClick={handleDelete}
              hidden={!isExpanded}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.6667 1.16667V2H14.1667C14.2993 2 14.4265 2.05268 14.5203 2.14645C14.614 2.24021 14.6667 2.36739 14.6667 2.5C14.6667 2.63261 14.614 2.75979 14.5203 2.85355C14.4265 2.94732 14.2993 3 14.1667 3H1.83337C1.70077 3 1.57359 2.94732 1.47982 2.85355C1.38605 2.75979 1.33337 2.63261 1.33337 2.5C1.33337 2.36739 1.38605 2.24021 1.47982 2.14645C1.57359 2.05268 1.70077 2 1.83337 2H5.33337V1.16667C5.33337 0.522667 5.85604 0 6.50004 0H9.50004C10.144 0 10.6667 0.522667 10.6667 1.16667ZM6.33337 1.16667V2H9.66671V1.16667C9.66671 1.12246 9.64915 1.08007 9.61789 1.04882C9.58664 1.01756 9.54424 1 9.50004 1H6.50004C6.45584 1 6.41344 1.01756 6.38219 1.04882C6.35093 1.08007 6.33337 1.12246 6.33337 1.16667ZM3.33137 4.11867C3.32567 4.05284 3.30698 3.9888 3.27638 3.93024C3.24578 3.87168 3.20388 3.81977 3.1531 3.7775C3.10231 3.73523 3.04366 3.70345 2.98052 3.68398C2.91737 3.66452 2.851 3.65777 2.78524 3.66411C2.71947 3.67045 2.65561 3.68977 2.59735 3.72094C2.5391 3.75211 2.48759 3.79452 2.44583 3.84571C2.40406 3.89691 2.37285 3.95587 2.354 4.0192C2.33516 4.08253 2.32905 4.14896 2.33604 4.21467L3.27737 13.9467C3.30553 14.2351 3.44005 14.5028 3.65473 14.6975C3.86941 14.8922 4.14888 15 4.43871 15H11.5614C11.8513 15 12.1309 14.8921 12.3456 14.6972C12.5603 14.5024 12.6947 14.2346 12.7227 13.946L13.6647 4.21467C13.6774 4.08259 13.6372 3.95086 13.5528 3.84847C13.4684 3.74607 13.3468 3.6814 13.2147 3.66867C13.0826 3.65594 12.9509 3.69619 12.8485 3.78059C12.7461 3.86498 12.6814 3.98659 12.6687 4.11867L11.7274 13.8493C11.7234 13.8906 11.7042 13.9289 11.6735 13.9567C11.6428 13.9846 11.6028 14 11.5614 14H4.43871C4.39726 14 4.35728 13.9846 4.32659 13.9567C4.2959 13.9289 4.27669 13.8906 4.27271 13.8493L3.33137 4.11867Z"
                  fill="black"
                />
                <path
                  d="M6.13731 5.00064C6.20289 4.99677 6.26859 5.00585 6.33066 5.02738C6.39272 5.0489 6.44994 5.08245 6.49904 5.12609C6.54813 5.16974 6.58815 5.22264 6.61679 5.28176C6.64544 5.34088 6.66215 5.40506 6.66598 5.47065L6.99931 11.1373C7.00709 11.2698 6.96191 11.4 6.8737 11.4992C6.7855 11.5984 6.6615 11.6585 6.52898 11.6663C6.39646 11.6741 6.26627 11.6289 6.16707 11.5407C6.06786 11.4525 6.00776 11.3285 5.99998 11.196L5.66664 5.52931C5.66277 5.46373 5.67185 5.39803 5.69337 5.33597C5.7149 5.2739 5.74844 5.21668 5.79209 5.16758C5.83574 5.11849 5.88864 5.07847 5.94776 5.04983C6.00688 5.02119 6.07106 5.00447 6.13664 5.00064H6.13731ZM10.3326 5.52931C10.3404 5.39679 10.2952 5.26661 10.207 5.1674C10.1188 5.0682 9.99483 5.00809 9.86231 5.00031C9.72979 4.99253 9.59961 5.03771 9.5004 5.12592C9.40119 5.21412 9.34109 5.33813 9.33331 5.47065L8.99998 11.1373C8.9922 11.2697 9.03734 11.3998 9.12549 11.499C9.21363 11.5981 9.33755 11.6582 9.46998 11.666C9.60241 11.6738 9.73251 11.6286 9.83165 11.5405C9.93079 11.4523 9.99086 11.3284 9.99864 11.196L10.3326 5.52931Z"
                  fill="black"
                />
              </svg>
            </button>
          </div>
        );
      }}
    </Draggable>
  );
}
