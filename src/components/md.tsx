import React from "react";

/**
 * So, this is obviously awful. But it seems to work for now. Refactor as needed
 * @param s Markdown string
 */
export function transformMd(s: string): JSX.Element {
  const body: JSX.Element[] = [];
  let text = "";

  let inCode = false;
  let inBold = false;
  let inItal = false;
  for (let i = 0; i < s.length; ++i) {
    switch (s[i]) {
      case "`": {
        if (inCode) {
          body.push(<code>{text}</code>);
          text = "";
        } else {
          body.push(<>{text}</>);
          text = "";
        }
        inCode = !inCode;
        break;
      }
      case "_": {
        if (s[i + 1] === "_") {
          if (inBold) {
            body.push(<strong>{text}</strong>);
            text = "";
          } else {
            body.push(<>{text}</>);
            text = "";
          }
          inBold = !inBold;
          ++i;
        } else {
          if (inItal) {
            body.push(<i>{text}</i>);
            text = "";
          } else {
            body.push(<>{text}</>);
            text = "";
          }
          inItal = !inItal;
        }
        break;
      }
      case "*": {
        if (s[i + 1] === "*") {
          if (inBold) {
            body.push(<strong>{text}</strong>);
            text = "";
          } else {
            body.push(<>{text}</>);
            text = "";
          }
          inBold = !inBold;
          ++i;
        } else {
          if (inItal) {
            body.push(<i>{text}</i>);
            text = "";
          } else {
            body.push(<>{text}</>);
            text = "";
          }
          inItal = !inItal;
        }
        break;
      }
      default: {
        text += s[i];
        break;
      }
    }
  }
  body.push(<>{text}</>);

  return <p>{body}</p>;
}
