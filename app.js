// Interactive logic, EN/PT/中文 i18n switcher, and live SVG rate curve
(function () {
  "use strict";

  const I18N = window.STT_I18N || {};
  let salaryMode = "annual";

  function detectLang() {
    const nav = (navigator.language || "en").toLowerCase();
    if (nav.startsWith("pt")) return "pt";
    if (nav.startsWith("zh")) return "zh";
    return "en";
  }

  let lang = detectLang();
  const $ = (id) => document.getElementById(id);

  function eur(v) {
    const loc = lang === "pt" ? "pt-PT" : "en-IE";
    return "€" + Number(v).toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function pct(v, d = 2) {
    const s = (v * 100).toFixed(d) + "%";
    return lang === "pt" ? s.replace(".", ",") : s;
  }

  function renderLowerSections(t) {
    const whyHtml = t.whyCards.map((c) => `
      <div class="info-card${c.red ? " red" : ""}">
        <h3>${c.title}</h3>
        <p>${c.p1}</p>
        <p>${c.p2}</p>
      </div>`).join("");

    const faqHtml = t.faqs.map((f) => `
      <details class="faq-item">
        <summary>${f.q}</summary>
        <p>${f.a}</p>
      </details>`).join("");

    $("lowerSections").innerHTML = `
      <section id="how-it-works" class="section-block">
        <div class="section-head">
          <h2>${t.whyHead}</h2>
          <span>${t.whySub}</span>
        </div>
        <div class="info-grid">${whyHtml}</div>
      </section>

      <section id="faq" class="section-block">
        <div class="section-head">
          <h2>${t.faqHead}</h2>
          <span>${t.faqSub}</span>
        </div>
        <div class="faq-grid">${faqHtml}</div>
      </section>

      <section id="join" class="section-block">
        <div class="section-head">
          <h2>${t.joinHead}</h2>
          <span>${t.joinSub}</span>
        </div>
        <div class="info-grid">
          <div class="info-card red">
            <h3>${t.joinCard1Title}</h3>
            <p>${t.joinCard1Body}</p>
            <ul>
              <li><a href="https://stt.org.pt/sindicaliza-te/" target="_blank" rel="noopener">stt.org.pt/sindicaliza-te/</a></li>
              <li><a href="mailto:geral@stt.org.pt">geral@stt.org.pt</a></li>
              <li>+351 213 966 652 / +351 969 101 802</li>
            </ul>
            <p style="margin-top:8px;">${t.joinCard1Note}</p>
          </div>
          <div class="info-card">
            <h3>${t.joinCard2Title}</h3>
            <p>${t.joinCard2Body}</p>
            <ul>
              <li><strong>Bernardo Santos</strong> &mdash; <em>Delegado Sindical</em></li>
              <li><strong>Rafael Diniz</strong> &mdash; <em>Delegado Sindical</em></li>
            </ul>
            <p style="margin-top:8px;">${t.joinCard2Note}</p>
          </div>
          <div class="info-card">
            <h3>${t.joinCard3Title}</h3>
            <ul>
              <li><a href="https://stt.org.pt/estatutos/" target="_blank" rel="noopener">STT Statutes (BTE 38/2014)</a></li>
              <li><a href="https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2009-34546475" target="_blank" rel="noopener">Código do Trabalho (Arts. 4, 405–468, 530–545)</a></li>
              <li><a href="https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2014-70048167" target="_blank" rel="noopener">CIRS Art. 25.º n.º 1 c) (200%)</a></li>
              <li><a href="https://files.diariodarepublica.pt/1s/2026/11/21400/0000500006.pdf" target="_blank" rel="noopener">Decreto-Lei n.º 212/2026 (IRS 2026)</a></li>
            </ul>
          </div>
        </div>
      </section>`;
  }

  function applyTranslations() {
    const t = I18N[lang] || I18N.en;
    document.documentElement.lang = t.langCode;
    document.title = t.pageTitle;

    const map = {
      tBrandTitle: t.brandTitle,
      tBrandSub: t.brandSub,
      tNavCalc: t.navCalc,
      tNavWhy: t.navWhy,
      tNavFaq: t.navFaq,
      tNavJoin: t.navJoin,
      tPrivLocal: t.privacyLocal,
      tPrivZero: t.privacyZero,
      tPrivLaw: t.privacyLaw,
      tOpenSource: t.openSource,
      tInputTitle: t.inputTitle,
      tInputSub: t.inputSub,
      tSalaryLabel: t.salaryLabel,
      btnAnnual: t.btnAnnual,
      btnMonthly14: t.btnMonthly14,
      tRegimeLabel: t.regimeLabel,
      optRegStd: t.regimeStandard,
      optRegJovem: t.regimeJovem,
      optRegNhr: t.regimeNhr,
      tJovemLabel: t.jovemLabel,
      optJY1: t.jovemY1,
      optJY24: t.jovemY24,
      optJY57: t.jovemY57,
      optJY810: t.jovemY810,
      tFilingLabel: t.filingLabel,
      optFilSingle: t.filingSingle,
      optFilSP: t.filingSingleParent,
      optFilJoint: t.filingJoint,
      tDepLabel: t.depLabel,
      tSpouseSalaryLabel: t.spouseSalaryLabel,
      tSpouseUnionLabel: t.spouseUnionLabel,
      tDepLe3Label: t.depLe3Label,
      tDep2ndLe6Label: t.dep2ndLe6Label,
      tAdvSummary: t.advSummary,
      tRegionLabel: t.regionLabel,
      optRegCont: t.regCont,
      optRegMad: t.regMad,
      optRegAco: t.regAco,
      tExtraCreditsLabel: t.extraCreditsLabel,
      tExtraCreditsHint: t.extraCreditsHint,
      tFeeLabel: t.feeLabel,
      tFeeHint: t.feeHint,
      tResultTitle: t.resultTitle,
      tResultSub: t.resultSub,
      tHeroMoLabel: t.heroMonthlyLabel,
      tHeroRateLabel: t.heroRateLabel,
      tKpiSavingsLabel: t.kpiSavingsLabel,
      tKpiNetYrLabel: t.kpiNetYrLabel,
      tBarTitle: t.barTitle,
      tLegNet: t.legNet,
      tLegTax: t.legTax,
      tChartSummary: t.chartSummary,
      tMathSummary: t.mathSummary,
      tMathColItem: t.mathColItem,
      tMathColNo: t.mathColNo,
      tMathColYes: t.mathColYes,
      tSourceLink: t.sourceLink
    };
    Object.keys(map).forEach((k) => {
      const n = $(k);
      if (n) n.textContent = map[k];
    });
    $("tDisclaimer").innerHTML = t.disclaimer;

    document.querySelectorAll(".lang-switch button").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
    renderLowerSections(t);
  }

  function getAnnualGross() {
    const raw = Math.max(0, Number($("salaryInput").value) || 0);
    return salaryMode === "monthly14" ? raw * 14 : raw;
  }

  function getOpts(overrideGross) {
    const filing = $("filingSelect").value;
    const regime = $("regimeSelect").value;
    const depTotal = Math.max(0, Math.floor(Number($("depTotal").value) || 0));
    return {
      grossAnnual: overrideGross != null ? overrideGross : getAnnualGross(),
      region: $("regionSelect").value,
      filing,
      spouseGrossAnnual: filing === "joint" ? Math.max(0, Number($("spouseSalary").value) || 0) : 0,
      spouseUnion: filing === "joint" && $("spouseUnion").checked,
      regime,
      irsJovemBand: regime === "irs_jovem" ? $("jovemBand").value : "none",
      dependents: depTotal,
      dependentsLe3: Math.min(depTotal, Math.max(0, Math.floor(Number($("depLe3").value) || 0))),
      dependents2ndLe6: Math.min(Math.max(0, depTotal - 1), Math.max(0, Math.floor(Number($("dep2ndLe6").value) || 0))),
      extraCredits: Math.max(0, Number($("extraCredits").value) || 0),
      feeRate: Math.max(0, (Number($("feeRateInput").value) || 0) / 100)
    };
  }

  function drawChart(opts, currentRes, t) {
    const svg = $("rateChart");
    const W = 540, H = 165;
    const padL = 44, padR = 16, padT = 14, padB = 26;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const minG = 12000, maxG = 100000;
    const maxY = Math.max(0.011, opts.feeRate * 1.12);

    const xOf = (g) => padL + ((Math.min(maxG, Math.max(minG, g)) - minG) / (maxG - minG)) * plotW;
    const yOf = (r) => padT + plotH - (Math.min(maxY, Math.max(0, r)) / maxY) * plotH;

    const pts = [];
    for (let g = minG; g <= maxG; g += 1000) {
      const r = IRS2026.compare({ ...opts, grossAnnual: g }).effectiveRate;
      pts.push([xOf(g), yOf(Math.max(0, r))]);
    }
    const pathD = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
    const areaD = pathD + ` L${xOf(maxG).toFixed(1)},${(padT + plotH).toFixed(1)} L${xOf(minG).toFixed(1)},${(padT + plotH).toFixed(1)} Z`;

    let grid = "";
    [0, 0.0025, 0.005, 0.0075, 0.01].forEach((tick) => {
      if (tick > maxY) return;
      const y = yOf(tick).toFixed(1);
      grid += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#E5E9F0" stroke-width="1"/>`;
      grid += `<text x="${padL - 6}" y="${Number(y) + 3}" text-anchor="end" font-size="10" fill="#5A6577">${pct(tick)}</text>`;
    });
    [15000, 30000, 45000, 60000, 75000, 90000].forEach((g) => {
      const x = xOf(g).toFixed(1);
      grid += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + plotH}" stroke="#F1F4F9" stroke-width="1"/>`;
      grid += `<text x="${x}" y="${H - 7}" text-anchor="middle" font-size="10" fill="#5A6577">€${g / 1000}k</text>`;
    });

    const cx = xOf(opts.grossAnnual).toFixed(1);
    const cy = yOf(Math.max(0, currentRes.effectiveRate)).toFixed(1);
    const labelRight = Number(cx) > W - 115;
    const lx = labelRight ? Number(cx) - 8 : Number(cx) + 8;
    const anchor = labelRight ? "end" : "start";

    svg.innerHTML = `
      ${grid}
      <path d="${areaD}" fill="rgba(29, 62, 143, 0.10)"/>
      <path d="${pathD}" fill="none" stroke="#1D3E8F" stroke-width="2.4" stroke-linejoin="round"/>
      <line x1="${cx}" y1="${padT}" x2="${cx}" y2="${padT + plotH}" stroke="#CC2925" stroke-dasharray="3,3" stroke-width="1.2"/>
      <circle cx="${cx}" cy="${cy}" r="5" fill="#CC2925" stroke="#fff" stroke-width="2"/>
      <text x="${lx}" y="${Math.max(padT + 11, Number(cy) - 7)}" text-anchor="${anchor}" font-size="11" font-weight="700" fill="#9E1B18">
        ${t.chartYou} ${pct(currentRes.effectiveRate)}
      </text>`;
  }

  function render() {
    const t = I18N[lang] || I18N.en;
    const filing = $("filingSelect").value;
    const regime = $("regimeSelect").value;
    const depTotal = Math.max(0, Math.floor(Number($("depTotal").value) || 0));

    $("jovemBox").classList.toggle("hidden", regime !== "irs_jovem");
    $("spouseBox").classList.toggle("hidden", filing !== "joint");
    $("depAgeBox").classList.toggle("hidden", depTotal === 0);

    const grossAnnual = getAnnualGross();
    $("salaryHint").textContent = salaryMode === "annual"
      ? t.hintAnnual(eur(grossAnnual / 14), eur(grossAnnual / 12))
      : t.hintMonthly(eur(grossAnnual));

    const opts = getOpts(grossAnnual);
    const res = IRS2026.compare(opts);

    $("outNetMo12").textContent = eur(res.netCostMonthly12);
    $("outNetMo14").textContent = t.heroMonthlySub(eur(res.netCostMonthly14));
    $("outEffRate").textContent = pct(res.effectiveRate);
    $("outEffSub").textContent = t.heroRateSub(pct(opts.feeRate));
    $("outSavings").textContent = eur(res.irsSavingsAnnual);
    $("outSavingsPct").textContent = t.kpiSavingsSub(pct(res.savingsPctOfDues, 1));
    $("outNetAnnual").textContent = eur(res.netCostAnnual);
    $("outNominalNote").textContent = t.kpiNetYrSub(eur(res.nominalDuesAnnual));

    $("barTotalLabel").textContent = eur(res.nominalDuesAnnual);
    const netPct = res.nominalDuesAnnual > 0 ? Math.max(0, Math.min(100, (res.netCostAnnual / res.nominalDuesAnnual) * 100)) : 0;
    $("barNet").style.width = netPct.toFixed(1) + "%";
    $("barTax").style.width = (100 - netPct).toFixed(1) + "%";
    $("legNet").textContent = eur(res.netCostAnnual);
    $("legTax").textContent = eur(res.irsSavingsAnnual);

    const box = $("insightBox");
    if (res.nominalDuesAnnual === 0) {
      box.className = "insight";
      box.innerHTML = t.insightZero;
    } else if (res.irsSavingsAnnual === 0) {
      box.className = "insight warn";
      box.innerHTML = t.insightNoTax(pct(opts.feeRate));
    } else if (res.netCostAnnual <= 0) {
      box.className = "insight";
      box.innerHTML = t.insightFree(pct(res.withoutDues.marginalRate, 1));
    } else if (opts.regime === "irs_jovem") {
      box.className = "insight";
      box.innerHTML = t.insightJovem(eur(res.withDues.totalExempt), eur(res.withDues.totalUnionDeduction), eur(res.irsSavingsAnnual));
    } else {
      box.className = "insight";
      box.innerHTML = t.insightStd(eur(res.nominalDuesAnnual), eur(res.withDues.totalUnionDeduction), pct(res.withoutDues.marginalRate, 1), eur(res.irsSavingsAnnual));
    }

    const w0 = res.withoutDues;
    const w1 = res.withDues;
    const vals = [
      [eur(w0.totalGross), eur(w1.totalGross), false],
      [eur(w0.totalExempt), eur(w1.totalExempt), false],
      [eur(w0.pA.baseDE + w0.pB.baseDE), eur(w1.pA.baseDE + w1.pB.baseDE), false],
      [eur(0), eur(w1.totalUnionDeduction), false],
      [eur(w0.pA.meAbatement + w0.pB.meAbatement), eur(w1.pA.meAbatement + w1.pB.meAbatement), false],
      [eur(w0.totalTaxable), eur(w1.totalTaxable), true],
      [eur(w0.bracketTaxTotal), eur(w1.bracketTaxTotal), false],
      [eur(w0.solidarityTotal), eur(w1.solidarityTotal), false],
      ["−" + eur(w0.credits.totalCredits), "−" + eur(w1.credits.totalCredits), false],
      [eur(w0.finalIRS), eur(w1.finalIRS), true],
      [eur(0), eur(res.nominalDuesAnnual), false],
      [eur(0), eur(res.netCostAnnual), true]
    ];
    $("mathBody").innerHTML = t.mathRows
      .map((label, i) => `<tr class="${vals[i][2] ? "em" : ""}"><td>${label}</td><td>${vals[i][0]}</td><td>${vals[i][1]}</td></tr>`)
      .join("");

    drawChart(opts, res, t);
  }

  // Language switcher
  document.querySelectorAll(".lang-switch button").forEach((btn) => {
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      applyTranslations();
      render();
    });
  });

  // Salary mode toggles
  $("btnAnnual").addEventListener("click", () => {
    if (salaryMode === "annual") return;
    const annual = getAnnualGross();
    salaryMode = "annual";
    $("salaryInput").value = Math.round(annual);
    $("salaryInput").step = 500;
    $("btnAnnual").classList.add("active");
    $("btnMonthly14").classList.remove("active");
    render();
  });

  $("btnMonthly14").addEventListener("click", () => {
    if (salaryMode === "monthly14") return;
    const annual = getAnnualGross();
    salaryMode = "monthly14";
    $("salaryInput").value = Math.round(annual / 14);
    $("salaryInput").step = 50;
    $("btnMonthly14").classList.add("active");
    $("btnAnnual").classList.remove("active");
    render();
  });

  document.querySelectorAll(".presets button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const annual = Number(btn.dataset.annual);
      $("salaryInput").value = salaryMode === "annual" ? annual : Math.round(annual / 14);
      render();
    });
  });

  [
    "salaryInput", "regionSelect", "filingSelect", "spouseSalary",
    "spouseUnion", "regimeSelect", "jovemBand", "depTotal",
    "depLe3", "dep2ndLe6", "extraCredits", "feeRateInput"
  ].forEach((id) => {
    const node = $(id);
    if (!node) return;
    node.addEventListener("input", render);
    node.addEventListener("change", render);
  });

  applyTranslations();
  render();
})();
