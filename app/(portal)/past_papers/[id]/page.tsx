import React from 'react';
import { PrismaClient } from '@prisma/client';
import dynamic from 'next/dynamic';
import PDFViewer from '@/app/components/pdfviewer';
import { TimeHandler } from '@/app/components/forumpost/CommentContainer';

function removePdfExtension(filename: string): string {
    if (filename.endsWith('.pdf')) {
        return filename.slice(0, -4);
    }
    return filename;
}

function isValidSlot(str: string): boolean {
    const regex = /^[A-G]\d$/;
    return regex.test(str);
}

function isValidYear(year: string): boolean {
    const regex = /^20\d{2}$/;
    return regex.test(year);
}

async function PdfViewerPage({ params }: { params: { id: string } }) {

    const prisma = new PrismaClient();
    let year: string = '';
    let slot: string = '';
    const paper = await prisma.pastPaper.findUnique({
        where: {
            id: params.id,
        },
        include: {
            author: true,
            tags: true,
        },
    });

    for(let i : number = 0; i < paper?.tags.length; i++) {
        if(isValidYear(paper!.tags[i].name)) {
            year = paper!.tags[i].name
        } 
        else if (isValidSlot(paper!.tags[i].name)) {
            slot = paper!.tags[i].name
        }
    }


    return (
        <div className="transition-colors p-6 flex flex-col items-center space-x-4 lg:flex-row h-screen text-black dark:text-[#D5D5D5] divide-black dark:divide-[#D5D5D5] divide-x">
            <div className="lg:w-1/2 p-8 flex flex-col justify-center overflow-none">
            <h1 className="text-3xl font-bold mb-4 truncate">{removePdfExtension(paper!.title)}</h1>
            <div className="space-y-2 overflow-y-auto">
                <p className="text-lg"><span className="font-semibold">Slot:</span> {slot}</p>
                <p className="text-lg"><span className="font-semibold">Year:</span> {year}</p>
                <p className="text-lg"><span className="font-semibold">Posted by:</span> {paper!.author?.name || 'Unknown'}</p>
                <p className='text-lg'><span className='font-semibold'>At: </span>{TimeHandler(paper!.createdAt.toISOString()).hours}:{TimeHandler(paper!.createdAt.toISOString()).minutes}{TimeHandler(paper!.createdAt.toISOString()).amOrPm}, {TimeHandler(paper!.createdAt.toISOString()).day}/{TimeHandler(paper!.createdAt.toISOString()).month}/{TimeHandler(paper!.createdAt.toISOString()).year}</p>
            </div>
            </div>
            <div className='pl-6 w-1/2 h-full'>
                <div className="h-full w-full overflow-hidden">
                    <PDFViewer fileUrl={paper!.fileUrl} />
                </div>
            </div>
        </div>

    );
}
export default dynamic(() => Promise.resolve(PdfViewerPage), { ssr: false });
