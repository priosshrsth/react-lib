import { serve } from "bun";
import index from "./index.html";

serve({
  routes: {
    "/*": index,
  },
});

// biome-ignore lint/suspicious/noConsole: <allow>
console.log("🚀 Server running at http://localhost:3000");
