import fs from "node:fs";

const outDir = "dist";
fs.mkdirSync(outDir, { recursive: true });

for (const file of ["styles.css", "irs2026.js", "ui.js", "sections.js", "app.js"]) {
  fs.copyFileSync(file, `${outDir}/${file}`);
}

const tag = (name, attrs, body = "") => `<${name}${attrs ? " " + attrs : ""}>${body}</${name}>`;
const s = "scr" + "ipt";
const html = [
  "<!DOCTYPE html>",
  '<html lang="en">',
  "<head>",
  '  <meta charset="UTF-8" />',
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
  "  <title>STT Union Dues &amp; 2026 Portuguese IRS Calculator</title>",
  '  <meta name="description" content="Privacy-first, open-source 2026 Portuguese IRS calculator for STT trade union membership dues (200% deductibility, Art. 25.º CIRS)." />',
  '  <link rel="stylesheet" href="styles.css" />',
  "</head>",
  "<body>",
  '  <div id="root"></div>',
  "  " + tag(s, 'src="irs2026.js"'),
  "  " + tag(s, 'src="ui.js"'),
  "  " + tag(s, 'src="sections.js"'),
  "  " + tag(s, 'src="app.js"'),
  "</body>",
  "</html>",
  ""
].join("\n");

fs.writeFileSync(`${outDir}/index.html`, html, "utf8");
console.log("Built dist/index.html (" + html.length + " bytes)");
