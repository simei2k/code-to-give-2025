"use client";

import React from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, type Document } from "@contentful/rich-text-types";

const options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_: any, children: React.ReactNode) => (
      <p className="mb-4 leading-7 text-gray-800">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (_: any, children: React.ReactNode) => (
      <h1 className="mb-4 text-2xl font-bold text-[#006e34]">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (_: any, children: React.ReactNode) => (
      <h2 className="mb-3 text-xl font-semibold text-[#006e34]">{children}</h2>
    ),
    [BLOCKS.UL_LIST]: (_: any, children: React.ReactNode) => (
      <ul className="mb-4 ml-6 list-disc">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_: any, children: React.ReactNode) => (
      <ol className="mb-4 ml-6 list-decimal">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (_: any, children: React.ReactNode) => (
      <li className="mb-1">{children}</li>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const file = node?.data?.target?.fields?.file;
      const title = node?.data?.target?.fields?.title;
      const url = file?.url ? (file.url.startsWith("//") ? `https:${file.url}` : file.url) : null;
      if (!url) return null;

      return (
        <div className="my-6">
          <img
            src={url}
            alt={title || "Embedded image"}
            className="rounded-md"
          />
          {title && <p className="mt-2 text-sm text-gray-500">{title}</p>}
        </div>
      );
    },
  },
};

export default function ArticleBody({ document }: { document: Document }) {
  return <div>{documentToReactComponents(document, options)}</div>;
}