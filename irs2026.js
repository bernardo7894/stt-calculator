/**
 * 2026 Portuguese IRS & Union Dues (Quotas Sindicais) Calculation Engine
 * ----------------------------------------------------------------------
 * Pure, dependency-free, 100% client-side implementation of Autoridade Tributária
 * 2026 liquidation rules:
 *  - Art. 25.º n.º 1 a), c) & n.º 2 CIRS: Category A specific deduction
 *    max(8.54 × IAS, 11% SS) + 200% of eligible union dues (dues capped at 1% gross).
 *  - Art. 68.º CIRS (Decreto-Lei n.º 212/2026, 4 Nov 2026; DLR n.º 17/2026/M, 5 Nov 2026):
 *    2026 Continente, Madeira (RAM), and Açores (RAA) 9-bracket tables.
 *  - Art. 68.º-A CIRS: Solidarity surcharge (2.5% / 5% Continente & RAM; 1.75% / 3.5% RAA).
 *  - Art. 69.º CIRS: Joint taxation (quociente conjugal = 2).
 *  - Art. 70.º CIRS (Lei n.º 73-A/2025 / OE 2026): Mínimo de Existência (€12,880.00).
 *  - Art. 12.º-B & Art. 22.º n.ºs 4, 7 CIRS: IRS Jovem (2026 cap 55 × IAS = €29,542.15)
 *    with exact englobamento rate determination.
 *  - Arts. 78.º, 78.º-A, 78.º-B CIRS: Despesas Gerais Familiares, Dependent credits,
 *    optional extra credits with Art. 78.º n.º 7 global ceiling.
 *  - Flat 20% regime: NHR / IFICI (Category A eligible activities).
 *
 * MIT License — Open source, runs 100% locally, collects zero personal data.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.IRS2026 = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const CONSTANTS = {
    YEAR: 2026,
    IAS: 537.13,
    BASE_DEDUCTION_A: 4587.09,      // 8.54 * 537.13 rounded per AT Newsletter #39
    SS_RATE: 0.11,                  // Standard private-sector TCO employee SS rate
    UNION_CAP_RATE: 0.01,           // Max eligible dues = 1% of gross Cat A
    UNION_MAJORATION: 2.0,          // +100% majoration -> 200% deductibility
    MIN_EXISTENCIA_VR: 12880.00,    // 14 * €920 (2026 SMN)
    MIN_EXISTENCIA_MAX_GROSS: 16543.60, // 2.2 * 14 * IAS per taxpayer
    IRS_JOVEM_CAP: 29542.15,        // 55 * 537.13
    NHR_RATE: 0.20,
    DESPESAS_GERAIS_SINGLE: 250.00,
    DESPESAS_GERAIS_SINGLE_PARENT: 335.00,
    DESPESAS_GERAIS_JOINT: 500.00,
    DEP_BASE: 600.00,
    DEP_BONUS_LE3: 126.00,          // Total €726 for child <= 3
    DEP_BONUS_2ND_LE6: 300.00       // Total €900 for 2nd+ child <= 6 (non-cumulative)
  };

  // Exact Art. 68.º CIRS 2026 tables (Continente: DL 212/2026; RAM/RAA: -30%)
  const BRACKETS = {
    continente: [
      { upTo: 8342,     rate: 0.1220, avg: 0.12200, abater: 0.00 },
      { upTo: 12587,    rate: 0.1520, avg: 0.13212, abater: 250.26 },
      { upTo: 17838,    rate: 0.2070, avg: 0.15416, abater: 942.51 },
      { upTo: 23089,    rate: 0.2360, avg: 0.17277, abater: 1459.86 },
      { upTo: 29397,    rate: 0.3060, avg: 0.20136, abater: 3076.15 },
      { upTo: 43090,    rate: 0.3460, avg: 0.24732, abater: 4251.98 },
      { upTo: 46566,    rate: 0.4310, avg: 0.26103, abater: 7914.77 },
      { upTo: 86634,    rate: 0.4460, avg: 0.34658, abater: 8613.31 },
      { upTo: Infinity, rate: 0.4800, avg: null,    abater: 11558.71 }
    ],
    madeira: [
      { upTo: 8342,     rate: 0.0854, avg: 0.08540, abater: 0.00 },
      { upTo: 12587,    rate: 0.1064, avg: 0.09248, abater: 175.18 },
      { upTo: 17838,    rate: 0.1449, avg: 0.10791, abater: 659.81 },
      { upTo: 23089,    rate: 0.1652, avg: 0.12094, abater: 1021.94 },
      { upTo: 29397,    rate: 0.2142, avg: 0.14095, abater: 2153.28 },
      { upTo: 43090,    rate: 0.2422, avg: 0.17313, abater: 2976.45 },
      { upTo: 46566,    rate: 0.3017, avg: 0.18272, abater: 5540.08 },
      { upTo: 86634,    rate: 0.3122, avg: 0.24261, abater: 6029.37 },
      { upTo: Infinity, rate: 0.3360, avg: null,    abater: 8090.75 }
    ],
    acores: [
      { upTo: 8342,     rate: 0.0854, avg: 0.08540, abater: 0.00 },
      { upTo: 12587,    rate: 0.1064, avg: 0.09248, abater: 175.18 },
      { upTo: 17838,    rate: 0.1449, avg: 0.10791, abater: 659.81 },
      { upTo: 23089,    rate: 0.1652, avg: 0.12094, abater: 1021.94 },
      { upTo: 29397,    rate: 0.2142, avg: 0.14095, abater: 2153.28 },
      { upTo: 43090,    rate: 0.2422, avg: 0.17313, abater: 2976.45 },
      { upTo: 46566,    rate: 0.3017, avg: 0.18272, abater: 5540.08 },
      { upTo: 86634,    rate: 0.3122, avg: 0.24261, abater: 6029.37 },
      { upTo: Infinity, rate: 0.3360, avg: null,    abater: 8090.75 }
    ]
  };

  // IRS Jovem exemption percentage by working year (Art. 12.º-B n.º 5)
  const IRS_JOVEM_RATES = {
    none: 0,
    y1: 1.00,
    y2_4: 0.75,
    y5_7: 0.50,
    y8_10: 0.25
  };

  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function bracketTax(income, region) {
    if (income <= 0) return { tax: 0, marginalRate: 0, bracketIndex: 0 };
    const table = BRACKETS[region] || BRACKETS.continente;
    for (let i = 0; i < table.length; i++) {
      const b = table[i];
      if (income <= b.upTo) {
        const tax = Math.max(0, income * b.rate - b.abater);
        return { tax, marginalRate: b.rate, bracketIndex: i + 1 };
      }
    }
    const last = table[table.length - 1];
    return {
      tax: Math.max(0, income * last.rate - last.abater),
      marginalRate: last.rate,
      bracketIndex: table.length
    };
  }

  function solidarityTax(perQuotientTaxable, region) {
    if (perQuotientTaxable <= 80000) return { tax: 0, marginalAdd: 0 };
    const r1 = region === "acores" ? 0.0175 : 0.025;
    const r2 = region === "acores" ? 0.0350 : 0.050;
    const slice1 = Math.min(perQuotientTaxable, 250000) - 80000;
    const slice2 = Math.max(0, perQuotientTaxable - 250000);
    return {
      tax: slice1 * r1 + slice2 * r2,
      marginalAdd: perQuotientTaxable > 250000 ? r2 : r1
    };
  }

  function computeMinExistenciaAbatement(gross, grossNonExempt, deApplied, region, eligibleHousehold) {
    if (!eligibleHousehold || gross <= 0 || grossNonExempt <= deApplied) return 0;
    const table = BRACKETS[region] || BRACKETS.continente;
    const t1 = table[0].rate;
    const u1 = table[0].upTo;
    const vr = CONSTANTS.MIN_EXISTENCIA_VR;
    const dg = CONSTANTS.DESPESAS_GERAIS_SINGLE; // Art. 70.º n.º 5 c) explicitly uses Art. 78.º-B n.º 1 (€250)
    const L = vr - dg / (t1 * 3.60) + u1 / 3.60;

    let abat;
    if (gross <= vr) {
      abat = vr - deApplied - dg / t1;
    } else if (gross <= L) {
      abat = vr - 2.60 * (gross - vr) - deApplied - dg / t1;
    } else {
      abat = L - u1 - 1.35 * (gross - L) - deApplied;
    }
    const maxAbat = Math.max(0, grossNonExempt - deApplied);
    return Math.max(0, Math.min(abat, maxAbat));
  }

  function computePersonIncome(gross, duesPaid, irsJovemBand, region, meEligible) {
    const g = Math.max(0, Number(gross) || 0);
    const dues = Math.max(0, Number(duesPaid) || 0);
    const exemptRate = IRS_JOVEM_RATES[irsJovemBand] || 0;
    const exempt = Math.min(g * exemptRate, CONSTANTS.IRS_JOVEM_CAP);
    const grossNonExempt = Math.max(0, g - exempt);

    const ss = g * CONSTANTS.SS_RATE;
    const baseDE = g > 0 ? Math.max(CONSTANTS.BASE_DEDUCTION_A, ss) : 0;
    const eligibleDues = Math.min(dues, g * CONSTANTS.UNION_CAP_RATE);
    const unionDeduction = eligibleDues * CONSTANTS.UNION_MAJORATION;
    const totalRawDE = baseDE + unionDeduction;
    const deApplied = Math.min(grossNonExempt, totalRawDE);

    const meAbatement = computeMinExistenciaAbatement(
      g,
      grossNonExempt,
      deApplied,
      region,
      meEligible
    );
    const taxable = Math.max(0, grossNonExempt - deApplied - meAbatement);

    return {
      gross: g,
      dues,
      eligibleDues,
      exempt,
      grossNonExempt,
      ss,
      baseDE,
      unionDeduction,
      deApplied,
      meAbatement,
      taxable
    };
  }

  function computeTaxCredits(opts, perQuotientTaxable) {
    const filing = opts.filing || "single";
    const depTotal = Math.max(0, Math.floor(Number(opts.dependents) || 0));
    const depLe3 = Math.min(depTotal, Math.max(0, Math.floor(Number(opts.dependentsLe3) || 0)));
    const dep2ndLe6 = Math.min(
      Math.max(0, depTotal - 1),
      Math.max(0, Math.floor(Number(opts.dependents2ndLe6) || 0))
    );

    // Non-cumulative bonuses (Art. 78.º-A n.º 4): 2nd+ <= 6 gets +€300, other <= 3 gets +€126
    // If user specifies both, assign €900 first to up to dep2ndLe6 children, then €726 to remaining <=3 children
    const count900 = dep2ndLe6;
    const remainingSlots = depTotal - count900;
    const count726 = Math.min(depLe3, remainingSlots);
    const count600 = Math.max(0, depTotal - count900 - count726);
    const dependentCredit =
      count600 * CONSTANTS.DEP_BASE +
      count726 * (CONSTANTS.DEP_BASE + CONSTANTS.DEP_BONUS_LE3) +
      count900 * (CONSTANTS.DEP_BASE + CONSTANTS.DEP_BONUS_2ND_LE6);

    let despesasGerais = CONSTANTS.DESPESAS_GERAIS_SINGLE;
    if (filing === "joint") {
      despesasGerais = CONSTANTS.DESPESAS_GERAIS_JOINT;
    } else if (filing === "single_parent") {
      despesasGerais = CONSTANTS.DESPESAS_GERAIS_SINGLE_PARENT;
    }

    // Art. 78.º n.º 7 global cap applies to extra credits (health, education, rent, e-fatura VAT, etc.)
    const rawExtra = Math.max(0, Number(opts.extraCredits) || 0);
    let extraCap = Infinity;
    if (perQuotientTaxable > 8342 && perQuotientTaxable <= 80000) {
      extraCap = 1000 + 1500 * ((80000 - perQuotientTaxable) / (80000 - 8342));
    } else if (perQuotientTaxable > 80000) {
      extraCap = 1000;
    }
    if (depTotal >= 3 && isFinite(extraCap)) {
      extraCap *= 1 + 0.05 * depTotal;
    }
    const extraCreditsApplied = Math.min(rawExtra, extraCap);

    return {
      despesasGerais,
      dependentCredit,
      extraCreditsApplied,
      extraCap,
      totalCredits: despesasGerais + dependentCredit + extraCreditsApplied
    };
  }

  /**
   * Run one full 2026 IRS liquidation for a household scenario.
   */
  function liquidate(opts, includeDues) {
    const region = opts.region || "continente";
    const filing = opts.filing || "single";
    const regime = opts.regime || "standard"; // "standard" | "irs_jovem" | "nhr"
    const isJoint = filing === "joint";
    const Q = isJoint ? 2 : 1;

    const grossA = Math.max(0, Number(opts.grossAnnual) || 0);
    const feeRate = Math.max(0, Number(opts.feeRate != null ? opts.feeRate : 0.01));
    const duesA = includeDues ? grossA * feeRate : 0;

    const grossB = isJoint ? Math.max(0, Number(opts.spouseGrossAnnual) || 0) : 0;
    const spouseUnion = isJoint && Boolean(opts.spouseUnion);
    const duesB = includeDues && spouseUnion ? grossB * feeRate : 0;

    // NHR / IFICI flat 20% regime (primary taxpayer; if joint & NHR, modeled on primary or combined)
    if (regime === "nhr") {
      const pA = computePersonIncome(grossA, duesA, "none", region, false);
      const pB = isJoint
        ? computePersonIncome(grossB, duesB, "none", region, false)
        : computePersonIncome(0, 0, "none", region, false);
      const totalTaxable = pA.taxable + pB.taxable;
      const coleta = totalTaxable * CONSTANTS.NHR_RATE;
      const credits = computeTaxCredits(opts, totalTaxable / Q);
      // Under flat 20% NHR/IFICI, standard Art. 78 credits generally apply only if englobamento;
      // show pure flat-rate tax without credits (conservative, accurate for non-englobated NHR)
      const finalIRS = Math.max(0, coleta);
      return {
        pA,
        pB,
        totalGross: pA.gross + pB.gross,
        totalDues: pA.dues + pB.dues,
        totalExempt: 0,
        totalUnionDeduction: pA.unionDeduction + pB.unionDeduction,
        totalTaxable,
        rdt: totalTaxable,
        bracketTaxTotal: coleta,
        solidarityTotal: 0,
        coletaTotal: coleta,
        marginalRate: CONSTANTS.NHR_RATE,
        credits: { ...credits, totalCredits: 0, note: "Flat 20% regime (no Art. 78 credits)" },
        finalIRS: round2(finalIRS)
      };
    }

    const irsJovemA = regime === "irs_jovem" ? (opts.irsJovemBand || "y2_4") : "none";
    const irsJovemB = isJoint && opts.spouseIrsJovemBand ? opts.spouseIrsJovemBand : "none";

    // Mínimo de existência household gross ceiling check (Art. 70.º n.º 4)
    const householdGross = grossA + grossB;
    const meEligible = householdGross > 0 && householdGross <= CONSTANTS.MIN_EXISTENCIA_MAX_GROSS * Q;

    const pA = computePersonIncome(grossA, duesA, irsJovemA, region, meEligible);
    const pB = isJoint
      ? computePersonIncome(grossB, duesB, irsJovemB, region, meEligible)
      : computePersonIncome(0, 0, "none", region, false);

    const totalTaxable = pA.taxable + pB.taxable;
    const totalExempt = pA.exempt + pB.exempt;
    const rdt = totalTaxable + totalExempt;

    const qRdt = rdt / Q;
    const qTaxable = totalTaxable / Q;

    const bRes = bracketTax(qRdt, region);
    const cRdt = Q * bRes.tax;

    let coletaSujeitos = 0;
    if (rdt > 0 && totalTaxable > 0) {
      coletaSujeitos = cRdt * (totalTaxable / rdt);
    }

    const solRes = solidarityTax(qTaxable, region);
    const solidarityTotal = Q * solRes.tax;
    const coletaTotal = coletaSujeitos + solidarityTotal;

    const credits = computeTaxCredits(opts, qTaxable);
    const finalIRS = Math.max(0, coletaTotal - credits.totalCredits);

    return {
      pA,
      pB,
      totalGross: pA.gross + pB.gross,
      totalDues: pA.dues + pB.dues,
      totalExempt,
      totalUnionDeduction: pA.unionDeduction + pB.unionDeduction,
      totalTaxable,
      rdt,
      bracketTaxTotal: round2(coletaSujeitos),
      solidarityTotal: round2(solidarityTotal),
      coletaTotal: round2(coletaTotal),
      marginalRate: totalTaxable > 0 ? bRes.marginalRate + solRes.marginalAdd : 0,
      credits,
      finalIRS: round2(finalIRS)
    };
  }

  /**
   * Compare household IRS with and without STT union dues.
   */
  function compare(opts) {
    const withoutDues = liquidate(opts, false);
    const withDues = liquidate(opts, true);
    const nominalDuesAnnual = round2(withDues.totalDues);
    const irsSavingsAnnual = round2(Math.max(0, withoutDues.finalIRS - withDues.finalIRS));
    const netCostAnnual = round2(nominalDuesAnnual - irsSavingsAnnual);
    const duesBaseGross = withDues.pA.gross + (opts.filing === "joint" && opts.spouseUnion ? withDues.pB.gross : 0);
    const effectiveRate = duesBaseGross > 0 ? netCostAnnual / duesBaseGross : 0;

    return {
      withoutDues,
      withDues,
      nominalDuesAnnual,
      nominalDuesMonthly12: round2(nominalDuesAnnual / 12),
      nominalDuesMonthly14: round2(nominalDuesAnnual / 14),
      irsSavingsAnnual,
      netCostAnnual,
      netCostMonthly12: round2(netCostAnnual / 12),
      netCostMonthly14: round2(netCostAnnual / 14),
      effectiveRate,
      savingsPctOfDues: nominalDuesAnnual > 0 ? irsSavingsAnnual / nominalDuesAnnual : 0
    };
  }

  return {
    CONSTANTS,
    BRACKETS,
    IRS_JOVEM_RATES,
    liquidate,
    compare
  };
});
