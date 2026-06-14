$ErrorActionPreference = 'Stop'

$root = 'C:\Users\User\.antigravity\extensions\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\dist'
$hostUrl = 'ftp://a139428.hostse1.fornex.host/public_html/BasingseLegions.com/'
$user = 'a139428'
$pass = 'Jd84m28YgQmqEPyz'
$logPath = 'C:\Users\User\.antigravity\extensions\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\upload_fornex_animation.log'

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Add-Content -LiteralPath $logPath -Value "[$timestamp] $Message"
}

function Get-EncodedRelativePath {
    param([string]$RelativePath)
    return (($RelativePath -split '/') | ForEach-Object { [System.Uri]::EscapeDataString($_) }) -join '/'
}

Write-Log 'Animation upload started.'

$files = Get-ChildItem -Path (Join-Path $root 'animation') -Recurse -File -Force | Sort-Object FullName

foreach ($file in $files) {
    $relative = $file.FullName.Substring($root.Length + 1).Replace('\', '/')
    $encoded = Get-EncodedRelativePath -RelativePath $relative
    $target = $hostUrl + $encoded

    Write-Log "Uploading $relative"
    & curl.exe --silent --show-error --ftp-create-dirs --max-time 600 --retry 5 --retry-delay 2 --user "${user}:$pass" -T $file.FullName $target

    if ($LASTEXITCODE -ne 0) {
        Write-Log "FAILED $relative"
        throw "Upload failed for $relative"
    }
}

Write-Log 'Animation upload finished successfully.'
