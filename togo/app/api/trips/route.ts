import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
const TRIPS_COLLECTION = "trips";

export async function POST(req: NextRequest) {
  try {
    const formValues = await req.json();

    // TODO: add value validation

    // parse request body
    const { destination, startDate, endDate, users } = formValues;

    const docRef = await addDoc(collection(db, TRIPS_COLLECTION), {
      destination,
      startDate,
      endDate,
      users,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { tripId: docRef.id, message: "Post created" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  //   return NextResponse.json({ trips }, { status: 200 });
}
