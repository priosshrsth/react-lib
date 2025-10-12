import { type DefineWorkspaceItem, defineWorkspace } from "bunup";

const config: DefineWorkspaceItem[] = defineWorkspace(
  [
    {
      name: "@react-lib/core",
      root: "packages/core",
      config: {
        entry: ["*/index.ts"],
      },
    },
    {
      name: "@react-lib/search-query-provider",
      root: "packages/search-query-provider",
      config: {
        entry: ["*/index.ts"],
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
