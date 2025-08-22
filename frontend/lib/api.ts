import { createClient } from 'contentful';
import {
    type updatePostEntry,
    type updatePostSkeleton,
} from './types';

const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  });

export async function getUpdatePosts(): Promise<updatePostEntry[] | null> {
    try {
        const response = await client.getEntries<updatePostSkeleton>({
            content_type: "updatePost",
        });
        return response.items;
    } catch (error) {
        console.error('Error fetching update posts:', error);
        return null;
    }
}

export async function getUpdatePostBySlug(
    slug: string
  ): Promise<updatePostEntry | null> {
    const res = await client.getEntries<updatePostSkeleton>({
      content_type: "updatePost",
    });
  
    const match = res.items.find(
      (item) => item.fields.slug === slug
    ) as updatePostEntry | undefined;
  
    return match ?? null;
  }