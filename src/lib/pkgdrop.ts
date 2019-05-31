export interface PkgdropOptions {
  package_path: string;
  package_root: string;
  config_path: string;

  force: boolean;
  optimize: boolean;
  clean: boolean;
  bundle: boolean;
  dry: boolean;
}