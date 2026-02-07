import { NextResponse } from "next/server";
import {
  getParcelOutItems,
  addParcelOutItem,
  updateParcelOutItem,
  deleteParcelOutItem,
} from "../../controller/parcelDelivery";

// GET: fetch all items
// route
export async function GET(req) {
  const { data, error } = await getParcelOutItems();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

// POST: add new parcel-out
export async function POST(req) {
  try {
    const body = await req.json();
    const { data, error } = await addParcelOutItem(body);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PUT: update parcel-out
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, updates } = body;
    const { data, error } = await updateParcelOutItem(id, updates);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data[0], { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE: delete parcel-out
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;
    const { data, error } = await deleteParcelOutItem(id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(
      { message: "Item deleted", data },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
