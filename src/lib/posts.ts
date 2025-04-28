import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define the directory where posts are stored, relative to the project root
const postsDirectory = path.join(process.cwd(), process.env.GITHUB_POSTS_PATH || 'src/app/posts');

export interface PostData {
  slug: string;
  title: string;
  date: string; // Keep as string initially, can be parsed later if needed
  excerpt?: string;
  content: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
}


/**
 * Reads all post metadata from the filesystem.
 * Sorts posts by date in descending order.
 */
export function getAllPostsMeta(): PostMeta[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory).filter(name => name.endsWith('.md') || name.endsWith('.mdx'));
    const allPostsData = fileNames.map((fileName) => {
      // Remove ".md" or ".mdx" from file name to get slug
      const slug = fileName.replace(/\.(md|mdx)$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Combine the data with the slug
      return {
        slug,
        title: matterResult.data.title || 'Untitled Post',
        date: matterResult.data.date ? new Date(matterResult.data.date).toISOString() : new Date().toISOString(),
        excerpt: matterResult.data.excerpt || '',
        ...matterResult.data, // Spread any other frontmatter data
      };
    });

    // Sort posts by date
    return allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });
  } catch (error) {
    console.error("Error reading posts directory:", postsDirectory, error);
    // Return empty array or throw error depending on desired behavior
    return [];
  }
}

/**
 * Reads the content and metadata for a single post by slug.
 */
export function getPostData(slug: string): PostData | null {
   const possibleFileNames = [`${slug}.md`, `${slug}.mdx`];
   let fullPath: string | undefined;
   let fileNameFound: string | undefined;

   for (const fileName of possibleFileNames) {
     const testPath = path.join(postsDirectory, fileName);
     if (fs.existsSync(testPath)) {
       fullPath = testPath;
       fileNameFound = fileName;
       break;
     }
   }

  if (!fullPath || !fileNameFound) {
     console.warn(`Post file not found for slug "${slug}" in ${postsDirectory}`);
    return null;
  }

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the slug and content
    return {
      slug,
      title: matterResult.data.title || 'Untitled Post',
      date: matterResult.data.date ? new Date(matterResult.data.date).toISOString() : new Date().toISOString(),
      excerpt: matterResult.data.excerpt || '',
      content: matterResult.content,
      ...matterResult.data,
    };
  } catch (error) {
    console.error(`Error reading post file "${fileNameFound}":`, error);
    return null;
  }
}

/**
 * Returns an array of slugs for all posts, used for generateStaticParams.
 */
export function getAllPostSlugs(): { slug: string }[] {
   try {
    const fileNames = fs.readdirSync(postsDirectory).filter(name => name.endsWith('.md') || name.endsWith('.mdx'));
    return fileNames.map((fileName) => {
      return {
        slug: fileName.replace(/\.(md|mdx)$/, ''),
      };
    });
  } catch (error) {
     console.error("Error reading post slugs:", error);
     return [];
  }
}
