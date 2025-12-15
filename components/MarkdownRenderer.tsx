import React from 'react';

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    // Process inline formatting like bold and italic
    const processInlines = (line: string) => {
        const html = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
    };

    // FIX: Replaced `JSX.Element` with `React.ReactElement` to resolve namespace error.
    const elements: React.ReactElement[] = [];
    const lines = text.split('\n');
    // FIX: Replaced `JSX.Element` with `React.ReactElement` to resolve namespace error.
    let listItems: React.ReactElement[] = [];
    let listType: 'ol' | 'ul' | null = null;

    // A helper to render a list once we're done collecting its items
    const flushList = () => {
        if (listItems.length > 0) {
            const ListComponent = listType === 'ol' ? 'ol' : 'ul';
            const listClasses = `list-inside space-y-1 pl-4 ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`;
            elements.push(<ListComponent key={elements.length} className={listClasses}>{listItems}</ListComponent>);
            listItems = [];
            listType = null;
        }
    };

    // Iterate through each line to build up paragraphs and lists
    lines.forEach((line, index) => {
        const olMatch = line.match(/^\s*\d+\.\s+(.*)/);
        const ulMatch = line.match(/^\s*[*-]\s+(.*)/);

        if (olMatch) {
            if (listType !== 'ol') flushList(); // If we switched list type, render the old one first
            listType = 'ol';
            listItems.push(<li key={index}>{processInlines(olMatch[1])}</li>);
        } else if (ulMatch) {
            if (listType !== 'ul') flushList();
            listType = 'ul';
            listItems.push(<li key={index}>{processInlines(ulMatch[1])}</li>);
        } else {
            flushList(); // If it's not a list item, the list (if any) has ended
            if (line.trim()) {
                elements.push(<p key={index}>{processInlines(line)}</p>);
            }
        }
    });

    flushList(); // Render any remaining list at the end of the text

    return (
        <div className="text-sm leading-relaxed space-y-2">
            {elements}
        </div>
    );
};

export default MarkdownRenderer;
