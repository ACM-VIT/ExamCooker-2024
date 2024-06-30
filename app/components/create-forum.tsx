'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const CreateForum: React.FC = () => {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [subject, setSubject] = useState('');
  const [slot, setSlot] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !year || !subject || !slot) {
      let errorMessage = 'Please fill in the following fields:\n';
      if (!title) errorMessage += '- Title\n';
      if (!year) errorMessage += '- Year\n';
      if (!subject) errorMessage += '- Subject\n';
      if (!slot) errorMessage += '- Slot\n';

      alert(errorMessage);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('year', year);
    formData.append('subject', subject);
    formData.append('slot', slot);
    formData.append('description', description);
    tags.forEach(tag => formData.append('tags[]', tag));

    const response = await fetch('/api/createForum', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      console.log('Forum created successfully');
      router.push('/');
    } else {
      console.error('Failed to create forum');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <button
            className="text-teal-500 border-2 border-teal-500 rounded-lg flex items-center justify-center p-1 font-bold duration-300 hover:bg-teal-600"
            onClick={() => router.back()}
          >
            <span className="mr-0">&larr;</span>
          </button>
          <button
            className="bg-teal-400 text-black p-2 px-4 border-2 border-black rounded font-bold duration-300 hover:bg-teal-500"
            onClick={handleSubmit}
          >
            Post
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Title"
              className="w-full p-2 border text-lg font-bold text-black border-dotted focus:border-solid"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="Year"
                className="w-full p-2 border text-base font-bold text-black border-dotted focus:border-solid"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Subject"
                className="w-full p-2 border text-base font-bold text-black border-dotted focus:border-solid"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <select
                className="p-2 w-2/3 bg-blue-300 text-black rounded-lg cursor-pointer transition duration-300 hover:bg-blue-400"
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
            <textarea
              placeholder="Thread Description"
              className="w-full p-2 border text-sm text-black border-dotted focus:border-solid min-h-[150px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <div className="flex flex-wrap items-center mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block text-gray-700 px-3 py-1 text-sm font-semibold mr-2 mb-2"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {isAddingTag ? (
                <input
                  type="text"
                  autoFocus
                  className="p-2 border text-lg font-bold text-black border-dotted focus:border-solid"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              ) : (
                <button
                  type="button"
                  onClick={handleAddTagClick}
                  className="bg-white text-teal-500 p-1 px-2 border-2 border-teal-500 rounded-lg text-sm cursor-pointer transition duration-300 hover:bg-blue-300"
                >
                  Add tag
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateForum;
