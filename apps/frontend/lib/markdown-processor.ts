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
    // Basic synchronous markdown processing for simple cases
    return content
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.*)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>)/g, '$1')
      .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<ul>)/g, '$1')
      .replace(/(<\/ul>)<\/p>/g, '$1')
      .replace(/<p>(<li>)/g, '$1')
      .replace(/(<\/li>)<\/p>/g, '$1')
      .replace(/\n/g, '<br>');
  } catch (error) {
    console.error('Error processing markdown synchronously:', error);
    return content.replace(/\n/g, '<br>');
  }
}
