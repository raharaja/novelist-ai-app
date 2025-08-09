import React, { useEffect, useState } from 'react';

function App() {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // 1. Try env variable
    const envKey = process.env.REACT_APP_API_KEY;
    if (envKey) {
      setApiKey(envKey);
      return;
    }
    // 2. Try config.json
    fetch('/config.json')
      .then(res => res.json())
      .then(data => {
        if(data.apiKey) {
          setApiKey(data.apiKey);
        }
      });

    // 3. Check localStorage for in-app settings key
    const storedKey = localStorage.getItem('apiKey');
    if(storedKey) {
      setApiKey(storedKey);
    }

  }, []);

  // Simple UI for displaying and changing key in localStorage
  const [inputKey, setInputKey] = useState('');

  const saveKey = () => {
    localStorage.setItem('apiKey', inputKey);
    setApiKey(inputKey);
  };

  return (
    <div style={{padding:20}}>
      <h1>Novelist AI App</h1>
      <p><b>Current API Key:</b> {apiKey || 'No API Key set'}</p>

      <h3>Set API Key (In-App Settings)</h3>
      <input
        value={inputKey}
        onChange={e => setInputKey(e.target.value)}
        placeholder="Paste API key here"
        style={{width:'300px', padding:'5px'}}
      />
      <button onClick={saveKey} style={{marginLeft: '10px', padding:'5px 10px'}}>Save</button>

      <p style={{marginTop:20}}>
        You can also set your API key via Netlify environment variable <code>REACT_APP_API_KEY</code> or <code>public/config.json</code> file.
      </p>
    </div>
  );
}

export default App;