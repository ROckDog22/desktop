import "./style.css";
import { startCourseApp } from "./app/courseApp";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("Application root was not found.");
}

startCourseApp(root);
