import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { searchWord } from './services/dictService.js';
import SavedWords from './SavedWords';
import { getThesaurus } from './services/thesaurusService.js';

const App = () => {
  const [word, setWord] = useState('');
  const [definitions, setDefinitions] = useState([]);
  const [dictResponse, setDictResponse] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [savedWords, setSavedWords] = useState([]);
  const [savedFeedback, setSavedFeedback] = useState('');
  const [thesaurus, setThesaurus] = useState([]);

  

  // Load search history and saved words from local storage on component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }

    const storedSavedWords = localStorage.getItem('savedWords');
    if (storedSavedWords) {
      setSavedWords(JSON.parse(storedSavedWords));
    }
  }, []);

  // Automatic save of search history when it changes
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

    // Cleanup function
    return () => {
      // Additional save logic can be added here if needed
    };
  }, [searchHistory]);

  const sendTerm = async () => {
    setDictResponse({});
    setDefinitions([])
    setThesaurus([]);
    try {
      const rawRes = await searchWord(word);
      console.log('Response on App.js:', JSON.stringify(rawRes));
      setDictResponse(rawRes);

      const rawThesaurus = await getThesaurus(word);
      console.log("Raw Thesaurus: ----> ", JSON.stringify(rawThesaurus));
      setThesaurus(rawThesaurus);

      if (rawRes.definition) {
        const definitionsArray = rawRes.definition.split(/\d+\./).filter(Boolean);
        setDefinitions(definitionsArray);
      }

      // Update the search history after receiving the response
      setSearchHistory((prevHistory) => [...prevHistory, word]);

      // Log the search term and response
      console.log('Search term:', word);
      console.log('Response:', rawRes);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleEnterKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendTerm();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const saveWord = () => {
    const updatedSavedWords = [...savedWords, { word, definition: dictResponse.definition }];
    setSavedWords(updatedSavedWords);
    localStorage.setItem('savedWords', JSON.stringify(updatedSavedWords));

    // Feedback logic
    setSavedFeedback('Word saved!');
    setTimeout(() => {
      setSavedFeedback('');
    }, 2000);

    // Log the saved word and definition
    console.log('Saved word:', word);
    console.log('Saved definition:', dictResponse.definition);
  };

  const deleteWord = (index) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this word?')

    if (isConfirmed) {
      const updatedSavedWords = [...savedWords];
      updatedSavedWords.splice(index, 1);
      setSavedWords(updatedSavedWords);
      localStorage.setItem('savedWords', JSON.stringify(updatedSavedWords));
    }
  };

  const searchFromHistory = (historyWord) => {
    setWord(historyWord);
    sendTerm();
  };

  return (
    <Router>
      <div>
        {/* Navigation Links */}
        <nav style={styles.nav}>
          <ul style={styles.navList}>
            <li style={styles.navItem}>
              <Link to="/" style={styles.link}>Home</Link>
            </li>
            <li style={styles.navItem}>
              <Link to="/saved-words" style={styles.link}>Saved Words</Link>
            </li>
          </ul>
        </nav>

        {/* Routes */}
        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <div style={styles.container}>
                <div style={styles.titleText}>Dictionary</div>

                <div style={styles.inputView}>
                  <input
                    placeholder='Search a word'
                    style={styles.input}
                    autoCapitalize='none'
                    autoCorrect={true}
                    autoFocus={true}
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    onBlur={sendTerm}
                    onKeyPress={handleEnterKeyPress}
                  />
                  <button style={styles.searchButton} onClick={sendTerm}>
                    <FontAwesomeIcon icon={faSearch} size={24} color="white" />
                  </button>
                </div>

                <div style={styles.historyContainer}>
                  <div style={styles.historyTitle}>Searched Terms:</div>
                  <div style={styles.historyListContainer}>
                    {searchHistory.map((historyWord, index) => (
                      <div
                        key={index}
                        style={styles.historyItem}
                        onClick={() => searchFromHistory(historyWord)}
                      >
                        {historyWord}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...styles.definitionCard, maxHeight: isCollapsed ? '100px' : 'none' }}>
                  {dictResponse.valid === false ? (
                    <div style={styles.definitionWord}>
                      No definitions found for "{dictResponse.word}". Check your spelling.
                    </div>
                  ) : (
                    <div style={styles.scrollView}>
                      <>
                        <div style={styles.headerContainer}>
                          <div style={styles.definitionWord}>{dictResponse.word}</div>
                          <button style={styles.toggleIcon} onClick={toggleCollapse}>
                            {isCollapsed ? <FontAwesomeIcon icon={faPlus} /> : <FontAwesomeIcon icon={faMinus} />}
                          </button>
                          <button style={styles.saveButton} onClick={saveWord}>
                            Save Word
                          </button>
                          {savedFeedback && <div style={styles.savedFeedback}>{savedFeedback}</div>}
                        </div>
                        {definitions.map((definition, index) => (
                          <div key={index} style={styles.definition}>
                            {`${index + 1}. ${definition.trim()}`}
                          </div>
                        ))}
                      </>
                    </div>
                  )}
                </div>

                {/* Display saved words */}
                <div style={{ ...styles.historyContainer, marginTop: '40px' }}>
                  <div style={styles.historyTitle}>Saved Words:</div>
                  <div style={styles.historyListContainer}>
                    {savedWords.map((savedWord, index) => (
                      <div key={index} style={{ ...styles.savedWordContainer, marginBottom: '20px' }}>
                        <div style={styles.savedWord}>{savedWord.word}</div>
                        <button style={styles.deleteButton} onClick={() => { deleteWord(index); }}>
                          <FontAwesomeIcon icon={faTimes} size={12} color="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/*display thesaurus data*/}
                <div>
                  <div style={styles.thesaurus}>Thesaurus</div>
                  {thesaurus.map((item, index) => (
                    <div key={index}>
                      <h2>{item.word}</h2>
                      <p>Phonetic: {item.phonetic}</p>

                      {/* Phonetics */}
                      <div>
                        <h3>Phonetics:</h3>
                        <ul>
                          {item.phonetics.map((phonetic, phoneticIndex) => (
                            <li key={phoneticIndex}>
                              {phonetic.text}
                              {phonetic.audio && <audio controls><source src={phonetic.audio} type="audio/mpeg" /></audio>}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Origin */}
                      <div>
                        <h3>Origin:</h3>
                        <p>{item.origin}</p>
                      </div>

                      {/* Meanings */}
                      <div>
                        <h3>Meanings:</h3>
                        {item.meanings.map((meaning, meaningIndex) => (
                          <div key={meaningIndex}>
                            <h4>{meaning.partOfSpeech}</h4>
                            <ol>
                              {meaning.definitions.map((definition, definitionIndex) => (
                                <li key={definitionIndex}>
                                  <p><strong>{definitionIndex + 1}.</strong> {definition.definition}</p>
                                  <p><strong>Example:</strong> {definition.example}</p>
                                </li>
                              ))}
                            </ol>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            }
          />

          {/* Saved Words Route */}
          <Route
            path="/saved-words"
            element={<SavedWords savedWords={savedWords} />}
          />
        </Routes>
      </div>
    </Router>
  );
};
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  titleText: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  historyListContainer: {
    display: 'flex',
    flexWrap: 'wrap',  // Allow items to wrap to the next line
    gap: '10px',       // Adjust horizontal spacing between items
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  inputView: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  input: {
    flex: '1',
    marginRight: '10px',
    padding: '10px',
    fontSize: '20px',
  },
  searchButton: {
    background: '#007BFF',
    color: 'white',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  historyContainer: {
    width: '80%',
    marginBottom: '20px',
  },
  historyTitle: {
    fontSize: '26px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  thesaurus: {
    fontSize: '26px',
    fontWeight: 'bold',
    marginVertical: '20px',
  },
  historyList: {
    display: 'flex',
    overflowX: 'auto',
    marginBottom: '10px',
  },
  historyItem: {
    padding: '5px 10px',
    marginRight: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  definitionCard: {
    width: '80%',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    overflow: 'hidden',
    transition: 'max-height 0.5s ease',
  },
  scrollView: {
    marginTop: '20px',
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  definitionWord: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  toggleIcon: {
    background: '#007BFF',
    color: 'white',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    fontSize: '18px',
    borderRadius: '5px',
  },
  saveButton: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  definition: {
    marginBottom: '10px',
    fontSize: '22px',
  },
  savedWordContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: '12px',
  },
  savedWord: {
    marginRight: '5px',
  },
  deleteButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '5px',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  savedFeedback: {
    color: '#28a745',
    fontSize: '16px',
    marginTop: '5px',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    transition: 'color 0.3s ease',  // Add transition for smooth color change
    '&:hover': {
      color: '#007BFF',  // Change color on hover
    },
  },
  nav: {
    background: '#007BFF',
    padding: '10px',
  },
  navList: {
    display: 'flex',
    listStyle: 'none',
    padding: '0',
    margin: '0',
  },
  navItem: {
    marginRight: '20px',
  },
  link: {
    textDecoration: 'none',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '5px',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
  },
  linkHover: {
    backgroundColor: '#0056b3',
  },
  historyItem: {
    marginBottom: '20px',  // Adjust margin for thesaurus data items
  },
};

export default App;
