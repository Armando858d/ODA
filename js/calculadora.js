document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  // ====== SECURITY (Simple Base64) ======
  // Using Base64 to avoid SSL requirements on local `file://` usage.
  const overlay = $("securityOverlay");
  const passInput = $("passInput");
  const btnUnlock = $("btnUnlock");
  const lockMsg = $("lockMsg");

  // Base64 hash for "oda2026@"
  const TARGET_HASH = "b2RhMjAyNkA=";

  // Check Session
  if (sessionStorage.getItem("oda_auth") === "unlocked") {
    unlock(false);
  }

  function checkPass() {
    const pwd = passInput.value;
    if (!pwd) return;

    try {
      // Simple obfuscation match (Universal support)
      if (btoa(pwd) === TARGET_HASH) {
        unlock(true);
      } else {
        showError();
      }
    } catch (e) {
      showError();
    }
  }

  function showError() {
    lockMsg.textContent = "Acceso Denegado";
    passInput.style.borderColor = "#ff3e5e";
    passInput.value = "";
    setTimeout(() => {
      lockMsg.textContent = "";
      passInput.style.borderColor = "";
    }, 2000);
  }

  function unlock(saveSession) {
    if (overlay) {
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
      setTimeout(() => overlay.remove(), 600);
    }
    document.body.classList.add("unlocked");
    if (saveSession) sessionStorage.setItem("oda_auth", "unlocked");
  }

  if (btnUnlock) btnUnlock.addEventListener("click", checkPass);

  if (passInput) {
    passInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") checkPass();
    });
  }

  // ====== Inputs ======
  const filamentPriceKg = $("filamentPriceKg");
  const pieceWeightG = $("pieceWeightG");
  const kgWeightG = $("kgWeightG");
  const materialMultiplier = $("materialMultiplier");

  const lightHours = $("lightHours");
  const lightMinutes = $("lightMinutes");
  const lightRate = $("lightRate");
  const wearPercent = $("wearPercent");

  const jobType = $("jobType");
  const extraRateMode = $("extraRateMode");
  const laborHours = $("laborHours");
  const laborMinutes = $("laborMinutes");

  const riskPercent = $("riskPercent");
  const minPrice = $("minPrice");
  const extras = $("extras");
  const note = $("note");

  // ====== Buttons ======
  const btnCalc = $("btnCalc");
  const btnReset = $("btnReset");
  const btnCopy = $("btnCopy");
  const btnWhats = $("btnWhats");
  const btnPdf = $("btnPdf"); // Added missing definition if not present before

  // ====== Error ======
  const errorBox = $("errorBox");

  // ====== Outputs ======
  const outFinalTotal = $("finalTotal");
  const outProfitDisplay = $("profitDisplay");

  const outMaterialClient = $("materialClient");
  const outMachineCost = $("machineCost");
  const outLaborCost = $("laborCost");
  const outExtrasCost = $("extrasCost");
  const outRiskCost = $("riskCost");

  const outRealCost = $("realCost");
  const outProfitPct = $("profitPct");
  const outMinApplied = $("minApplied");

  const jobHint = $("jobHint");

  // ===== Helpers =====
  const money = (n) => {
    if (!isFinite(n)) return "$0.00";
    return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  };

  const num = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  // ===== Job pricing =====
  const JOB_FIRST_HOUR = {
    printOnly: 50,
    prep: 80,
    designAssist: 150,
    fullDesign: 300
  };

  const JOB_LABEL = {
    printOnly: "Solo impresión",
    prep: "Preparación + limpieza",
    designAssist: "Ajustes de archivo",
    fullDesign: "Diseño completo"
  };

  function updateJobHint() {
    const base = JOB_FIRST_HOUR[jobType.value] ?? 50;
    jobHint.textContent = `Base: ${money(base)}`;
  }

  function makeSummary(data) {
    const jobName = JOB_LABEL[jobType.value] ?? "Trabajo";
    const noteTxt = (note.value || "").trim();

    return `*COTIZACIÓN ODA STUDIO* ⚡
📦 *Trabajo:* ${jobName}
💰 *Total:* ${money(data.totalFinal)}

📝 *Detalles:*
• Material: ${money(data.materialClient)}
• Mano de obra: ${money(data.laborCost)}
• Extras: ${money(data.extraMoney)}

${noteTxt ? `📌 *Nota:* ${noteTxt}` : ""}
_Cálculo interno v2.0_`;
  }

  function calc() {
    try {
      errorBox.style.display = "none";
      errorBox.textContent = "";

      const priceKg = num(filamentPriceKg.value);
      const pieceG = num(pieceWeightG.value);
      const kiloG = Math.max(1, num(kgWeightG.value));

      const mult = Math.max(1, num(materialMultiplier.value));

      const hLight = clamp(num(lightHours.value), 0, 9999);
      const mLight = clamp(num(lightMinutes.value), 0, 9999);
      const rateLight = Math.max(0, num(lightRate.value));

      const wearPct = clamp(num(wearPercent.value), 0, 100) / 100;

      const hLabor = clamp(num(laborHours.value), 0, 9999);
      const mLabor = clamp(num(laborMinutes.value), 0, 9999);
      const extraRate = Math.max(0, num(extraRateMode.value));

      const riskPct = clamp(num(riskPercent.value), 0, 100) / 100;

      const minP = Math.max(0, num(minPrice.value));
      const extraMoney = Math.max(0, num(extras.value));

      // === Material ===
      const materialBase = (pieceG * priceKg) / kiloG;
      const materialClient = materialBase * mult;

      // === Luz ===
      const lightTotalHours = hLight + (mLight / 60);
      const lightCost = rateLight * lightTotalHours;

      // === Desgaste ===
      const wearCost = (materialBase + lightCost) * wearPct;

      // Combined Machine Cost for display
      const machineTotal = lightCost + wearCost;

      // === Mano de obra ===
      const laborTotalHours = hLabor + (mLabor / 60);
      const firstHourBase = JOB_FIRST_HOUR[jobType.value] ?? 50;

      let laborCost = 0;
      if (laborTotalHours <= 0) laborCost = 0;
      else if (laborTotalHours <= 1) laborCost = firstHourBase;
      else laborCost = firstHourBase + ((laborTotalHours - 1) * extraRate);

      // === Subtotal + riesgo ===
      const subtotal = materialClient + machineTotal + laborCost + extraMoney;
      const riskCost = subtotal * riskPct;

      // === Total final ===
      let totalFinal = subtotal + riskCost;

      // === Mínimo ===
      let minimumApplied = false;
      if (totalFinal > 0 && totalFinal < minP) {
        totalFinal = minP;
        minimumApplied = true;
      }

      // === Costo real + ganancia ===
      const realCost = materialBase + lightCost; // Direct costs only
      const profit = totalFinal - realCost;
      const profitPct = totalFinal > 0 ? (profit / totalFinal) * 100 : 0;

      // === UI Updates ===
      outMaterialClient.textContent = money(materialClient);
      outMachineCost.textContent = money(machineTotal);
      outLaborCost.textContent = money(laborCost);
      outExtrasCost.textContent = money(extraMoney);
      outRiskCost.textContent = money(riskCost);

      outFinalTotal.textContent = money(totalFinal);
      outProfitDisplay.textContent = money(profit);

      outRealCost.textContent = money(realCost);
      outProfitPct.textContent = `${profitPct.toFixed(0)}%`;
      outMinApplied.textContent = minimumApplied ? "Sí" : "No";

      // Store summary for buttons
      const summary = makeSummary({
        materialClient,
        laborCost,
        extraMoney,
        riskCost,
        totalFinal,
        realCost,
        profit
      });

      if (btnCopy) btnCopy.dataset.copyText = summary;
      if (btnWhats) btnWhats.dataset.copyText = summary;

    } catch (e) {
      errorBox.style.display = "block";
      errorBox.textContent = "⚠️ Error en el cálculo.";
      console.error(e);
    }
  }

  function resetAll() {
    filamentPriceKg.value = "";
    pieceWeightG.value = "";
    kgWeightG.value = "1000";
    materialMultiplier.value = "2";

    lightHours.value = "";
    lightMinutes.value = "";
    lightRate.value = "4";
    wearPercent.value = "15";

    jobType.value = "printOnly";
    extraRateMode.value = "15";
    laborHours.value = "";
    laborMinutes.value = "";

    riskPercent.value = "20";
    minPrice.value = "120";
    extras.value = "0";
    note.value = "";

    errorBox.style.display = "none";
    errorBox.textContent = "";

    updateJobHint();
    calc();

    // Smooth scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===== Events =====
  if (btnCalc) btnCalc.addEventListener("click", calc);
  if (btnReset) btnReset.addEventListener("click", resetAll);

  if (btnCopy) {
    btnCopy.addEventListener("click", async () => {
      const text = btnCopy.dataset.copyText || "";
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        const originalText = btnCopy.textContent;
        btnCopy.textContent = "Listo ✅";
        setTimeout(() => (btnCopy.textContent = originalText), 1500);
      } catch (e) {
        btnCopy.textContent = "Error ❌";
        setTimeout(() => (btnCopy.textContent = "Copiar 📋"), 1500);
      }
    });
  }

  if (btnWhats) {
    btnWhats.addEventListener("click", () => {
      const text = btnWhats.dataset.copyText || "";
      if (!text) return;

      const url = "https://wa.me/?text=" + encodeURIComponent(text);
      window.open(url, "_blank");
    });
  }

  // PDF Generation with Clean Corporate Design
  if (btnPdf) {
    btnPdf.addEventListener("click", () => {
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const logoImg = document.getElementById("logoForPdf");

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;

        // Colors
        const colorBlack = [20, 20, 20];
        const colorGrey = [100, 100, 100];
        const colorLightGrey = [240, 240, 240];
        const colorAccent = [0, 180, 216]; // Muted Cyan for corporate feel

        // --- CANVAS RESET ---
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        // --- HEADER SECTION ---
        let y = 25;

        // Logo
        if (logoImg && logoImg.complete && logoImg.naturalHeight !== 0) {
          doc.addImage(logoImg, 'PNG', margin, y - 5, 25, 25);
        }

        // Company Info (Left, below logo)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(...colorBlack);
        doc.text("ODA SERVICIOS", margin + 30, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...colorGrey);
        doc.text("IMPRESIÓN 3D & FABRICACIÓN DIGITAL", margin + 30, y + 10);
        doc.text("Aguascalientes, Ags.", margin + 30, y + 15);
        doc.text("www.oda.studio", margin + 30, y + 20);

        // Quote Details (Right Side Box)
        const now = new Date();
        const dateStr = now.toLocaleDateString("es-MX", { day: '2-digit', month: 'long', year: 'numeric' });
        const folio = now.getTime().toString().slice(-6);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(26);
        doc.setTextColor(...colorBlack);
        doc.text("COTIZACIÓN", pageWidth - margin, y + 5, { align: "right" });

        doc.setFontSize(10);
        doc.setTextColor(...colorAccent);
        doc.text(`FOLIO: #${folio}`, pageWidth - margin, y + 14, { align: "right" });

        doc.setTextColor(...colorGrey);
        doc.setFont("helvetica", "normal");
        doc.text(`Fecha: ${dateStr}`, pageWidth - margin, y + 20, { align: "right" });

        // Horizontal Line
        y += 40;
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);

        // --- BILL TO / INFO ---
        y += 15;
        const noteTxt = (note.value || "").trim();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...colorGrey);
        doc.text("DESCRIPCIÓN DEL PROYECTO", margin, y);

        if (noteTxt) {
          doc.text("NOTAS ADICIONALES", pageWidth / 2 + 10, y);
        }

        y += 8;
        const jobName = JOB_LABEL[jobType.value] ?? "Servicio de Impresión 3D";

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...colorBlack);
        doc.text(jobName.toUpperCase(), margin, y);

        if (noteTxt) {
          doc.setFontSize(10);
          doc.setTextColor(80, 80, 80);
          const splitNotes = doc.splitTextToSize(noteTxt, (pageWidth / 2) - margin - 10);
          doc.text(splitNotes, pageWidth / 2 + 10, y);
        }

        // --- TABLE ---
        y += 30;

        // Header Background
        doc.setFillColor(...colorLightGrey);
        doc.rect(margin, y, pageWidth - (margin * 2), 10, "F");

        // Header Text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...colorBlack);
        doc.text("CONCEPTO", margin + 5, y + 6.5);
        doc.text("IMPORTE", pageWidth - margin - 5, y + 6.5, { align: "right" });

        // Row
        y += 10;
        const total = outFinalTotal.textContent;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...colorBlack);

        // Item
        doc.text("Servicio de Manufactura Aditiva (Impresión 3D)", margin + 5, y + 10);
        doc.setFontSize(9);
        doc.setTextColor(...colorGrey);
        doc.text(`Especificación: ${jobName}`, margin + 5, y + 16);

        // Price
        doc.setFontSize(11);
        doc.setTextColor(...colorBlack);
        doc.text(total, pageWidth - margin - 5, y + 10, { align: "right" });

        // Border Line
        y += 25;
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y, pageWidth - margin, y);

        // --- TOTALS SECTION ---
        y += 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...colorBlack);
        doc.text("TOTAL NETO", pageWidth - margin - 60, y + 5);

        doc.setFontSize(18);
        doc.setTextColor(...colorAccent);
        doc.text(total, pageWidth - margin - 5, y + 5, { align: "right" });

        // --- TERMS & CONDITIONS (Footer) ---
        const legalY = 245;

        doc.setDrawColor(...colorAccent);
        doc.setLineWidth(1);
        doc.line(margin, legalY - 10, margin + 20, legalY - 10); // Accent little line

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...colorBlack);
        doc.text("TÉRMINOS Y CONDICIONES", margin, legalY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);

        const terms = [
          "1. VIGENCIA: La presente cotización tiene una validez de 15 días hábiles a partir de su emisión.",
          "2. CONFIRMACIÓN: Se requiere un anticipo del 50% para agendar producción y congelar precios.",
          "3. ENTREGA: Los tiempos están sujetos a la carga de trabajo al momento de recibir el anticipo.",
          "4. AVISO: Los materiales y costos pueden variar sin previo aviso una vez vencida la vigencia.",
          "5. URGENCIAS: Las solicitudes con entrega urgente (servicio express) estarán sujetas a un ajuste en el costo final, según el tiempo requerido y la carga de trabajo."
        ];

        let termY = legalY + 6;
        terms.forEach(term => {
          const splitTitle = doc.splitTextToSize(term, pageWidth - (margin * 2));
          doc.text(splitTitle, margin, termY);
          termY += (4 * splitTitle.length);
        });

        // Decorative Bottom Bar
        doc.setFillColor(...colorBlack);
        doc.rect(0, pageHeight - 6, pageWidth, 6, "F");

        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text("ODA SERVICIOS - DOCUMENTO GENERADO DIGITALMENTE", pageWidth / 2, pageHeight - 2, { align: "center" });

        // --- SAVE ---
        doc.save(`Cotizacion_ODA_Folio_${folio}.pdf`);

      } catch (e) {
        console.error("PDF Error:", e);
        alert("Error al generar PDF.");
      }
    });
  }

  // Auto-calc listeners
  [
    filamentPriceKg, pieceWeightG, kgWeightG, materialMultiplier,
    lightHours, lightMinutes, lightRate, wearPercent,
    jobType, extraRateMode, laborHours, laborMinutes,
    riskPercent, minPrice, extras, note
  ].forEach((el) => {
    if (el) {
      el.addEventListener("input", () => {
        updateJobHint();
        calc();
      });
      el.addEventListener("change", () => {
        updateJobHint();
        calc();
      });
    }
  });

  // Init
  updateJobHint();
  calc();
});
