$content = Get-Content "Page\so-sanh.html" -Raw

$script_block = @"
      function getSpecs(p) {
          // Parse info from product properties if available, otherwise guess from name
          if (p.specs) return p.specs;
          
          let name = p.name.toUpperCase();
          let weight = name.includes("6U") ? "6U" : (name.includes("3U") ? "3U" : "4U");
          let balance = name.includes("NẶNG ĐẦU") ? "305mm (Nặng đầu)" : (name.includes("NHẸ ĐẦU") ? "290mm (Nhẹ đầu)" : "295mm (Cân bằng)");
          let flex = name.includes("POWER") || name.includes("NẶNG") || name.includes("TẤN CÔNG") ? "Cứng" : (name.includes("NHẸ") ? "Dẻo" : "Trung bình");
          let maxTension = weight === "3U" ? "13.5kg" : (weight === "4U" ? "12.5kg" : "11kg");
          
          return { weight, balance, flex, maxTension };
      }

      function renderCompare() {
"@

$content = $content -replace '(?s)// Mock Specs Data.*?\};\s+function renderCompare\(\) \{', $script_block

$content = $content -replace "\`$\{MOCK_SPECS\[p.id\] \? MOCK_SPECS\[p.id\].weight : MOCK_SPECS\['default'\].weight\}", "`${getSpecs(p).weight}"
$content = $content -replace "\`$\{MOCK_SPECS\[p.id\] \? MOCK_SPECS\[p.id\].balance : MOCK_SPECS\['default'\].balance\}", "`${getSpecs(p).balance}"
$content = $content -replace "\`$\{MOCK_SPECS\[p.id\] \? MOCK_SPECS\[p.id\].flex : MOCK_SPECS\['default'\].flex\}", "`${getSpecs(p).flex}"
$content = $content -replace "\`$\{MOCK_SPECS\[p.id\] \? MOCK_SPECS\[p.id\].maxTension : MOCK_SPECS\['default'\].maxTension\}", "`${getSpecs(p).maxTension}"

Set-Content -Path "Page\so-sanh.html" -Value $content -Encoding UTF8
Write-Host "Updated so-sanh.html to remove MOCK_SPECS"
