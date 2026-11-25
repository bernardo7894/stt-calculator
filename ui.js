// Clean, progressive-disclosure UI skeleton for the STT 2026 IRS Calculator
(function () {
  "use strict";
  const root = document.getElementById("root");
  if (!root) return;

  const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 185 52" height="42" role="img" aria-label="STT">
    <g fill="#1D3E8F">
      <ellipse cx="36" cy="9" rx="28" ry="1.9" opacity=".55"/>
      <ellipse cx="34" cy="15" rx="30" ry="2.1" opacity=".75"/>
      <ellipse cx="32" cy="21" rx="31" ry="2.2" opacity=".9"/>
      <ellipse cx="30" cy="27" rx="31" ry="2.2"/>
      <ellipse cx="28" cy="33" rx="30" ry="2.1" opacity=".9"/>
      <ellipse cx="26" cy="39" rx="28" ry="1.9" opacity=".75"/>
      <ellipse cx="24" cy="45" rx="25" ry="1.8" opacity=".55"/>
      <circle cx="44" cy="26" r="13.5" stroke="#fff" stroke-width="2"/>
      <path d="M31,26Q44,16 57,26Q44,36 31,26Z" fill="#fff"/>
      <circle cx="44" cy="26" r="5.2" fill="#13295E"/>
    </g>
    <text x="72" y="36" font-family="system-ui,sans-serif" font-weight="900" font-size="33" fill="#CC2925">STT</text>
    <text x="73" y="47" font-family="system-ui,sans-serif" font-weight="700" font-size="7.2" fill="#181D27">TELECOMUNICAÇÕES E AUDIOVISUAL</text>
  </svg>`;

  root.innerHTML = `
  <div class="topbar"></div>
  <header>
    <div class="wrap header-inner">
      <div class="brand">
        ${svgLogo}
        <div class="brand-text">
          <h1 id="tBrandTitle">STT Union Dues Calculator</h1>
          <p id="tBrandSub"></p>
        </div>
      </div>
      <div class="header-right">
        <div class="lang-switch" role="group" aria-label="Language">
          <button type="button" data-lang="en" class="active">EN</button>
          <button type="button" data-lang="pt">PT</button>
          <button type="button" data-lang="zh">中文</button>
        </div>
        <nav aria-label="Primary">
          <a href="#calculator" id="tNavCalc"></a>
          <a href="#how-it-works" id="tNavWhy"></a>
          <a href="#faq" id="tNavFaq"></a>
          <a href="#join" id="tNavJoin" class="primary"></a>
        </nav>
      </div>
    </div>
  </header>

  <div class="privacy-bar">
    <div class="wrap privacy-items">
      <div class="privacy-badges">
        <span>&#128274; <strong id="tPrivLocal"></strong></span>
        <span>&#128683; <span id="tPrivZero"></span></span>
        <span>&#128197; <span id="tPrivLaw"></span></span>
      </div>
      <a href="https://github.com/bernardo7894/stt-calculator" target="_blank" rel="noopener"><span id="tOpenSource"></span> &#8599;</a>
    </div>
  </div>

  <main class="wrap">
    <section id="calculator" class="calc-grid">
      <!-- Left: Streamlined Core Inputs -->
      <div class="card">
        <h2 id="tInputTitle"></h2>
        <p class="card-sub" id="tInputSub"></p>

        <div class="field">
          <div class="field-head">
            <label for="salaryInput" id="tSalaryLabel"></label>
            <div class="seg" role="group">
              <button type="button" id="btnAnnual" class="active"></button>
              <button type="button" id="btnMonthly14"></button>
            </div>
          </div>
          <div class="input-prefix">
            <span>€</span>
            <input type="number" id="salaryInput" min="0" max="500000" step="500" value="40000" />
          </div>
          <div class="hint" id="salaryHint"></div>
          <div class="presets">
            <button type="button" data-annual="20000">€20k</button>
            <button type="button" data-annual="30000">€30k</button>
            <button type="button" data-annual="40000">€40k</button>
            <button type="button" data-annual="55000">€55k</button>
            <button type="button" data-annual="70000">€70k</button>
          </div>
        </div>

        <div class="field">
          <label for="regimeSelect" id="tRegimeLabel"></label>
          <select id="regimeSelect">
            <option value="standard" id="optRegStd" selected></option>
            <option value="irs_jovem" id="optRegJovem"></option>
            <option value="nhr" id="optRegNhr"></option>
          </select>
        </div>

        <div id="jovemBox" class="subbox hidden">
          <label for="jovemBand" id="tJovemLabel"></label>
          <select id="jovemBand">
            <option value="y1" id="optJY1"></option>
            <option value="y2_4" id="optJY24" selected></option>
            <option value="y5_7" id="optJY57"></option>
            <option value="y8_10" id="optJY810"></option>
          </select>
        </div>

        <div class="field-row">
          <div class="field" style="margin-bottom:0;">
            <label for="filingSelect" id="tFilingLabel"></label>
            <select id="filingSelect">
              <option value="single" id="optFilSingle" selected></option>
              <option value="single_parent" id="optFilSP"></option>
              <option value="joint" id="optFilJoint"></option>
            </select>
          </div>
          <div class="field" style="margin-bottom:0;">
            <label for="depTotal" id="tDepLabel"></label>
            <input type="number" id="depTotal" min="0" max="10" step="1" value="0" />
          </div>
        </div>

        <div id="spouseBox" class="subbox hidden" style="margin-top:14px;">
          <label for="spouseSalary" id="tSpouseSalaryLabel"></label>
          <div class="input-prefix">
            <span>€</span>
            <input type="number" id="spouseSalary" min="0" max="500000" step="500" value="30000" />
          </div>
          <label class="check-inline">
            <input type="checkbox" id="spouseUnion" />
            <span id="tSpouseUnionLabel"></span>
          </label>
        </div>

        <div id="depAgeBox" class="subbox hidden" style="margin-top:14px;">
          <div class="field-row">
            <div>
              <label for="depLe3" id="tDepLe3Label"></label>
              <input type="number" id="depLe3" min="0" max="10" step="1" value="0" />
            </div>
            <div>
              <label for="dep2ndLe6" id="tDep2ndLe6Label"></label>
              <input type="number" id="dep2ndLe6" min="0" max="10" step="1" value="0" />
            </div>
          </div>
        </div>

        <details class="fold" style="margin-top:18px;">
          <summary id="tAdvSummary"></summary>
          <div class="fold-body">
            <div class="field">
              <label for="regionSelect" id="tRegionLabel"></label>
              <select id="regionSelect">
                <option value="continente" id="optRegCont" selected></option>
                <option value="madeira" id="optRegMad"></option>
                <option value="acores" id="optRegAco"></option>
              </select>
            </div>
            <div class="field">
              <label for="extraCredits" id="tExtraCreditsLabel"></label>
              <div class="input-prefix">
                <span>€</span>
                <input type="number" id="extraCredits" min="0" max="10000" step="50" value="0" />
              </div>
              <div class="hint" id="tExtraCreditsHint"></div>
            </div>
            <div class="field" style="margin-bottom:0;">
              <label for="feeRateInput" id="tFeeLabel"></label>
              <input type="number" id="feeRateInput" min="0.1" max="5.0" step="0.1" value="1.0" />
              <div class="hint" id="tFeeHint"></div>
            </div>
          </div>
        </details>
      </div>

      <!-- Right: Calm, Focused Results -->
      <div class="card">
        <h2 id="tResultTitle"></h2>
        <p class="card-sub" id="tResultSub"></p>

        <div class="hero-answer">
          <div class="hero-tile primary">
            <div class="hero-label" id="tHeroMoLabel"></div>
            <div class="hero-num" id="outNetMo12">€10.27</div>
            <div class="hero-sub" id="outNetMo14"></div>
          </div>
          <div class="hero-tile rate">
            <div class="hero-label" id="tHeroRateLabel"></div>
            <div class="hero-num" id="outEffRate">0.31%</div>
            <div class="hero-sub" id="outEffSub"></div>
          </div>
        </div>

        <div class="mini-stats">
          <div class="mini-stat savings">
            <div class="k" id="tKpiSavingsLabel"></div>
            <div class="v" id="outSavings">€276.80</div>
            <div class="n" id="outSavingsPct"></div>
          </div>
          <div class="mini-stat">
            <div class="k" id="tKpiNetYrLabel"></div>
            <div class="v" id="outNetAnnual">€123.20</div>
            <div class="n" id="outNominalNote"></div>
          </div>
        </div>

        <div class="bar-wrap">
          <div class="bar-header">
            <span id="tBarTitle"></span>
            <span id="barTotalLabel"></span>
          </div>
          <div class="bar-track" aria-hidden="true">
            <div class="bar-net" id="barNet" style="width:31%;"></div>
            <div class="bar-tax" id="barTax" style="width:69%;"></div>
          </div>
          <div class="bar-legend">
            <span><span class="dot" style="background:var(--red);"></span><span id="tLegNet"></span> <strong id="legNet"></strong></span>
            <span><span class="dot" style="background:var(--green);"></span><span id="tLegTax"></span> <strong id="legTax"></strong></span>
          </div>
        </div>

        <div id="insightBox" class="insight"></div>

        <details class="fold">
          <summary id="tChartSummary"></summary>
          <div class="fold-body">
            <svg id="rateChart" viewBox="0 0 540 165" role="img"></svg>
          </div>
        </details>

        <details class="fold">
          <summary id="tMathSummary"></summary>
          <div class="fold-body">
            <table class="math-table">
              <thead>
                <tr>
                  <th id="tMathColItem"></th>
                  <th id="tMathColNo"></th>
                  <th id="tMathColYes"></th>
                </tr>
              </thead>
              <tbody id="mathBody"></tbody>
            </table>
          </div>
        </details>
      </div>
    </section>

    <div id="lowerSections"></div>
  </main>

  <footer>
    <div class="wrap footer-inner">
      <div id="tDisclaimer"></div>
      <div>
        <a href="https://github.com/bernardo7894/stt-calculator" target="_blank" rel="noopener" id="tSourceLink"></a>
      </div>
    </div>
  </footer>`;
})();
