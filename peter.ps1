# === CONFIG ===
$Host.UI.RawUI.WindowTitle = "Peter Cianci - Coccodrillo"
$host.UI.RawUI.BackgroundColor = "Black"
Clear-Host
Write-Host "Scaricamento dei frames (Potrebbe volerci un po')..."

$fps = 15
$delay = 1000 / $fps
$totalFrames = 1991

# === UTILS ===
function Hide-Cursor { Write-Host "`e[?25l" -NoNewline }
function Show-Cursor { Write-Host "`e[?25h" -NoNewline }
function Clear-Screen { cls }

# === PROGRESS BAR ===
function Show-ProgressBar($current, $total) {
    $barLength = 30
    $percent = [math]::Round(($current / $total) * 100)
    $filledLength = [math]::Floor(($current / $total) * $barLength)
    $bar = ("---" * $filledLength) + ("   " * ($barLength - $filledLength))
    Write-Host ("Scaricati: $current / $total [$bar] $percent%") -NoNewline
    Write-Host "`r" -NoNewline
}

# === TEMP DIRECTORY ===
$tempDir = "$env:TEMP\ascii_temp_frames"
if (-Not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir | Out-Null
}

# === SCARICA I FRAME (solo se mancano) ===
for ($i = 1; $i -le $totalFrames; $i++) {
    $fileName = "frame_{0:D4}.txt" -f $i
    $localPath = Join-Path $tempDir $fileName
    $url = "https://raw.githubusercontent.com/pannisco/pannisco.github.io/main/frames/$fileName"

    if (-Not (Test-Path $localPath)) {
        try {
            Invoke-WebRequest -Uri $url -UseBasicParsing -OutFile $localPath -TimeoutSec 5
        } catch {
            Write-Host "❌ Errore durante il download del frame $i"
            break
        }
    }

    Show-ProgressBar -current $i -total $totalFrames
}

# === CARICA I FRAME IN MEMORIA ===
$frames = @()
Get-ChildItem -Path $tempDir -Filter *.txt | Sort-Object Name | ForEach-Object {
    $frames += Get-Content $_.FullName -Raw
}

Clear-Host
Write-Host "Avvio riproduzione..."
Start-Sleep -Seconds 1

# === PLAYBACK ===
Hide-Cursor
try {
    while ($true) {
        foreach ($frame in $frames) {
            Clear-Screen
            Write-Host $frame
            Start-Sleep -Milliseconds $delay
        }
    }
}
finally {
    Show-Cursor
    Clear-Host
    Write-Host "Arrivederci GANG!"
}
