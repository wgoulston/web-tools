import { NextRequest, NextResponse } from "next/server";
import { PKPass } from "passkit-generator";
import path from "path";
import fs from "fs";

function hexToRgb(hex: string): string {
  // Convert "#rrggbb" to "rgb(r, g, b)"
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!result) return hex;
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Check for required certificates
    const certPath = process.env.PASS_CERT_PATH;
    const certPassword = process.env.PASS_CERT_PASSWORD;
    const passTypeId = process.env.PASS_TYPE_ID;
    const teamId = process.env.PASS_TEAM_ID;

    if (!certPath || !certPassword || !passTypeId || !teamId) {
      return NextResponse.json(
        {
          error:
            "Pass generation requires Apple Developer certificates. Set PASS_CERT_PATH, PASS_CERT_PASSWORD, PASS_TYPE_ID, and PASS_TEAM_ID environment variables.",
        },
        { status: 503 }
      );
    }

    // Load cert (p12 buffer)
    const signerCert = fs.readFileSync(certPath);

    // WWDR certificate path (bundled or env)
    const wwdrPath = process.env.PASS_WWDR_PATH ?? path.join(process.cwd(), "certs", "wwdr.pem");
    const wwdrCert = fs.readFileSync(wwdrPath);

    const pass = new PKPass(
      {},
      {
        signerCert,
        signerKey: signerCert, // p12 contains both
        signerKeyPassphrase: certPassword,
        wwdr: wwdrCert,
      },
      {
        passTypeIdentifier: passTypeId,
        teamIdentifier: teamId,
        serialNumber: data.serialNumber || "001",
        description: data.description || "My Pass",
        organizationName: data.organizationName || "My Organization",
        logoText: data.logoText,
        backgroundColor: data.backgroundColor ? hexToRgb(data.backgroundColor) : undefined,
        foregroundColor: data.foregroundColor ? hexToRgb(data.foregroundColor) : undefined,
        labelColor: data.labelColor ? hexToRgb(data.labelColor) : undefined,
      }
    );

    // Set pass style
    pass.type = data.style ?? "generic";

    // Add barcode
    if (data.barcodeMessage) {
      pass.setBarcodes({
        message: data.barcodeMessage,
        format: data.barcodeFormat ?? "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
      });
    }

    // Add fields
    const addFields = (
      area: "headerFields" | "primaryFields" | "secondaryFields" | "auxiliaryFields",
      fields: Array<{ key: string; label: string; value: string }>
    ) => {
      fields.forEach((f) => {
        if (f.label || f.value) {
          pass[area].push({ key: f.key, label: f.label, value: f.value });
        }
      });
    };

    addFields("headerFields", data.headerFields ?? []);
    addFields("primaryFields", data.primaryFields ?? []);
    addFields("secondaryFields", data.secondaryFields ?? []);
    addFields("auxiliaryFields", data.auxiliaryFields ?? []);

    const buffer = await pass.getAsBuffer();
    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": 'attachment; filename="pass.pkpass"',
      },
    });
  } catch (err) {
    console.error("Pass generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
