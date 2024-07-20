import React from 'react';
import { PrismaClient } from '@prisma/client';
import dynamic from 'next/dynamic';
import PDFViewer from '@/app/components/pdfviewer';
import { TimeHandler } from '@/app/components/forumpost/CommentContainer';
//{dateTimeObj.hours}:{dateTimeObj.minutes} {dateTimeObj.amOrPm}, {dateTimeObj.day}/{dateTimeObj.month}/{dateTimeObj.year}

function removePdfExtension(filename: string): string {
  return filename.endsWith('.pdf') ? filename.slice(0, -4) : filename;
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
  let note;

  try {
    note = await prisma.note.findUnique({
      where: { 
        id: params.id 
      },
      include: { 
        author: true, 
        tags: true,
      },
    });

    for(let i : number = 0; i < note?.tags.length; i++) {
        if(isValidYear(note!.tags[i].name)) {
            year = note!.tags[i].name
        } 
        else if (isValidSlot(note!.tags[i].name)) {
            slot = note!.tags[i].name
        }
    }

    if (!note) {
      throw new Error('Note not found');
    }
  } catch (error) {
    console.error('Error fetching note:', error);
    return <div className="text-center p-8">Error loading note. Please try again later.</div>;
  } finally {
    await prisma.$disconnect();
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="lg:w-1/2 p-8 flex flex-col justify-center overflow-none">
        <h1 className="text-3xl font-bold mb-4 truncate">{removePdfExtension(note.title)}</h1>
        <div className="space-y-2 overflow-y-auto">
          <p className="text-lg"><span className="font-semibold">Slot:</span> {slot}</p>
          <p className="text-lg"><span className="font-semibold">Year:</span> {year}</p>
          <p className="text-lg"><span className="font-semibold">Posted by:</span> {note.author?.name || 'Unknown'}</p>
          <p className='text-lg'><span className='font-semibold'>At: </span>{TimeHandler(note.createdAt.toISOString()).hours}:{TimeHandler(note.createdAt.toISOString()).minutes}{TimeHandler(note.createdAt.toISOString()).amOrPm}, {TimeHandler(note.createdAt.toISOString()).day}/{TimeHandler(note.createdAt.toISOString()).month}/{TimeHandler(note.createdAt.toISOString()).year}</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 lg:border-l lg:border-black-900 lg:dark:border-[#d5d5d5] lg:overflow-hidden p-4">
        <div className="h-full">
          <PDFViewer fileUrl={note.fileUrl} />
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(PdfViewerPage), { ssr: false });