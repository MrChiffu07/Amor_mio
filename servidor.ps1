# Servidor web local sin dependencias (YouTube no reproduce en páginas abiertas como archivo)
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$puerto = 5500
$url = "http://localhost:$puerto/"

$tipos = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'
  '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.png' = 'image/png'; '.gif' = 'image/gif'; '.webp' = 'image/webp'
  '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'; '.mp3' = 'audio/mpeg'; '.m4a' = 'audio/mp4'; '.ogg' = 'audio/ogg'; '.wav' = 'audio/wav'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()
Write-Host "Pagina disponible en $url  (cierra esta ventana para apagarla)" -ForegroundColor Magenta
Start-Process "${url}index.html"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $ruta = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrEmpty($ruta)) { $ruta = 'index.html' }
    $archivo = [IO.Path]::GetFullPath((Join-Path $raiz $ruta))
    $res = $ctx.Response
    if ($archivo.StartsWith($raiz) -and (Test-Path $archivo -PathType Leaf)) {
      $ext = [IO.Path]::GetExtension($archivo).ToLower()
      $res.ContentType = if ($tipos.ContainsKey($ext)) { $tipos[$ext] } else { 'application/octet-stream' }
      $bytes = [IO.File]::ReadAllBytes($archivo)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
    }
    $res.Close()
  }
} finally {
  $listener.Stop()
}
