$file = "App.tsx"
$lines = Get-Content $file -Encoding UTF8

# Function to replace all occurrences of a string
$newLines = @()
foreach ($line in $lines) {
    if ($line -match 'lastAttackTime:\s*Date\.now\(\)\s*\+\s*\(.*?constructionTimeSeconds.*?\) \* 1000') {
        $newLine = $line -replace 'lastAttackTime:\s*Date\.now\(\)\s*\+\s*\(.*?constructionTimeSeconds.*?\) \* 1000', 'lastAttackTime: Date.now()'
        $newLines += $newLine
    } elseif ($line -match 'return \(now - lastTime >= 10000\);') {
        $newLine = $line -replace 'return \(now - lastTime >= 10000\);', 'return (now - lastTime >= 10000) || (lastTime > now); // Fix for future-dated lastAttackTime bug'
        $newLines += $newLine
    } else {
        $newLines += $line
    }
}

Set-Content -Path $file -Value $newLines -Encoding UTF8
Write-Host "SUCCESS: Fixed lastAttackTime future bug"
