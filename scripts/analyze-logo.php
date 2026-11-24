<?php

$img = imagecreatefromjpeg(__DIR__ . '/../public/logo-colorida.jpeg');
$w = imagesx($img);
$h = imagesy($img);

$samples = [
    [0, 0],
    [$w - 1, 0],
    [0, $h - 1],
    [$w - 1, $h - 1],
    [(int) ($w * 0.1), (int) ($h * 0.1)],
    [(int) ($w * 0.5), (int) ($h * 0.5)],
    [(int) ($w * 0.25), (int) ($h * 0.5)],
    [(int) ($w * 0.75), (int) ($h * 0.4)],
];

foreach ($samples as [$x, $y]) {
    $c = imagecolorat($img, $x, $y);
    $r = ($c >> 16) & 0xFF;
    $g = ($c >> 8) & 0xFF;
    $b = $c & 0xFF;
    echo "($x,$y) = $r,$g,$b\n";
}

// Histograma simples de "quase cinza plano" vs colorido
$bg = 0;
$fg = 0;
$step = 8;
for ($y = 0; $y < $h; $y += $step) {
    for ($x = 0; $x < $w; $x += $step) {
        $c = imagecolorat($img, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        $chroma = max($r, $g, $b) - min($r, $g, $b);
        $avg = ($r + $g + $b) / 3;
        if ($chroma < 12 && $avg > 200) {
            $bg++;
        } else {
            $fg++;
        }
    }
}
echo "bg~$bg fg~$fg\n";

// Bounding box por croma
$minX = $w; $minY = $h; $maxX = 0; $maxY = 0;
for ($y = 0; $y < $h; $y += 2) {
    for ($x = 0; $x < $w; $x += 2) {
        $c = imagecolorat($img, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        $chroma = max($r, $g, $b) - min($r, $g, $b);
        $avg = ($r + $g + $b) / 3;
        if ($chroma >= 18 || $avg < 190) {
            if ($x < $minX) $minX = $x;
            if ($y < $minY) $minY = $y;
            if ($x > $maxX) $maxX = $x;
            if ($y > $maxY) $maxY = $y;
        }
    }
}
echo "chroma-box: {$minX},{$minY} -> {$maxX},{$maxY} (" . ($maxX - $minX + 1) . 'x' . ($maxY - $minY + 1) . ")\n";
