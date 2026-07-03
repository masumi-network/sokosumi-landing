'use client';

import { useState } from 'react';
import { Bot, Braces, Check, Copy, Download, ExternalLink, Eye, FileText } from 'lucide-react';
import { portalUrl, withBasePath } from '@/lib/base-path';

interface PageActionsProps {
  content: string;
  title: string;
  url: string;
  pathname: string;
  loading?: boolean;
  error?: string | null;
}

export function PageActions({ content, title, url, pathname, loading = false, error }: PageActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const markdownPath = `${pathname.replace(/\/$/, '') || '/documentation'}.md`;
  const markdownUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${withBasePath(markdownPath)}` : `${portalUrl}${markdownPath}`;

  const handleDownloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewMarkdown = () => {
    window.open(withBasePath(markdownPath), '_blank');
  };

  const handleAskNori = () => {
    const params = new URLSearchParams({
      q: `Help me understand this Masumi docs page: ${title}`,
      pagePath: pathname,
      pageTitle: title,
      markdownUrl,
    });

    window.location.href = withBasePath(`/ask?${params.toString()}`);
  };

  const getAgentContext = () => {
    return [
      `Masumi docs page: ${title}`,
      `HTML URL: ${url}`,
      `Markdown URL: ${markdownUrl}`,
      `Concise docs index: ${portalUrl}/llms.txt`,
      `Full docs corpus: ${portalUrl}/llms-full.txt`,
      '',
      'Use the Markdown URL as the canonical source and cite it when answering.',
      '',
      content,
    ].join('\n');
  };

  return (
    <div className="relative inline-flex">
      <div className="flex items-center border border-fd-border rounded-md overflow-hidden">
        {/* Main copy button */}
        <button
          onClick={() => !loading && !error && handleCopy(content, 'markdown')}
          disabled={loading || !!error}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
            loading || error 
              ? 'text-fd-muted-foreground/50 cursor-not-allowed' 
              : 'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/10'
          }`}
          aria-label="Copy page content"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : copiedStates.markdown ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span>{loading ? 'Loading...' : 'Copy Markdown'}</span>
        </button>
        
        {/* Divider */}
        <div className="w-px h-6 bg-fd-border" />
        
        {/* Dropdown trigger */}
        <button
          onClick={() => !loading && !error && setIsOpen(!isOpen)}
          disabled={loading || !!error}
          className={`flex items-center px-2 py-1.5 transition-colors ${
            loading || error 
              ? 'text-fd-muted-foreground/50 cursor-not-allowed' 
              : 'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/10'
          }`}
          aria-label="More actions"
          aria-expanded={isOpen}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {isOpen && !loading && !error && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-56 bg-fd-card border border-fd-border rounded-lg shadow-lg z-50 p-1">
            <button
              onClick={() => {
                handleAskNori();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-fd-foreground hover:bg-fd-accent/10 rounded-md transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Nori about this page</span>
            </button>

            <button
              onClick={() => {
                handleViewMarkdown();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-fd-foreground hover:bg-fd-accent/10 rounded-md transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Markdown</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
            </button>

            <button
              onClick={() => {
                handleCopy(content, 'markdown-menu');
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-fd-foreground hover:bg-fd-accent/10 rounded-md transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Copy page Markdown</span>
              {copiedStates['markdown-menu'] && <Check className="w-3 h-3 ml-auto text-green-500" />}
            </button>

            <button
              onClick={() => {
                handleCopy(getAgentContext(), 'agent-context');
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-fd-foreground hover:bg-fd-accent/10 rounded-md transition-colors"
            >
              <Braces className="w-4 h-4" />
              <span>Copy agent context</span>
              {copiedStates['agent-context'] ? (
                <Check className="w-3 h-3 ml-auto text-green-500" />
              ) : null}
            </button>

            <button
              onClick={() => {
                handleDownloadMarkdown();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-fd-foreground hover:bg-fd-accent/10 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Markdown</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
