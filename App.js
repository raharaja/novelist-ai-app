import React, { useState, useEffect, useRef } from "react";

// Default export: single-file React component for a mobile-friendly novel-writing app.
// Tailwind CSS assumed to be available in the host environment.
// NOTES:
//  - This is a prototype UI + local persistence. Replace AI placeholder functions
//    with calls to your AI/image generation backend.
//  - For image generation, wire up an image API and update handleGenerateImage.

export default function NovelistApp() {
  // Age-gate
  const [ageVerified, setAgeVerified] = useState(() => {
    try {
      return localStorage.getItem("novelist_age_verified") === "true";
    } catch (e) {
      return false;
    }
  });
  const [showAgeModal, setShowAgeModal] = useState(!ageVerified);

  // Editor state
  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState(() => {
    return localStorage.getItem("novelist_draft") || "";
  });
  const [genre, setGenre] = useState("Fantasy");
  const [theme, setTheme] = useState("Classic");
  const [allowAdult, setAllowAdult] = useState(() => {
    return localStorage.getItem("novelist_allow_adult") === "true";
  });

  // Sidebar tools
  const [characters, setCharacters] = useState(() => {
    const raw = localStorage.getItem("novelist_characters");
    return raw ? JSON.parse(raw) : [];
  });
  const [worldNotes, setWorldNotes] = useState(() => {
    return localStorage.getItem("novelist_world_notes") || "";
  });

  // Images (user uploads and generated)
  const [images, setImages] = useState(() => {
    const raw = localStorage.getItem("novelist_images");
    return raw ? JSON.parse(raw) : [];
  });

  // UI helpers
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    localStorage.setItem("novelist_draft", content);
  }, [content]);

  useEffect(() => {
    localStorage.setItem("novelist_characters", JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem("novelist_world_notes", worldNotes);
  }, [worldNotes]);

  useEffect(() => {
    localStorage.setItem("novelist_images", JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    localStorage.setItem("novelist_allow_adult", allowAdult ? "true" : "false");
  }, [allowAdult]);

  // Age modal handlers
  function confirmAge(isAdult) {
    if (isAdult) {
      setAgeVerified(true);
      setShowAgeModal(false);
      try { localStorage.setItem("novelist_age_verified", "true"); } catch(e){}
    } else {
      // Safe mode: hide adult categories
      setAllowAdult(false);
      setAgeVerified(false);
      setShowAgeModal(true);
      alert("You can continue in Safe Mode without adult/graphic categories.");
    }
  }

  // Character management
  function addCharacter() {
    const name = prompt("Character name:");
    if (!name) return;
    const bio = prompt("Short bio / notes for " + name + ":") || "";
    setCharacters(prev => [...prev, { id: Date.now(), name, bio }]);
  }
  function removeCharacter(id) {
    setCharacters(prev => prev.filter(c => c.id !== id));
  }

  // Image upload
  function handleFiles(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    arr.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages(prev => [...prev, { id: Date.now() + Math.random(), src: reader.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  }

  // Simple image insertion into content
  function insertImageToContent(img) {
    setContent(prev => prev + `\n![${img.name || 'image'}](${img.src})\n`);
  }

  // Placeholder AI call
  async function handleAIHelp(kind) {
    setStatus("Generating suggestion...");
    await new Promise(r => setTimeout(r, 800));
    const suggestions = {
      'plot': 'A surprising betrayal reshapes the hero\'s moral compass — consider reversing expectations around chapter midpoint.',
      'character': 'Give the antagonist a small, sympathetic hobby — it makes them three-dimensional.',
      'dialogue': 'Short lines, interruptions, and a repeated motif will make this scene feel tense.'
    };
    setContent(prev => prev + "\n\n# AI Suggestion: " + (suggestions[kind] || 'Try adding sensory detail and stakes.') + "\n");
    setStatus('');
  }

  // Mock image generation handler
  async function handleGenerateImage(promptText) {
    setStatus('Generating image...');
    await new Promise(r => setTimeout(r, 1200));
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 450;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#444';
    ctx.font = '24px sans-serif';
    ctx.fillText('Generated: ' + (promptText||'scene'), 20, 40);
    const src = canvas.toDataURL('image/png');
    const imgObj = { id: Date.now()+Math.random(), src, name: 'ai_'+Date.now() };
    setImages(prev => [...prev, imgObj]);
    setStatus('');
    return imgObj;
  }

  function downloadPlain() {
    const blob = new Blob(["# " + title + "\n\n" + content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = (title||'novel') + '.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    const t = setInterval(() => {
      try { localStorage.setItem('novelist_draft_ts', Date.now().toString()); } catch(e){}
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{padding: '1rem', fontFamily: 'sans-serif'}}>
      {showAgeModal && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: 'white', padding: '1rem', borderRadius: '0.5rem'}}>
            <h2>Age Verification</h2>
            <p>This app includes adult & graphic themes. Confirm you are 18+ to unlock those categories.</p>
            <button onClick={() => confirmAge(true)}>I am 18+</button>
            <button onClick={() => confirmAge(false)}>I am under 18</button>
          </div>
        </div>
      )}
      <h1>Novelist — AI Novel Studio</h1>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
      <select value={genre} onChange={e => setGenre(e.target.value)}>
        <option>Fantasy</option>
        <option>Sci-Fi</option>
        <option>Romance</option>
        <option>Mystery/Thriller</option>
        <option>Horror</option>
        <option>Historical</option>
        <option>Comedy/Satire</option>
        {allowAdult && <option>Adult / Erotic</option>}
        {allowAdult && <option>Graphic / Dark Themes</option>}
        <option>Custom</option>
      </select>
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Start writing here..." rows={10} style={{width: '100%'}} />
      <div>
        <button onClick={() => handleAIHelp('plot')}>AI Plot Help</button>
        <button onClick={() => handleAIHelp('character')}>AI Character Help</button>
        <button onClick={() => handleAIHelp('dialogue')}>AI Dialogue Help</button>
        <button onClick={() => fileInputRef.current?.click()}>Upload Image</button>
        <input ref={fileInputRef} onChange={handleFiles} type="file" multiple accept="image/*" style={{display: 'none'}} />
        <button onClick={async () => {
          const promptText = prompt('Describe the image to generate:');
          if (!promptText) return;
          if (!ageVerified && (promptText.toLowerCase().includes('explicit') || promptText.toLowerCase().includes('erotic'))) {
            alert('Explicit image generation requires age verification.');
            return;
          }
          const img = await handleGenerateImage(promptText);
          if (img) insertImageToContent(img);
        }}>AI Generate Image</button>
        <button onClick={downloadPlain}>Export</button>
      </div>
    </div>
  );
}
