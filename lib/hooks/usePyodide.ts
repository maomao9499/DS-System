"use client";

import { useState, useEffect, useRef } from "react";

// 声明全局 pyodide 变量类型
declare global {
  interface Window {
    loadPyodide: any;
  }
}

export function usePyodide() {
  const [isLoading, setIsLoading] = useState(true);
  const [output, setOutput] = useState<string>("");
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    // 动态注入 Pyodide Wasm 引擎
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
    script.async = true;
    script.onload = async () => {
      try {
        pyodideRef.current = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
        });
        // 预加载一些数据科学常用库（可选）
        // await pyodideRef.current.loadPackage(["pandas", "numpy"]);
        setIsLoading(false);
      } catch (err) {
        console.error("Pyodide 加载失败", err);
        setOutput("初始化 Wasm Python 引擎失败，请检查网络。");
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 执行 Python 代码的方法
  const runPython = async (code: string) => {
    if (!pyodideRef.current) return;

    setOutput("运行中...");

    // 捕获 Python 的 print 输出
    pyodideRef.current.setStdout({
      batched: (str: string) =>
        setOutput((prev) =>
          prev === "运行中..." ? str + "\n" : prev + str + "\n",
        ),
    });
    pyodideRef.current.setStderr({
      batched: (str: string) =>
        setOutput((prev) =>
          prev === "运行中..."
            ? "错误: " + str + "\n"
            : prev + "错误: " + str + "\n",
        ),
    });

    try {
      await pyodideRef.current.runPythonAsync(code);
    } catch (err: any) {
      // 捕获代码语法错误或运行异常
      setOutput((prev) => prev + "\n" + err.toString());
    }
  };

  return { isLoading, output, runPython, setOutput };
}
