<?php

$src = __DIR__ . '/../public/logo-mark.png';
$img = @imagecreatefrompng($src);
if (!$img) {
    fwrite(STDERR, "Falha ao carregar logo-mark.png — rode optimize-logo.php antes.\n");
    exit(1);
}

imagesavealpha($img, true);
$w = imagesx($img);
$h = imagesy($img);
echo "logo: {$w}x{$h}\n";

function make_square_png($img, int $size, string $out, bool $withWhiteBg = true): void
{
    $w = imagesx($img);
    $h = imagesy($img);

    $outImg = imagecreatetruecolor($size, $size);
    if ($withWhiteBg) {
        $white = imagecolorallocate($outImg, 255, 255, 255);
        imagefilledrectangle($outImg, 0, 0, $size, $size, $white);
        imagealphablending($outImg, true);
        imagecopyresampled($outImg, $img, 0, 0, 0, 0, $size, $size, $w, $h);
    } else {
        imagealphablending($outImg, false);
        imagesavealpha($outImg, true);
        $transparent = imagecolorallocatealpha($outImg, 0, 0, 0, 127);
        imagefilledrectangle($outImg, 0, 0, $size, $size, $transparent);
        imagealphablending($outImg, true);
        imagecopyresampled($outImg, $img, 0, 0, 0, 0, $size, $size, $w, $h);
        imagealphablending($outImg, false);
        imagesavealpha($outImg, true);
    }

    imagepng($outImg, $out, 6);
    imagedestroy($outImg);
    echo basename($out) . ' ' . filesize($out) . " bytes\n";
}

$base = __DIR__ . '/../public/icons';
make_square_png($img, 32, "{$base}/favicon-32.png", true);
make_square_png($img, 192, "{$base}/icon-192.png", true);
make_square_png($img, 512, "{$base}/icon-512.png", true);
make_square_png($img, 180, "{$base}/apple-touch-icon.png", true);

imagedestroy($img);
echo "ok\n";
