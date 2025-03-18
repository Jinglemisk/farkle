"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdatefarkle"]("main",{

/***/ "./src/client/index.js":
/*!*****************************!*\
  !*** ./src/client/index.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom/client */ \"./node_modules/react-dom/client.js\");\n/* harmony import */ var socket_io_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! socket.io-client */ \"./node_modules/socket.io-client/build/esm/index.js\");\n/* harmony import */ var _components_App__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/App */ \"./src/client/components/App.js\");\n/* harmony import */ var _styles_main_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./styles/main.css */ \"./src/client/styles/main.css\");\n/**\n * Main entry point for the Farkle game client application\n * Responsible for:\n * - Initializing React application\n * - Setting up Socket.io connection\n * - Rendering the appropriate game component (Lobby or Game)\n */\n\n\n\n\n\n\n\n// Initialize socket connection with auto-discovery\n// This will work with any port the server is running on\nvar socket = (0,socket_io_client__WEBPACK_IMPORTED_MODULE_2__[\"default\"])({\n  reconnectionAttempts: 5,\n  reconnectionDelay: 1000,\n  timeout: 20000,\n  autoConnect: true,\n  forceNew: true\n});\n\n// Socket connection error handling\nsocket.on('connect_error', function (err) {\n  console.error('Connection error:', err);\n});\n\n// Create root and render app\nvar container = document.getElementById('root');\nvar root = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_1__.createRoot)(container);\nroot.render(/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().StrictMode), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_App__WEBPACK_IMPORTED_MODULE_3__[\"default\"], {\n  socket: socket\n})));\n\n//# sourceURL=webpack://farkle/./src/client/index.js?");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("a68e5614e5836088f1be")
/******/ })();
/******/ 
/******/ }
);