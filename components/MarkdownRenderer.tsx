import React from 'react';

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    // Process inline formatting like bold, italic, and inline code blocks
    const processInlines = (line: string) => {
        // Escape HTML special characters first to show tags as code text
        let html = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Bold (**text**)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
        
        // Italic (*text*)
        html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800 dark:text-slate-200">$1</em>');
        
        // Inline Code (`code`)
        html = html.replace(
            /\`(.*?)\`/g, 
            '<code class="px-1.5 py-0.5 font-mono text-[11px] bg-slate-200/80 dark:bg-slate-800/80 rounded border border-slate-300/30 dark:border-slate-700/30 text-pink-600 dark:text-pink-400 font-semibold">$1</code>'
        );

        return <span dangerouslySetInnerHTML={{ __html: html }} />;
    };

    const elements: React.ReactElement[] = [];
    const lines = text.split('\n');
    let listItems: React.ReactElement[] = [];
    let listType: 'ol' | 'ul' | null = null;

    // Helper to render lists
    const flushList = () => {
        if (listItems.length > 0) {
            const ListComponent = listType === 'ol' ? 'ol' : 'ul';
            const listClasses = `list-inside space-y-1.5 pl-5 mb-2 ${listType === 'ol' ? 'list-decimal' : 'list-disc text-sky-500 dark:text-sky-400'}`;
            elements.push(
                <ListComponent key={`list-${elements.length}`} className={listClasses}>
                    {listItems}
                </ListComponent>
            );
            listItems = [];
            listType = null;
        }
    };

    lines.forEach((line, index) => {
        // Match horizontal dividers (e.g. ---, ***)
        if (/^\s*[-*_]{3,}\s*$/.test(line)) {
            flushList();
            elements.push(
                <hr key={`hr-${index}`} className="my-4 border-slate-200/50 dark:border-slate-800/40" />
            );
            return;
        }

        // Match headings (e.g. # Heading 1, ## Heading 2, etc.)
        const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
        if (headingMatch) {
            flushList();
            const level = headingMatch[1].length;
            const headingText = headingMatch[2];
            
            const HeadingTag = `h${Math.min(level, 6)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
            
            const headingClasses = 
                level === 1 ? "text-xl font-black text-slate-900 dark:text-white mt-5 mb-2.5 uppercase tracking-wide" :
                level === 2 ? "text-lg font-black text-slate-900 dark:text-white mt-4.5 mb-2 uppercase tracking-wide" :
                level === 3 ? "text-base font-bold text-slate-900 dark:text-white mt-3.5 mb-1.5" :
                "text-sm font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1.5";

            elements.push(
                <HeadingTag key={`h-${index}`} className={headingClasses}>
                    {processInlines(headingText)}
                </HeadingTag>
            );
            return;
        }

        // Match list items
        const olMatch = line.match(/^\s*\d+\.\s+(.*)/);
        const ulMatch = line.match(/^\s*[*-]\s+(.*)/);

        if (olMatch) {
            if (listType !== 'ol') flushList();
            listType = 'ol';
            listItems.push(
                <li key={`li-${index}`} className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {processInlines(olMatch[1])}
                </li>
            );
        } else if (ulMatch) {
            if (listType !== 'ul') flushList();
            listType = 'ul';
            listItems.push(
                <li key={`li-${index}`} className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                    <span className="text-slate-700 dark:text-slate-300">{processInlines(ulMatch[1])}</span>
                </li>
            );
        } else {
            flushList();
            if (line.trim()) {
                elements.push(
                    <p key={`p-${index}`} className="text-xs sm:text-sm leading-relaxed text-slate-750 dark:text-slate-300 mb-2">
                        {processInlines(line)}
                    </p>
                );
            }
        }
    });

    flushList();

    return (
        <div className="text-sm leading-relaxed space-y-2 text-slate-700 dark:text-slate-300">
            {elements}
        </div>
    );
};

export default MarkdownRenderer;
