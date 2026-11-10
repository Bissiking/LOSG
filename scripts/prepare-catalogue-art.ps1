# scripts/prepare-catalogue-art.ps1
# Deterministic format conversion/layout only; no generative alteration of official images.
param([string]$SourceDirectory = (Join-Path $PSScriptRoot '../.cache/catalogue-sources'))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$outputDirectory = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../public/games'))
New-Item -ItemType Directory -Force $outputDirectory | Out-Null
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'

foreach ($id in @('arcline', 'ctpasimal', 'luma-snake', 'dustbound', 'harmonix')) {
  $file = if ($id -in @('dustbound', 'harmonix')) { "$id-official.png" } else { "$id-generated.png" }
  $source = [System.Drawing.Image]::FromFile([IO.Path]::GetFullPath((Join-Path $SourceDirectory $file)))
  try {
    foreach ($variant in @(@{ Suffix='cover'; Width=1280; Height=720 }, @{ Suffix='bg'; Width=1920; Height=1080 })) {
      $bitmap = [System.Drawing.Bitmap]::new($variant.Width, $variant.Height)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      $parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
      try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#0A0F2B'))
        if ($id -eq 'harmonix') {
          # Place the unchanged official H in the right half; preserve alpha and aspect ratio.
          $edge = [single]($variant.Height * 0.93)
          $x = [single]($variant.Width * 0.72 - $edge / 2)
          $y = [single](($variant.Height - $edge) / 2)
          $graphics.DrawImage($source, [System.Drawing.RectangleF]::new($x, $y, $edge, $edge))
        } else {
          # DustBound: remove the screenshot HUD, preserve the actual scene and vehicle.
          $top = if ($id -eq 'dustbound') { 110.0 } else { 0.0 }
          $height = [double]$source.Height - $top
          $width = $height * 16 / 9
          if ($width -gt $source.Width) { $width = $source.Width; $height = $width * 9 / 16 }
          $crop = [System.Drawing.RectangleF]::new([single](($source.Width - $width) / 2), [single]$top, [single]$width, [single]$height)
          $destination = [System.Drawing.RectangleF]::new(0, 0, $variant.Width, $variant.Height)
          $graphics.DrawImage($source, $destination, $crop, [System.Drawing.GraphicsUnit]::Pixel)
        }
        $parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]86)
        $bitmap.Save((Join-Path $outputDirectory "$id-$($variant.Suffix).jpg"), $codec, $parameters)
      } finally { $graphics.Dispose(); $bitmap.Dispose(); $parameters.Dispose() }
    }
  } finally { $source.Dispose() }
}
