"use client"
import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { generateSignedUploadURL, storeFileInfoInDatabase } from "../actions/uploadFile";
import cuid from 'cuid';

const UploadFilePaper: React.FC = () => {
    const [year, setYear] = useState('');
    const [subject, setSubject] = useState('');
    const [slot, setSlot] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [fileUploadStatus, setFileUploadStatus] = useState<{ [key: string]: string }>({});
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState("");

    const handleAddTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag('');
        }
        setIsAddingTag(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleAddTagClick = () => {
        setIsAddingTag(true);
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles([...files, ...acceptedFiles]);
    }, [files]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles: File[]) => {
            setFiles([...files, ...acceptedFiles]);
            setIsDragging(false);
        },
        onDragEnter: () => setIsDragging(true),
        onDragLeave: () => setIsDragging(false),
        multiple: true
    });


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        setMessage("");
        setError("");

        if (files.length === 0) {
            setError("Please select at least one file to upload.");
            setUploading(false);
            return;
        }

        try {
            for (const file of files) {
                const filename = `${file.name}-${cuid()}`;
                const { url, fields } = await generateSignedUploadURL(filename);

                const formData = new FormData();
                Object.entries({ ...fields, file }).forEach(([key, value]) => {
                    formData.append(key, value as string | Blob);
                });

                setFileUploadStatus((prevStatus) => ({
                    ...prevStatus,
                    [file.name]: "Uploading",
                }));

                const uploadResponse = await fetch(url, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error(`Failed to upload file: ${file.name}`);
                }

                const fileUrl = `${url}${filename}`;
                await storeFileInfoInDatabase(file.name, fileUrl, "cly0klo9800006hg6gwc73j5u", "Note");

                setFileUploadStatus((prevStatus) => ({
                    ...prevStatus,
                    [file.name]: "Uploaded",
                }));
            }

            setMessage("Files uploaded successfully!");
        } catch (error) {
            console.error("Error uploading files:", error);
            setError(`Error uploading files: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUploading(false);
            setFiles([]);
        }
    };
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <Link href={'/notes'}>
                        <button className="text-[#3BF3C7] px-2 py-1 border-2 border-[#3BF3C7] rounded flex items-center justify-center font-bold hover:bg-teal-600">
                            <span className="mr-0">&larr;</span>
                        </button>
                    </Link>
                    <button
                        className="bg-teal-400 hover:bg-teal-500 text-black px-4 py-2 border-2 border-black rounded font-bold"
                        onClick={handleSubmit}
                        disabled={uploading}
                    >
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Year"
                                className={`p-2 border ${year ? 'border-solid' : 'border-dotted'} border-gray-300 w-full text-black text-base font-bold`}
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Subject"
                                className={`p-2 border ${subject ? 'border-solid' : 'border-dotted'} border-gray-300 w-full text-black text-base font-bold`}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <select
                                className="p-2 w-2/3 text-black rounded bg-blue-400 cursor-pointer transition-colors duration-300 hover:bg-blue-600"
                                value={slot}
                                onChange={(e) => setSlot(e.target.value)}
                                required
                            >
                                <option value="">Slot</option>
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center mb-2 flex-wrap">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-block text-gray-700 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2"
                                >
                                    #{tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="ml-2 text-red-500"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                            {isAddingTag ? (
                                <input
                                    type="text"
                                    autoFocus
                                    className={`p-2 border ${newTag ? 'border-solid' : 'border-dotted'} border-gray-300 w-full text-black text-lg font-bold`}
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleAddTagClick}
                                    className="bg-white hover:bg-blue-300 text-[#3BF3C7] px-4 py-2 border-2 border-[#3BF3C7] rounded font-bold text-sm cursor-pointer ml-2"
                                >
                                    Add tag
                                </button>
                            )}
                        </div>
                    </div>

                    <div
                        {...getRootProps()}
                        className={`
                            border-2 border-dashed rounded-lg
                            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                            transition-all duration-300 ease-in-out
                            flex flex-col items-center justify-center
                            p-4 sm:p-6 md:p-8
                            h-32 sm:h-40 md:h-48
                            mb-4 cursor-pointer
                        `}
                    >
                        <input {...getInputProps()} />
                        <svg
                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <p className="text-sm sm:text-base md:text-lg text-gray-500 text-center">
                            Drag & drop files here, or click here
                        </p>
                        {files.length > 0 && (
                            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-2">
                                {files.length} file(s) selected
                            </p>
                        )}
                    </div>

                    {files.length > 0 && (
                        <div className="mb-4">
                            {files.map((file, index) => (
                                <div key={index} className="text-gray-700 flex items-center">
                                    {file.name}
                                    <span className={`ml-2 ${fileUploadStatus[file.name] === "Uploading" ? "text-yellow-500" : "text-green-500"}`}>
                                        {fileUploadStatus[file.name]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 text-center">
                            <span className="text-red-500">{error}</span>
                        </div>
                    )}

                    {message && (
                        <div className="mb-4 text-center">
                            <span className={`text-${message.includes('successfully') ? 'green' : 'red'}-500`}>{message}</span>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );

}

export default UploadFilePaper;