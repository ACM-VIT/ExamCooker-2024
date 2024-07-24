import React from 'react';
import Fuse from 'fuse.js';
import { PrismaClient, PastPaper, Tag } from "@prisma/client";
import { redirect } from 'next/navigation';
import Pagination from '../../components/Pagination';
import PastPaperCard from '../../components/PastPaperCard';
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
    const largePageSize = 9;
    const mediumPageSize = 8;
    const smallPageSize = 4;
    const search = searchParams.search || '';
    const page = parseInt(searchParams.page || '1', 10);
    const tags: string[] = Array.isArray(searchParams.tags)
        ? searchParams.tags
        : (searchParams.tags ? searchParams.tags.split(',') : []);

    const allPastPapers = await prisma.pastPaper.findMany({
        where: {
            isClear: true,
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
        orderBy: {
            createdAt: 'desc',
        }
    });

    let filteredPastPapers = allPastPapers;
    if (search) {
        filteredPastPapers = performSearch(search, filteredPastPapers);
    }

    const totalCount = filteredPastPapers.length;
    const largeTotalPages = Math.ceil(totalCount / largePageSize);
    const mediumTotalPages = Math.ceil(totalCount / mediumPageSize);
    const smallTotalPages = Math.ceil(totalCount / smallPageSize);

    const maxTotalPages = Math.max(largeTotalPages, mediumTotalPages, smallTotalPages);
    const validatedPage = validatePage(page, maxTotalPages);

    const largeStartIndex = (validatedPage - 1) * largePageSize;
    const mediumStartIndex = (validatedPage - 1) * mediumPageSize;
    const smallStartIndex = (validatedPage - 1) * smallPageSize;

    const largePaginatedPastPapers = filteredPastPapers.slice(largeStartIndex, largeStartIndex + largePageSize);
    const mediumPaginatedPastPapers = filteredPastPapers.slice(mediumStartIndex, mediumStartIndex + mediumPageSize);
    const smallPaginatedPastPapers = filteredPastPapers.slice(smallStartIndex, smallStartIndex + smallPageSize);

    if (validatedPage !== page) {
        const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
        const tagsQuery = tags.length > 0 ? `&tags=${encodeURIComponent(tags.join(','))}` : '';
        redirect(`/past_papers?page=${validatedPage}${searchQuery}${tagsQuery}`);
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 transition-colors flex flex-col min-h-screen items-center text-black dark:text-[#D5D5D5]">
            <h1 className="text-center mb-4">Past Papers</h1>
            <div className="hidden w-5/6 lg:w-1/2 md:flex items-center justify-center p-4 space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
                <Dropdown pageType='past_papers' />
                <SearchBar pageType="past_papers" initialQuery={search} />
                <UploadButtonPaper />
            </div>

            <div className='flex-col w-5/6 md:hidden space-y-4'>
                <SearchBar pageType="past_papers" initialQuery={search} />
                <div className='flex justify-between'>
                    <Dropdown pageType='past_papers' />
                    <UploadButtonPaper />
                </div>
            </div>

            {tags.length > 0 && (
                <div className="flex justify-center mb-4">
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className='flex justify-center w-full'>
                <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-2 sm:p-4 place-items-center">
                    {filteredPastPapers.length > 0 ? (
                        <>
                            <div className="hidden lg:contents">
                                {largePaginatedPastPapers.map((eachPaper, index) => (
                                    <PastPaperCard key={eachPaper.id} pastPaper={eachPaper} index={index} />
                                ))}
                            </div>
                            <div className="hidden sm:contents lg:hidden">
                                {mediumPaginatedPastPapers.map((eachPaper, index) => (
                                    <PastPaperCard key={eachPaper.id} pastPaper={eachPaper} index={index} />
                                ))}
                            </div>
                            <div className="contents sm:hidden">
                                {smallPaginatedPastPapers.map((eachPaper, index) => (
                                    <PastPaperCard key={eachPaper.id} pastPaper={eachPaper} index={index} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="col-span-1 sm:col-span-2 lg:col-span-3 text-center">
                            {search || tags.length > 0
                                ? "No past papers found matching your search or selected tags."
                                : "No past papers found."}
                        </p>
                    )}
                </div>
            </div>

            {maxTotalPages > 1 && (
                <div className="mt-auto pt-4">
                    <Pagination
                        currentPage={validatedPage}
                        totalPages={maxTotalPages}
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