{ bun2nix, ... }:
bun2nix.mkDerivation {
  packageJson = ./package.json;

  src = ./.;

  bunDeps = bun2nix.fetchBunDeps {
    bunNix = ./bun.nix;
  };

  buildPhase = ''
    runHook preBuild
    bun run build
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    cp -r dist $out
    runHook postInstall
  '';
}
