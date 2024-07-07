import React from 'react';
import Fuse from 'fuse.js';
import { PrismaClient, Prisma, Note, Tag } from "@prisma/client";
import { redirect } from 'next/navigation';
import Pagination from "../../components/Pagination";
import NotesCard from "../../components/NotesCard";
import SearchBar from "../../components/SearchBar";
import Dropdown from "../../components/FilterComponent";
import UploadButtonNotes from "../../components/UploadButtonNotes";

const SCORE_THRESHOLD = 0.6;

type NoteWithTags = Note & {
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

function performSearch(query: string, dataSet: NoteWithTags[]) {
    const options = {
        includeScore: true,
        keys: [
            { name: 'title', weight: 2 },
            { name: 'tags.name', weight: 1 }
        ],
        threshold: 0.6,
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

async function notesPage({ searchParams }: { searchParams: { page?: string, search?: string, tags?: string | string[] } }) {
    const prisma = new PrismaClient();
    const pageSize = 9;
    const search = searchParams.search || '';
    const page = parseInt(searchParams.page || '1', 10);
    let tags: string[] = Array.isArray(searchParams.tags)
        ? searchParams.tags
        : (searchParams.tags ? searchParams.tags.split(',') : []);

    const allNotes = await prisma.note.findMany({
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

    let filteredNotes = allNotes;
    if (search) {
        filteredNotes = performSearch(search, filteredNotes);
    }

    const totalCount = filteredNotes.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    let validatedPage = validatePage(page, totalPages);

    const startIndex = (validatedPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedNotes = filteredNotes.slice(startIndex, endIndex);

    if (validatedPage !== page) {
        const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
        const tagsQuery = tags.length > 0 ? `&tags=${encodeURIComponent(tags.join(','))}` : '';
        redirect(`/notes?page=${validatedPage}${searchQuery}${tagsQuery}`);
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto p-4">
                <h1 className="text-4xl font-bold text-center mb-4">Notes</h1>

                <div className="flex justify-center">
                    <div className="container flex flex-col sm:flex-row items-center justify-center p-4 space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
                        <SearchBar pageType="notes" initialQuery={search} />
                        <div className="flex space-x-4">
                            <Dropdown pageType='notes' />
                            <UploadButtonNotes />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6">
                        {paginatedNotes.length > 0 ? (
                            paginatedNotes.map((eachNote, index) => (
                                <NotesCard
                                    key={eachNote.id}
                                    note={eachNote}
                                    index={index}
                                />
                            ))
                        ) : (
                            <p className="col-span-3 text-center">
                                {search || tags.length > 0
                                    ? "No notes found matching your search or selected tags."
                                    : "No notes found."}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="mt-auto">
                    <Pagination
                        currentPage={validatedPage}
                        totalPages={totalPages}
                        basePath="/notes"
                        searchQuery={search}
                        tagsQuery={tags.join(',')}
                    />
                </div>
            )}
        </div>
    );
}

export default notesPage;