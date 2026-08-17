"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { apiVersion, assertSanityEnv, dataset, projectId } from "./src/sanity/env";

assertSanityEnv();

export default defineConfig({
  name: "default",
  title: "IPTV Pro Blog",
  projectId: projectId!,
  dataset: dataset!,
  apiVersion,
  basePath: "/studio",
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});