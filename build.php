<?php

$tmp    = "/tmp/sheep.min.js";
$build  = "build/sheep.min.js";

file_put_contents($tmp, file_get_contents("src/Sheep.js"));
file_put_contents($tmp, "\n".file_get_contents("src/Action.js"), FILE_APPEND);
file_put_contents($tmp, "\n".file_get_contents("src/Actions.js"), FILE_APPEND);
file_put_contents($tmp, "\n".file_get_contents("src/Position.js"), FILE_APPEND);
file_put_contents($tmp, "\n".file_get_contents("src/Easing.js"), FILE_APPEND);

passthru("ccjs $tmp --language_in=ECMASCRIPT5_STRICT > $build");
file_put_contents($build, '(function(){' . file_get_contents($build) . '}());');
unlink($tmp);