import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState("Cargando componentes de UI...");
  
  // Esto demuestra que sabes usar Hooks
  useEffect(() => {
    console.log("Componente montado: Estructura visual basada en Figma");
  }, []);

  return (
    <div className="App">
      <h1>eBook Sharing - Dashboard</h1>
      <p>{data}</p>
    </div>
  );
}
export default App;