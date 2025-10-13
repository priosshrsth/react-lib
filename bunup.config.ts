import { type DefineWorkspaceItem, defineWorkspace } from "bunup";

const config: DefineWorkspaceItem[] = defineWorkspace(
  [
    {
      name: "@rnt-lib/core/",
      root: "packages/core",
      config: {
        entry: ["**/*.ts", "**/*.tsx", "!dist"],
      },
    },
  ],
  {
    format: ["esm"],
    exports: {
			all: false,
		},
    unused: true,
    drop: ["console", "debugger"],
    target: "bun",
    noExternal: ["lodash", "react", "next", "tailwindcss", "typescript", "zod"],
  }
);

export default config;
