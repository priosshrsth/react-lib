import { type DefineWorkspaceItem, defineWorkspace } from "bunup";

const config: DefineWorkspaceItem[] = defineWorkspace(
  [
    {
      name: "@react-lib/core",
      root: "packages/core",
      config: {
        entry: ["**/*.ts", "**/*.tsx"],
      },
    },
  ],
  {
    format: ["esm"],
    exports: true,
    unused: true,
    drop: ["console", "debugger"],
    target: "bun",
    noExternal: ["lodash", "react", "next", "tailwindcss", "typescript", "zod"],
  }
);

export default config;
