import { getUpdatePosts } from '@/lib/api';
import GalleryClient from './GalleryClient';

export default async function GallerySection() {
  const posts = (await getUpdatePosts()) ?? [];
  return <GalleryClient posts={posts} />;
}