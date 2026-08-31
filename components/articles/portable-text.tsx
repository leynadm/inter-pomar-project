import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="display mt-10 mb-4 text-2xl font-bold tracking-wide text-neutral-900 sm:text-3xl">
        <span className="mr-2 inline-block h-6 w-1 rounded-sm bg-pitch align-middle" aria-hidden />
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="display mt-8 mb-3 text-xl font-bold tracking-wide text-neutral-900 sm:text-2xl">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="display mt-6 mb-2 text-lg font-bold text-neutral-800">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="mb-5 text-base/relaxed text-neutral-700 sm:text-lg/relaxed">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="editorial my-8 border-l-3 border-pitch bg-green-50/60 py-4 pr-4 pl-6 text-xl text-neutral-800 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const isExternal = (value?.href || "").startsWith("http");
      return (
        <a
          href={value?.href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="font-semibold text-pitch underline decoration-pitch/30 underline-offset-4 transition-colors hover:text-green-700 hover:decoration-pitch"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => (
      <strong className="font-bold text-neutral-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8 overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-card">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={urlFor(value).width(1200).height(675).fit("crop").url()}
              alt={value.caption || "Article image"}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="size-full object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="editorial border-t border-neutral-100 bg-white px-5 py-3 text-center text-xs text-neutral-500">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

export function ArticleBody({ value }: { value: any }) {
  return <PortableText value={value} components={components} />;
}
