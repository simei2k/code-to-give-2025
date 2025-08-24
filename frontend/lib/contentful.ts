import { createClient } from 'contentful';

// Create a client for fetching content
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

// Interface for contentful posts
export interface ContentfulPost {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

// Fetch content from the last month
export const fetchLatestContentfulPosts = async (limit = 10): Promise<ContentfulPost[]> => {
  try {
    const response = await client.getEntries({
      content_type: 'teacherPost', // Adjust to match your content type
      order: '-sys.createdAt',
      limit,
    });

    return response.items.map(item => ({
      id: item.sys.id,
      title: item.fields.title as string,
      description: item.fields.description as string,
      imageUrl: (item.fields.image as any)?.fields?.file?.url 
        ? `https:${(item.fields.image as any).fields.file.url}` 
        : '/placeholder.jpg',
      createdAt: item.sys.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching posts from Contentful:', error);
    return [];
  }
};

// Fetch a specific post for "student of the month"
export const fetchStudentOfMonthPost = async (): Promise<ContentfulPost | null> => {
  try {
    const response = await client.getEntries({
      content_type: 'Title', // Adjust to match your content type
      'description': 'Photos', // Assuming you tag special posts
      order: '-sys.createdAt',
      limit: 1,
    });

    if (response.items.length === 0) {
      // If no specific student of the month, just get the most recent post
      return (await fetchLatestContentfulPosts(1))[0];
    }

    const item = response.items[0];
    return {
      id: item.sys.id,
      title: item.fields.title as string,
      description: item.fields.description as string,
      imageUrl: (item.fields.image as any)?.fields?.file?.url 
        ? `https:${(item.fields.image as any).fields.file.url}` 
        : '/placeholder.jpg',
      createdAt: item.sys.createdAt,
    };
  } catch (error) {
    console.error('Error fetching student of the month from Contentful:', error);
    return null;
  }
};
