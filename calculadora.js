document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

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

  // ====== Error ======
  const errorBox = $("errorBox");

  // ====== Outputs ======
  const outFinalTotal = $("finalTotal");
  const outFinalTotal2 = $("finalTotal2");

  const outMaterialBase = $("materialBase");
  const outMaterialClient = $("materialClient");
  const outLightCost = $("lightCost");
  const outWearCost = $("wearCost");
  const outLaborCost = $("laborCost");
  const outExtrasCost = $("extrasCost");

  const outSubtotal = $("subtotal");
  const outRiskCost = $("riskCost");

  const outRealCost = $("realCost");
  const outProfit = $("profit");
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
    jobHint.textContent = money(base);
  }

  function makeSummary(data) {
    const jobName = JOB_LABEL[jobType.value] ?? "Trabajo";
    const noteTxt = (note.value || "").trim();

    return `ODA STUDIO • Cotización 3D
Trabajo: ${jobName}
Material cliente: ${money(data.materialClient)}
Luz: ${money(data.lightCost)}
Desgaste: ${money(data.wearCost)}
Tiempo: ${money(data.laborCost)}
Extras: ${money(data.extraMoney)}
Riesgo (${(data.riskPct * 100).toFixed(0)}%): ${money(data.riskCost)}

TOTAL: ${money(data.totalFinal)}
Costo real: ${money(data.realCost)}
Ganancia: ${money(data.profit)}
${noteTxt ? ("Nota: " + noteTxt) : ""}`;
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

      // === Mano de obra ===
      const laborTotalHours = hLabor + (mLabor / 60);
      const firstHourBase = JOB_FIRST_HOUR[jobType.value] ?? 50;

      let laborCost = 0;
      if (laborTotalHours <= 0) laborCost = 0;
      else if (laborTotalHours <= 1) laborCost = firstHourBase;
      else laborCost = firstHourBase + ((laborTotalHours - 1) * extraRate);

      // === Subtotal + riesgo ===
      const subtotal = materialClient + lightCost + wearCost + laborCost + extraMoney;
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
      const realCost = materialBase + lightCost;
      const profit = totalFinal - realCost;
      const profitPct = totalFinal > 0 ? (profit / totalFinal) * 100 : 0;

      // === UI Updates ===
      outMaterialBase.textContent = money(materialBase);
      outMaterialClient.textContent = money(materialClient);
      outLightCost.textContent = money(lightCost);
      outWearCost.textContent = money(wearCost);
      outLaborCost.textContent = money(laborCost);
      outExtrasCost.textContent = money(extraMoney);

      outSubtotal.textContent = money(subtotal);
      outRiskCost.textContent = money(riskCost);

      outFinalTotal.textContent = money(totalFinal);
      outFinalTotal2.textContent = money(totalFinal);

      outRealCost.textContent = money(realCost);
      outProfit.textContent = money(profit);
      outProfitPct.textContent = `${profitPct.toFixed(0)}%`;
      outMinApplied.textContent = minimumApplied ? "Sí" : "No";

      // Summary para copiar y WhatsApp
      const summary = makeSummary({
        materialClient,
        lightCost,
        wearCost,
        laborCost,
        extraMoney,
        riskPct,
        riskCost,
        totalFinal,
        realCost,
        profit
      });

      btnCopy.dataset.copyText = summary;
      btnWhats.dataset.copyText = summary;

    } catch (e) {
      errorBox.style.display = "block";
      errorBox.textContent =
        "⚠️ Error en el cálculo. Revisa consola o si copiaste todo bien.";
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
  }

  // ===== Events =====
  btnCalc.addEventListener("click", calc);
  btnReset.addEventListener("click", resetAll);

  btnCopy.addEventListener("click", async () => {
    const text = btnCopy.dataset.copyText || "";
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      btnCopy.textContent = "✅ Copiado";
      setTimeout(() => (btnCopy.textContent = "📋 Copiar"), 1000);
    } catch (e) {
      btnCopy.textContent = "❌ No se pudo";
      setTimeout(() => (btnCopy.textContent = "📋 Copiar"), 1000);
    }
  });

  btnWhats.addEventListener("click", () => {
    const text = btnWhats.dataset.copyText || "";
    if (!text) return;

    const url = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
  });

  [
    filamentPriceKg, pieceWeightG, kgWeightG, materialMultiplier,
    lightHours, lightMinutes, lightRate, wearPercent,
    jobType, extraRateMode, laborHours, laborMinutes,
    riskPercent, minPrice, extras, note
  ].forEach((el) => el.addEventListener("input", () => {
    updateJobHint();
    calc();
  }));

  // Init
  updateJobHint();
  calc();
});
