// SavedWords.js

import React, { useState } from 'react';

const SavedWords = ({ savedWords, onDeleteWord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');

  const filteredWords = savedWords.filter((word) =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedWords = [...filteredWords].sort((a, b) => {
    if (sortOption === 'a-z') {
      return a.word.localeCompare(b.word);
    } else if (sortOption === 'z-a') {
      return b.word.localeCompare(a.word);
    }
    return 0;
  });

  const deleteWord = (index) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this word?');

    if (isConfirmed) {
      onDeleteWord(index);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Saved Words</h2>
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search word..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={styles.sortDropdown}
        >
          <option value="" disabled>
            Sort by
          </option>
          <option value="a-z">A-Z</option>
          <option value="z-a">Z-A</option>
        </select>
      </div>
      {sortedWords.map((savedWord, index) => (
        <div key={index} style={styles.wordContainer}>
          <p style={styles.word}>
            <strong>Word:</strong> {savedWord.word}
          </p>
          <p style={styles.definition}>
            <strong>Definition:</strong> {savedWord.definition}
          </p>
          <button
            style={styles.deleteButton}
            onClick={() => deleteWord(index)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};


const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  controls: {
    display: 'flex',
    marginBottom: '20px',
  },
  searchInput: {
    marginRight: '10px',
    padding: '8px',
    fontSize: '16px',
  },
  sortDropdown: {
    padding: '8px',
    fontSize: '16px',
  },
  wordContainer: {
    marginBottom: '20px',
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    width: '80%',
    textAlign: 'left',
    position: 'relative',
  },
  word: {
    marginBottom: '10px',
  },
  definition: {
    marginTop: '10px',
  },
  deleteButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '5px',
    cursor: 'pointer',
    borderRadius: '5px',
  },
};

export default SavedWords;
