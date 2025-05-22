import { defineConfig } from "azion";
import { typescript } from "azion/presets";
import {configureDatabase} from "./migrations/setup"

export default defineConfig({
  build: {
    entry: "main.ts",
    preset: {
      ...typescript,
      prebuild: async (config, ctx) => {
        try{
        await configureDatabase("memeddatabase")
        console.log("Database fully configured!")
      } catch (error) {
        console.error("Error generating templates:", error);
        throw error;
      }
      }
    }
  },
});
