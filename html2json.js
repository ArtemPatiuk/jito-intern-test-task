function convertHtml2JsonAndSet() {
  const htmlTextAreaValue = document.getElementById("html").value;
  const jsonObj = html2json(htmlTextAreaValue);
  const jsonArea = document.getElementById("json");
  jsonArea.textContent = JSON.stringify(jsonObj, null, 2);
}

/* 
  Update this function to convert html into json object.
  You can rewrite it completely, just be sure it accepts htmlText as string and outputs json object.
*/
const voidElements = ["img", 'br', "hr", 'input', 'meta', 'area', 'col', 'embed', 'link', 'source', 'track', 'wbr'];
const rawTextTags = ["script", "style", "textarea", "title"];
function html2json(htmlText) {
  const res = stack(htmlText)
  //const tokens = tokenize(htmlText);
  return res;
}

function tokenize(htmlText) {
  const tokens = [];

  const tagStart = /<(?=[a-z!\/])/gi;

  let match;
  let lastEnd = 0;

  while ((match = tagStart.exec(htmlText)) !== null) {
    const start = match.index;
    const end = findTagEnd(htmlText, start);
    if (end === -1) {
      break;
    }
    const text = htmlText.slice(lastEnd, start);

    if (text && text.trim() !== "") {
      tokens.push({
        type: "text",
        value: text
      });
    }

    const raw = htmlText.slice(start, end + 1);
    const parsedRaw = parseTag(raw)
    tokens.push(parsedRaw);

    if (
      parsedRaw.type === "open" &&
      rawTextTags.includes(parsedRaw.name)
    ) {
      const indexOfStartContent = end + 1;
      const indexOfStartCloseTag = findRawTextEnd(htmlText, indexOfStartContent, parsedRaw.name);

      if (indexOfStartCloseTag === -1) {
        const content = htmlText.slice(indexOfStartContent);
        if (content.trim() !== "") {
          tokens.push({
            type: "text",
            value: content
          });
        }
        lastEnd = htmlText.length;
        tagStart.lastIndex = htmlText.length;
        break;
      }
      const content = htmlText.slice(indexOfStartContent, indexOfStartCloseTag);
      if (content.trim() !== "") {
        tokens.push({
          type: "text",
          value: content
        });
      }
      tokens.push({
        type: "close",
        name: parsedRaw.name
      });
      const closeEnd = findTagEnd(htmlText, indexOfStartCloseTag);
      if (closeEnd === -1) {
        break;
      }
      lastEnd = closeEnd + 1;
      tagStart.lastIndex = closeEnd + 1;

      continue;
    }


    lastEnd = end + 1;
    tagStart.lastIndex = end + 1;
  }

  return tokens;
}
function stack(htmlText) {
  const tokens = tokenize(htmlText);
  const stack = [];
  const res = [];
  for (const token of tokens) {

    if (token.type === 'unknown') {
      continue;
    }
    if (token.type === 'close') {
      if (stack.length > 0 && stack[stack.length - 1].name === token.name) {
        stack.pop();
      }
      continue;
    }
    if (token.type === 'text') {
      const node = {
        type: "text",
        value: token.value
      }

      if (stack.length > 0) {
        stack[stack.length - 1].children.push(node)
      } else {
        res.push(node)
      }
      continue
    }

    if (token.type === 'open' || token.type === 'void element') {
      const node = {
        name: token.name,
        attributes: token.attributes,
        children: []
      }
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(node)
      } else {
        res.push(node)
      }
      if (token.type === 'open') {
        stack.push(node);
      }
    }
  }
  return res;
}
function findRawTextEnd(htmlText, contentStart, tagName) {
  const regex = new RegExp(`<\\/\\s*${tagName}\\s*>`, "i");

  const match = regex.exec(htmlText.slice(contentStart));

  if (!match) {
    return -1;
  }

  return contentStart + match.index;
}
function findTagEnd(htmlText, start) {
  let quote = null;

  for (let i = start + 1; i < htmlText.length; i++) {
    const char = htmlText[i];
    if (quote !== null) {
      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === ">") {
      return i;
    }
  }

  return -1;
}
function parseTag(raw) {
  const result = {
    type: "unknown",
    name: "",
  };
  if (!raw) {
    return result;
  }

  if (raw.startsWith("<!")) {
    if (/^<!doctype\b/i.test(raw)) {
      result.type = "doctype";
      result.name = "doctype";
    } else if (/^<!--[\s\S]*?-->/.test(raw)) {
      result.type = "comment";
      result.name = "comment"
    }

    return result;
  }
  const regex = /^<\/?([a-zA-Z0-9-]+)(?:\s+([\s\S]+))?>$/i
  const tagMatch = regex.exec(raw)
  if (!tagMatch) {
    return result;
  }
  const nameOfTag = tagMatch[1]
  const normalizedName = nameOfTag.toLowerCase();

  const attr = (tagMatch[2] || "").trim()
  if (raw.startsWith("</")) {
    result.name = normalizedName.replace("/", '')
    result.type = "close";
    return result;
  }

  result.name = normalizedName
  result.attributes = attr;
  if (voidElements.includes(normalizedName)) {
    result.type = "void element"
  } else {
    result.type = "open";
  }
  return result;
}
function showExample1() {
  const htmlExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport">
    <title>Sample HTML</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
    </header>
    <nav>
        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>
    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is the home section of the webpage.</p>
        </section>
        <section id="about">
            <h2>About Section</h2>
            <p>This is the about section of the webpage.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>
`;
  const jsonContent = {
    "Comment 1":
      "You have to think about how to take into account various html inputs so your json structure will cover them all and handle different cases.",
    "Comment 2":
      "When you make any choice in terms of selecting specific json structure for conversion - be ready to provide reasoning behind such choice.",
  };

  document.getElementById("html").value = htmlExample;
  document.getElementById("json").textContent = JSON.stringify(
    jsonContent,
    null,
    2
  );
}

function showExample2() {
  const htmlExample = `<div>
<p>Hello world!</p>
  <button>Click me!</button>
  <textarea>Some very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long string.</textarea>
</div>
`;
  const jsonContent = {
    "Comment 1":
      "You have to think about how to take into account various html inputs so your json structure will cover them all and handle different cases.",
    "Comment 2":
      "When you make any choice in terms of selecting specific json structure for conversion - be ready to provide reasoning behind such choice.",
  };

  document.getElementById("html").value = htmlExample;
  document.getElementById("json").textContent = JSON.stringify(
    jsonContent,
    null,
    2
  );
}
