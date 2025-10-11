import { type DefineWorkspaceItem, defineWorkspace } from "bunup";

const config: DefineWorkspaceItem[] = defineWorkspace(
  [
    {
      name: "@react-lib/ui",
      root: "packages/components",
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
    noExternal: ["lodash", "react", "next", "tailwindcss", "typescript", "zod"],
  }
);

export default config;
