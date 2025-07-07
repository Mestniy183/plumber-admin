import { logoutUser } from "./auth.js";
import { setupDragAndDrop } from "./dragDrop.js";
import { setupFormSubmissions } from "./form.js";
import { loadServer } from "./loadServer/loadServer.js";
import "../css/style.css";

document.addEventListener("DOMContentLoaded", function () {
  logoutUser();
  loadServer();
  setupDragAndDrop();
  setupFormSubmissions();
});
