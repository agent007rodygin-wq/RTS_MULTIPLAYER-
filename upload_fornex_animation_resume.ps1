$ErrorActionPreference = 'Stop'

$root = 'C:\Users\User\.antigravity\extensions\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\dist'
$hostUrl = 'ftp://a139428.hostse1.fornex.host/public_html/BasingseLegions.com/'
$user = 'a139428'
$pass = 'Jd84m28YgQmqEPyz'
$startAt = 'animation/flags/21022/12.png'
$logPath = 'C:\Users\User\.antigravity\extensions\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\upload_fornex_animation_resume.log'

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Add-Content -LiteralPath $logPath -Value "[$timestamp] $Message"
}

function Get-EncodedRelativePath {
    param([string]$RelativePath)
    return (($RelativePath -split '/') | ForEach-Object { [System.Uri]::EscapeDataString($_) }) -join '/'
}

Write-Log 'Resume upload started.'

$files = Get-ChildItem -Path (Join-Path $root 'animation') -Recurse -File -Force |
    Sort-Object FullName |
    ForEach-Object {
        [pscustomobject]@{
            File = $_
            Relative = $_.FullName.Substring($root.Length + 1).Replace('\', '/')
        }
    }

$started = $false

foreach ($item in $files) {
    if (-not $started) {
        if ($item.Relative -eq $startAt) {
            $started = $true
        } else {
            continue
        }
    }

    $encoded = Get-EncodedRelativePath -RelativePath $item.Relative
    $target = $hostUrl + $encoded

    Write-Log "Uploading $($item.Relative)"
    & curl.exe --silent --show-error --ftp-create-dirs --max-time 600 --retry 8 --retry-delay 3 --user "${user}:$pass" -T $item.File.FullName $target

    if ($LASTEXITCODE -ne 0) {
        Write-Log "FAILED $($item.Relative)"
        throw "Upload failed for $($item.Relative)"
    }
}

Write-Log 'Resume upload finished successfully.'
