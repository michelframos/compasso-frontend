<?php

$srcPath = __DIR__ . '/../public/logo-colorida.jpeg';
$outPath = __DIR__ . '/../public/logo-mark.png';

$img = imagecreatefromjpeg($srcPath);
if (!$img) {
    fwrite(STDERR, "Falha ao carregar a logo\n");
    exit(1);
}

$w = imagesx($img);
$h = imagesy($img);
echo "source: {$w}x{$h}\n";

$isBackground = static function (int $r, int $g, int $b): bool {
    $chroma = max($r, $g, $b) - min($r, $g, $b);
    $avg = ($r + $g + $b) / 3;
    return $chroma < 18 && $avg > 190;
};

$minX = $w;
$minY = $h;
$maxX = 0;
$maxY = 0;

for ($y = 0; $y < $h; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $c = imagecolorat($img, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if (!$isBackground($r, $g, $b)) {
            if ($x < $minX) $minX = $x;
            if ($y < $minY) $minY = $y;
            if ($x > $maxX) $maxX = $x;
            if ($y > $maxY) $maxY = $y;
        }
    }
}

$pad = (int) max(16, round(max($maxX - $minX, $maxY - $minY) * 0.035));
$minX = max(0, $minX - $pad);
$minY = max(0, $minY - $pad);
$maxX = min($w - 1, $maxX + $pad);
$maxY = min($h - 1, $maxY + $pad);

$cw = $maxX - $minX + 1;
$ch = $maxY - $minY + 1;
echo "crop: {$cw}x{$ch} @ {$minX},{$minY}\n";

$side = max($cw, $ch);
$target = 512;

// Canvas final transparente
$canvas = imagecreatetruecolor($target, $target);
imagealphablending($canvas, false);
imagesavealpha($canvas, true);
$transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
imagefilledrectangle($canvas, 0, 0, $target - 1, $target - 1, $transparent);

$scale = $target / $side;
$dw = (int) round($cw * $scale);
$dh = (int) round($ch * $scale);
$ox = (int) round(($target - $dw) / 2);
$oy = (int) round(($target - $dh) / 2);

// Rasteriza direto com nearest-ish via amostragem do JPEG (evita artefatos de alpha no resample)
for ($y = 0; $y < $dh; $y++) {
    $sy = $minY + (int) floor(($y + 0.5) * $ch / $dh);
    $sy = min($maxY, max($minY, $sy));
    for ($x = 0; $x < $dw; $x++) {
        $sx = $minX + (int) floor(($x + 0.5) * $cw / $dw);
        $sx = min($maxX, max($minX, $sx));

        $c = imagecolorat($img, $sx, $sy);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;

        if ($isBackground($r, $g, $b)) {
            continue;
        }

        $chroma = max($r, $g, $b) - min($r, $g, $b);
        $avg = ($r + $g + $b) / 3;
        $alpha = 0;
        if ($chroma < 36 && $avg > 175) {
            // Semi-transparente nas bordas suaves do JPEG
            $edge = 1 - (($chroma / 36) * 0.55 + ((255 - $avg) / 80) * 0.45);
            $alpha = (int) max(0, min(100, round(100 * $edge)));
        }

        $col = imagecolorallocatealpha($canvas, $r, $g, $b, $alpha);
        imagesetpixel($canvas, $ox + $x, $oy + $y, $col);
    }
}

imagepng($canvas, $outPath, 6);
echo 'wrote ' . basename($outPath) . ' ' . filesize($outPath) . " bytes\n";

// Sanity: conta pixels opacos vs transparentes
$opaque = 0;
$clear = 0;
for ($y = 0; $y < $target; $y += 4) {
    for ($x = 0; $x < $target; $x += 4) {
        $c = imagecolorat($canvas, $x, $y);
        $a = ($c & 0x7F000000) >> 24;
        if ($a >= 120) {
            $clear++;
        } else {
            $opaque++;
        }
    }
}
echo "sample opaque~$opaque clear~$clear\n";

imagedestroy($canvas);
imagedestroy($img);
