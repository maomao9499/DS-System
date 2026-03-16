export const getCodeAnalysisPrompt = (
  questionContent: string,
  studentCode: string,
  executionOutput: string,
  standardAnswer?: string,
) => `
你是一位资深的数据科学讲师，现在需要你对学生的编程实训代码进行评估。

【题目要求】
${questionContent}

${standardAnswer ? `【参考标准答案】\n${standardAnswer}\n` : ""}

【学生提交的代码】
${studentCode}

【前端沙箱运行输出 / 报错信息】
${executionOutput || "无输出或代码未运行"}

请严格基于以上信息，分析学生的代码逻辑是否正确，是否满足题目要求，并指出潜在的优化点或错误原因。
`;
