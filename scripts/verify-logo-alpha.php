<?php

$i = imagecreatefrompng(__DIR__ . '/../public/logo-mark.png');
$w = imagesx($i);
$h = imagesy($i);

$minX = $w;
$minY = $h;
$maxX = 0;
$maxY = 0;
$opaque = 0;

for ($y = 0; $y < $h; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $c = imagecolorat($i, $x, $y);
        $a = ($c >> 24) & 0x7F;
        if ($a < 100) {
            $opaque++;
            if ($x < $minX) $minX = $x;
            if ($y < $minY) $minY = $y;
            if ($x > $maxX) $maxX = $x;
            if ($y > $maxY) $maxY = $y;
        }
    }
}

echo "opaque=$opaque\n";
if ($opaque > 0) {
    echo "bounds: {$minX},{$minY} -> {$maxX},{$maxY}\n";
    $cx = (int) (($minX + $maxX) / 2);
    $cy = (int) (($minY + $maxY) / 2);
    $c = imagecolorat($i, $cx, $cy);
    $a = ($c >> 24) & 0x7F;
    $r = ($c >> 16) & 0xFF;
    $g = ($c >> 8) & 0xFF;
    $b = $c & 0xFF;
    echo "mid content ($cx,$cy) a=$a rgb=$r,$g,$b\n";
}
