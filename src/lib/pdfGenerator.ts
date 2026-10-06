import html2canvas from "html2canvas";
import jsPDF from "jspdf";

async function renderElement(el: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    scale: 2,
    backgroundColor: "#0A0E12",
    useCORS: true,
    logging: false,
  });
}

export async function generatePDFFromElement(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // بخش‌ها به ترتیب
  const sections = Array.from(
    element.querySelectorAll<HTMLElement>("[data-pdf-section]")
  );

  if (sections.length === 0) {
    // fallback
    const canvas = await renderElement(element);
    const data = canvas.toDataURL("image/jpeg", 0.95);
    const h = (canvas.height * pageW) / canvas.width;
    let left = h;
    let pos = 0;
    pdf.addImage(data, "JPEG", 0, pos, pageW, h, undefined, "FAST");
    left -= pageH;
    while (left > 0) {
      pos = left - h;
      pdf.addPage();
      pdf.addImage(data, "JPEG", 0, pos, pageW, h, undefined, "FAST");
      left -= pageH;
    }
    pdf.save(filename);
    return;
  }

  let cursorMm = 0;
  let pageIndex = 0;
  let isFirst = true;

  for (const section of sections) {
    // اگه داخل بخش، ساب‌بخش داریم (روزها)، تکی اضافه کن
    const subSections = Array.from(
      section.querySelectorAll<HTMLElement>("[data-pdf-day]")
    );

    // بخش اصلی رو رندر کن
    if (subSections.length === 0) {
      const canvas = await renderElement(section);
      const data = canvas.toDataURL("image/jpeg", 0.95);
      const sectionHeightMm = (canvas.height * pageW) / canvas.width;

      // اگه جا نمی‌شه برو صفحه بعد
      if (!isFirst && cursorMm + sectionHeightMm > pageH) {
        pdf.addPage();
        cursorMm = 0;
        pageIndex++;
      }

      // اگه بزرگ‌تر از یه صفحه کامل
      if (sectionHeightMm > pageH) {
        let remainingMm = sectionHeightMm;
        let offsetMm = 0;
        const pxPerMm = canvas.width / pageW;

        while (remainingMm > 0.5) {
          const availableH = pageH - cursorMm;
          const sliceH = Math.min(availableH, remainingMm);

          const slice = document.createElement("canvas");
          slice.width = canvas.width;
          slice.height = Math.ceil(sliceH * pxPerMm);
          const ctx = slice.getContext("2d")!;
          ctx.fillStyle = "#0A0E12";
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(
            canvas,
            0,
            Math.floor(offsetMm * pxPerMm),
            canvas.width,
            Math.ceil(sliceH * pxPerMm),
            0,
            0,
            slice.width,
            slice.height
          );

          const sliceData = slice.toDataURL("image/jpeg", 0.95);
          pdf.addImage(sliceData, "JPEG", 0, cursorMm, pageW, sliceH, undefined, "FAST");

          offsetMm += sliceH;
          remainingMm -= sliceH;

          if (remainingMm > 0.5) {
            pdf.addPage();
            cursorMm = 0;
            pageIndex++;
          } else {
            cursorMm += sliceH;
          }
        }
      } else {
        pdf.addImage(data, "JPEG", 0, cursorMm, pageW, sectionHeightMm, undefined, "FAST");
        cursorMm += sectionHeightMm;
      }

      isFirst = false;
    } else {
      // بخش «لیست» با روزها
      // اول هر چی قبل از اولین روز هست رو جدا رندر کن (تایتل «لیست تراکنش‌ها»)
      const preEl = section.querySelector<HTMLElement>("[data-pdf-pre]");
      if (preEl) {
        const canvas = await renderElement(preEl);
        const data = canvas.toDataURL("image/jpeg", 0.95);
        const hMm = (canvas.height * pageW) / canvas.width;

        if (!isFirst && cursorMm + hMm > pageH) {
          pdf.addPage();
          cursorMm = 0;
          pageIndex++;
        }
        pdf.addImage(data, "JPEG", 0, cursorMm, pageW, hMm, undefined, "FAST");
        cursorMm += hMm;
        isFirst = false;
      }

      // روزها
      for (const day of subSections) {
        const canvas = await renderElement(day);
        const data = canvas.toDataURL("image/jpeg", 0.95);
        const hMm = (canvas.height * pageW) / canvas.width;

        if (!isFirst && cursorMm + hMm > pageH) {
          pdf.addPage();
          cursorMm = 0;
          pageIndex++;
        }

        // اگه یه روز از یه صفحه بزرگ‌تره (خیلی نادر)
        if (hMm > pageH) {
          let remainingMm = hMm;
          let offsetMm = 0;
          const pxPerMm = canvas.width / pageW;

          while (remainingMm > 0.5) {
            const availableH = pageH - cursorMm;
            const sliceH = Math.min(availableH, remainingMm);

            const slice = document.createElement("canvas");
            slice.width = canvas.width;
            slice.height = Math.ceil(sliceH * pxPerMm);
            const ctx = slice.getContext("2d")!;
            ctx.fillStyle = "#0A0E12";
            ctx.fillRect(0, 0, slice.width, slice.height);
            ctx.drawImage(
              canvas,
              0,
              Math.floor(offsetMm * pxPerMm),
              canvas.width,
              Math.ceil(sliceH * pxPerMm),
              0,
              0,
              slice.width,
              slice.height
            );

            const sliceData = slice.toDataURL("image/jpeg", 0.95);
            pdf.addImage(sliceData, "JPEG", 0, cursorMm, pageW, sliceH, undefined, "FAST");

            offsetMm += sliceH;
            remainingMm -= sliceH;

            if (remainingMm > 0.5) {
              pdf.addPage();
              cursorMm = 0;
              pageIndex++;
            } else {
              cursorMm += sliceH;
            }
          }
        } else {
          pdf.addImage(data, "JPEG", 0, cursorMm, pageW, hMm, undefined, "FAST");
          cursorMm += hMm;
        }
        isFirst = false;
      }
    }
  }

  pdf.save(filename);
}
