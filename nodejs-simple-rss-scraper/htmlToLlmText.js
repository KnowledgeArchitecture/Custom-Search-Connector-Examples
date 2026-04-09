// Function to convert html blog content to LLM friendly text
// Written by Claude Sonnet 4

import * as cheerio from 'cheerio';

export function htmlToLlmText(htmlContent, options = {
    preserveLinks: false,
    includeUrls: false,
    listBullet: '• '
}) {
    if (!htmlContent) return '';
    
    const $ = cheerio.load(htmlContent);
    
    // Remove script and style elements
    $('script, style, nav, footer, header').remove();
    
    let result = '';
    
    // Process headings
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
        const level = parseInt(el.tagName.charAt(1));
        const text = $(el).text().trim();
        if (text) {
            result += '\n' + '#'.repeat(level) + ' ' + text + '\n\n';
        }
        $(el).remove();
    });
    
    // Process paragraphs
    $('p').each((i, el) => {
        let text = $(el).text().trim();
        
        // Handle links
        $(el).find('a').each((j, link) => {
            const linkText = $(link).text().trim();
            const href = $(link).attr('href');
            
            if (options.preserveLinks && href && options.includeUrls) {
                const replacement = `[${linkText}](${href})`;
                text = text.replace(linkText, replacement);
            }
        });
        
        if (text) {
            result += text + '\n\n';
        }
    });
    
    // Process lists
    $('ul, ol').each((i, list) => {
        const isOrdered = list.tagName.toLowerCase() === 'ol';
        let counter = 1;
        
        $(list).find('li').each((j, li) => {
            const text = $(li).text().trim();
            const bullet = isOrdered ? `${counter}. ` : options.listBullet;
            if (text) {
                result += bullet + text + '\n';
            }
            counter++;
        });
        result += '\n';
    });
    
    // Clean up
    result = result.replace(/&amp;/g, '&')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/&quot;/g, '"')
                   .replace(/&#39;/g, "'")
                   .replace(/&nbsp;/g, ' ')
                   .replace(/&mdash;/g, '—')
                   .replace(/&ndash;/g, '–');
    
    // Remove excessive whitespace
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    
    return result;
}