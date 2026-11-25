(function () {
      "use strict";

      let salaryMode = "annual"; // "annual" | "monthly14"

      const el = {
        salaryInput: document.getElementById("salaryInput"),
        salaryHint: document.getElementById("salaryHint"),
        btnAnnual: document.getElementById("btnAnnual"),
        btnMonthly14: document.getElementById("btnMonthly14"),
        regionSelect: document.getElementById("regionSelect"),
        filingSelect: document.getElementById("filingSelect"),
        spouseBox: document.getElementById("spouseBox"),
        spouseSalary: document.getElementById("spouseSalary"),
        spouseUnion: document.getElementById("spouseUnion"),
        regimeSelect: document.getElementById("regimeSelect"),
        jovemBand: document.getElementById("jovemBand"),
        depTotal: document.getElementById("depTotal"),
        depAgeRow: document.getElementById("depAgeRow"),
        depLe3: document.getElementById("depLe3"),
        dep2ndLe6: document.getElementById("dep2ndLe6"),
        extraCredits: document.getElementById("extraCredits"),
        feeRateInput: document.getElementById("feeRateInput"),
        outEffRate: document.getElementById("outEffRate"),
        outEffSub: document.getElementById("outEffSub"),
        outNetMo12: document.getElementById("outNetMo12"),
        outNetMo14: document.getElementById("outNetMo14"),
        outSavings: document.getElementById("outSavings"),
        outSavingsPct: document.getElementById("outSavingsPct"),
        outNetAnnual: document.getElementById("outNetAnnual"),
        outNominalNote: document.getElementById("outNominalNote"),
        barTotalLabel: document.getElementById("barTotalLabel"),
        barNet: document.getElementById("barNet"),
        barTax: document.getElementById("barTax"),
        legNet: document.getElementById("legNet"),
        legTax: document.getElementById("legTax"),
        insightBox: document.getElementById("insightBox"),
        rateChart: document.getElementById("rateChart"),
        mathBody: document.getElementById("mathBody")
      };

      const eur = (v) => "€" + Number(v).toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const pct = (v, d = 2) => (v * 100).toFixed(d) + "%";

      function getAnnualGross() {
        const raw = Math.max(0, Number(el.salaryInput.value) || 0);
        return salaryMode === "monthly14" ? raw * 14 : raw;
      }

      function getOpts(overrideGross) {
        const filing = el.filingSelect.value;
        const regime = el.regimeSelect.value;
        const depTotal = Math.max(0, Math.floor(Number(el.depTotal.value) || 0));
        return {
          grossAnnual: overrideGross != null ? overrideGross : getAnnualGross(),
          region: el.regionSelect.value,
          filing,
          spouseGrossAnnual: filing === "joint" ? Math.max(0, Number(el.spouseSalary.value) || 0) : 0,
          spouseUnion: filing === "joint" && el.spouseUnion.checked,
          regime,
          irsJovemBand: regime === "irs_jovem" ? el.jovemBand.value : "none",
          dependents: depTotal,
          dependentsLe3: Math.min(depTotal, Math.max(0, Math.floor(Number(el.depLe3.value) || 0))),
          dependents2ndLe6: Math.min(Math.max(0, depTotal - 1), Math.max(0, Math.floor(Number(el.dep2ndLe6.value) || 0))),
          extraCredits: Math.max(0, Number(el.extraCredits.value) || 0),
          feeRate: Math.max(0, (Number(el.feeRateInput.value) || 0) / 100)
        };
      }

      function drawChart(opts, currentRes) {
        const svg = el.rateChart;
        const W = 540, H = 175;
        const padL = 42, padR = 16, padT = 14, padB = 28;
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
          grid += `<text x="${padL - 6}" y="${Number(y) + 3}" text-anchor="end" font-size="10" fill="#566070">${(tick * 100).toFixed(2)}%</text>`;
        });

        [15000, 30000, 45000, 60000, 75000, 90000].forEach((g) => {
          const x = xOf(g).toFixed(1);
          grid += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + plotH}" stroke="#F1F4F9" stroke-width="1"/>`;
          grid += `<text x="${x}" y="${H - 8}" text-anchor="middle" font-size="10" fill="#566070">€${g / 1000}k</text>`;
        });

        const cx = xOf(opts.grossAnnual).toFixed(1);
        const cy = yOf(Math.max(0, currentRes.effectiveRate)).toFixed(1);
        const labelRight = Number(cx) > W - 110;
        const lx = labelRight ? Number(cx) - 8 : Number(cx) + 8;
        const anchor = labelRight ? "end" : "start";

        svg.innerHTML = `
          ${grid}
          <path d="${areaD}" fill="rgba(29, 62, 143, 0.10)"/>
          <path d="${pathD}" fill="none" stroke="#1D3E8F" stroke-width="2.4" stroke-linejoin="round"/>
          <line x1="${cx}" y1="${padT}" x2="${cx}" y2="${padT + plotH}" stroke="#CC2925" stroke-dasharray="3,3" stroke-width="1.2"/>
          <circle cx="${cx}" cy="${cy}" r="5" fill="#CC2925" stroke="#fff" stroke-width="2"/>
          <text x="${lx}" y="${Math.max(padT + 11, Number(cy) - 7)}" text-anchor="${anchor}" font-size="11" font-weight="700" fill="#9E1B18">
            You: ${pct(currentRes.effectiveRate)}
          </text>
        `;
      }

      function render() {
        const filing = el.filingSelect.value;
        const regime = el.regimeSelect.value;
        const depTotal = Math.max(0, Math.floor(Number(el.depTotal.value) || 0));

        el.spouseBox.classList.toggle("hidden", filing !== "joint");
        el.jovemBand.disabled = regime !== "irs_jovem";
        el.depAgeRow.classList.toggle("hidden", depTotal === 0);

        const grossAnnual = getAnnualGross();
        if (salaryMode === "annual") {
          el.salaryHint.textContent = `Equivalent to ${eur(grossAnnual / 14)}/mo across 14 payments (or ${eur(grossAnnual / 12)}/mo across 12).`;
        } else {
          el.salaryHint.textContent = `Equivalent to ${eur(grossAnnual)}/yr annual gross (× 14 payments).`;
        }

        const opts = getOpts(grossAnnual);
        const res = IRS2026.compare(opts);

        el.outEffRate.textContent = pct(res.effectiveRate);
        el.outEffSub.textContent = `of gross salary (vs. ${pct(opts.feeRate)} nominal)`;
        el.outNetMo12.textContent = eur(res.netCostMonthly12);
        el.outNetMo14.textContent = `per month (/12) · ${eur(res.netCostMonthly14)} (/14)`;
        el.outSavings.textContent = eur(res.irsSavingsAnnual);
        el.outSavingsPct.textContent = `${pct(res.savingsPctOfDues, 1)} of nominal dues offset via IRS`;
        el.outNetAnnual.textContent = eur(res.netCostAnnual);
        el.outNominalNote.textContent = `Nominal dues: ${eur(res.nominalDuesAnnual)} / yr (${eur(res.nominalDuesMonthly12)}/mo)`;

        el.barTotalLabel.textContent = `${eur(res.nominalDuesAnnual)} / yr`;
        const netPct = res.nominalDuesAnnual > 0 ? Math.max(0, Math.min(100, (res.netCostAnnual / res.nominalDuesAnnual) * 100)) : 0;
        const taxPct = 100 - netPct;
        el.barNet.style.width = netPct.toFixed(1) + "%";
        el.barTax.style.width = taxPct.toFixed(1) + "%";
        el.legNet.textContent = eur(res.netCostAnnual);
        el.legTax.textContent = eur(res.irsSavingsAnnual);

        // Contextual explanation
        if (res.nominalDuesAnnual === 0) {
          el.insightBox.className = "insight";
          el.insightBox.innerHTML = "Enter a gross salary above €0 to estimate your effective union cost.";
        } else if (res.irsSavingsAnnual === 0) {
          el.insightBox.className = "insight warn";
          el.insightBox.innerHTML = `<strong>Why is the effective rate equal to ${pct(opts.feeRate)}?</strong> In this scenario, your baseline 2026 IRS owed is already <strong>€0.00</strong> (due to Mínimo de Existência, IRS Jovem exemption, or family/extra tax credits). Because IRS credits aren't refundable below €0, the 200% deduction cannot generate a further rebate.`;
        } else if (res.netCostAnnual <= 0) {
          el.insightBox.className = "insight";
          el.insightBox.innerHTML = `<strong>Marginal IRS + solidarity rate (${pct(res.withoutDues.marginalRate, 1)}) exceeds 50%:</strong> Because union dues are 200% deductible, the IRS tax reduction slightly exceeds the nominal 1% fee — making your effective net cost essentially <strong>€0</strong>.`;
        } else if (opts.regime === "irs_jovem") {
          el.insightBox.className = "insight";
          el.insightBox.innerHTML = `<strong>IRS Jovem active:</strong> ${eur(res.withDues.totalExempt)} of gross income is exempt (2026 cap €29,542.15), and your 200% union dues deduction (${eur(res.withDues.totalUnionDeduction)}) reduces your non-exempt taxable slice — saving <strong>${eur(res.irsSavingsAnnual)}/yr</strong>.`;
        } else {
          el.insightBox.className = "insight";
          el.insightBox.innerHTML = `<strong>200% deduction in action:</strong> Paying <strong>${eur(res.nominalDuesAnnual)}/yr</strong> in STT dues deducts <strong>${eur(res.withDues.totalUnionDeduction)}</strong> from taxable income (marginal rate ${pct(res.withoutDues.marginalRate, 1)}), cutting your IRS bill by <strong>${eur(res.irsSavingsAnnual)}/yr</strong>.`;
        }

        // Exact math breakdown table
        const w0 = res.withoutDues;
        const w1 = res.withDues;
        const rows = [
          ["Household Gross Income (Cat. A)", eur(w0.totalGross), eur(w1.totalGross)],
          ["IRS Jovem Exempt Income", eur(w0.totalExempt), eur(w1.totalExempt)],
          ["Base Specific Deduction (max €4,587.09, 11% SS)", eur(w0.pA.baseDE + w0.pB.baseDE), eur(w1.pA.baseDE + w1.pB.baseDE)],
          ["Union Dues Deduction (200% of eligible dues)", eur(0), eur(w1.totalUnionDeduction)],
          ["Mínimo de Existência Abatement (Art. 70.º)", eur(w0.pA.meAbatement + w0.pB.meAbatement), eur(w1.pA.meAbatement + w1.pB.meAbatement)],
          ["Taxable Income (Rendimento Coletável)", eur(w0.totalTaxable), eur(w1.totalTaxable), true],
          ["Bracket Tax (Art. 68.º, incl. englobamento)", eur(w0.bracketTaxTotal), eur(w1.bracketTaxTotal)],
          ["Solidarity Surcharge (Art. 68.º-A)", eur(w0.solidarityTotal), eur(w1.solidarityTotal)],
          ["Tax Credits (Despesas Gerais + Dependents + Extra)", "−" + eur(w0.credits.totalCredits), "−" + eur(w1.credits.totalCredits)],
          ["Estimated Final IRS Payable", eur(w0.finalIRS), eur(w1.finalIRS), true],
          ["Nominal STT Dues Paid", eur(0), eur(res.nominalDuesAnnual)],
          ["Net Effective Annual Cost (Dues − IRS Savings)", eur(0), eur(res.netCostAnnual), true]
        ];
        el.mathBody.innerHTML = rows
          .map(([k, v0, v1, em]) => `<tr class="${em ? "em" : ""}"><td>${k}</td><td>${v0}</td><td>${v1}</td></tr>`)
          .join("");

        drawChart(opts, res);
      }

      // Wire events
      el.btnAnnual.addEventListener("click", () => {
        if (salaryMode === "annual") return;
        const annual = getAnnualGross();
        salaryMode = "annual";
        el.salaryInput.value = Math.round(annual);
        el.salaryInput.step = 500;
        el.btnAnnual.classList.add("active");
        el.btnMonthly14.classList.remove("active");
        render();
      });

      el.btnMonthly14.addEventListener("click", () => {
        if (salaryMode === "monthly14") return;
        const annual = getAnnualGross();
        salaryMode = "monthly14";
        el.salaryInput.value = Math.round(annual / 14);
        el.salaryInput.step = 50;
        el.btnMonthly14.classList.add("active");
        el.btnAnnual.classList.remove("active");
        render();
      });

      document.querySelectorAll(".presets button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const annual = Number(btn.dataset.annual);
          el.salaryInput.value = salaryMode === "annual" ? annual : Math.round(annual / 14);
          render();
        });
      });

      [
        el.salaryInput, el.regionSelect, el.filingSelect, el.spouseSalary,
        el.spouseUnion, el.regimeSelect, el.jovemBand, el.depTotal,
        el.depLe3, el.dep2ndLe6, el.extraCredits, el.feeRateInput
      ].forEach((node) => {
        node.addEventListener("input", render);
        node.addEventListener("change", render);
      });

      render();
    })();
