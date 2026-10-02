# Webcam Test

Single-page app for checking a camera and microphone. Picks a video input,
shows a live preview, and records 10-second clips you can play back and
download as `.webm`. Everything stays in the browser — nothing is uploaded.

`getUserMedia` only works in a secure context, so serve it over HTTPS (or
`localhost`).

## Develop

```sh
nix develop   # bun + bun2nix, runs bun install
bun run dev
```

After changing dependencies, regenerate the lockfile-derived nix expression:

```sh
bun2nix -o bun.nix
```

## Build

```sh
nix build     # ./result is a folder of static assets
```

## Deploy

Import this flake and point a web server at the package, e.g. Caddy on NixOS:

```nix
services.caddy.virtualHosts."webcam.jamesst.one".extraConfig = ''
  root * ${inputs.webcam.packages.${pkgs.system}.default}
  file_server
'';
```
