import { invoke } from "@tauri-apps/api/core";

export type BootstrapPayload = {
  productName: string;
  greeting: string;
  processModel: string;
  coreBoundary: string;
  architectureRules: string[];
  nextLessons: string[];
};

export async function loadBootstrap(name: string): Promise<BootstrapPayload> {
  return invoke<BootstrapPayload>("greet", { name });
}
