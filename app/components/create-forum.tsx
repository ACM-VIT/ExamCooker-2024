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

    // Validation for required fields
    if (!title || !year || !subject || !slot) {
      let errorMessage = 'Please fill in the following fields:\n';
      if (!title) errorMessage += '- Title\n';
      if (!year) errorMessage += '- Year\n';
      if (!subject) errorMessage += '- Subject\n';
      if (!slot) errorMessage += '- Slot\n';

      alert(errorMessage);
      return;
    }

    const response = await fetch('/api/createForum', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, year, subject, slot, description, tags }),
    });

    if (response.ok) {
      console.log('Forum created successfully');
      router.push('/');
    } else {
      console.error('Failed to create forum');
    }
  };

  const getInputStyle = (value: string) => ({
    padding: '5px',
    border: value ? '1px solid #D3D3D3' : '1px dotted #D3D3D3',
    width: '100%',
    color: '#000',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  });

  const getYSSInputStyle = (value: string) => ({
    padding: '5px',
    border: value ? '1px solid #D3D3D3' : '1px dotted #D3D3D3',
    width: '100%',
    color: '#000',
    fontSize: '1rem',
    fontWeight: 'bold',
  });

  const getTextAreaStyle = (value: string) => ({
    padding: '5px',
    border: value ? '1px solid #D3D3D3' : '1px dotted #D3D3D3',
    width: '100%',
    color: '#000',
    fontSize: '0.8rem',
    minHeight: '150px',
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <button
            className="duration-300 hover:bg-teal-600"
            onClick={() => router.back()}
            style={{
              color: '#3BF3C7',
              padding: '3px 5px',
              border: '3px solid #3BF3C7',
              cursor: 'pointer',
              display: 'flex',
              borderRadius: '7px',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            <span style={{ marginRight: '0px' }}>&larr;</span>
          </button>
          <button
            className="duration-300 bg-teal-400 hover:bg-teal-500"
            onClick={handleSubmit}
            style={{
              color: '#000000',
              padding: '7px 15px',
              border: '2px solid #000000',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Post
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Title"
              style={getInputStyle(title)}
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
                style={getYSSInputStyle(year)}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Subject"
                style={getYSSInputStyle(subject)}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <select
                style={{
                  padding: '7px',
                  width: '65%',
                  color: '#000',
                  borderRadius: '8px',
                  backgroundColor: '#87CEEB',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5DADE2')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#87CEEB')}
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
              style={getTextAreaStyle(description)}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block text-gray-700 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2"
                >
                  #{tag}{' '}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{ marginLeft: '5px' }}
                  >
                    &times;
                  </button>
                </span>
              ))}
              {isAddingTag ? (
                <input
                  type="text"
                  autoFocus
                  style={getInputStyle(newTag)}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              ) : (
                <button
                  type="button"
                  onClick={handleAddTagClick}
                  className="duration-300 bg-white hover:bg-blue-300"
                  style={{
                    color: '#3BF3C7',
                    padding: '5px 10px',
                    border: '3px solid #3BF3C7',
                    borderRadius: '7px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    marginLeft: tags.length > 0 ? '10px' : '0px',
                  }}
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
