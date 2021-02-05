import { decoder, encoder, Page, Field } from "tetris-fumen";

const reverseString = (word: string): string =>
  word.split("").reduceRight((p, c) => p + c);

const replaceMinoString = (word: string): string =>
  word.replace(/[SZJL]/g, (m) => {
    if (m == "S" || m == "Z" || m == "J" || m == "L")
      return { S: "Z", Z: "S", L: "J", J: "L" }[m];
    else return m;
  });

const flipPage = (page: Page): Page => {
  page.comment = replaceMinoString(page.comment);
  const innerField = page.field
    .str({ reduced: false, garbage: true })
    .split("\n")
    .map((line) => replaceMinoString(reverseString(line)))
    .join("");
  console.log(innerField.length);
  const filppedField = Field.create(
    innerField.substring(0, 230),
    innerField.substring(230)
  );
  if (page.operation) {
    const oldMino = page.mino();
    let newRotation: "spawn" | "right" | "reverse" | "left";
    if (
      page.operation.type == "J" ||
      page.operation.type == "L" ||
      page.operation.type == "T"
    ) {
      newRotation =
        page.operation.rotation == "left"
          ? "right"
          : page.operation.rotation == "right"
          ? "left"
          : page.operation.rotation;
    } else {
      newRotation =
        page.operation.rotation == "left"
          ? "right"
          : page.operation.rotation == "right"
          ? "left"
          : page.operation.rotation == "spawn"
          ? "reverse"
          : page.operation.rotation == "reverse"
          ? "spawn"
          : page.operation.rotation;
    }
    page.operation.rotation = newRotation;

    const newPieceType =
      page.operation.type == "J"
        ? "L"
        : page.operation.type == "L"
        ? "J"
        : page.operation.type == "Z"
        ? "S"
        : page.operation.type == "S"
        ? "Z"
        : page.operation.type;
    page.operation.type = newPieceType;
    console.log(page.mino());

    const newX = 9 - page.mino().x;

    const newMino = page.mino();

    const oldMinoY = Math.min(...oldMino.positions().map((p) => p.y));
    const newMinoY = Math.min(...newMino.positions().map((p) => p.y));
    const newY = page.mino().y + (oldMinoY - newMinoY);

    page.operation.x = newX;
    page.operation.y = newY;
  }
  page.field = filppedField;
  return page;
};

const filp = (tetofu: string): string => {
  const pages = decoder.decode(tetofu);
  const encoded = encoder.encode(pages.map((p) => flipPage(p)));
  return encoded;
};

const execute = async () => {
  const button = document.createElement("button");
  button.innerText = "flip";
  button.addEventListener("click", () => {
    const url = new URL(location.href);
    const tetofu = url.search;

    url.search = filp(tetofu);

    location.href = url.toString();
  });
  document.body.appendChild(button);
};

execute();
