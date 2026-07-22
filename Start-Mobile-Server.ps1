# AmenityWorks Pricing — serve for phone access on same Wi-Fi
# Double-click or: powershell -ExecutionPolicy Bypass -File .\Start-Mobile-Server.ps1

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$Port = 8080

# Find LAN IPv4 (skip loopback / APIPA)
$ip = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object {
    $_.IPAddress -notlike "127.*" -and
    $_.IPAddress -notlike "169.254.*" -and
    $_.PrefixOrigin -ne "WellKnown"
  } |
  Sort-Object -Property InterfaceMetric |
  Select-Object -ExpandProperty IPAddress -First 1

if (-not $ip) {
  $ip = "127.0.0.1"
  Write-Host "Could not detect LAN IP — use phone only if on this PC, or check Wi-Fi." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  AmenityWorks Pricing — mobile server" -ForegroundColor Green
Write-Host "  ------------------------------------"
Write-Host "  Folder: $Root"
Write-Host ""
Write-Host "  On this PC:     http://localhost:$Port/" -ForegroundColor Cyan
Write-Host "  On your phone:  http://${ip}:$Port/" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Phone must be on the SAME Wi-Fi as this PC."
Write-Host "  Leave this window OPEN while you use the apps."
Write-Host "  Press Ctrl+C to stop."
Write-Host ""

# Prefer Python if available
$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) { $py = Get-Command py -ErrorAction SilentlyContinue }

if ($py) {
  Set-Location $Root
  # 0.0.0.0 = listen on all interfaces so phone can connect
  & $py.Source -m http.server $Port --bind 0.0.0.0
  exit $LASTEXITCODE
}

# Fallback: PowerShell HttpListener
Write-Host "Python not found — using built-in PowerShell server." -ForegroundColor Yellow

$prefix = "http://+:$Port/"
$listener = New-Object System.Net.HttpListener
try {
  $listener.Prefixes.Add($prefix)
  $listener.Start()
} catch {
  # Try localhost-only bind message for URL ACL
  Write-Host "Binding to all interfaces failed; trying http://localhost only." -ForegroundColor Yellow
  Write-Host "If phone cannot connect, run as Administrator once:" -ForegroundColor Yellow
  Write-Host "  netsh http add urlacl url=http://+:$Port/ user=Everyone" -ForegroundColor Yellow
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add("http://localhost:$Port/")
  $listener.Start()
  Write-Host "Listening on localhost only — phone may not work without the netsh command above." -ForegroundColor Yellow
}

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json"
  ".webmanifest" = "application/manifest+json"
  ".png"  = "image/png"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".md"   = "text/plain; charset=utf-8"
  ".txt"  = "text/plain; charset=utf-8"
}

Write-Host "Server running..." -ForegroundColor Green

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response
  try {
    $path = [Uri]::UnescapeDataString($req.Url.LocalPath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($path)) { $path = "index.html" }
    $full = [System.IO.Path]::GetFullPath((Join-Path $Root $path))
    if (-not $full.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) {
      $res.StatusCode = 403
      $res.Close()
      continue
    }
    if (Test-Path $full -PathType Container) {
      $full = Join-Path $full "index.html"
    }
    if (-not (Test-Path $full -PathType Leaf)) {
      $res.StatusCode = 404
      $buf = [Text.Encoding]::UTF8.GetBytes("Not found")
      $res.OutputStream.Write($buf, 0, $buf.Length)
      $res.Close()
      continue
    }
    $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
    $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($full)
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } catch {
    $res.StatusCode = 500
  } finally {
    $res.Close()
  }
}
