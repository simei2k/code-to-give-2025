import type { Asset } from 'contentful';
import type { Document } from '@contentful/rich-text-types';

export interface StrictEntry<TFields, TContentTypeId extends string> {
    sys: {
      id: string;
      contentType: {
        sys: { id: TContentTypeId };
      };
      [key: string]: any;
    };
    fields: TFields;
  }

export interface updatePostFields {
    title: string;
    content: Document;
    coverImage: Asset;
    slug: string;
    location: 'General' | 'Kwai Tsing' | 'Sham Shui Po' | 'Kwun Tong';
  }
  
export type updatePostEntry = StrictEntry<updatePostFields, 'updatePost'>;
  
export interface updatePostSkeleton {
    contentTypeId: 'updatePost';
    fields: updatePostFields;
  }