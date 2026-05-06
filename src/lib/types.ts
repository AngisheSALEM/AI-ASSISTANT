export interface AgentTemplateUIData {
  focus?: string;
  features?: string[];
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
  category: string;
  pricePerMonth: number;
  icon: string | null;
  uiData?: AgentTemplateUIData | null;
  createdAt: Date;
  updatedAt: Date;
}
