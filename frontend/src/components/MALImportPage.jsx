import React from 'react';

function MALImportPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Import from MyAnimeList</h1>
      <p>This feature is coming soon!</p>
      <div style={{ marginTop: '30px', border: '1px dashed #ccc', padding: '20px', minHeight: '200px' }}>
        <p>UI for MAL import will be here.</p>
        <input type="file" accept=".xml,.json" style={{ margin: '10px 0' }} />
        <button onClick={() => alert('Import functionality not yet implemented.')} >
          Upload File
        </button>
      </div>
    </div>
  );
}

export default MALImportPage;