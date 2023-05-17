export type WorkflowActionRegistry = {
  version: string;
  actions: WorkflowActionRegistryEntry[];
};

export type WorkflowActionRegistryEntry = {
  name: string;
  uri: string;
  default_entry?: string;
  engine?: string;
};
