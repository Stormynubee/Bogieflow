$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$log = Join-Path $root "assets\fallback_demo_log.txt"
"Bogie Flow - Fallback Demo Log" | Out-File $log
"Generated: $(Get-Date -Format o)" | Add-Content $log
"" | Add-Content $log

python -m pytest tests/ -v 2>&1 | Add-Content $log

Write-Host "Log written to $log"
