//dictService.js

const apiKey = 'hrR89lQrU+P5X/SYJu+eSw==SiCOUnEd6M4exukE';

const searchWord = async (word) => {
  try {
    const response = await fetch(`https://api.api-ninjas.com/v1/dictionary?word=${word}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`dictService -> HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('dictService Request failed:', error);
    throw error;
  }
};

export { searchWord };
