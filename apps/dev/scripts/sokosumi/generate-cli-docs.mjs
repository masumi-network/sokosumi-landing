import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fetchReadme, fetchAllImages } from './fetch-readme.mjs';

/**
 * Generate CLI documentation from sokosumi-cli README
 */
async function generateCliDocs() {
  try {
    console.log('🚀 Generating CLI documentation...');

    const readmeContent = await fetchReadme();
    const outputDir = './content/sokosumi/cli_docs';
    
    // Ensure directory exists
    mkdirSync(outputDir, { recursive: true });
    
    // Dynamically fetch all images referenced in the README
    const baseUrl = 'https://raw.githubusercontent.com/masumi-network/sokosumi-cli/main';
    await fetchAllImages(readmeContent, baseUrl, outputDir);
    
    // Create MDX file with frontmatter and README content
    const mdxContent = `---
title: Sokosumi CLI
banner: /assets/sokosumi_banner_cli_tool.png
icon: FileTerminal
---

${readmeContent}
`;

    const outputPath = join(outputDir, 'index.mdx');
    writeFileSync(outputPath, mdxContent);

    console.log('✅ CLI documentation generated successfully!');
  } catch (error) {
    console.error('❌ Failed to generate CLI documentation:', error.message);
    process.exit(1);
  }
}

generateCliDocs();