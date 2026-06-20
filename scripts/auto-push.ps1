param(
    [string]$Branch = "frontend/kds-displays",
    [string]$PushUrl = "https://Miles-dk@github.com/venkatsundar1804-ux/Odoo-Cafe.git",
    [int]$PollSeconds = 5,
    [int]$QuietSeconds = 8
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$git = "C:\Program Files\Git\cmd\git.exe"
$lastChangeAt = $null
$lastSnapshot = ""

Set-Location $repoRoot

function Get-StatusSnapshot {
    $status = & $git status --porcelain
    return ($status -join "`n")
}

function Invoke-AutoPush {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    & $git add -A
    & $git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        return
    }

    & $git commit -m "Auto push changes $timestamp"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Auto-push skipped: commit failed at $timestamp"
        return
    }

    & $git push $PushUrl $Branch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Auto-push warning: push failed at $timestamp"
        return
    }

    & $git fetch origin $Branch
    Write-Host "Auto-pushed changes at $timestamp"
}

Write-Host "Watching $repoRoot for changes."
Write-Host "Auto commits and pushes to $Branch every time files settle for $QuietSeconds seconds."
Write-Host "Press Ctrl+C in this process to stop."

while ($true) {
    $snapshot = Get-StatusSnapshot

    if ($snapshot -ne $lastSnapshot) {
        $lastSnapshot = $snapshot
        $lastChangeAt = Get-Date
    }

    if ($snapshot -and $lastChangeAt) {
        $quietFor = ((Get-Date) - $lastChangeAt).TotalSeconds
        if ($quietFor -ge $QuietSeconds) {
            Invoke-AutoPush
            $lastSnapshot = Get-StatusSnapshot
            $lastChangeAt = $null
        }
    }

    Start-Sleep -Seconds $PollSeconds
}
