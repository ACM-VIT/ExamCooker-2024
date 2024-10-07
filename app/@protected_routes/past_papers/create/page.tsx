import React from "react";
import UploadPaper from "@/app/components/uploadPaper";
import { PrismaClient } from "@prisma/client";


async function UploadPaperPage() {
    const prisma = new PrismaClient();

    const allTags = await prisma.tag.findMany();
    return (
        <div className="create-papers">
            <UploadPaper allTags={allTags.map(i => i.name)} variant="Past Papers"/>
        </div>
    );
}

export default UploadPaperPage;
