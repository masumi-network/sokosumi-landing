import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fetchReadme, fetchAllImages } from './fetch-readme.mjs';

/**
 * Generate MCP documentation from Sokosumi-MCP repository
 */
async function generateMcpDocs() {
  try {
    console.log('🚀 Generating MCP documentation...');

    const baseUrl = 'https://raw.githubusercontent.com/masumi-network/Sokosumi-MCP/main';
    const outputDir = './content/sokosumi/mcp';
    
    // Ensure directory exists
    mkdirSync(outputDir, { recursive: true });
    
    // Fetch README content
    let readmeContent = await fetchReadme(`${baseUrl}/README.md`);
    
    // Try to fetch advanced debugging guide from docs folder
    let debuggingContent = null;
    try {
      debuggingContent = await fetchReadme(`${baseUrl}/docs/DEBUG_CONNECTION.md`);
    } catch (error) {
      console.warn(`⚠️  DEBUG_CONNECTION.md not found: ${error.message}`);
    }
    
    /* Fetch images from README
    await fetchAllImages(readmeContent, baseUrl, outputDir);
    
    // Update image paths in README content to point to images/ folder
    readmeContent = readmeContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      const filename = src.split('/').pop();
      return `![${alt}](./images/${filename})`;
    });
    */
    
    // Create index.mdx (main page)
    const indexContent = `---
title: Sokosumi MCP Server
banner: /assets/sokosumi_banner_mcp_server.png
---

${readmeContent}
`;

    // Create debugging.mdx if debugging content exists
    let debuggingMdxContent = '';
    if (debuggingContent) {
      debuggingMdxContent = `---
title: Advanced Debugging Guide
---

${debuggingContent}
`;
    }

    // Write all files
    const indexPath = join(outputDir, 'index.mdx');
    
    writeFileSync(indexPath, indexContent);
    
    if (debuggingContent) {
      const debuggingPath = join(outputDir, 'debugging.mdx');
      writeFileSync(debuggingPath, debuggingMdxContent);
      console.log('✅ MCP documentation generated successfully!');
      console.log(`   - Main page: ${indexPath}`);
      console.log(`   - Debugging guide: ${debuggingPath}`);
    } else {
      console.log('✅ MCP documentation generated successfully!');
      console.log(`   - Main page: ${indexPath}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to generate MCP documentation:', error.message);
    process.exit(1);
  }
}

generateMcpDocs();