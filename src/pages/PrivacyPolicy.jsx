import ReactMarkdown from "react-markdown";
import privacyPolicyMd from "../data/privacy-policy.md?raw";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="mb-2 text-2xl font-bold text-slate-900">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-10 mb-4 border-b border-slate-200 pb-2 text-xl font-bold text-slate-800">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-6 mb-2 text-base font-bold text-slate-800">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-3 text-sm leading-relaxed text-slate-700">
                  {children}
                </p>
              ),
              ol: ({ children }) => (
                <ol className="mb-3 list-decimal pl-5 text-sm text-slate-700">
                  {children}
                </ol>
              ),
              ul: ({ children }) => (
                <ul className="mb-3 list-disc pl-5 text-sm text-slate-700">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="mb-1 leading-relaxed">{children}</li>
              ),
              hr: () => <hr className="my-8 border-slate-200" />,
            }}
          >
            {privacyPolicyMd}
          </ReactMarkdown>
        </div>
        <p className="mt-12 text-center text-xs text-slate-400">
          ㈜서큘러스 · circulus@circul.us
        </p>
      </div>
    </div>
  );
}
