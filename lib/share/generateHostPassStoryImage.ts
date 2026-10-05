export interface HostPassStoryData {
  venueName: string;
  planCode: string;
  squadSize: number;
  totalCost: number;
  perPerson: number;
  dateStr: string;
  areaName?: string;
}

/**
 * Generates an aesthetic, high-resolution 1080x1920 (9:16) Instagram Story image
 * representing the official OyaPlan Host Pass / Till Slip.
 */
export async function generateHostPassStoryCanvas(
  data: HostPassStoryData
): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = 1920;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // 1. Deep Obsidian Background
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, width, height);

  // Subtle background grain grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 2. Top Yellow Accent Bar
  ctx.fillStyle = "#F9E828";
  ctx.fillRect(80, 140, width - 160, 16);

  // 3. Central Physical Till Slip Container
  const slipX = 80;
  const slipY = 156;
  const slipWidth = width - 160;
  const slipHeight = 1620;

  ctx.fillStyle = "#181818";
  ctx.fillRect(slipX, slipY, slipWidth, slipHeight);

  // Outer border with dashed border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 3;
  ctx.strokeRect(slipX, slipY, slipWidth, slipHeight);

  // 4. Header metadata
  ctx.fillStyle = "#F9E828";
  ctx.font = "bold 28px 'Courier New', monospace";
  ctx.fillText("OYAPLAN • THE OUTSIDE MATH", slipX + 60, slipY + 90);

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "24px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText(data.dateStr.toUpperCase(), slipX + slipWidth - 60, slipY + 90);
  ctx.textAlign = "left";

  // Perforated line
  drawDashedLine(ctx, slipX + 60, slipY + 130, slipX + slipWidth - 60, slipY + 130, [12, 10]);

  // 5. Destination Hero Block
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.fillText("DESTINATION", slipX + 60, slipY + 200);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 76px 'Impact', sans-serif";
  const venueTitle = data.venueName.toUpperCase();
  ctx.fillText(venueTitle.length > 18 ? venueTitle.slice(0, 18) + "..." : venueTitle, slipX + 60, slipY + 290);

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "28px 'Courier New', monospace";
  ctx.fillText(`LAGOS LEISURE OUTING ${data.areaName ? `// ${data.areaName.toUpperCase()}` : ""}`, slipX + 60, slipY + 345);

  // 6. Outing Squad & Per Person Block
  const statBoxY = slipY + 410;
  const statBoxHeight = 220;
  ctx.fillStyle = "#111111";
  ctx.fillRect(slipX + 60, statBoxY, slipWidth - 120, statBoxHeight);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 2;
  ctx.strokeRect(slipX + 60, statBoxY, slipWidth - 120, statBoxHeight);

  // Left col: Squad
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "bold 22px 'Courier New', monospace";
  ctx.fillText("SQUAD SIZE", slipX + 100, statBoxY + 65);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 56px 'Impact', sans-serif";
  ctx.fillText(`${data.squadSize} PEOPLE`, slipX + 100, statBoxY + 145);

  // Vertical divider inside stat box
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.moveTo(slipX + slipWidth / 2, statBoxY + 30);
  ctx.lineTo(slipX + slipWidth / 2, statBoxY + statBoxHeight - 30);
  ctx.stroke();

  // Right col: Cost per head
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "bold 22px 'Courier New', monospace";
  ctx.fillText("COST / PERSON", slipX + slipWidth / 2 + 40, statBoxY + 65);
  ctx.fillStyle = "#F9E828";
  ctx.font = "bold 56px 'Impact', sans-serif";
  ctx.fillText(`~₦${data.perPerson.toLocaleString("en-NG")}`, slipX + slipWidth / 2 + 40, statBoxY + 145);

  // 7. Official Pass Code Centerpiece
  const codeBoxY = slipY + 680;
  const codeBoxHeight = 250;
  ctx.fillStyle = "#111111";
  ctx.fillRect(slipX + 60, codeBoxY, slipWidth - 120, codeBoxHeight);
  ctx.strokeStyle = "#F9E828";
  ctx.lineWidth = 3;
  ctx.strokeRect(slipX + 60, codeBoxY, slipWidth - 120, codeBoxHeight);

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("VISIT IDENTIFICATION CODE", slipX + slipWidth / 2, codeBoxY + 70);

  ctx.fillStyle = "#F9E828";
  ctx.font = "bold 84px 'Courier New', monospace";
  ctx.fillText(data.planCode, slipX + slipWidth / 2, codeBoxY + 175);
  ctx.textAlign = "left";

  // 8. Financial Summary Table
  const tableY = slipY + 980;
  drawDashedLine(ctx, slipX + 60, tableY, slipX + slipWidth - 60, tableY, [12, 10]);

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "28px 'Courier New', monospace";
  ctx.fillText("TOTAL OUTING COST", slipX + 60, tableY + 70);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 44px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText(`~₦${data.totalCost.toLocaleString("en-NG")}`, slipX + slipWidth - 60, tableY + 70);
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "28px 'Courier New', monospace";
  ctx.fillText("COVERS: FOOD + DRINKS + TAX + BOLT", slipX + 60, tableY + 130);
  ctx.textAlign = "right";
  ctx.fillStyle = "#F9E828";
  ctx.fillText("ZERO BILL SHOCK", slipX + slipWidth - 60, tableY + 130);
  ctx.textAlign = "left";

  drawDashedLine(ctx, slipX + 60, tableY + 180, slipX + slipWidth - 60, tableY + 180, [12, 10]);

  // 9. Verified Stamp Box
  const stampY = slipY + 1220;
  ctx.fillStyle = "rgba(249, 232, 40, 0.08)";
  ctx.fillRect(slipX + 60, stampY, slipWidth - 120, 140);
  ctx.strokeStyle = "rgba(249, 232, 40, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(slipX + 60, stampY, slipWidth - 120, 140);

  ctx.fillStyle = "#F9E828";
  ctx.font = "bold 28px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("✓ CONFIRMED OUTING BUDGET SLIP", slipX + slipWidth / 2, stampY + 60);

  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "22px 'Courier New', monospace";
  ctx.fillText("SHOW TO YOUR SERVER OR HOST UPON ARRIVAL", slipX + slipWidth / 2, stampY + 105);
  ctx.textAlign = "left";

  // 10. Footer / Till-slip tear
  const footerY = slipY + 1440;
  drawDashedLine(ctx, slipX + 60, footerY, slipX + slipWidth - 60, footerY, [12, 10]);

  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "24px 'Courier New', monospace";
  ctx.fillText("oyaplan.com", slipX + 60, footerY + 60);

  ctx.fillStyle = "#F9E828";
  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText("KNOW WHAT IT WILL COST BEFORE YOU LEAVE HOME", slipX + slipWidth - 60, footerY + 60);
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.font = "20px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("THIS IS A BUDGET PLAN • NOT A TABLE RESERVATION", slipX + slipWidth / 2, footerY + 115);

  return canvas;
}

function drawDashedLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dashPattern: number[]
) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 2;
  ctx.setLineDash(dashPattern);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Creates a PNG blob and triggers native navigator.share or fallback file download.
 */
export async function shareOrDownloadHostPassStory(data: HostPassStoryData): Promise<boolean> {
  const canvas = await generateHostPassStoryCanvas(data);

  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error("Failed to generate image blob"));
        return;
      }

      const fileName = `oyaplan-hostpass-${data.planCode}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      // Check if native file sharing is supported on this browser/OS
      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            title: `${data.venueName} Host Pass`,
            text: `Lagos Outing Plan for ${data.venueName} • ~₦${data.perPerson.toLocaleString("en-NG")}/person`,
            files: [file],
          });
          resolve(true);
          return;
        } catch (err: unknown) {
          // If user aborted/cancelled share dialog, resolve cleanly
          if ((err as Error)?.name === "AbortError") {
            resolve(false);
            return;
          }
          // Otherwise fallback to download
        }
      }

      // Fallback: Direct file download
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      resolve(true);
    }, "image/png");
  });
}
