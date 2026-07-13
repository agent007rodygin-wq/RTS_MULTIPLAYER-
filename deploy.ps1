$ErrorActionPreference = 'Stop'

$nodeCandidates = @(
  'C:\Users\goldw\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe',
  (Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue)
)

$nodeExe = $nodeCandidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $nodeExe) {
  throw 'Node.js not found. Install Node or use the bundled Codex runtime path.'
}

if (-not $env:DEPLOY_PASSWORD) {
  $secure = Read-Host 'Enter VPS password' -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $env:DEPLOY_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

& $nodeExe "$PSScriptRoot\deploy.cjs" @args
