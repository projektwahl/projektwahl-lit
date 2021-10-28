# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
# SPDX-License-Identifier: AGPL-3.0-or-later
{
  description = "projektwahl-lit's development flake";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let pkgs = nixpkgs.legacyPackages.${system}; in
        {
          devShell = pkgs.mkShell {
            nativeBuildInputs = [
              pkgs.bashInteractive
              pkgs.nodejs-16_x
              (pkgs.yarn.override { nodejs = pkgs.nodejs-16_x; })
              pkgs.postgresql_14
              pkgs.reuse
              pkgs.nixpkgs-fmt
              pkgs.nodePackages.npm-check-updates
              pkgs.cbc
              pkgs.glpk
              pkgs.lp_solve
              pkgs.diffoscope
            ];
          };
        }
      );
}
