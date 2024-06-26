/* eslint-disable @typescript-eslint/no-explicit-any */
import { processMarkdown } from "./md.server";
import { LRUCache } from "lru-cache";
import { load as $ } from "cheerio";
import { env } from "@/lib/env.server";

interface MenuDocAttributes {
  title: string;
  order?: number;
  new?: boolean;
  [key: string]: any;
}

export interface MenuDoc {
  attrs: MenuDocAttributes;
  children: MenuDoc[];
  filename: string;
  hasContent: boolean;
  slug: string;
}

export interface Doc extends Omit<MenuDoc, "hasContent"> {
  html: string;
  headings: {
    headingLevel: string;
    html: string | null;
    slug: string | undefined;
  }[];
}

const _global = global as typeof globalThis & {
  menuCache: LRUCache<string, MenuDoc[]>;
  docCache: LRUCache<string, Doc>;
  versionsCache: LRUCache<string, string[]>;
};

const NO_CACHE = env.NO_CACHE;

/**
 * ---------------------
 * Documentation Caching
 * ---------------------
 * While we're using HTTP caching, we have this memory cache too so that
 * document requests and data request to the same document can do less work for
 * new versions. This makes our origin server very fast, but adding HTTP caching
 * let's have simpler and faster deployments with just one origin server, but
 * still distribute the documents across the CDN.
 */

const CACHING_TIME = NO_CACHE ? 1 : 1000 * 60 * 60 * 24; // 1 day
_global.docCache ??= new LRUCache<string, Doc>({
  max: 300,
  ttl: CACHING_TIME,
  allowStale: !NO_CACHE,
  noDeleteOnFetchRejection: true,
  fetchMethod: fetchDoc,
});

_global.menuCache ??= new LRUCache<string, MenuDoc[]>({
  max: 10,
  ttl: CACHING_TIME,
  allowStale: !NO_CACHE,
  noDeleteOnFetchRejection: true,
  fetchMethod: fetchMenu,
});

_global.versionsCache ??= new LRUCache<string, string[]>({
  max: 10,
  ttl: CACHING_TIME,
  allowStale: !NO_CACHE,
  noDeleteOnFetchRejection: true,
  fetchMethod: fetchVersions,
});

export async function fetchVersions(key: string) {
  const [baseUrl] = key.split("_:_");
  const url = new URL(`/documentation/__autogenerated__/versions.json`, baseUrl);
  const response = await fetch(url.href);
  if (!response.ok) throw Error(`Failed to fetch versions: ${response.status}`);
  const versions = (await response.json()) as string[];

  // Sort the versions in descending order
  // Example: ["v1.0.0", "v1.1.12", "v1.15.2"] => ["v1.15.2", "v1.1.12", "v1.0.0"]
  const sortedVersions = versions.sort((a, b) => {
    const [aMajor, aMinor, aPatch] = a.slice(1).split(".").map(Number);
    const [bMajor, bMinor, bPatch] = b.slice(1).split(".").map(Number);
    if (aMajor !== bMajor) return bMajor - aMajor;
    if (aMinor !== bMinor) return bMinor - aMinor;
    return bPatch - aPatch;
  });

  return sortedVersions;
}

export async function getVersions(baseUrl: string): Promise<string[]> {
  const versions = await _global.versionsCache.fetch(`${baseUrl}_:_doc_versions`);
  return versions || [];
}

async function fetchMenu(key: string) {
  const [baseUrl, lang, version] = key.split("_:_");

  const url = new URL(`/documentation/__autogenerated__/${version}/${lang}.json`, baseUrl);
  const response = await fetch(url.href);
  if (!response.ok) throw Error(`Failed to fetch menu: ${response.status}`);

  const menuTree = (await response.json()) as MenuDoc[];

  const sortDocs = (a: MenuDoc, b: MenuDoc) => {
    return (a.attrs.order || Infinity) - (b.attrs.order || Infinity);
  };

  menuTree.sort(sortDocs);

  for (const category of menuTree) {
    category.children.sort(sortDocs);
  }

  return menuTree;
}

export async function getMenu(key: string): Promise<MenuDoc[] | undefined> {
  const menu = await _global.menuCache.fetch(key);
  return menu || undefined;
}

async function fetchDoc(key: string): Promise<Doc> {
  const [baseUrl, lang, version, docPath] = key.split("_:_");
  const filename = `${docPath}.md`;

  const url = new URL(`/documentation/${lang}/${version}/${filename}`, baseUrl);
  const response = await fetch(url.href);
  if (!response.ok) throw Error(`Could not find ${filename}`);

  const markdown = await response.text();
  if (markdown === null) throw Error(`Could not find ${filename}`);

  try {
    const { html, attributes } = await processMarkdown(markdown);
    let attrs: MenuDocAttributes = { title: filename };
    if (isPlainObject(attributes)) attrs = { title: filename, ...attributes };
    const headings = createTableOfContentsFromHeadings(html);
    return { attrs, filename, html, slug: docPath, headings, children: [] };
  } catch (err) {
    console.error(`Error processing doc file ${filename}`, err);
    throw err;
  }
}

/**
 * ---------------------
 * Table of Contents
 * ---------------------
 * This function creates a table of contents from the headings in the document.
 * It uses cheerio to parse the HTML and extract the headings.
 */
function createTableOfContentsFromHeadings(html: string) {
  const $headings = $(html)("h2,h3");

  const headings = $headings.toArray().map((heading) => ({
    headingLevel: heading.name,
    html: $(heading)("a").remove().end().children().html(),
    slug: heading.attributes.find((attr) => attr.name === "id")?.value,
  }));

  return headings;
}

/**
 * ---------------------
 * Document Fetching
 * ---------------------
 * This function fetches a document from the server and processes it with the
 * markdown processor. It then caches the document in memory.
 */
export async function getDoc(params: {
  baseUrl: string;
  lang: string;
  version: string;
  docPath: string;
}): Promise<Doc | undefined> {
  const { baseUrl, lang, version, docPath } = params;
  const key = `${baseUrl}_:_${lang}_:_${version}_:_${docPath}`;
  const doc = await _global.docCache.fetch(key);
  return doc || undefined;
}

function isPlainObject(obj: unknown): obj is Record<keyof any, unknown> {
  return !!obj && Object.prototype.toString.call(obj) === "[object Object]";
}
