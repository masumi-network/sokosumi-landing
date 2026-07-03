import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';
import { writeFileSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Recursively find all .mdx files and convert to page paths
 */
function getAllMdxPages(dir, baseDir = dir) {
  const pages = [];
  
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursively search subdirectories
      pages.push(...getAllMdxPages(fullPath, baseDir));
    } else if (entry.endsWith('.mdx')) {
      // Get relative path from baseDir, remove .mdx extension
      const relativePath = fullPath.replace(baseDir + '/', '').replace(/\.mdx$/, '');
      pages.push(relativePath);
    }
  }
  
  return pages.sort();
}

/**
 * Generate a title from HTTP method and route
 */
function generateTitle(method, route) {
  const methodMap = {
    'GET': 'Get',
    'POST': 'Create',
    'PUT': 'Update',
    'PATCH': 'Update',
    'DELETE': 'Delete'
  };
  
  const methodName = methodMap[method.toUpperCase()] || method.toUpperCase();
  
  // Check if route has parameters (e.g., {id}, {agentId})
  const hasParams = route.includes('{');
  
  // Split route into parts, keeping track of parameters
  const parts = route.split('/').filter(p => p);
  const resource = parts[0] || 'resource';
  
  // Handle nested resources (e.g., /conversations/{id}/items -> conversation items)
  if (parts.length > 2) {
    const lastPart = parts[parts.length - 1];
    // Skip parameter parts (like {id})
    const nonParamParts = parts.filter(p => !p.startsWith('{'));
    const resourceName = nonParamParts[0].charAt(0).toUpperCase() + nonParamParts[0].slice(1).replace(/s$/, '');
    const subResource = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    return `${methodName} ${resourceName} ${subResource}`;
  }
  
  // Handle routes with parameters (e.g., /agents/{id} -> "Get Agent by ID")
  if (hasParams && method.toUpperCase() === 'GET') {
    const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1).replace(/s$/, '');
    return `${methodName} ${resourceName} by ID`;
  }
  
  // Handle routes with parameters for other methods (e.g., /agents/{id} PATCH -> "Update Agent")
  if (hasParams) {
    const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1).replace(/s$/, '');
    return `${methodName} ${resourceName}`;
  }
  
  // Handle list endpoints (e.g., /agents -> "Get Agents")
  const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
  return `${methodName} ${resourceName}`;
}

/**
 * Recursively find all .mdx files
 */
function getAllMdxFiles(dir) {
  const files = [];
  
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllMdxFiles(fullPath));
    } else if (entry.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Update titles in generated MDX files
 */
function updateMdxTitles(outputDir) {
  const files = getAllMdxFiles(outputDir);
  let updated = 0;
  
  for (const filePath of files) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      
      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) continue;
      
      const frontmatter = frontmatterMatch[1];
      
      // Extract method and route from _openapi section
      const methodMatch = frontmatter.match(/method:\s*(\w+)/);
      const routeMatch = frontmatter.match(/route:\s*([^\n]+)/);
      
      if (methodMatch && routeMatch) {
        const method = methodMatch[1];
        const route = routeMatch[1].trim();
        const newTitle = generateTitle(method, route);
        
        // Replace title: Unknown with the new title
        const updatedFrontmatter = frontmatter.replace(
          /title:\s*Unknown/g,
          `title: ${newTitle}`
        );
        
        const updatedContent = content.replace(
          /^---\n[\s\S]*?\n---/,
          `---\n${updatedFrontmatter}\n---`
        );
        
        writeFileSync(filePath, updatedContent);
        updated++;
      }
    } catch (error) {
      console.warn(`⚠️  Could not update title for ${filePath}:`, error.message);
    }
  }
  
  console.log(`📝 Updated titles for ${updated} files`);
}

/**
 * Generate meta.json files for navigation structure
 */
function generateMetaFiles(outputDir) {
  const apiRefDir = outputDir;
  
  // Determine subdirectories dynamically (tags translated to folders)
  const subdirs = readdirSync(apiRefDir).filter(name => {
    const fullPath = join(apiRefDir, name);
    return !name.startsWith('.') && !name.endsWith('.mdx') && !name.endsWith('.json') && statSync(fullPath).isDirectory();
  });

  // Generate main meta.json using discovered subdirs
  const mainMeta = {
    title: "API",
    icon: "Code",
    root: true,
    pages: ["index", ...subdirs]
  };
  writeFileSync(join(apiRefDir, 'meta.json'), JSON.stringify(mainMeta, null, 2));

  // Generate meta.json for each subdirectory
  for (const subdir of subdirs) {
    const subdirPath = join(apiRefDir, subdir);
    try {
      const pages = getAllMdxPages(subdirPath);
      
      const meta = {
        title: subdir.charAt(0).toUpperCase() + subdir.slice(1),
        pages: pages
      };

      writeFileSync(join(subdirPath, 'meta.json'), JSON.stringify(meta, null, 2));
      console.log(`📋 Generated meta.json for ${subdir} (${pages.length} pages)`);
    } catch (error) {
      console.warn(`⚠️  Could not generate meta.json for ${subdir}:`, error.message);
    }
  }
}

/**
 * Generate OpenAPI documentation files from Sokosumi API spec
 */
async function generateOpenAPI() {
  try {
    console.log('🚀 Generating Sokosumi API documentation...');
    console.log('📥 Fetching spec from: https://api.sokosumi.com/v1/openapi.json');

    const outputDir = './content/sokosumi/api-reference';

    const input = createOpenAPI({
      input: ['https://api.sokosumi.com/v1/openapi.json'],
    });

    await generateFiles({
      input,
      output: outputDir,
      per: 'operation',
      groupBy: 'tag',
    });

    console.log('📝 Updating page titles...');
    updateMdxTitles(outputDir);

    console.log('📋 Generating navigation meta files...');
    generateMetaFiles(outputDir);

    console.log('✅ Sokosumi API documentation generated successfully!');
  } catch (error) {
    console.error('❌ Failed to generate API documentation:', error.message);
    process.exit(1);
  }
}

generateOpenAPI();