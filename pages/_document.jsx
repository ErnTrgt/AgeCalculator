import { Html, Head, Main, NextScript } from "next/document"

// Set the theme class before first paint so there's no light/dark flash.
const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem("memento-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved || (prefersDark ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`

export default function Document() {
  return (
    <Html lang="tr">
      <Head />
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
