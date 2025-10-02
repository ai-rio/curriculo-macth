import { remark } from 'remark';
import remarkHtml from 'remark-html';

export async function processMarkdownContent(content: string): Promise<string> {
  try {
    const processedContent = await remark().use(remarkHtml).process(content);

    return processedContent.toString();
  } catch (error) {
    console.error('Error processing markdown:', error);
    // Fallback to basic HTML formatting
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^(.*?)$/gm, '<p>$1</p>');
  }
}

export function processMarkdownContentSync(content: string): string {
  try {
    // Enhanced synchronous markdown processing
    let processed = content;

    // Remove empty lines at the beginning and end
    processed = processed.trim();

    // Process headers first
    processed = processed
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Process code blocks (triple backticks)
    processed = processed
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Process inline code
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Process bold and italic
    processed = processed
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Process links
    processed = processed.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Process lists (both unordered and ordered)
    processed = processed
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>');

    // Wrap list items in appropriate list containers
    const lines = processed.split('\n');
    let inOrderedList = false;
    let inUnorderedList = false;
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('<li>')) {
        // Check if it's an ordered list item by looking at the original content
        if (/^\d+\./.test(line.replace(/<[^>]*>/g, '').trim())) {
          if (!inOrderedList) {
            if (inUnorderedList) {
              result.push('</ul>');
              inUnorderedList = false;
            }
            result.push('<ol>');
            inOrderedList = true;
          }
        } else {
          if (!inUnorderedList) {
            if (inOrderedList) {
              result.push('</ol>');
              inOrderedList = false;
            }
            result.push('<ul>');
            inUnorderedList = true;
          }
        }
        result.push(line);
      } else {
        if (inOrderedList) {
          result.push('</ol>');
          inOrderedList = false;
        }
        if (inUnorderedList) {
          result.push('</ul>');
          inUnorderedList = false;
        }
        if (line) {
          result.push(line);
        }
      }
    }

    // Close any open lists
    if (inOrderedList) result.push('</ol>');
    if (inUnorderedList) result.push('</ul>');

    processed = result.join('\n');

    // Process blockquotes
    processed = processed.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

    // Process horizontal rules
    processed = processed.replace(/^---$/gm, '<hr>');

    // Process line breaks and paragraphs
    processed = processed
      .replace(/\n\n/g, '</p><p>')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');

    // Wrap in paragraphs, but avoid wrapping existing HTML elements
    processed = processed
      .split('\n')
      .map((line) => {
        // Skip if line starts with HTML block element
        if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|div)/.test(line)) {
          return line;
        }
        // Skip if line is just a closing tag
        if (/^<\/(h[1-6]|ul|ol|li|blockquote|pre|hr|div)>/.test(line)) {
          return line;
        }
        // Skip if line already has paragraph tags
        if (line.startsWith('<p>') && line.endsWith('</p>')) {
          return line;
        }
        // Wrap in paragraph
        return `<p>${line}</p>`;
      })
      .join('\n');

    // Clean up empty paragraphs
    processed = processed.replace(/<p><\/p>/g, '');
    processed = processed.replace(/<p>(<h[1-6]>)/g, '$1');
    processed = processed.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    processed = processed.replace(/<p>(<ul>)/g, '$1');
    processed = processed.replace(/(<\/ul>)<\/p>/g, '$1');
    processed = processed.replace(/<p>(<ol>)/g, '$1');
    processed = processed.replace(/(<\/ol>)<\/p>/g, '$1');
    processed = processed.replace(/<p>(<li>)/g, '$1');
    processed = processed.replace(/(<\/li>)<\/p>/g, '$1');
    processed = processed.replace(/<p>(<blockquote>)/g, '$1');
    processed = processed.replace(/(<\/blockquote>)<\/p>/g, '$1');
    processed = processed.replace(/<p>(<pre>)/g, '$1');
    processed = processed.replace(/(<\/pre>)<\/p>/g, '$1');
    processed = processed.replace(/<p>(<hr)/g, '$1');
    processed = processed.replace(/(<\/hr>)<\/p>/g, '$1');

    return processed;
  } catch (error) {
    console.error('Error processing markdown synchronously:', error);
    return content.replace(/\n/g, '<br>');
  }
}
