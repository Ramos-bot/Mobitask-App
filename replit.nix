{ pkgs }: {
  deps = [
    pkgs.nodejs-22_x
    pkgs.nodePackages.npm
    pkgs.nodePackages.expo-cli
    pkgs.nodePackages.typescript-language-server
    pkgs.git
    pkgs.watchman
  ];
  
  env = {
    EXPO_DEVTOOLS_LISTEN_ADDRESS = "0.0.0.0";
    REACT_NATIVE_PACKAGER_HOSTNAME = "0.0.0.0";
    NODE_OPTIONS = "--max-old-space-size=4096";
  };
}
