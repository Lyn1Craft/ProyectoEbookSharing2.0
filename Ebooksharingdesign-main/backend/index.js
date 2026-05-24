const express = require('express');
const app = express();

// Ruta que simula la conexión a la base de datos de libros
app.get('/api/libros', (req, res) => {
    res.json({
        mensaje: "Conexión establecida",
        catalogo: "Cargando desde el prototipo de alta fidelidad..."
    });
});

app.listen(3000, () => console.log('Backend listo para integrar con Figma'));
