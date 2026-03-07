"use client";
import { ItineraryItemProps } from "@/components/trip-page/ItineraryItem";
import { ItineraryDayProps } from "@/components/trip-page/ItineraryDay";
import Trip from "@/components/trip-page/Trip";

export interface TripProps {
  userId: number[]; // intended to store the users in the trip TODO: remove if necessary
  tripName: string;
  startDate: Date;
  endDate: Date;
  tripLat: number;
  tripLon: number;
}

export default function TripPage(tripInfo: TripProps) {
  // TODO: remove hardcoded test values
  const mockTrip: TripProps = {
    userId: [1, 2, 3],
    tripName: "Friends New Years Trip!",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-01-07"),
    // Seattle:
    // tripLat: 47.608,
    // tripLon: -122.3352,

    // New York:
    tripLat: 40.7128,
    tripLon: -74.006,
  };

  const mockWishList: ItineraryItemProps[] = [
    {
      id: 0,
      index: 0,
      itemName: "Central Park",
      itemDesc:
        "Central park is considered the heart of New York. With the park spanning over 800 acres, visitors can walk around scenic paths and discover an abundance of attractions!",
      destImg:
        "https://lh3.googleusercontent.com/gps-cs-s/AHVAweqKCop4voDjTEiAlmhsYYEK0tCj8zvKerfFK201dC3bigw31EvAYeVl3aKjftWVc8sJEyoExHTH20m9cRcwA2nwVodKqlf7R1mnUhHJabnGVJaQpRQ-ta_grh-TI_OuTyeGXi2a=s1360-w1360-h1020-rw",
      itemNote: "Bike",
    },
  ];

  const mockItinerary: ItineraryDayProps[] = [
    {
      date: mockTrip.startDate,
      items: [
        {
          id: 1,
          index: 0,
          itemName: "Central Park",
          itemDesc: "Central park is considered the heart of New York...",
          destImg:
            "https://lh3.googleusercontent.com/gps-cs-s/AHVAweqKCop4voDjTEiAlmhsYYEK0tCj8zvKerfFK201dC3bigw31EvAYeVl3aKjftWVc8sJEyoExHTH20m9cRcwA2nwVodKqlf7R1mnUhHJabnGVJaQpRQ-ta_grh-TI_OuTyeGXi2a=s1360-w1360-h1020-rw",
          itemNote: "Picnic",
        },
        {
          id: 2,
          index: 1,
          itemName: "Times Square",
          itemDesc: "Times Square description",
          destImg: "/img_placeholder.svg",
          itemNote: "Shopping",
        },
      ],
    },
    {
      date: mockTrip.endDate,
      items: [
        {
          id: 3,
          index: 0,
          itemName: "Central Park",
          itemDesc: "Central park is considered the heart of New York...",
          destImg:
            "https://lh3.googleusercontent.com/gps-cs-s/AHVAweqKCop4voDjTEiAlmhsYYEK0tCj8zvKerfFK201dC3bigw31EvAYeVl3aKjftWVc8sJEyoExHTH20m9cRcwA2nwVodKqlf7R1mnUhHJabnGVJaQpRQ-ta_grh-TI_OuTyeGXi2a=s1360-w1360-h1020-rw",
          itemNote: "Picnic",
        },
        {
          id: 4,
          index: 1,
          itemName: "Times Square",
          itemDesc: "Times Square description",
          destImg: "/img_placeholder.svg",
          itemNote: "Shopping",
        },
      ],
    },
  ];

  return (
    <Trip
      tripInfo={mockTrip}
      wishlist={mockWishList}
      itinerary={mockItinerary}
    ></Trip>
  );
}
