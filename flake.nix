{
  description = "C Table Formatter VS Code extension dev shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_20
            # This provides the 'vsce' command
            vsce 
          ];
          shellHook = ''
            echo "C Table Formatter dev shell ready"
            echo "  node test.js   — test the formatter without VS Code"
            echo "  code .         — open VS Code, then press F5"
            echo "  vsce package   — bundle the extension into a .vsix file"
          '';
        };
      });
}