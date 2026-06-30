export type ProviderCapabilityId =
  | "structured-text-generation"
  | "conversation-evidence-import";

export type ProviderCapability = {
  id: ProviderCapabilityId;
  label: string;
  supported: boolean;
  explanation?: string;
};

export type ProviderCredential = {
  providerName: string;
  secret: string;
};

export type ProviderConnectionResult =
  | {
      connected: true;
      providerName: string;
      capabilities: ProviderCapability[];
    }
  | {
      connected: false;
      providerName: string;
      error: string;
    };

export type StructuredGenerationInput = {
  instruction: string;
  schemaName: string;
};

export type StructuredGenerationResult = {
  schemaName: string;
  data: Record<string, unknown>;
};

export type AiProviderAdapter = {
  testConnection(
    credential: ProviderCredential
  ): Promise<ProviderConnectionResult>;
  generateStructuredText(
    input: StructuredGenerationInput
  ): Promise<StructuredGenerationResult>;
};

type FakeAdapterOptions = {
  mode: "success" | "failure";
};

export function createFakeAiProviderAdapter({
  mode
}: FakeAdapterOptions): AiProviderAdapter {
  return {
    async testConnection(credential) {
      if (mode === "failure") {
        return {
          connected: false,
          providerName: credential.providerName,
          error: "Provider Connection Test failed."
        };
      }

      return {
        connected: true,
        providerName: credential.providerName,
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
      };
    },
    async generateStructuredText(input) {
      if (input.schemaName === "goal-suggestions") {
        return {
          schemaName: input.schemaName,
          data: {
            suggestions: [
              {
                id: "fake-goal-suggestion-1",
                goalText: "Ship a Nuxt goals tracker onboarding flow",
                progressFormat: "Milestones completed",
                schedulePattern: "3 focus blocks per week",
                deadlineSuggestion: "2026-07-31",
                taskBreakdown: [
                  {
                    title: "Build provider setup UI",
                    priority: "High",
                    effort: "Focus",
                    deadline: "2026-07-10"
                  },
                  {
                    title: "Write Goal Prompt acceptance tests",
                    priority: "Medium",
                    effort: "Focus",
                    deadline: "2026-07-17"
                  },
                  {
                    title: "Polish accepted Goal package display",
                    priority: "Medium",
                    effort: "Light",
                    deadline: "2026-07-24"
                  }
                ]
              }
            ]
          }
        };
      }

      return {
        schemaName: input.schemaName,
        data: {
          ok: true
        }
      };
    }
  };
}

export function createRealAiProviderAdapter(): AiProviderAdapter {
  return {
    async testConnection() {
      throw new Error(
        "TODO: user implements the real Provider Connection Test with their AI SDK or agents API."
      );
    },
    async generateStructuredText() {
      throw new Error(
        "TODO: user implements real structured text generation with their AI SDK or agents API."
      );
    }
  };
}
