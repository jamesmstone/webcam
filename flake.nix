{
  description = "Webcam Test — check a camera and microphone in the browser";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    systems.url = "github:nix-systems/default";

    bun2nix.url = "github:nix-community/bun2nix?tag=2.1.2";
    bun2nix.inputs.nixpkgs.follows = "nixpkgs";
    bun2nix.inputs.systems.follows = "systems";
  };

  nixConfig = {
    extra-substituters = [
      "https://cache.nixos.org"
      "https://nix-community.cachix.org"
    ];
    extra-trusted-public-keys = [
      "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
    ];
  };

  outputs =
    inputs:
    let
      eachSystem = inputs.nixpkgs.lib.genAttrs (import inputs.systems);

      pkgsFor = eachSystem (
        system:
        import inputs.nixpkgs {
          inherit system;
          overlays = [ inputs.bun2nix.overlays.default ];
        }
      );
    in
    {
      # `packages.<system>.default` is the built static site: a plain folder
      # of assets, ready to be used as a web server root, e.g.
      #   services.caddy.virtualHosts."webcam.jamesst.one".extraConfig = ''
      #     root * ${inputs.webcam.packages.${system}.default}
      #     file_server
      #   '';
      packages = eachSystem (system: {
        default = pkgsFor.${system}.callPackage ./default.nix { };
      });

      checks = eachSystem (system: {
        build = inputs.self.packages.${system}.default;
      });

      devShells = eachSystem (system: {
        default = pkgsFor.${system}.mkShell {
          packages = with pkgsFor.${system}; [
            bun
            bun2nix
          ];

          shellHook = ''
            bun install --frozen-lockfile
          '';
        };
      });
    };
}
