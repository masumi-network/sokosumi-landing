import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Fetch README from sokosumi-cli repository
 * @param {string} url - The URL to fetch the README from
 * @returns {Promise<string>} The README content
 */
export async function fetchReadme(url = 'https://raw.githubusercontent.com/masumi-network/sokosumi-cli/main/README.md') {
  console.log(`📥 Fetching README from: ${url}`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.status} ${response.statusText}`);
  }

  return await response.text();
}

/**
 * Fetch an image from a URL and save it locally
 * @param {string} imageUrl - The URL to fetch the image from
 * @param {string} outputPath - The local path to save the image
 */
export async function fetchImage(imageUrl, outputPath) {
  console.log(`📥 Fetching image from: ${imageUrl}`);
  
  const response = await fetch(imageUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  writeFileSync(outputPath, new Uint8Array(buffer));
  console.log(`💾 Image saved to: ${outputPath}`);
}

/**
 * Extract image references from markdown content
 * @param {string} markdown - The markdown content to parse
 * @returns {Array<{src: string, alt: string}>} Array of image references
 */
export function extractImageReferences(markdown) {
  // Regex to match markdown images: ![alt text](image.png)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images = [];
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    images.push({
      alt: match[1],
      src: match[2]
    });
  }

  return images;
}

/**
 * Fetch all images referenced in README content
 * @param {string} readmeContent - The README markdown content
 * @param {string} baseUrl - The base URL for the repository (e.g., 'https://raw.githubusercontent.com/masumi-network/sokosumi-cli/main')
 * @param {string} outputDir - The directory to save images to
 * @returns {Promise<void>}
 */
export async function fetchAllImages(readmeContent, baseUrl, outputDir) {
  const images = extractImageReferences(readmeContent);
  
  if (images.length === 0) {
    console.log('📄 No images found in README');
    return;
  }

  console.log(`🖼️  Found ${images.length} image(s) to fetch`);
  
  // Create images directory
  const imagesDir = join(outputDir, 'images');
  mkdirSync(imagesDir, { recursive: true });
  
  for (const image of images) {
    const imageUrl = image.src.startsWith('http') ? image.src : `${baseUrl}/${image.src}`;
    const filename = image.src.split('/').pop();
    const outputPath = join(imagesDir, filename);
    
    try {
      await fetchImage(imageUrl, outputPath);
    } catch (error) {
      console.warn(`⚠️  Failed to fetch image ${image.src}:`, error.message);
    }
  }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const readme = await fetchReadme();
    console.log(readme);
  } catch (error) {
    console.error('❌ Failed to fetch README:', error.message);
    process.exit(1);
  }
}