# Compose catalogue SVGs from the games' own geometry and unchanged HexGL artwork.
$artRoot = Split-Path -Parent $PSScriptRoot
$utf8Art = [System.Text.UTF8Encoding]::new($false)
$hexScene = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes((Join-Path $artRoot 'GAMES/HexGL/css/bg.jpg')))
$hexLogo = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes((Join-Path $artRoot 'GAMES/HexGL/css/title.png')))
foreach ($variant in @('cover', 'bg')) {
  $artWidth = if ($variant -eq 'cover') { 1280 } else { 1920 }
  $artHeight = if ($variant -eq 'cover') { 720 } else { 1080 }
  $hexSvg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="$artWidth" height="$artHeight" viewBox="0 0 1280 720">
<title>HexGL — illustrations originales de BKcore</title>
<image width="1280" height="720" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,$hexScene"/>
<image x="190" y="25" width="900" height="560" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,$hexLogo"/>
<path d="M0 640H1280V720H0Z" fill="#143749"/>
<text x="640" y="692" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" letter-spacing="5" fill="#fff">CITYSCAPE · COURSE FUTURISTE</text>
</svg>
"@
  [System.IO.File]::WriteAllText((Join-Path $artRoot "public/games/hexgl-$variant.svg"), $hexSvg, $utf8Art)
  $tileValues = @(2, 4, 8, 16, 4, 8, 32, 64, 8, 16, 128, 256, 16, 32, 512, 2048)
  $tileColors = @('#eee4da','#ede0c8','#f2b179','#f59563','#ede0c8','#f2b179','#f67c5f','#f65e3b','#f2b179','#f59563','#edcf72','#edcc61','#f59563','#f67c5f','#edc850','#edc22e')
  $tileSvg = for ($tileIndex = 0; $tileIndex -lt 16; $tileIndex++) {
    $tileX = 742 + ($tileIndex % 4) * 100
    $tileY = 172 + [Math]::Floor($tileIndex / 4) * 100
    $tileTextX = $tileX + 44
    $tileTextY = $tileY + 57
    $tileTextColor = if ($tileValues[$tileIndex] -le 4) { '#776e65' } else { '#fffaf0' }
    $tileFont = if ($tileValues[$tileIndex] -ge 1000) { 27 } else { 36 }
    "<rect x='$tileX' y='$tileY' width='88' height='88' rx='5' fill='$($tileColors[$tileIndex])'/><text x='$tileTextX' y='$tileTextY' text-anchor='middle' font-family='Arial,sans-serif' font-weight='bold' font-size='$tileFont' fill='$tileTextColor'>$($tileValues[$tileIndex])</text>"
  }
  $svg2048 = @"
<svg xmlns="http://www.w3.org/2000/svg" width="$artWidth" height="$artHeight" viewBox="0 0 1280 720">
<title>2048 — tuiles et palette du jeu de Gabriele Cirulli</title>
<path fill="#faf8ef" d="M0 0H1280V720H0Z"/>
<text x="95" y="360" font-family="Arial,sans-serif" font-size="190" font-weight="bold" letter-spacing="-9" fill="#776e65">2048</text>
<text x="105" y="427" font-family="Arial,sans-serif" font-size="28" fill="#776e65">Un mouvement. Une fusion.</text>
<rect x="728" y="158" width="416" height="416" rx="9" fill="#bbada0"/>
$($tileSvg -join "`n")
</svg>
"@
  [System.IO.File]::WriteAllText((Join-Path $artRoot "public/games/2048-$variant.svg"), $svg2048, $utf8Art)
}
