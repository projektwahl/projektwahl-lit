{
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils, fenix }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          devShells.default = pkgs.mkShell {
            packages = [
              pkgs.nodejs_latest
              (pkgs.yarn.override { nodejs = pkgs.nodejs_latest; })
            ];
            shellHook = ''
              export ROME_BINARY="${pkgs.biome}/bin/biome"
            '';
          };
        }
      );
}
