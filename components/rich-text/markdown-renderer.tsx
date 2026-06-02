import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"

interface MarkdownRendererProps {
  content: string
  className?: string
}

const components: Components = {
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith("http")
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-[#1a1a1a] underline underline-offset-2 decoration-[#d1d1d1] hover:decoration-[#1a1a1a] transition-all"
        {...props}
      >
        {children}
      </a>
    )
  },
  img: ({ src, alt, ...props }) => (
    <img
      src={src}
      alt={alt || ""}
      className="rounded-[16px] w-full my-4"
      loading="lazy"
      {...props}
    />
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-2 border-[#d1d1d1] pl-4 my-4 text-sm text-[#737373] italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }) => (
    <code
      className="bg-[#f0f0f0] text-[#525252] px-1.5 py-0.5 rounded-[6px] text-xs font-mono"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="bg-[#f8f8f8] rounded-[16px] p-4 overflow-x-auto my-4 border border-[#f0f0f0]"
      {...props}
    >
      {children}
    </pre>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-5 my-3 space-y-1 text-sm text-[#525252]" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-5 my-3 space-y-1 text-sm text-[#525252]" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-sm leading-relaxed" {...props}>
      {children}
    </li>
  ),
  h1: ({ children, ...props }) => (
    <h1 className="font-serif text-2xl font-bold text-[#1a1a1a] my-4 leading-snug" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="font-serif text-xl font-bold text-[#1a1a1a] my-3 leading-snug" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="font-sans text-base font-semibold text-[#1a1a1a] my-2" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="text-sm text-[#525252] leading-[1.65] mb-4 last:mb-0" {...props}>
      {children}
    </p>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-[#1a1a1a]" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-[#404040]" {...props}>
      {children}
    </em>
  ),
  hr: (props) => (
    <hr className="border-[#f0f0f0] my-6" {...props} />
  ),
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
