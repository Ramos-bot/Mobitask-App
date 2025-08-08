{ pkgs }: {
  deps = [
    pkgs.nodejs-22_x
    pkgs.nodePackages.npm
    pkgs.nodePackages.expo-cli
    pkgs.git
    pkgs.yarn
  ];
}
