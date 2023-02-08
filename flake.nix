/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
{
  description = "projektwahl-lit's development flake";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let pkgs = import nixpkgs {
          inherit system;
          config.permittedInsecurePackages = [
#            "openssl-1.0.2u"
#            "openssl-1.0.2e"
#            "openssl-1.1.1h"
          ];
        };
        in
        {
          devShell = pkgs.mkShell {
            nativeBuildInputs = [
              pkgs.bashInteractive
              (pkgs.nodejs-16_x.override { enableNpm = true; })
              #(pkgs.yarn.override { nodejs = pkgs.nodejs-17_x; })
              pkgs.postgresql_15
              pkgs.reuse
              pkgs.nixpkgs-fmt
              #pkgs.nodePackages.npm-check-updates
              pkgs.cbc
              pkgs.glpk
              pkgs.lp_solve
              #pkgs.diffoscope
              pkgs.python3 # argon2
              pkgs.brotli
              pkgs.openssl

              pkgs.poedit

              pkgs.geckodriver
              pkgs.chromedriver

              pkgs.zap
              #pkgs.wapiti
              #pkgs.burpsuite
            ];
          };
        }
      );
}


