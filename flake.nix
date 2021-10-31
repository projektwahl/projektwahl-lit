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

            nixosConfigurations = nixpkgs.lib.nixosSystem {
              inherit system;
              modules = [
                ({ config, ... }: {
                  boot.isContainer = true;

                  networking.hostName = "projektwahl-lit";

                  services.postgresql = {
                    enable = true;
                    package = pkgs.postgresql_14;
                    enableTCPIP = true;
                    authentication = "hostnossl all all 10.233.2.1 255.255.255.255 scram-sha-256";
                  };

                  systemd.services.projektwahl-init = {
                    after = [ "postgresql.service" ];
                    wants = [ "postgresql.service" ];
                    wantedBy = [ "multi-user.target" ];

                    serviceConfig = {
                      Type = "oneshot";
                      User = "postgres";
                      Group = "postgres";
                      ExecStart = let psqlSetupCommands = pkgs.writeText "projektwahl-init.sql" ''
                      SELECT 'CREATE ROLE "projektwahl" LOGIN PASSWORD ''\'''\'projektwahl''\'''\'' WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'projektwahl')\gexec
                      SELECT 'CREATE DATABASE "projektwahl" OWNER "not-grocy" TEMPLATE template0 ENCODING UTF8' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'projektwahl')\gexec
                      \c 'projektwahl'
                      ''; in "${config.services.postgresql.package}/bin/psql -f ${psqlSetupCommands}";
                    };
                  };

                  networking.firewall.allowedTCPPorts = [ 5432 ];

                  system.stateVersion = "21.11";
            })
            ];
            };
          };
        }
      );
}
