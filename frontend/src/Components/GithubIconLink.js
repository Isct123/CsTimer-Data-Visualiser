import { FaGithub } from "react-icons/fa";
import "./GithubLink.css";

export default function GitHubIconLink() {
  return (
    <a
      href="https://github.com/Isct123/CsTimer-Data-Visualiser/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub repository"
      style={{ color: "black", fontSize: 24 }}
      className="github-link"
    >
      <FaGithub />
    </a>
  );
}
