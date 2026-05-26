import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { errorResponse } from "@/lib/api";

export const runtime = "nodejs";

const KIT_FILE = path.join(process.cwd(), "data", "kits.json");

async function readKitsFromFile() {
  try {
    const content = await fs.promises.readFile(KIT_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
}

async function tryImportKitService() {
  try {
    return await import("@/lib/services/kit-service");
  } catch (err) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const namesParam = request.nextUrl.searchParams.get("names");
    const svc = await tryImportKitService();

    if (namesParam) {
      const names = namesParam.split(",").map((s) => s.trim()).filter(Boolean);
      const kits = [];

      if (svc && svc.getKitByName) {
        for (const n of names) {
          const k = await svc.getKitByName(n);
          if (k) kits.push(k);
        }
        return NextResponse.json({ kits });
      }

      const all = await readKitsFromFile();
      for (const n of names) {
        const k = all.find((a: any) => a.name === n);
        if (k) kits.push(k);
      }
      return NextResponse.json({ kits });
    }

    if (svc && svc.getAllKits) {
      const kits = (await svc.getAllKits()).filter((k) => k.visible);
      return NextResponse.json({ kits });
    }

    const kits = (await readKitsFromFile()).filter((k: any) => k.visible);
    return NextResponse.json({ kits });
  } catch (error) {
    return errorResponse(error);
  }
}
