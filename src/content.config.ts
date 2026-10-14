import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    updated: z.coerce.date(),
    type: z.string(),
  }),
});

const links = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/collections" }),
  schema: z.object({
    url: z.url(),
    note: z.string().optional(),
  }),
});

export const collections = { articles, collections: links };
