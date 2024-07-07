import React from 'react';
import Fuse from 'fuse.js';
import { PrismaClient, Prisma, PastPaper, Tag } from "@prisma/client";
import { redirect } from 'next/navigation';
import Pagination from '../../components/Pagination';
import PastPaperCard from '../../components/PastPaperCard';
import FilterComponent from '../../components/FilterComponent';
import SearchBar from '../../components/SearchBar';
import UploadButtonPaper from '../../components/uploadButtonPaper';
import Dropdown from '../../components/FilterComponent';

const SCORE_THRESHOLD = 0.6;

type PastPaperWithTags = PastPaper & {
  tags: Tag[];
};

function validatePage(page: number, totalPages: number): number {
  if (isNaN(page) || page < 1) {
    return 1;
  }
  if (page > totalPages && totalPages > 0) {
    return totalPages;
  }
  return page;
}

function performSearch(query: string, dataSet: PastPaperWithTags[]) {
  const options = {
    includeScore: true,
    keys: [
      { name: 'title', weight: 2 },
      { name: 'tags.name', weight: 1 }
    ],
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
    findAllMatches: true,
    useExtendedSearch: true,
  };
  const fuse = new Fuse(dataSet, options);
  const searchResults = fuse.search({
    $or: [
      { title: query },
      { 'tags.name': query },
      { title: `'${query}` }
    ]
  });
  return searchResults
    .filter((fuseResult) => (fuseResult.score || 1) < SCORE_THRESHOLD)
    .map((fuseResult) => fuseResult.item);
}

async function pastPaperPage({ searchParams }: { searchParams: { page?: string, search?: string, tags?: string | string[] } }) {
  const prisma = new PrismaClient();
  const pageSize = 9;
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  let tags: string[] = Array.isArray(searchParams.tags)
    ? searchParams.tags
    : (searchParams.tags ? searchParams.tags.split(',') : []);

  const allPastPapers = await prisma.pastPaper.findMany({
    where: {
      ...(tags.length > 0 && {
        tags: {
          some: {
            name: {
              in: tags,
            },
          },
        },
      }),
    },
    include: {
      tags: true,
    },
  });

  let filteredPastPapers = allPastPapers;
  if (search) {
    filteredPastPapers = performSearch(search, filteredPastPapers);
  }

  const totalCount = filteredPastPapers.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  let validatedPage = validatePage(page, totalPages);

  const startIndex = (validatedPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPastPapers = filteredPastPapers.slice(startIndex, endIndex);

  if (validatedPage !== page) {
    const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
    const tagsQuery = tags.length > 0 ? `&tags=${encodeURIComponent(tags.join(','))}` : '';
    redirect(`/past_papers?page=${validatedPage}${searchQuery}${tagsQuery}`);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center mb-4">Past Papers</h1>

        <div className="flex flex-col sm:flex-row items-center justify-center p-4 space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
          <SearchBar pageType="past_papers" initialQuery={search} />
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Dropdown pageType='past_papers' />
            <UploadButtonPaper />
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex justify-center mb-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6">
            {paginatedPastPapers.length > 0 ? (
              paginatedPastPapers.map((eachPaper, index) => (
                <div key={eachPaper.id} className="flex justify-center">
                  <PastPaperCard pastPaper={eachPaper} index={index} />
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center">
                {search || tags.length > 0
                  ? "No past papers found matching your search or selected tags."
                  : "No past papers found."}
              </p>
            )}
          </div>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={validatedPage}
            totalPages={totalPages}
            basePath="/past_papers"
            searchQuery={search}
            tagsQuery={tags.join(',')}
          />
        </div>
      )}
    </div>
  );
}

export default pastPaperPage;