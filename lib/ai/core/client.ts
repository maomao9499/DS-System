import { aiProviders, SupportedProviders } from "./providers";

/**
 * 获取当前激活的 AI 模型实例 (适配器模式核心)
 * 业务层无需知道具体是哪个厂商，只需调用此函数获取模型对象
 */
export function getActiveModel() {
  const providerName = (process.env.ACTIVE_AI_PROVIDER ||
    "openai") as SupportedProviders;

  const model = aiProviders[providerName];

  if (!model) {
    throw new Error(`AI Provider "${providerName}" 未在 providers.ts 中配置.`);
  }

  return model;
}
