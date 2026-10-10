#!/bin/sh
# Pre-release sanity checks. No npm, no dependencies. Run from anywhere: sh scripts/check.sh
# Never prints the catalog block (it is ~800 KB).
cd "$(dirname "$0")/.." || exit 1
fail=0

if ! command -v node >/dev/null 2>&1; then
  echo "SKIP: node not found, cannot syntax-check index.html or parse the catalog."
else
  tmp=$(mktemp -d)
  node -e '
    const fs=require("fs"), tmp=process.argv[1];
    const html=fs.readFileSync("index.html","utf8");
    const cat=html.match(/<script type="application\/json" id="fullCatalog">([\s\S]*?)<\/script>/);
    const re=/<script>([\s\S]*?)<\/script>/g; let m, last=null;
    while((m=re.exec(html))) last=m[1];
    if(!last){console.log("FAIL: main <script> not found");process.exit(2);}
    fs.writeFileSync(tmp+"/main.js",last);
    if(!cat){console.log("FAIL: fullCatalog block not found");process.exit(3);}
    fs.writeFileSync(tmp+"/catalog.json",cat[1]);
  ' "$tmp" || fail=1
  if [ -f "$tmp/main.js" ]; then
    if node --check "$tmp/main.js"; then echo "OK: main script syntax"; else echo "FAIL: main script syntax"; fail=1; fi
    if node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));if(!Array.isArray(j))throw new Error("not an array");console.log("OK: catalog parses ("+j.length+" entries)")' "$tmp/catalog.json" 2>&1 | cut -c1-200; then :; fi
    node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))' "$tmp/catalog.json" 2>/dev/null || { echo "FAIL: catalog JSON"; fail=1; }
  fi
  rm -rf "$tmp"
fi

# Release reminder: index.html changed vs main but sw.js did not -> installed copies will not update.
if git rev-parse --verify -q main >/dev/null; then
  if ! git diff --quiet main -- index.html && git diff --quiet main -- sw.js; then
    echo "WARN: index.html differs from main but sw.js does not. Bump CACHE_VERSION in sw.js before deploying."
  else
    echo "OK: no index.html change without sw.js (vs main)"
  fi
fi

exit $fail
