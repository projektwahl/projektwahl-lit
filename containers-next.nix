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
# sudo env "NIX_PATH=nixpkgs=/etc/nixos/nixpkgs" nixos-nspawn create projektwahl ./containers-next.nix
# sudo nixos-nspawn remove projektwahl
{
  nixpkgs = /etc/nixos/nixpkgs;
  system-config = { config, pkgs, ... }: {
    boot.isContainer = true;

    networking.hostName = "projektwahl-lit";

    services.postgresql = {
      enable = true;
      package = pkgs.postgresql_14;
      enableTCPIP = true;
      authentication = "hostnossl all all 10.233.3.1 255.255.0.0 scram-sha-256";
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
          SELECT 'CREATE ROLE "projektwahl" LOGIN PASSWORD ''\'''\'projektwahl''\'''\''
          WHERE
          NOT
          EXISTS
          (SELECT FROM pg_roles WHERE rolname = '
          projektwahl')\gexec
        SELECT 'CREATE DATABASE "projektwahl" OWNER "projektwahl" TEMPLATE template0 ENCODING UTF8' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'projektwahl')\gexec
        \c 'projektwahl'
        ''; in "${config.services.postgresql.package}/bin/psql -f ${psqlSetupCommands}";
                    };
                  };

                  networking.firewall.allowedTCPPorts = [ 5432 ];

                  system.stateVersion = "21.11";
            };
    
}

