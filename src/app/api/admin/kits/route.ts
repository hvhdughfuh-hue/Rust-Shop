import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { errorResponse, readJson, requireAdmin } from "@/lib/api";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data");
const KIT_FILE = path.join(DATA_DIR, "kits.json");

async function readKitsFromFile() {
  try {
    const content = await fs.promises.readFile(KIT_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
}

async function writeKitsToFile(kits: unknown) {
  try {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    await fs.promises.writeFile(KIT_FILE, JSON.stringify(kits, null, 2), "utf-8");
  } catch (e) {
    // ignore
  }
}

async function tryImportKitService() {
  try {
    return await import("@/lib/services/kit-service");
  } catch (err) {
    return null;
  }
}

export async function GET() {
  try {
    await requireAdmin();

    const svc = await tryImportKitService();
    if (svc && svc.getAllKits) {
      const kits = await svc.getAllKits();
      return NextResponse.json({ kits });
    }

    const kits = await readKitsFromFile();
    return NextResponse.json({ kits });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await readJson(request);
    const { name, label, description, items, visible } = body as any;

    if (!name || !label || !Array.isArray(items)) {
      throw new Error("Invalid kit payload");
    }

    const svc = await tryImportKitService();
    if (svc && svc.createKit) {
      const kit = await svc.createKit({ name, label, description, items, visible });
      return NextResponse.json({ kit });
    }

    const kits = await readKitsFromFile();
    if (kits.some((k: any) => k.name === name)) {
      return NextResponse.json({ error: "Kit already exists" }, { status: 400 });
    }

    const newKit = { name, label, description: description || "", items, visible: visible ?? true };
    kits.push(newKit);
    await writeKitsToFile(kits);

    return NextResponse.json({ kit: newKit });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await readJson(request);
    const { name, label, description, items, visible } = body as any;

    if (!name) {
      return NextResponse.json({ error: "Kit name required" }, { status: 400 });
    }

    const svc = await tryImportKitService();
    if (svc && svc.updateKit) {
      const kit = await svc.updateKit({ name, label, description, items, visible });
      if (!kit) return NextResponse.json({ error: "Kit not found" }, { status: 404 });
      return NextResponse.json({ kit });
    }

    const kits = await readKitsFromFile();
    const idx = kits.findIndex((k: any) => k.name === name);
    if (idx === -1) {
      return NextResponse.json({ error: "Kit not found" }, { status: 404 });
    }

    const updated = { ...kits[idx], label: label ?? kits[idx].label, description: description ?? kits[idx].description, items: Array.isArray(items) ? items : kits[idx].items, visible: typeof visible === "boolean" ? visible : kits[idx].visible };
    kits[idx] = updated;
    await writeKitsToFile(kits);

    return NextResponse.json({ kit: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const name = request.nextUrl.searchParams.get("name");
    if (!name) {
      return NextResponse.json({ error: "Kit name required" }, { status: 400 });
    }

    const svc = await tryImportKitService();
    if (svc && svc.deleteKit) {
      await svc.deleteKit(name);
      return NextResponse.json({ ok: true });
    }

    const kits = await readKitsFromFile();
    const filtered = kits.filter((k: any) => k.name !== name);
    await writeKitsToFile(filtered);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
