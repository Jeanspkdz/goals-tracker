import { describe, expect, it } from "vitest";
import { createFakeAiProviderAdapter } from "./ai-provider";

describe("AI Provider adapter contract", () => {
  it("verifies structured text generation before a provider is treated as connected", async () => {
    const adapter = createFakeAiProviderAdapter({ mode: "success" });

    const result = await adapter.testConnection({
      providerName: "Fake Provider",
      secret: "user-owned-secret"
    });

    expect(result).toEqual({
      connected: true,
      providerName: "Fake Provider",
      capabilities: [
        {
          id: "structured-text-generation",
          label: "Structured text generation",
          supported: true
        },
        {
          id: "conversation-evidence-import",
          label: "Conversation evidence import",
          supported: false,
          explanation: "Fake Provider does not support conversation import."
        }
      ]
    });

    await expect(
      adapter.generateStructuredText({
        instruction: "Return a connection test payload.",
        schemaName: "provider-connection-test"
      })
    ).resolves.toEqual({
      schemaName: "provider-connection-test",
      data: {
        ok: true
      }
    });
  });

  it("reports failed connection tests without exposing the Provider Credential", async () => {
    const adapter = createFakeAiProviderAdapter({ mode: "failure" });

    const result = await adapter.testConnection({
      providerName: "Fake Provider",
      secret: "bad-secret"
    });

    expect(result).toEqual({
      connected: false,
      providerName: "Fake Provider",
      error: "Provider Connection Test failed."
    });
    expect(JSON.stringify(result)).not.toContain("bad-secret");
  });
});
