# eBook Sharing - Dashboard

Proyecto desarrollado para la Actividad 4 de la electiva "Desarrollo de aplicaciones web II". 
La aplicación tiene como objetivo gestionar el catálogo de libros digitales y físicos, permitiendo una experiencia de usuario interactiva y eficiente.

## Estructura del Proyecto

El proyecto se encuentra organizado para separar las responsabilidades de la lógica de negocio y la interfaz de usuario:

- **/back**: Contiene el servidor de API REST desarrollado en Node.js y Express. Este módulo es el encargado de gestionar la comunicación con la base de datos y proveer los endpoints necesarios para el consumo de información.
- **/front**: Contiene la aplicación web desarrollada en ReactJS. Implementa los conceptos vistos en clase como:
    - Uso de **Hooks** (useState, useEffect, useContext).
    - **Context API** para el manejo de estado global.
    - **Axios** para la realización de peticiones HTTP al back-end.
    - **React Router** para la navegación entre vistas.

## Tecnologías Utilizadas

- **Front-end**: ReactJS, Axios, React Router.
- **Back-end**: Node.js, Express.
- **Prototipado**: Diseño de alta fidelidad realizado en Figma para la validación de UX.

## Instrucciones de Ejecución

### Backend:
1. Navegar a la carpeta `back`.
2. Instalar dependencias: `npm install express cors`.
3. Ejecutar: `node index.js`.

### Frontend:
1. Navegar a la carpeta `front`.
2. Instalar dependencias: `npm install axios react-router-dom`.
3. Ejecutar: `npm start`.

---
**Autores:**
- Evelin Valentina Robayo Bernal
- Wilmar Eulises Franco Beltrán
