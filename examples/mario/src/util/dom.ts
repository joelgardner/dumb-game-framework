let elementCount = 0;

type WordElement = {
  id: string;
  hitbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export function animatePunch(elementSelector: string) {
  // Clone the span containing the word, to create
  // an outer-wrapper span that will have the class
  // that handles vertical movement during animation.
  const element = document.querySelector(elementSelector) as HTMLElement;
  const clone = element.cloneNode() as HTMLElement;
  clone.classList.add("explode-vertical");
  clone.innerText = element.innerText;

  // If Mario punches a word at the beginning of a line,
  // Chrome and Firefox will actually start the animation from
  // the end of the previous line, which is visually jarring.
  // This hack fixes that issue by detecting if the word exists
  // as the first word on a line and if so, sets the left/top
  // properties to prevent this "reverse line-break" issue.
  const elementRect = element.getBoundingClientRect();
  const parentRect = element.parentElement.getBoundingClientRect();
  if (elementRect.x === parentRect.x && element.previousElementSibling) {
    // @ts-ignore
    const offsetLeft = window.pageXOffset - element.offsetParent.offsetLeft;
    // @ts-ignore
    const offsetTop = window.pageYOffset - element.offsetParent.offsetTop;
    clone.style.left = `${elementRect.x + offsetLeft}px`;
    clone.style.top = `${elementRect.y + offsetTop}px`;
  }

  // Insert the cloned element just before the punched
  // word and start the animation.
  element.parentElement.insertBefore(clone, element);
  element.classList.add("punched");

  // Remove the cloned/animated element from the DOM
  setTimeout(() => {
    element.parentElement.removeChild(clone);
  }, 2000);
}

export function getWordHitboxes(containerSelector: string): WordElement[] {
  // First, put every word in each punchable section into
  // its own span, so we can easily get its bounding box.
  splitSectionsByWord(".punchable");

  // Then get each word's bounding box and offset
  // it according to its container offsets.
  const container = document.querySelector(containerSelector) as HTMLElement;
  const xOffset = window.pageXOffset - container.offsetLeft;
  const yOffset = window.pageYOffset - container.offsetTop;
  return Array.from(
    document.querySelectorAll(".punchable-word:not(.punched)")
  ).map((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      id: element.id,
      hitbox: {
        x: bounds.x + xOffset,
        y: bounds.y + yOffset,
        width: bounds.width,
        height: bounds.height,
      },
    };
  });
}

export function createBackingCanvas(
  contentSelector: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.id = "world-canvas";
  canvas.classList.add("mario-canvas");
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.zIndex = "0";

  const content = document.querySelector(contentSelector);
  content.parentElement.insertBefore(canvas, content);
  setSizeToMatch(canvas, contentSelector);

  return canvas;
}

export function setSizeToMatch(
  canvas: HTMLCanvasElement,
  contentSelector: string
) {
  const content = document.querySelector(contentSelector);
  const box = content.getBoundingClientRect();
  canvas.width = box.width;
  canvas.height = box.height;
}

function splitSectionsByWord(sectionSelector: string) {
  document.querySelectorAll(sectionSelector).forEach(splitChildrenByWord);
}

/*
 * Idea here is to take an element, and if it is a TextNode, split it up
 * so that each word of text is contained within its own span element.
 * This allows us to easily get a bounding box per word, which can then
 * be used to add a (transparent) physical entity to the game world.
 */
function splitChildrenByWord(element: HTMLElement): (HTMLElement | Text)[] {
  if (element.nodeType === Node.TEXT_NODE) {
    return element.textContent
      .split(/(\s+|-+)/)
      .filter(Boolean)
      .map((text) => {
        // Preserve any whitespace. Previously we just inserted a single space
        // between each word. But that breaks in the case of <pre> blocks.
        if (text.match(/\s+/)) {
          return document.createTextNode(text);
        }

        const punchableWord = document.createElement("span") as HTMLSpanElement;
        punchableWord.id = `punchable-word-${++elementCount}`;
        punchableWord.classList.add("punchable-word");
        punchableWord.appendChild(document.createTextNode(text));
        return punchableWord;
      });
  }

  // Don't descend further if we've already done this, i.e.,
  // this is happening while handling a window resize event.
  if (!element.classList.contains("punchable-word")) {
    element.replaceChildren(
      ...Array.from(element.childNodes).flatMap(splitChildrenByWord)
    );
  }

  return [element];
}
