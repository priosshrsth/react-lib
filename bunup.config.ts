import { type DefineWorkspaceItem, defineWorkspace } from "bunup";

const config: DefineWorkspaceItem[] = defineWorkspace(
  [
    {
      name: "rnt-lib",
      root: "packages/core",
      config: {
        entry: ["src/**/*.ts", "src/**/*.tsx"],
      },
    },
  ],
  {
    format: ["esm"],
    exports: false,
    unused: true,
    drop: ["console", "debugger"],
    noExternal: ["lodash", "react", "next", "tailwindcss", "typescript", "zod"],
  }
);

export default config;
