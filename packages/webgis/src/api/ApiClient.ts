import type { LoadedFeatureData, WebGISLayerDefinition } from "../types";

export interface ApiClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  headers?: HeadersInit;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly headers: HeadersInit;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.headers = options.headers ?? {};
  }

  private resolve(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    if (!this.baseUrl) return path;
    return this.baseUrl + "/" + path.replace(/^\//, "");
  }

  async postForm<T = unknown>(
    path: string,
    payload: Record<string, string | number>
  ): Promise<T> {
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(payload)) body.set(key, String(value));

    const response = await this.fetchImpl(this.resolve(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        ...this.headers
      },
      body
    });

    if (!response.ok) throw new Error("HTTP " + response.status + " for " + path);
    return response.json() as Promise<T>;
  }

  async loadFeature(
    definition: WebGISLayerDefinition,
    featureId: string | number
  ): Promise<LoadedFeatureData> {
    const endpoints = definition.endpoints ?? {};
    const requestParam = definition.requestParam ?? "gid";
    const payload = { [requestParam]: featureId };
    const result: LoadedFeatureData = { errors: {} };

    const jobs = Object.entries(endpoints)
      .filter((entry): entry is [keyof typeof endpoints, string] => Boolean(entry[1]))
      .map(async ([name, path]) => [name, await this.postForm(path, payload)] as const);

    for (const settled of await Promise.allSettled(jobs)) {
      if (settled.status === "fulfilled") {
        const [name, value] = settled.value;
        result[name] = value;
      } else {
        result.errors.unknown =
          settled.reason instanceof Error ? settled.reason.message : String(settled.reason);
      }
    }
    return result;
  }
}
