import assert from "node:assert/strict";
import IRS2026 from "./irs2026.js";

function approx(actual, expected, tol = 0.05, label = "") {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `${label}: expected ${expected} ± ${tol}, got ${actual}`
  );
}

// 1. Standard 2026 Continente single filer checks (matching slide table!)
{
  const cases = [
    { gross: 20000, savings: 82.80,  net: 117.20, eff: 0.00586 },
    { gross: 30000, savings: 183.60, net: 116.40, eff: 0.00388 },
    { gross: 40000, savings: 276.80, net: 123.20, eff: 0.00308 },
    { gross: 55000, savings: 490.60, net: 59.40,  eff: 0.00108 },
    { gross: 70000, savings: 624.40, net: 75.60,  eff: 0.00108 },
  ];
  for (const c of cases) {
    const res = IRS2026.compare({ grossAnnual: c.gross, region: "continente", filing: "single", regime: "standard" });
    approx(res.irsSavingsAnnual, c.savings, 0.05, `gross=${c.gross} savings`);
    approx(res.netCostAnnual, c.net, 0.05, `gross=${c.gross} net`);
    approx(res.effectiveRate, c.eff, 0.0001, `gross=${c.gross} effRate`);
  }
}

// 2. Mínimo de Existência (€12,880 gross -> IRS = €0 -> net cost = 1.00% nominal)
{
  const res = IRS2026.compare({ grossAnnual: 12880, region: "continente", filing: "single", regime: "standard" });
  assert.equal(res.withoutDues.finalIRS, 0, "ME should zero out IRS at €12,880");
  assert.equal(res.irsSavingsAnnual, 0, "No tax savings when IRS is already 0");
  approx(res.effectiveRate, 0.01, 0.00001, "ME effective rate = 1.00%");
}

// 3. IRS Jovem Year 1 (100% exempt up to €29,542.15): at €28,000 -> IRS = 0 -> net cost = 1.00%
{
  const res = IRS2026.compare({
    grossAnnual: 28000, region: "continente", filing: "single", regime: "irs_jovem", irsJovemBand: "y1"
  });
  assert.equal(res.withoutDues.finalIRS, 0);
  assert.equal(res.irsSavingsAnnual, 0);
  approx(res.effectiveRate, 0.01, 0.00001, "IRS Jovem Yr 1 €28k -> 1.00%");
}

// 4. IRS Jovem Year 2-4 (75% exempt): at €40,000 -> exempt €29,542.15, non-exempt €10,457.85
//    DE without dues = €4,587.09 -> taxable = €5,870.76 -> RDT = €35,412.91 -> meaningful but reduced savings
{
  const res = IRS2026.compare({
    grossAnnual: 40000, region: "continente", filing: "single", regime: "irs_jovem", irsJovemBand: "y2_4"
  });
  assert.ok(res.irsSavingsAnnual > 0 && res.irsSavingsAnnual < 276.80,
    `IRS Jovem Y2-4 €40k savings (${res.irsSavingsAnnual}) should be between 0 and standard €276.80`);
}

// 5. NHR / IFICI flat 20% -> 40% rebate -> 0.60% effective rate
{
  const res = IRS2026.compare({ grossAnnual: 50000, region: "continente", filing: "single", regime: "nhr" });
  approx(res.irsSavingsAnnual, 200.00, 0.02, "NHR €50k savings");
  approx(res.effectiveRate, 0.006, 0.00001, "NHR effective rate 0.60%");
}

// 6. Dependents wiping out coleta at low-mid salary reduces union tax savings
{
  const noKids = IRS2026.compare({ grossAnnual: 18000, filing: "single", dependents: 0 });
  const threeKids = IRS2026.compare({
    grossAnnual: 18000, filing: "single_parent", dependents: 3, dependentsLe3: 1, dependents2ndLe6: 1
  });
  assert.equal(threeKids.withoutDues.finalIRS, 0, "3 kids at €18k wipes out IRS");
  assert.equal(threeKids.irsSavingsAnnual, 0, "Zero tax savings when credits already wipe out IRS");
  assert.ok(noKids.irsSavingsAnnual > 0, "Single no kids at €18k gets positive rebate");
}

// 7. Joint filing with lower-earning spouse lowers combined marginal bracket -> higher net cost than single
{
  const single = IRS2026.compare({ grossAnnual: 55000, filing: "single" });
  const joint = IRS2026.compare({ grossAnnual: 55000, filing: "joint", spouseGrossAnnual: 20000, spouseUnion: false });
  assert.ok(joint.netCostAnnual > single.netCostAnnual,
    `Joint filing (${joint.netCostAnnual}) with lower-earning spouse drops marginal rate vs single (${single.netCostAnnual})`);
}

// 8. Madeira / Açores 30% lower brackets -> slightly smaller tax savings than Continente
{
  const cont = IRS2026.compare({ grossAnnual: 40000, region: "continente" });
  const mad = IRS2026.compare({ grossAnnual: 40000, region: "madeira" });
  assert.ok(mad.irsSavingsAnnual < cont.irsSavingsAnnual, "Madeira 30% lower rates -> lower tax rebate");
}

// 9. Solidarity surcharge above €80k taxable (~€100k gross): combined rate 47.1% or 50.5% -> near 0% net cost
{
  const res = IRS2026.compare({ grossAnnual: 105000, region: "continente", filing: "single" });
  assert.ok(res.netCostAnnual <= 0, `At €105k gross (50.5% marginal), 200% deduction makes net cost <= 0 (got ${res.netCostAnnual})`);
}

console.log("ALL 9 IRS 2026 TEST SUITES PASSED!");
